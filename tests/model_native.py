"""Synthetic typed requests only. No microphone, private media or flight."""
import json,subprocess,time
cases=[
('Could you give me four peaceful compositions around camp, with Frank in one of them?',4,'calm','frank'),
('I would like two cinematic compositions of my parked van.',2,'dramatic','van'),
('Suggest five serene campsite pictures.',5,'calm','campsite')]
for request,count,style,subject in cases:
 start=time.monotonic()
 p=subprocess.run(['.private/neo-brief',request],text=True,capture_output=True,timeout=25,check=True)
 value=json.loads(p.stdout)
 assert value['suggestion']==dict(count=count,style=style,subject=subject),value
 q=subprocess.run(['node','--input-type=module','-e',"import {validateModelDraft} from './lib/model-brief.js';let s='';for await(const p of process.stdin)s+=p;console.log(JSON.stringify(validateModelDraft(JSON.parse(s),process.argv[1])))",request],input=p.stdout,text=True,capture_output=True,check=True)
 result=json.loads(q.stdout)
 assert result['requiresTypedReview'] and not result['simulationStarted'] and not result['actuation']
 print(json.dumps(dict(passed=True,suggestion=result['suggestedRequest'],elapsedSeconds=round(time.monotonic()-start,2))))
