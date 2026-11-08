import subprocess,json,pathlib,hashlib
root=pathlib.Path('.private');fixture=pathlib.Path('fixtures/synthetic-campsite.png')
def run(args):
 r=subprocess.run(args,capture_output=True,text=True,timeout=25);assert r.returncode==0,(r.returncode,r.stdout);return json.loads(r.stdout)
still=run(['.private/neo-scene','image',str(fixture)])
assert still['sourceSHA256']==hashlib.sha256(fixture.read_bytes()).hexdigest()
assert any(c['label']=='camping' and c['score']>.6 for c in still['classifications'])
def dog(report):
 dogs=[a for a in report['animalCandidates'] if a['label']=='Dog' and a['score']>.6];assert dogs
 b=dogs[0]['box'];assert .3<b['x']+b['width']/2<.65 and .15<b['y']+b['height']/2<.65
 assert report['safetyAssessment']=='unknown' and report['requiresHumanReview'] is True
dog(still)
video=root/'synthetic-campsite.mov'
if video.exists():video.unlink()
subprocess.run(['.private/fixture-video',str(fixture),str(video)],check=True,capture_output=True,timeout=15)
frame=run(['.private/neo-scene','video',str(video)]);dog(frame);assert frame['frameTimeSeconds']==0
negative=run(['.private/neo-scene','image','.private/test-card.png']);assert not any(a['score']>.6 for a in negative['animalCandidates'])
profile=root/'no-network.sb';profile.write_text('(version 1)\n(allow default)\n(deny network*)\n')
restricted=run(['/usr/bin/sandbox-exec','-f',str(profile),'.private/neo-scene','video',str(video)]);dog(restricted)
print(json.dumps({'passed':True,'checks':['Synthetic still: camping candidate and dog candidate at expected frame position','Synthetic recorded video: first-frame dog candidate with safety unknown','Negative text-card fixture: no confident animal candidate','Source hash matches fixture','Recorded scene detection succeeds with test-process networking denied'],'limitations':'One generated scene, not a real-world accuracy benchmark; system services not separately isolated'},indent=2))
