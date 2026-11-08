// Pure offline planning. This module has no IO or drone transport.
export const MAX_AGE_MS = 5000;
const templates = Object.freeze({
  campsite: {title: 'Campsite establishing sequence', shots: ['Wide establishing composition', 'Static detail of camp', 'Offset wide closing composition']},
  frank: {title: 'Campsite with Frank', shots: ['Wide establishing composition', 'Static offset wide with stationary Frank and handler', 'Camp detail with Frank outside the flight area']},
  van: {title: 'Parked van sequence', shots: ['Parked van establishing composition', 'Static detail of van', 'Wide parked van closing composition']}
});
// Bounded offline phrase/slot interpreter, not an LLM. Unknown details clarify.
export function parseIntent(text) {
  if (typeof text !== 'string' || text.length > 500) return {kind:'refuse', reason:'Use a short supported request.'};
  const t = text.trim().toLowerCase().replace(/[.!?,]+/g,' ').replace(/\s+/g,' ').trim();
  if (/\b(chase|swoop|overfly|takeoff|take off|land|fly|motor|execute|launch|follow|track|drive|driving)\b/.test(t)) return {kind:'refuse',reason:'Flight and moving-subject control are unavailable. Van tracking requires a separate pilot and later validation.'};
  const clarify=reason=>({kind:'clarify',reason});
  if (/\b(no|not|never|without|except|ignore|instead|or)\b/.test(t)) return clarify('Negation, alternatives and corrections need a fresh explicit brief. Try: plan 3 calm campsite shots with Frank.');
  const allowed=new Set('plan create make suggest propose give get shoot film capture record a an the my our me us please can could would you i want to some few cool shots shot videos video photos photo pictures picture compositions composition sequence of for at campsite camp site camping parked van with frank dog include including and in one sure very dramatic cinematic calm peaceful gentle natural documentary 2 3 4 5 two three four five'.split(' '));
  if (!t || t.split(' ').some(word=>!allowed.has(word))) return clarify('I can draft 2–5 campsite or parked-van compositions, optionally including Frank, in natural, calm or dramatic style. Unrecognized details were not applied.');
  if (/\bone\b/.test(t.replace(/\bin one of the (videos|shots|photos|pictures)\b/g,''))) return clarify('Choose a shot count from 2 to 5.');
  if (/\bdog\b/.test(t) && !/\bfrank\b/.test(t)) return clarify('For the pet template, explicitly request Frank. A generic dog is not assumed to be Frank.');
  const camp=/\b(campsite|camp|camping)\b/.test(t), van=/\bvan\b/.test(t), pet=/\b(frank|dog)\b/.test(t);
  if (camp===van || (van&&!/\bparked\b/.test(t)) || (van&&pet)) return clarify('Choose a campsite (optionally with Frank), or explicitly a parked van. Mixed subjects need separate briefs.');
  if (!/\b(plan|create|make|suggest|propose|give|get|shoot|film|capture|record|want)\b/.test(t)) return clarify('Ask for a shot plan, for example: create a few calm campsite shots.');
  const counts={two:2,three:3,four:4,five:5,'2':2,'3':3,'4':4,'5':5};
  const unique=[...new Set(t.split(' ').filter(w=>Object.hasOwn(counts,w)).map(w=>counts[w]))];
  if(unique.length>1)return clarify('Choose one shot count from 2 to 5.');
  const styles=[];
  if(/\b(dramatic|cinematic)\b/.test(t))styles.push('dramatic');
  if(/\b(calm|peaceful|gentle)\b/.test(t))styles.push('calm');
  if(/\b(natural|documentary)\b/.test(t))styles.push('natural');
  if(styles.length>1)return clarify('Choose one style: natural, calm or dramatic.');
  return {kind:'plan',subject:van?'van':pet?'frank':'campsite',brief:{count:unique[0]||3,style:styles[0]||'natural'}};
}
export function makePlan(subject, now, brief={count:3,style:'natural'}) {
  const template=Object.hasOwn(templates,subject)?templates[subject]:null;
  if(!template||!Number.isFinite(now)||!brief||Object.keys(brief).sort().join(',')!=='count,style'||!Number.isInteger(brief.count)||brief.count<2||brief.count>5||!['natural','calm','dramatic'].includes(brief.style))throw Error('Invalid plan request');
  const extra=subject==='van'?['Static texture detail of parked van','Wide parked van against landscape']:['Static camp texture detail','Wide landscape with camp at edge of frame'];
  const all=[...template.shots,...extra];
  const treatment={natural:'Natural documentary framing',calm:'Calm balanced composition; hold steady',dramatic:'Dramatic off-center composition and foreground contrast'};
  return Object.freeze({schema:1,mode:'simulation',subject,brief:Object.freeze({...brief}),createdAt:now,title:template.title,shots:Object.freeze(all.slice(0,brief.count).map((composition,i)=>Object.freeze({id:i+1,composition:composition+' — '+treatment[brief.style],durationSeconds:8}))), constraints:Object.freeze(['No drone transport','Human review required','No chase, swoop or overflight of Frank','Recognition is not obstacle avoidance','Style describes framing only, not aircraft movement','Frank inclusion is a requested subject, not verified identity']), requiresSeparatePilot:subject==='van'});
}
// Safety policy is independent of intent parsing. Reject any unrecognized plan.
export function supervise(plan, sample, now) {
  if (!plan || !Object.hasOwn(templates,plan.subject) || !Number.isFinite(plan.createdAt) || !Number.isFinite(now)) return {ok:false,reason:'Unknown plan'};
  try { if (JSON.stringify(plan)!==JSON.stringify(makePlan(plan.subject,plan.createdAt,plan.brief))) return {ok:false,reason:'Unknown or modified plan'}; } catch { return {ok:false,reason:'Malformed plan'}; }
  if (now < plan.createdAt || now-plan.createdAt>60000) return {ok:false,reason:'Plan expired'};
  if (!sample || sample.source!=='synthetic' || sample.link!=='ready' || !Number.isFinite(sample.at) || now-sample.at<0 || now-sample.at>MAX_AGE_MS) return {ok:false,reason:'Missing, stale or lost synthetic telemetry'};
  return {ok:true,reason:'Simulation permitted; actuation impossible'};
}
export class Director {
  constructor(){this.state='idle';this.plan=null;this.elapsed=0;}
  request(text,now){
    if(this.state==='simulating') return {kind:'refuse',reason:'Stop the simulation before changing the plan.'};
    this.plan=null;this.elapsed=0;const intent=parseIntent(text);
    if(intent.kind!=='plan'){this.state=intent.kind==='refuse'?'refused':'clarification';return intent;}
    this.plan=makePlan(intent.subject,now,intent.brief);this.state='proposed';return {kind:'proposal',plan:this.plan};
  }
  start(sample,now){
    if(this.state!=='proposed') return {ok:false,reason:'A new proposal is required'};
    const result=supervise(this.plan,sample,now);this.state=result.ok?'simulating':'blocked';return result;
  }
  tick(sample,now){
    if(this.state!=='simulating') return {ok:false,reason:'No active simulation'};
    const result=supervise(this.plan,sample,now);
    if(!result.ok){this.state='blocked';return result;}
    this.elapsed+=1;if(this.elapsed>=this.plan.shots.length)this.state='complete';
    return {ok:true,shot:this.plan.shots[this.elapsed-1],elapsedSeconds:this.elapsed*8,state:this.state};
  }
  stop(){this.state='stopped';this.plan=null;this.elapsed=0;return {ok:true,reason:'Simulation stopped. No landing command was sent.'};}
}
