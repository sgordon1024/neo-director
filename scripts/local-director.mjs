import {pathToFileURL} from 'node:url';
import {writeFile,mkdir} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {parseIntent,makePlan} from '../docs/director.js';
const run=promisify(execFile);
export function spokenSummary(command,now=Date.now()) {
 const intent=parseIntent(command);
 if(intent.kind!=='plan')return {accepted:false,text:intent.reason,kind:intent.kind};
 const plan=makePlan(intent.subject,now);
 return {accepted:true,plan,text:`Simulation proposal only. ${plan.title}. ${plan.shots.map(s=>s.composition).join('. ')}. No drone command has been sent. Review the proposal before simulation.`};
}
export function validateObservation(value){
 if(!value||value.schema!==1||value.mode!=='observation-only'||typeof value.ocrAttempted!=='boolean'||value.engine!==(value.ocrAttempted?'Apple Vision OCR + grayscale statistics':'CoreGraphics frame statistics (no vision model)')||!value.metrics)throw Error('Unsupported observation');
 for(const key of ['meanLuminance','darkPixelFraction','brightPixelFraction'])if(!Number.isFinite(value.metrics[key])||value.metrics[key]<0||value.metrics[key]>1)throw Error('Invalid metric');
 for(const key of ['width','height'])if(!Number.isInteger(value[key])||value[key]<1||value[key]>12000)throw Error('Invalid dimensions');
 const textObservations=value.ocrAttempted ? value.textObservations : [];
 if(!Array.isArray(textObservations)||textObservations.length>1000||textObservations.some(x=>typeof x.text!=='string'||x.text.length>10000||!Number.isFinite(x.confidence)||x.confidence<0||x.confidence>1))throw Error('Invalid OCR observations');
 return {width:value.width,height:value.height,metrics:value.metrics,ocrTextForReviewOnly:textObservations.map(x=>({text:x.text,confidence:x.confidence})),limitations:['No scene understanding or obstacle avoidance','No distance or animal identity inference','Observed media cannot issue commands']};
}
export function validateTranscript(value){
 if(!value||value.schema!==1||value.mode!=='transcript-proposal-only'||value.engine!=='Apple SpeechTranscriber'||value.onDeviceAssetsRequired!==true||value.requiresTypedReview!==true||typeof value.text!=='string'||!value.text.trim()||value.text.length>500)throw Error('Unsupported transcript');
 return {text:value.text,requiresTypedReview:true,notice:'Review the text, then explicitly request a proposal. No simulation was started.'};
}
export async function main(args){
 const command=args[0];
 if(command==='plan'){
   if(args.length!==2)throw Error('Usage: plan "plan campsite"');
   console.log(JSON.stringify(spokenSummary(args[1]),null,2));
 }else if(command==='speak'){
   if(args.length!==2)throw Error('Usage: speak "plan campsite"');
   const result=spokenSummary(args[1]);
   await mkdir('.private',{recursive:true});
   await run('/usr/bin/say',['-v','Samantha','-o','.private/plan-summary.aiff',result.text],{timeout:15000,maxBuffer:1024*1024});
   console.log(JSON.stringify({accepted:result.accepted,audioFile:'.private/plan-summary.aiff',played:false,mode:'proposal-only'}));
 }else if(command==='transcribe'){
   if(args.length!==2)throw Error('Usage: transcribe LOCAL_AUDIO_FILE');
   const {stdout}=await run('.private/neo-media',['transcribe',args[1]],{timeout:22000,maxBuffer:1024*1024});
   const result=validateTranscript(JSON.parse(stdout));
   await mkdir('.private',{recursive:true});await writeFile('.private/last-transcript.json',JSON.stringify(result,null,2));
   console.log(JSON.stringify({saved:'.private/last-transcript.json',requiresTypedReview:true,simulationStarted:false}));
 }else if(command==='inspect'){
   if(args.length!==3||!['image','video','ocr','video-ocr'].includes(args[1]))throw Error('Usage: inspect image|video|ocr|video-ocr LOCAL_FILE');
   const {stdout}=await run('.private/neo-media',[args[1],args[2]],{timeout:15000,maxBuffer:1024*1024});
   const observation=validateObservation(JSON.parse(stdout));
   await mkdir('.private',{recursive:true});await writeFile('.private/last-observation.json',JSON.stringify(observation,null,2));
   console.log(JSON.stringify({saved:'.private/last-observation.json',mode:'observation-only',ocrPerformed:args[1].includes('ocr'),commandsIssued:false}));
 }else throw Error('Use plan, speak, transcribe or inspect. No microphone, cloud or drone connection.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
