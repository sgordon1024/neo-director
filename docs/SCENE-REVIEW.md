# Recorded-scene review

Verified 2026-11-08 using a generated scene, not personal media. Apple Vision classification and animal detection run locally on still images or the first decoded frame of a video.

## Observed results

The generated campsite contains a tent, a fictional dog and a parked van. The still-image model reported camping-related labels and a Dog candidate whose box falls over the dog. The recorded version also returned a dog candidate. The test does not require the van to be recognized, and no general multi-object understanding is claimed. Scores are model outputs, not calibrated probabilities.

Five native checks passed: still-image labels and animal location; recorded first-frame animal location; a text-card negative fixture with no confident animal; source hash verification; and recorded analysis with direct networking denied to the test process. System services were not separately isolated. This is one generated positive scene and one negative fixture, not a real-world accuracy benchmark.

The scene report includes a SHA-256 source fingerprint and relative video frame time when applicable. Its safetyAssessment is always unknown and requiresHumanReview is always true. A fixed 0.6 display threshold selects review notes; it is not a certified confidence or safety threshold. No detection does not establish absence. A detected dog is not proof that it is Frank.

## Use locally

```sh
swiftc -parse-as-library -module-cache-path .private/swift-cache native/Scene.swift -o .private/neo-scene
python3 tests/scene_native.py
node scripts/local-director.mjs scene image fixtures/synthetic-campsite.png
node scripts/local-director.mjs scene video .private/synthetic-campsite.mov
```

Compile the earlier fixture-video helper first, as described in LOCAL-MEDIA.md. The wrapper writes `.private/last-scene.json`. It can be selected in the companion's scene-review panel; the file stays in the tab and does not start a command. Media remains local. Input size, frame dimensions, candidate counts, score ranges and bounding boxes are bounded. Processes have a 20-second deadline.

The report provides candidate labels and conservative composition notes only. It cannot estimate route distance, identify a particular pet, establish obstacle clearance, follow a moving subject or authorize flight. It analyzes one frame, not a temporal track. Whole-scene semantic reasoning, field recordings and independent scene accuracy evaluation remain future work.

[Apple image classification](https://developer.apple.com/documentation/vision/vnclassifyimagerequest), [Apple animal recognition](https://developer.apple.com/documentation/vision/vnrecognizeanimalsrequest).
