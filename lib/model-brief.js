import {parseIntent} from '../docs/director.js';
export function validateModelDraft(value,request){
 if(typeof request!=='string'||!request.trim()||request.length>500||parseIntent(request).kind==='refuse')throw Error('Unsupported request');
 if(!value||value.schema!==1||value.engine!=='Apple FoundationModels SystemLanguageModel'||value.mode!=='draft-for-review'||value.requiresTypedReview!==true||value.actuation!==false)throw Error('Invalid model envelope');
 const s=value.suggestion;
 if(!s||Object.keys(s).sort().join(',')!=='count,style,subject'||!Number.isInteger(s.count)||s.count<2||s.count>5||!['natural','calm','dramatic'].includes(s.style)||!['campsite','frank','van','unsupported'].includes(s.subject))throw Error('Invalid model suggestion');
 if(s.subject==='unsupported')return {suggestedRequest:null,requiresTypedReview:true,simulationStarted:false,actuation:false,notice:'No supported draft. Clarify the subject, count and mood.'};
 const t=request.toLowerCase();
 if(s.subject==='frank'&&!/\bfrank\b/.test(t))throw Error('Unrequested identity');
 if(s.subject==='van'&&!/\bparked\b/.test(t))throw Error('Vehicle is not explicitly parked');
 const numbers={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
 const countWords=t.replace(/\bin one of (the |them\b)[^.!?]*/g,'').match(/\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/g)||[];
 if(countWords.some(w=>(numbers[w]||Number(w))!==s.count))throw Error('Requested count not preserved');
 const known=parseIntent(request);
 if(known.kind==='plan'&&(known.subject!==s.subject||known.brief.count!==s.count||known.brief.style!==s.style))throw Error('Known brief not preserved');
 const subject={campsite:'campsite',frank:'campsite with Frank',van:'parked van'}[s.subject];
 return {suggestedRequest:'plan '+s.count+' '+s.style+' '+subject,requiresTypedReview:true,simulationStarted:false,actuation:false,notice:'Local model suggestion, not verified understanding. Check every detail, then explicitly Propose. No simulation or flight started.'};
}
