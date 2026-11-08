// Local human review aids only. Candidate labels never identify an individual dog.
export function videoBookmarks(report,sourceSHA256){
 if(!report||report.schema!==2||report.mode!=='video-sample-observation-only'||report.sourceSHA256!==sourceSHA256||! /^[a-f0-9]{64}$/.test(sourceSHA256)||report.safetyAssessment!=='unknown'||report.requiresHumanReview!==true||report.actuation!==false||!Number.isFinite(report.durationSeconds)||report.durationSeconds<=0||report.durationSeconds>120||!Array.isArray(report.frames)||report.frames.length<1||report.frames.length>5||!Array.isArray(report.dogCandidates)||report.dogCandidates.length>100)throw Error('Unverified video review');
 let previous=-1;
 const times=report.frames.map(f=>{if(f.sourceSHA256!==sourceSHA256||!Number.isFinite(f.frameTimeSeconds)||f.frameTimeSeconds<=previous||f.frameTimeSeconds>report.durationSeconds)throw Error('Invalid sample time');previous=f.frameTimeSeconds;return previous;});
 if(report.dogCandidates.some(c=>!times.includes(c.frameTimeSeconds)||!Number.isFinite(c.score)||c.score<.6||c.score>1))throw Error('Invalid candidate time');
 return times.map(time=>({time,label:(report.dogCandidates.some(c=>c.frameTimeSeconds===time)?'Dog candidate':'Sample')+' · '+time.toFixed(2)+' s'}));
}
