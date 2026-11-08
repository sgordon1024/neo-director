import {parseIntent,makePlan} from './director.js';
// Single-brief context only; deterministic edits, not conversational model memory.
export function conversationRequest(director,text,now){
 const direct=parseIntent(text);
 if(direct.kind==='plan'||direct.kind==='refuse')return director.request(text,now);
 const t=typeof text==='string'?text.toLowerCase().trim().replace(/[.!?]+$/,'').replace(/^please /,'').replace(/\s+/g,' '):'';
 const clauses=t.split(' and ');
 const edits=[];
 const counts={two:2,three:3,four:4,five:5,'2':2,'3':3,'4':4,'5':5};
 for(const clause of clauses){
  if(/^(make (it|that) |keep (it|that) )?(calmer|calm|peaceful|gentle)$/.test(clause))edits.push(['style','calm']);
  else if(/^(make (it|that) )?(more )?(dramatic|cinematic)$/.test(clause))edits.push(['style','dramatic']);
  else if(/^(make (it|that) |keep (it|that) )?(natural|documentary)$/.test(clause))edits.push(['style','natural']);
  else if(/^(make (it|that) |give me )?(two|three|four|five|2|3|4|5) shots$/.test(clause))edits.push(['count',counts[clause.match(/\b(two|three|four|five|2|3|4|5)\b/)[1]]]);
  else if(/^(add )?one more shot$/.test(clause))edits.push(['delta',1]);
  else if(/^(one fewer shot|remove one shot)$/.test(clause))edits.push(['delta',-1]);
  else if(/^(include|add) frank$/.test(clause))edits.push(['pet',true]);
  else if(/^(leave frank out|remove frank)$/.test(clause))edits.push(['pet',false]);
  else return director.request(text,now);
 }
 const fail=reason=>{director.stop();return {kind:'clarify',reason};};
 if(!edits.length||edits.length>3)return fail('Use at most three clear edits.');
 if(director.state==='simulating')return {kind:'refuse',reason:'Stop the simulation before revising the plan.'};
 const base=director.plan;
 if(!base||!['proposed','complete'].includes(director.state))return fail('Start with a campsite or parked-van brief before making a follow-up edit.');
 try{if(JSON.stringify(base)!==JSON.stringify(makePlan(base.subject,base.createdAt,base.brief)))return fail('The previous brief could not be verified. Start a fresh proposal.');}catch{return fail('Start a fresh proposal.');}
 const fields=edits.map(([key])=>key==='delta'?'count':key);
 if(new Set(fields).size!==fields.length)return fail('Conflicting edits. Choose one change per detail.');
 let {count,style}=base.brief,subject=base.subject;
 for(const [key,value] of edits){if(key==='style')style=value;if(key==='count')count=value;if(key==='delta')count+=value;if(key==='pet'){if(subject==='van')return fail('Frank edits apply to the campsite template, not the parked-van template.');subject=value?'frank':'campsite';}}
 if(count<2||count>5)return fail('Keep the sequence between 2 and 5 shots.');
 const target={campsite:'campsite',frank:'campsite with Frank',van:'parked van'}[subject];
 const result=director.request('plan '+count+' '+style+' '+target,now);
 return {...result,revision:true,notice:'Revised the previous brief only. Review the new proposal; no simulation or flight started.'};
}
