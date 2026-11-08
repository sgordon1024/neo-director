// Coordinates are processed in memory only. No location service or network calls.
export function point(p){if(!p || !Number.isFinite(p.lat)||!Number.isFinite(p.lon)||Math.abs(p.lat)>90||Math.abs(p.lon)>180)throw Error('Invalid coordinate');return p;}
export function haversine(a,b){point(a);point(b);const r=Math.PI/180;const dlat=(b.lat-a.lat)*r,dlon=(b.lon-a.lon)*r;const h=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlon/2)**2;return 6371008.8*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));}
export function distance(segments){if(!Array.isArray(segments)||!segments.length)throw Error('No route segments');let m=0;for(const s of segments){if(!Array.isArray(s)||s.length<2)throw Error('Each segment needs two points');s.forEach(point);for(let i=1;i<s.length;i++)m+=haversine(s[i-1],s[i]);}return m;}
export function remaining(segments,gps,now){
  distance(segments);point(gps);
  if(!Number.isFinite(now)||!Number.isFinite(gps.at)||now<gps.at||now-gps.at>10000||!Number.isFinite(gps.accuracy)||gps.accuracy<0||gps.accuracy>30)throw Error('GPS fix is stale, missing or inaccurate');
  if(segments.length!==1)throw Error('Choose one continuous segment for remaining distance');
  const s=segments[0];let nearest=0,offset=Infinity;
  s.forEach((p,i)=>{const d=haversine(gps,p);if(d<offset){offset=d;nearest=i;}});
  if(offset>100)throw Error('GPS fix is too far from route vertices');
  const tail=s.slice(nearest);return {meters:tail.length<2?0:distance([tail]),offsetMeters:offset,nearestVertex:nearest,method:'Approximate remaining distance from nearest route vertex; sparse points and loops may mislead. Not navigation.'};
}
export function parseGPX(xml,Parser=globalThis.DOMParser){
  if(typeof xml!=='string'||xml.length>2000000||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Unsupported GPX file');
  const doc=new Parser().parseFromString(xml,'application/xml');
  if(doc.getElementsByTagName('parsererror').length||doc.documentElement.localName!=='gpx')throw Error('Invalid GPX');
  const elements=(root,name)=>Array.from(root.getElementsByTagNameNS('*',name));
  let containers=elements(doc,'trkseg');let tag='trkpt';
  if(!containers.length){containers=elements(doc,'rte');tag='rtept';}
  const segments=containers.map(s=>elements(s,tag).map(n=>{
    const lat=n.getAttribute('lat'),lon=n.getAttribute('lon');
    if(lat===null||lon===null||!lat.trim()||!lon.trim())throw Error('Missing coordinate');
    return point({lat:Number(lat),lon:Number(lon)});
  }));distance(segments);return segments;
}
