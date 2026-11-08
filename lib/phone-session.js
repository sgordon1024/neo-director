// Executable protocol model only. No transport, authentication, capture or credentials.
const operations = new Set(['transcribe', 'scene', 'proposal', 'speech']);
export class PhoneSessionModel {
  constructor() { this.state = 'disconnected'; this.epoch = 0; this.sequence = 0; this.owner = null; this.pending = null; this.challenge = null; }
  snapshot() { return {state:this.state, epoch:this.epoch, owner:this.owner, pending:this.pending?.operation ?? null, actuation:false}; }
  disconnect() { this.state='disconnected'; this.owner=null; this.pending=null; this.challenge=null; this.epoch++; return this.snapshot(); }
  pair({owner, approved, secureTransport}, now) {
    if (!Number.isFinite(now) || typeof owner!=='string' || !/^[a-z0-9-]{1,32}$/.test(owner) || approved!==true || secureTransport!==true || this.state!=='disconnected') throw new Error('Pairing conditions not met');
    this.owner=owner; this.state='ready'; this.expires=now+900000; this.lastTime=now; return this.snapshot();
  }
  check(owner, now) {
    if (!Number.isFinite(now) || now<this.lastTime || now>=this.expires) { this.disconnect(); throw new Error('Session expired or clock invalid'); }
    this.lastTime=now;
    if (this.state==='disconnected' || owner!==this.owner) throw new Error('Session owner required');
  }
  issue(owner, now) {
    this.check(owner,now);
    if (this.state!=='ready') throw new Error('Session busy');
    this.challenge={id:`model-${this.epoch}-${++this.sequence}`, expires:now+10000};
    return {...this.challenge};
  }
  submit({owner, challenge, operation, reviewed=false}, now) {
    this.check(owner,now);
    if(this.state!=='ready' || !this.challenge || challenge!==this.challenge.id || now>=this.challenge.expires) throw new Error('Fresh challenge required');
    this.challenge=null; // Consume even rejected operations; never silently retry.
    if(!operations.has(operation) || (operation==='proposal' && reviewed!==true)) throw new Error('Operation refused or review missing');
    const job={id:`job-${this.epoch}-${this.sequence}`,epoch:this.epoch,operation};
    this.pending=job; this.state='busy'; return {...job};
  }
  complete(job, owner, now) {
    this.check(owner,now);
    if(this.state!=='busy' || job?.id!==this.pending?.id || job?.epoch!==this.epoch) throw new Error('Late or unknown result');
    const operation=this.pending.operation;
    this.pending=null; this.state='ready';
    return {operation,requiresReview:true,automaticSubmission:false,automaticPlayback:false,safety:'unknown',actuation:false};
  }
}
