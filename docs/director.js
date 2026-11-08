// Pure offline planning. This module has no IO or drone transport.
export const MAX_AGE_MS = 5000;
const templates = Object.freeze({
  campsite: {title: 'Campsite establishing sequence', shots: ['Wide establishing composition', 'Static detail of camp', 'Offset wide closing composition']},
  frank: {title: 'Campsite with Frank', shots: ['Wide establishing composition', 'Static offset wide with stationary Frank and handler', 'Camp detail with Frank outside the flight area']},
  van: {title: 'Dramatic van sequence', shots: ['Parked van establishing composition', 'Static detail of van', 'Wide parked van closing composition']}
});
export function parseIntent(text) {
  if (typeof text !== 'string' || text.length > 500) return {kind:'refuse', reason:'Use a short supported request.'};
  const t = text.trim().toLowerCase().replace(/[.!?]+$/, '').replace(/\s+/g,' ');
  if (/\b(chase|swoop|overfly|takeoff|take off|land|fly|motor|execute|launch|follow|track|drive|driving)\b/.test(t)) return {kind:'refuse',reason:'Flight and moving-subject control are unavailable. Van tracking requires a separate pilot and later validation.'};
  const allowed = {'plan campsite':'campsite','plan campsite with frank':'frank','plan parked van':'van'};
  return Object.hasOwn(allowed,t) ? {kind:'plan',subject:allowed[t]} : {kind:'clarify',reason:'Choose exactly: plan campsite, plan campsite with Frank, or plan parked van. Ambiguous requests are not executed.'};
}
export function makePlan(subject, now) {
  const template = Object.hasOwn(templates,subject) ? templates[subject] : null;
  if (!template || !Number.isFinite(now)) throw Error('Invalid plan request');
  return Object.freeze({schema:1,mode:'simulation',subject,createdAt:now,title:template.title,shots:Object.freeze(template.shots.map((composition,i)=>Object.freeze({id:i+1,composition,durationSeconds:8}))), constraints:Object.freeze(['No drone transport','Human review required','No chase, swoop or overflight of Frank','Recognition is not obstacle avoidance']), requiresSeparatePilot:subject==='van'});
}
// Safety policy is independent of intent parsing. Reject any unrecognized plan.
export function supervise(plan, sample, now) {
  if (!plan || !Object.hasOwn(templates,plan.subject) || !Number.isFinite(plan.createdAt) || !Number.isFinite(now)) return {ok:false,reason:'Unknown plan'};
  try { if (JSON.stringify(plan)!==JSON.stringify(makePlan(plan.subject,plan.createdAt))) return {ok:false,reason:'Unknown or modified plan'}; } catch { return {ok:false,reason:'Malformed plan'}; }
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
    this.plan=makePlan(intent.subject,now);this.state='proposed';return {kind:'proposal',plan:this.plan};
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
