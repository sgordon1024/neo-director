"""Mac-only acceptance check. Never downloads models or reads private footage.
Run existing tests/scene_native.py first to create synthetic-campsite.mov.
"""
import hashlib
import json
import pathlib
import subprocess

video = pathlib.Path('.private/synthetic-campsite.mov')
assert video.exists(), 'Create the synthetic fixture with tests/scene_native.py first'
r = subprocess.run(['.private/neo-scene', 'video-sample', str(video)],
                   capture_output=True, text=True, timeout=25)
assert r.returncode == 0, (r.returncode, r.stdout)
value = json.loads(r.stdout)
assert value['schema'] == 2 and value['mode'] == 'video-sample-observation-only'
assert value['sourceSHA256'] == hashlib.sha256(video.read_bytes()).hexdigest()
frames = value['frames']
assert 2 <= len(frames) <= 5, 'Fixture must demonstrate more than first-frame extraction'
times = [f['frameTimeSeconds'] for f in frames]
assert times == sorted(set(times)) and times[-1] > 0
for frame in frames:
    assert frame['sourceSHA256'] == value['sourceSHA256']
    assert frame['safetyAssessment'] == 'unknown' and frame['requiresHumanReview'] is True
    assert any(a['label'] == 'Dog' and a['score'] >= .6 for a in frame['animalCandidates'])
# Run the actual JS review boundary, not a separate Python reimplementation.
review = subprocess.run(['node', '--input-type=module', '-e',
    "import {reviewSampledVideo} from './lib/video-review.js'; let s=''; for await (const p of process.stdin) s+=p; console.log(JSON.stringify(reviewSampledVideo(JSON.parse(s))));"],
    input=r.stdout, capture_output=True, text=True, check=True, timeout=5)
summary = json.loads(review.stdout)
assert summary['actuation'] is False and len(summary['dogCandidates']) >= 2
print(json.dumps({'passed': True, 'sampleTimes': times,
                  'limits': 'Repeated synthetic scene only. No real accuracy, pet identity or continuous tracking claim.'}))

# A negative first half followed by the generated dog/campsite scene.
mixed = pathlib.Path('.private/synthetic-late-dog.mov')
if mixed.exists(): mixed.unlink()
subprocess.run(['.private/fixture-video', '.private/test-card.png', str(mixed), 'fixtures/synthetic-campsite.png'], check=True, capture_output=True, timeout=15)
r = subprocess.run(['.private/neo-scene', 'video-sample', str(mixed)], capture_output=True, text=True, check=True, timeout=25)
value = json.loads(r.stdout)
assert value['sourceSHA256'] == hashlib.sha256(mixed.read_bytes()).hexdigest()
assert len(value['frames']) >= 3
first = value['frames'][0]
assert not any(a['label'] == 'Dog' and a['score'] >= .6 for a in first['animalCandidates'])
dog_times = [f['frameTimeSeconds'] for f in value['frames'] if any(a['label'] == 'Dog' and a['score'] >= .6 for a in f['animalCandidates'])]
assert dog_times and all(t >= 2 for t in dog_times), dog_times
assert all(f['safetyAssessment'] == 'unknown' for f in value['frames'])
print(json.dumps({'mixedFixturePassed': True, 'dogCandidateTimes': dog_times, 'limitations': 'Synthetic scene transition only; no Frank identity or real-world accuracy claim.'}))
