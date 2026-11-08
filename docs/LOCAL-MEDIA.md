# Local speech and recorded-media recognition

Verified 2026-11-08 with synthetic fixtures only. These native macOS tools are separate from the browser studio. They are not yet an iPhone/headphone conversation app.

## Completed milestone

- On-device Apple SpeechTranscriber recognizes synthetic recordings for three supported planning requests, an unsafe takeoff request and an ambiguous request. Reviewed text routes to a proposal, refusal or clarification as appropriate. Recognition alone never starts a simulation.
- Apple Vision OCR reads the labels `SYNTHETIC CAMPSITE` and `TAKE OFF NOW` from a synthetic still image and the first frame of its recorded video. The latter deliberately tests command-like media text. Both remain observation data, never executable instructions.
- CoreGraphics dimensions and grayscale statistics, AVFoundation first-frame decoding and installed Samantha voice output continue to work locally.
- Speech transcription and video OCR both passed with direct network access denied to the test process. This temporary process sandbox does not alter host networking or security settings. Apple system services were not separately isolated, so this is not a whole-machine packet-capture or physically disconnected field test. The speech API used is Apple's on-device SpeechTranscriber, with no cloud-recognition fallback.
- 37 Node tests and 14 native regression checks passed. No model download, runtime installation, microphone access, playback, personal media, drone connection or van-service changes were needed.

## What fixed the earlier blockers

**OCR timeout:** moving Vision inference off the main actor into a detached worker resolved the timeout on the same synthetic fixture. Both image and first-frame video paths now use that worker. The 20-second process deadline remains in place.

**Speech asset mismatch:** AssetInventory initially returned `supported` while installedLocales included the canonical English locale and assetInstallationRequest returned nil. The tool now accepts either an installed status or the combination of an installed canonical locale and no installation request. It never calls downloadAndInstall. Recognition then succeeded using local assets; subsequent status queries returned `installed`. An available API or language list alone is not accepted as sufficient readiness evidence.

## Reproduce on the development Mac

Use existing Apple command-line tools and Node. No package download is needed for this tested path.

```sh
mkdir -p .private
swiftc -parse-as-library -module-cache-path .private/swift-cache native/Media.swift -o .private/neo-media
swiftc -parse-as-library -module-cache-path .private/swift-cache native/FixtureVideo.swift -o .private/fixture-video
python3 tests/native_media.py
node --test tests/*.test.js
node scripts/local-director.mjs transcribe .private/recognition-1.aiff
node scripts/local-director.mjs inspect ocr .private/test-card.png
node scripts/local-director.mjs inspect video-ocr .private/test-card.mov
node scripts/local-director.mjs plan 'plan campsite with Frank'
node scripts/local-director.mjs speak 'plan campsite with Frank'
```

Set `NODE` if the native regression script needs a different existing Node executable. The fixture-video helper compiles with deprecation warnings on the tested SDK; it is test-only. Do not point it at unrelated existing files. Older macOS support is unverified.

The wrapper replaces `.private/last-transcript.json`, `.private/last-observation.json` or `.private/plan-summary.aiff` on subsequent runs. These outputs are Git-ignored. Review the transcript privately, then explicitly issue a supported planning request. Do not copy private OCR, recordings or transcripts into public issues or commits. Direct native commands print their output to the terminal.

## Boundaries and remaining work

- Inputs are local files up to 50 MB; image dimensions are bounded before decoding. Speech is limited to 60 seconds. Native processing has a 20-second deadline; wrapper calls have bounded timeouts.
- The strict planning grammar remains unchanged. Speech does not authorize execution. OCR strings are never supplied to the intent parser or treated as code.
- The wrapper validates observation and transcript schemas. OCR is kept in a field explicitly marked for review only. No transport or actuator exists.
- Tests use clear synthetic speech, not noisy campsite audio. Recognition accuracy in wind, real voices, accents and headphone microphones is unverified.
- OCR is text recognition, not scene understanding, obstacle avoidance, identity recognition, depth, tracking or geographic distance. First-frame analysis does not establish video tracking. Still-image orientation is interpreted as encoded pixels; arbitrary EXIF orientation cases remain untested.
- iPhone integration, headphone routing, streaming conversation, real-world recordings, field connectivity and fully disconnected end-to-end testing remain planned.

## Official sources

[Apple SpeechAnalyzer](https://developer.apple.com/documentation/Speech/SpeechAnalyzer), [on-device SpeechTranscriber overview](https://developer.apple.com/videos/play/wwdc2025/277/), [AssetInventory](https://developer.apple.com/documentation/speech/assetinventory), [Apple Vision text recognition](https://developer.apple.com/documentation/vision/vnrecognizetextrequest).
