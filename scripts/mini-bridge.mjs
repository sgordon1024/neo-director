import http from 'node:http';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {readFile,writeFile,mkdir,mkdtemp,rm,access} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {Director,parseIntent} from '../docs/director.js';
import {conversationRequest} from '../docs/conversation.js';
import {validateModelDraft} from '../lib/model-brief.js';
import {spokenSummary,spokenPlanSummary,validateTranscript} from './local-director.mjs';
import {sceneReview} from '../docs/scene-policy.js';
import {reviewSampledVideo} from '../lib/video-review.js';
const ROOT=dirname(dirname(fileURLToPath(import.meta.url)));
const STATIC=new Set(['bridge.html','bridge.js','bridge.css','video-bookmarks.js']);
class Failure extends Error{constructor(status,message){super(message);this.status=status;}}
function exact(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!==[...keys].sort().join(','))throw new Failure(400,'Unsupported request schema');}
async function body(req,limit){const parts=[];let size=0;if(Number(req.headers['content-length'])>limit)throw new Failure(413,'Input too large');for await(const part of req){size+=part.length;if(size>limit)throw new Failure(413,'Input too large');parts.push(part);}return Buffer.concat(parts);}
async function jsonBody(req){if(req.headers['content-type']?.split(';')[0]!=='application/json')throw new Failure(415,'JSON required');try{return JSON.parse((await body(req,4096)).toString('utf8'));}catch(e){if(e instanceof Failure)throw e;throw new Failure(400,'Invalid JSON');}}
export async function startBridge({port=8766,now=Date.now,root=ROOT,sessionMs=15*60*1000,runner}={}){
 if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
 const token=randomBytes(32).toString('base64url');const expiresAt=now()+sessionMs;const seen=new Map();const director=new Director();let origin,host,busy=false,lastPlanCommand=null;const children=new Set(),folders=new Set();
 const execute=runner||((file,args)=>new Promise((resolve,reject)=>{const child=execFile(file,args,{timeout:22000,maxBuffer:1024*1024},(error,stdout)=>{children.delete(child);error?reject(new Failure(422,'Local inference failed or timed out; no fallback attempted')):resolve(stdout);});children.add(child);}));
 async function job(fn){if(busy)throw new Failure(429,'Local inference busy; retry after it finishes');busy=true;let folder;try{await mkdir(join(root,'.private'),{recursive:true,mode:0o700});folder=await mkdtemp(join(root,'.private','bridge-'));folders.add(folder);return await fn(folder);}finally{if(folder){await rm(folder,{recursive:true,force:true});folders.delete(folder);}busy=false;}}
 function ensureFresh(req){if(now()>expiresAt)throw new Failure(401,'Session expired; restart the local bridge');const issued=Number(req.headers['x-neo-issued-at']);if(!Number.isFinite(issued)||issued>now()+1000||now()-issued>10000)throw new Failure(409,'Stale or future request rejected');}
 function authorize(req){ensureFresh(req);const auth=req.headers.authorization||'';const expected=`Bearer ${token}`;if(Buffer.byteLength(auth)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(auth),Buffer.from(expected)))throw new Failure(401,'Session token required');if(req.headers.origin!==origin)throw new Failure(403,'Same-origin request required');const issued=Number(req.headers['x-neo-issued-at']);const id=req.headers['x-neo-request-id'];if(!Number.isFinite(issued)||issued>now()+1000||now()-issued>10000)throw new Failure(409,'Stale or future request rejected');if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{16,80}$/.test(id))throw new Failure(400,'Request ID required');for(const [key,time] of seen)if(now()-time>11000)seen.delete(key);if(seen.has(id))throw new Failure(409,'Replayed request rejected');if(seen.size>=1024)throw new Failure(429,'Request limit reached');seen.set(id,now());}
 const server=http.createServer(async(req,res)=>{
  const send=(status,value,type='application/json')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none'",'Permissions-Policy':'microphone=(), camera=(), geolocation=()'});res.end(Buffer.isBuffer(value)?value:type==='application/json'?JSON.stringify(value):value);};
  try{
   if(req.headers.host!==host)throw new Failure(403,'Unexpected host');
   const path=new URL(req.url,origin).pathname;
   if(req.headers.origin&&req.headers.origin!==origin)throw new Failure(403,'Cross-origin requests rejected');
   if(path.startsWith('/api/')&&req.headers['sec-fetch-site']==='cross-site')throw new Failure(403,'Cross-site requests rejected');
   if(req.method==='GET'&&path==='/api/session'){
    if(now()>expiresAt)throw new Failure(401,'Session expired; restart the local bridge');
    const available=async name=>{try{await access(join(root,'.private',name));return true;}catch{return false;}};
    return send(200,{mode:'simulation-only',token,expiresAt,capabilities:{transcription:await available('neo-media'),scene:await available('neo-scene'),brief:await available('neo-brief')},networkScope:'127.0.0.1 only'});
   }
   if(req.method==='GET'&&!path.startsWith('/api/')){const file=path==='/'?'bridge.html':path.slice(1);if(!STATIC.has(file))throw new Failure(404,'Not found');const data=await readFile(join(root,'docs',file));return send(200,data,file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8');}
   if(req.method!=='POST')throw new Failure(405,'Method not allowed');authorize(req);
   if(path==='/api/brief'){const value=await jsonBody(req);ensureFresh(req);exact(value,['command']);if(typeof value.command!=='string'||!value.command.trim()||value.command.length>500||parseIntent(value.command).kind==='refuse')throw new Failure(400,'Unsupported or flight-related request');if(director.state==='simulating')throw new Failure(409,'Stop simulation before drafting a new brief');director.stop();const result=await job(async()=>validateModelDraft(JSON.parse(await execute(join(root,'.private','neo-brief'),[value.command])),value.command));return send(200,result);}
   if(path==='/api/plan'){const value=await jsonBody(req);ensureFresh(req);exact(value,['command']);if(typeof value.command!=='string'||value.command.length>500)throw new Failure(400,'Short command required');const result=conversationRequest(director,value.command,now());lastPlanCommand=result.kind==='proposal'?value.command:null;return send(200,{...result,state:director.state,actuation:false});}
   if(path==='/api/simulation'){const value=await jsonBody(req);ensureFresh(req);exact(value,['action','telemetry']);if(!['start','step','stop'].includes(value.action)||!['fresh','stale','lost'].includes(value.telemetry))throw new Failure(400,'Unsupported simulation request');const sample={source:'synthetic',at:now()-(value.telemetry==='stale'?6000:0),link:value.telemetry==='lost'?'lost':'ready'};const result=value.action==='start'?director.start(sample,now()):value.action==='step'?director.tick(sample,now()):director.stop();return send(200,{...result,state:director.state,actuation:false});}
   if(path==='/api/speech'){const value=await jsonBody(req);ensureFresh(req);exact(value,['command']);if(typeof value.command!=='string'||value.command.length>500)throw new Failure(400,'Short command required');const audio=await job(async folder=>{const aiff=join(folder,'reply.aiff'),wav=join(folder,'reply.wav');await execute('/usr/bin/say',['-v','Samantha','-o',aiff,(value.command===lastPlanCommand&&director.plan&&['proposed','complete'].includes(director.state)?spokenPlanSummary(director.plan):spokenSummary(value.command,now())).text]);await execute('/usr/bin/afconvert',[aiff,wav,'-f','WAVE','-d','LEI16']);const data=await readFile(wav);if(data.length>5_000_000)throw new Failure(413,'Generated audio too large');return data;});return send(200,audio,'audio/wav');}
   if(['/api/transcribe','/api/scene/image','/api/scene/video','/api/scene/video-sample'].includes(path)){
    if(req.headers['content-type']!=='application/octet-stream')throw new Failure(415,'Binary upload required');
    if(busy)throw new Failure(429,'Local inference busy; retry after it finishes');const bytes=await body(req,8_000_000);ensureFresh(req);if(!bytes.length)throw new Failure(400,'Empty media');
    const result=await job(async folder=>{const input=join(folder,path.startsWith('/api/scene/video')?'input.mov':'input.media');await writeFile(input,bytes,{mode:0o600});if(path==='/api/transcribe'){const output=await execute(join(root,'.private','neo-media'),['transcribe',input]);return {transcript:validateTranscript(JSON.parse(output)),simulationStarted:false};}const kind=path.endsWith('/video-sample')?'video-sample':path.endsWith('/video')?'video':'image';const output=await execute(join(root,'.private','neo-scene'),[kind,input]);return {scene:(kind==='video-sample'?reviewSampledVideo:sceneReview)(JSON.parse(output)),commandsIssued:false};});return send(200,result);
   }
   throw new Failure(404,'Unknown operation');
  }catch(error){req.resume();if(!res.headersSent)send(error instanceof Failure?error.status:500,{error:error instanceof Failure?error.message:'Local operation failed',actuation:false});else res.end();}
 });
 server.requestTimeout=30000;server.headersTimeout=5000;server.keepAliveTimeout=1000;server.maxRequestsPerSocket=100;server.maxConnections=8;
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});host=`127.0.0.1:${server.address().port}`;origin=`http://${host}`;
 const close=async()=>{for(const child of children)child.kill('SIGTERM');await new Promise(resolve=>server.close(resolve));for(const folder of folders)await rm(folder,{recursive:true,force:true});};
 return {origin,close,address:server.address()};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const raw=process.argv[2];const port=raw===undefined?8766:Number(raw);startBridge({port}).then(bridge=>{console.log(`Loopback simulation bridge: ${bridge.origin}. No LAN listener, microphone, drone or cloud connection.`);let closing=false;const stop=async()=>{if(closing)return;closing=true;await bridge.close();process.exit(0);};process.on('SIGINT',stop);process.on('SIGTERM',stop);}).catch(()=>{console.error('Bridge could not start. Check the port and local files; existing services were not changed.');process.exitCode=1;});}
