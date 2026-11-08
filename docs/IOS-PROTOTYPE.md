# Native phone-local prototype

## Verified scope

An unsigned iOS Simulator app now runs without a Mini server connection. Structured campsite, Frank-at-camp and parked-van briefs produce two to five static composition suggestions. A separate native Vision check processes only the bundled synthetic campsite image. It reports a dog candidate, not Frank identity, obstacle clearance or a safe flight path.

The simulator self-test covers all 36 structured combinations and independent draft-constraint rejection. Native Vision detected one dog candidate in the generated fixture. The Propose control was exercised in Device Hub. No physical iPhone, headset, microphone, camera, photo library, drone connection or real flight was used.

## Local model remains experimental

The installed simulator runtime reports the system language model available. It generated a typed response but omitted explicitly requested Frank in a synthetic brief. Independent validation rejects that mismatch instead of accepting it. A strict bounded-vocabulary contract now runs before model generation, supplies required subject/style/count, and verifies all three afterward. Negation, unknown subjects or actions, conflicting counts/styles, generic-dog identity and unparked vehicles are rejected. This is deliberately not unrestricted natural-language understanding. Structured controls remain the fallback.

No model download, cloud fallback, account, signing profile, certificate, network listener or permission setting was added. The existing verified Mini and browser paths remain unchanged.

## Reproduce on the development Mac

Build with `bash ios/build-simulator.sh`. This writes only a git-ignored `.private/NeoDirector.app` unsigned simulator bundle. Install it in an existing arm64 iOS Simulator with `simctl install`, then launch bundle `dev.neodirector.simulator --self-test`. Read its application Documents/self-test.json. `corePassed` and `scene.success` must be true; `modelDraftPassed` is a separate experimental result covering three synthetic local-model cases. Review `modelStatus` before interpreting any failure.

Simulator Vision uses CPU-only execution because its initial default compute path failed. The deprecated simulator-only flag produces a compiler warning. This is not evidence about performance or availability on the actual phone.

## Remaining gates

Physical installation/signing and actual iPhone compatibility, lifecycle, accessibility, microphone and headphone testing remain outstanding. No consent prompt has been accepted. No command from this app can operate a drone. Model proposals are untrusted suggestions requiring explicit field review and a separate Propose action.

## Native contract regression checks

Compile `ios/PlanCore.swift` and `ios/ContractTests.swift` with the installed Swift compiler and run the resulting local executable. 166 assertions cover four supported requests, every supported output-field combination for each request, and 18 unsupported or conflicting inputs. No microphone or device permission is needed.

The guarded simulator model passed three end-to-end synthetic cases: four calm campsite shots with Frank, two dramatic parked-van compositions, and a default three-shot campsite brief. All returned fields matched the independent contract, with no proposal automatically started. This repairs the observed Frank omission for the tested case; it does not establish arbitrary conversational reliability or hands-free operation.

## Simulator speech gate

A generated Samantha-voice AIFF containing “Create four calm campsite shots with Frank” is bundled locally by the build script for self-testing only. The app checks installed on-device speech support before reading it. The current iOS Simulator reports `SpeechTranscriber.isAvailable == false`, so transcription was refused before processing. No asset download, permission request, microphone access or alternate/cloud recognizer was attempted. The same run retained passing structured, three model and synthetic Vision checks. Hands-free native phone operation is not verified. Existing Mini speech results do not establish iPhone availability.
