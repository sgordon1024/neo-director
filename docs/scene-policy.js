export function sceneReview(value){
 if(!value||value.schema!==1||value.mode!=='scene-observation-only'||value.engine!=='Apple Vision image classification and animal detection'||value.requiresHumanReview!==true||value.safetyAssessment!=='unknown'||typeof value.sourceSHA256!=='string'||!/^([a-f0-9]{64})$/.test(value.sourceSHA256))throw Error('Unsupported scene report');
 for(const key of ['width','height'])if(!Number.isInteger(value[key])||value[key]<1||value[key]>12000)throw Error('Invalid frame dimensions');
 const clean=(items,animal=false)=>{if(!Array.isArray(items)||items.length>100)throw Error('Invalid candidates');return items.map(item=>{if(!item||typeof item.label!=='string'||item.label.length>100||!Number.isFinite(item.score)||item.score<0||item.score>1)throw Error('Invalid candidate');const result={label:item.label,score:item.score};if(animal){const b=item.box;if(!b||['x','y','width','height'].some(k=>!Number.isFinite(b[k])||b[k]<0||b[k]>1)||b.x+b.width>1.00001||b.y+b.height>1.00001)throw Error('Invalid frame box');result.box={x:b.x,y:b.y,width:b.width,height:b.height};}return result;});};
 const classifications=clean(value.classifications),animalCandidates=clean(value.animalCandidates,true);
 const visible=classifications.filter(c=>c.score>=.6);
 const animal=animalCandidates.some(a=>a.score>=.6);
 const notes=[visible.length?`Candidate labels: ${visible.map(c=>c.label).join(', ')}.`:'No label clears the review threshold. Scene remains uncertain.',animal?'An animal candidate needs human review. Consider only a stationary, offset wide composition; no chase or overflight.':'No confident animal candidate. This does not prove animals are absent.','Safety is unknown. These scores cannot establish a safe route, distance or pet identity.'];
 const result={schema:1,mode:value.mode,engine:value.engine,sourceSHA256:value.sourceSHA256,width:value.width,height:value.height,classifications,animalCandidates,safetyAssessment:'unknown',requiresHumanReview:true,notes};
 if(value.frameTimeSeconds!==undefined){if(!Number.isFinite(value.frameTimeSeconds)||value.frameTimeSeconds<0)throw Error('Invalid frame time');result.frameTimeSeconds=value.frameTimeSeconds;}
 return result;
}
