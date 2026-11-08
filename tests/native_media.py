"""Run after compiling native tools; uses only generated fixtures under .private."""
import json, subprocess, pathlib, time
root=pathlib.Path('.private'); root.mkdir(exist_ok=True)
checks=[]
def run(args, expected=0):
    result=subprocess.run(args,capture_output=True,text=True,timeout=25)
    assert result.returncode==expected,(args[0:2],result.returncode,result.stdout)
    return json.loads(result.stdout)
run(['.private/neo-media','fixture',str(root/'test-card.png')])
still=run(['.private/neo-media','image',str(root/'test-card.png')])
assert still['width']==1280 and still['height']==720
assert still['ocrAttempted'] is False and still['textObservations']==[]
assert 0<still['metrics']['meanLuminance']<1
checks.append('Synthetic still dimensions and luminance verified; OCR disabled')
video=root/'test-card.mov'
if video.exists():video.unlink()
subprocess.run(['.private/fixture-video',str(root/'test-card.png'),str(video)],check=True,capture_output=True,timeout=15)
frame=run(['.private/neo-media','video',str(video)])
assert frame['width']==1280 and frame['height']==720 and frame['frameTimeSeconds']==0
assert abs(frame['metrics']['meanLuminance']-still['metrics']['meanLuminance'])<.05
checks.append('Synthetic recorded video first frame decoded and checked')
invalid=root/'invalid.txt';invalid.write_text('not an image')
assert run(['.private/neo-media','image',str(invalid)],1)['ok'] is False
checks.append('Invalid image fails closed')
large=root/'oversized.test'
with large.open('wb') as f:f.truncate(50_000_001)
assert run(['.private/neo-media','image',str(large)],1)['ok'] is False
large.unlink();checks.append('Oversized input refused before decoding')
subprocess.run(['/usr/bin/say','-v','Samantha','-o',str(root/'test-speech.aiff'),'Simulation proposal only. Plan campsite with Frank.'],check=True,timeout=15)
audio=run(['.private/neo-media','audio-info',str(root/'test-speech.aiff')])
assert 0<audio['durationSeconds']<15 and audio['channels']==1
checks.append('Installed voice generated nonempty local audio file; no playback')
probe=run(['.private/neo-media','probe'])
if probe['englishModelState']!='installed':
    failure=run(['.private/neo-media','transcribe',str(root/'test-speech.aiff')],1)
    assert 'no download or cloud fallback' in failure['error']
    checks.append('Unavailable transcription model fails closed without download or cloud fallback')
else:
    transcript=run(['.private/neo-media','transcribe',str(root/'test-speech.aiff')])
    assert transcript['requiresTypedReview'] is True
    checks.append('Installed speech model produced a review-only transcript')
print(json.dumps({'passed':True,'checks':checks,'speechModelState':probe['englishModelState']},indent=2))
