const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Applications/ChatGPT.app/Contents/Resources/cua_node/lib/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const base=process.env.BASE_URL||'http://127.0.0.1:8765/';const checks=[];
for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:844}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(base+"studio.html");await page.waitForFunction(()=>document.querySelector('#offline').textContent.startsWith('Offline cache ready'));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks.push(`${width}px: no horizontal overflow`);
 await page.getByRole('button',{name:'Include Frank',exact:true}).click();assert.match(await page.locator('#output').innerText(),/proposed/);
 await page.getByRole('button',{name:'Start simulation',exact:true}).click();for(let i=0;i<3;i++)await page.getByRole('button',{name:'Next simulated shot',exact:true}).click();assert.match(await page.locator('#output').innerText(),/complete/);
 await page.getByRole('button',{name:'Campsite',exact:true}).click();await page.locator('#stale').check();await page.getByRole('button',{name:'Start simulation',exact:true}).click();assert.match(await page.locator('#output').innerText(),/blocked/);
 await page.locator('#command').fill('chase Frank');await page.getByRole('button',{name:'Propose shots',exact:true}).click();assert.match(await page.locator('#output').innerText(),/refused/);
 await page.getByRole('button',{name:'Try synthetic GPS route',exact:true}).click();assert.match(await page.locator('#route-result').innerText(),/222.4 m total/);
 const gpx='<?xml version="1.0"?><gpx xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg><trkpt lat="0" lon="0"/><trkpt lat="0" lon="1"/></trkseg><trkseg><trkpt lat="0" lon="10"/><trkpt lat="0" lon="11"/></trkseg></trk></gpx>';
 await page.locator('#gpx').setInputFiles({name:'synthetic.gpx',mimeType:'application/gpx+xml',buffer:Buffer.from(gpx)});await page.waitForFunction(()=>document.querySelector('#route-result').textContent.includes('222.39 km'));
 const parseChecks=await page.evaluate(async()=>{const {parseGPX}=await import('./route.js');return ['<gpx><trk><trkseg><trkpt lat="" lon="0"/><trkpt lat="0" lon="1"/></trkseg></trk></gpx>','<gpx>','<!DOCTYPE gpx><gpx/>','<gpx><trk><trkseg><trkpt lat="91" lon="0"/><trkpt lat="0" lon="1"/></trkseg></trk></gpx>'].map(x=>{try{parseGPX(x);return false}catch{return true}})});assert.ok(parseChecks.every(Boolean));checks.push(`${width}px: simulation, stale refusal, unsafe request refusal, synthetic GPS, segmented GPX and invalid XML checks passed`);
 await page.screenshot({path:`/tmp/neo-${width}.png`,fullPage:true});
 await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Parked van',exact:true}).click();assert.match(await page.locator('#output').innerText(),/proposed/);checks.push(`${width}px: offline reload and proposal passed`);
 assert.deepEqual(errors,[]);checks.push(`${width}px: zero console errors and page errors`);await context.close();
}await browser.close();console.log(JSON.stringify({passed:true,checks},null,2));})().catch(e=>{console.error(e);process.exit(1)});
