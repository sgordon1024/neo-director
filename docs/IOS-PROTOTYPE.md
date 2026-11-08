# Native phone-local prototype

## Verified scope

An unsigned iOS Simulator app now runs without a Mini server connection. Structured campsite, Frank-at-camp and parked-van briefs produce two to five static composition suggestions. A separate native Vision check processes only the bundled synthetic campsite image. It reports a dog candidate, not Frank identity, obstacle clearance or a safe flight path.

The simulator self-test covers all 36 structured combinations and independent draft-constraint rejection. Native Vision detected one dog candidate in the generated fixture. The Propose control was exercised in Device Hub. No physical iPhone, headset, microphone, camera, photo library, drone connection or real flight was used.

## Local model remains experimental

The installed simulator runtime reports the system language model available. It generated a typed response but omitted explicitly requested Frank in a synthetic brief. Independent validation now rejects that mismatch instead of accepting it. Availability is not a successful conversational test. Use structured controls; reliable native conversational drafting remains unfinished.

No model download, cloud fallback, account, signing profile, certificate, network listener or permission setting was added. The existing verified Mini and browser paths remain unchanged.

## Reproduce on the development Mac

Build with `bash ios/build-simulator.sh`. This writes only a git-ignored `.private/NeoDirector.app` unsigned simulator bundle. Install it in an existing arm64 iOS Simulator with `simctl install`, then launch bundle `dev.neodirector.simulator --self-test`. Read its application Documents/self-test.json. `corePassed` and `scene.success` must be true; `modelDraftPassed` is a separate experimental result, not an expected success gate. Review `modelStatus` before interpreting any failure.

Simulator Vision uses CPU-only execution because its initial default compute path failed. The deprecated simulator-only flag produces a compiler warning. This is not evidence about performance or availability on the actual phone.

## Remaining gates

Physical installation/signing and actual iPhone compatibility, lifecycle, accessibility, microphone and headphone testing remain outstanding. No consent prompt has been accepted. No command from this app can operate a drone. Model proposals are untrusted suggestions requiring explicit field review and a separate Propose action.
