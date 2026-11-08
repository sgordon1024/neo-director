# Local media baseline

Verified 2026-11-08 with synthetic fixtures only. This is a native macOS companion for development, separate from the browser studio. It is not a headphone conversation app or a scene-understanding model.

## Completed

- Read-only inventory identifies a Mac mini with Apple silicon and 16 GB memory. Existing Swift, Apple CoreGraphics, AVFoundation, Speech and Vision frameworks are available. No new runtime was installed.
- Still-image dimensions and grayscale statistics run locally with CoreGraphics. A 1280 × 720 synthetic test card returned bounded luminance and pixel fractions.
- AVFoundation decodes the first frame of a local synthetic video. Frame dimensions and luminance were checked against the source card.
- Installed Samantha voice writes a proposed shot summary to a private AIFF file. The synthetic phrase test produced nonempty mono audio. No audio was played, microphone opened or headphone routing changed.
- The Node wrapper rejects unsupported intents before generating spoken output. Observed image text is never passed to the command parser.
- Six native regression checks and four additional Node tests passed. The complete Node suite is now 33 tests.

## Genuine limits

Apple SpeechTranscriber is available and lists English locales, but AssetInventory reports the specific requested module as `supported`, not `installed`. The transcription command rejects that state; no download or cloud fallback is attempted. Legacy on-device capability reporting alone is insufficient evidence that this newer module can transcribe. Model acquisition, proper application packaging and actual transcription remain unresolved.

Apple Vision OCR did not complete in the bounded synthetic test, including a CPU-only trial terminated after 30 seconds. It is not part of the working analysis path and is not claimed functional. The current native CLI has a 20-second process deadline. Its optional `ocr` command is experimental. The default image and video modes perform pixel statistics with no model inference.

No real camera, drone stream, photos, speech recordings or routes were accessed. Local-only APIs and synthetic file tests were verified; a physical network-disconnected native test and iPhone/Safari/headphone end-to-end test have not been done. The browser's offline reload test is separately verified.

Pixel statistics are not calibrated exposure, depth or obstacle safety measurements. A first frame says nothing about temporal tracking. There is no animal identity, map distance, object recognition or scene-understanding claim.

## Reproduce on the development Mac

Use installed Apple command-line tools and Node. No package download is needed for the tested baseline.

```sh
mkdir -p .private
swiftc -parse-as-library -module-cache-path .private/swift-cache native/Media.swift -o .private/neo-media
swiftc -parse-as-library -module-cache-path .private/swift-cache native/FixtureVideo.swift -o .private/fixture-video
python3 tests/native_media.py
node --test tests/*.test.js
node scripts/local-director.mjs plan 'plan campsite with Frank'
node scripts/local-director.mjs speak 'plan campsite with Frank'
node scripts/local-director.mjs inspect image .private/test-card.png
node scripts/local-director.mjs inspect video .private/test-card.mov
```

The fixture video helper uses Apple APIs that compile with deprecation warnings on the tested SDK. It is test-only. Do not use it on unrelated existing files. Native support on older macOS versions is not verified.

The wrapper writes only `.private/plan-summary.aiff` and `.private/last-observation.json`. These fixed local outputs are replaced on subsequent runs. They are ignored by Git. Native direct commands print results to the terminal; do not copy private results into public issues or commits. Inputs are local files of at most 50 MB; speech files are limited to 60 seconds. Wrapper subprocesses have 15-second timeouts. No model-generated code, shell interpolation, network transport or drone API is used.

## References

[Apple SpeechAnalyzer](https://developer.apple.com/documentation/Speech/SpeechAnalyzer), [Apple's on-device SpeechTranscriber overview](https://developer.apple.com/videos/play/wwdc2025/277/), [Apple Vision text recognition](https://developer.apple.com/documentation/vision/vnrecognizetextrequest).
