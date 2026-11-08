# Verification evidence

Last verified: 2026-11-08T01:57:55.458432+00:00

## Completed foundation deployment

GitHub Pages build 1350428902 reported `built` for commit `c6affbc598cda91ae98b91c29c946818dbe094c4` on 2026-11-08. Live index.html matched that commit byte for byte; SHA-256 `8f71c6569b1c36e2bb44a798bcdd60e376660f80d31282fa5c9bfcb45c43c60a`.

## Prototype checks

- 29 of 29 Node tests passed with Node.js v24.21.0. The built-in test runner covers supported/ambiguous/refused intents, state transitions, stop, expired plans, malformed plans, stale/future/lost synthetic samples, no-IO/no-actuator invariants, route distance, antimeridian math, segment gaps, GPS freshness and accuracy.
- Headless Chrome browser suite exercises 390 × 844 and 1280 × 844 viewports, no horizontal overflow, structured proposals, complete sequences, stale refusal, unsafe request refusal, synthetic GPS, namespaced segmented GPX and malformed XML rejection.
- Browser suite verifies offline reload and planning with service workers, and zero console errors and page errors.
- Mobile screenshot visually reviewed. Controls have text labels, visible focus styles and status live regions. Real iPhone/Safari, assistive technology and field range remain untested.
- No drone software, flight, motors, hardware or network configuration used.

Reproduce with README instructions. Browser test fixtures are synthetic equatorial coordinates, not actual travel locations. Screenshots and private local paths are not published.

Deployment of the prototype must be verified against GitHub Pages' reported commit and exact asset bytes before it is claimed delivered. See GitHub's Pages deployment/build history for the current deployment commit.

## Timeline redesign verification

Verified 2026-11-08: six colored stage links, two factual milestone markers, keyboard activation, all six detail pages and project notes available offline, and the simulator retained on studio.html. Headless Chrome checks at 390 × 844 and 1280 × 844 passed with no horizontal overflow or console errors. Both responsive layouts were captured; the mobile timeline was visually reviewed. The original simulator browser suite also passed after moving it to the studio page.

## Local media baseline

Verified 2026-11-08: 33 Node tests passed. Six native checks passed: synthetic still dimensions/statistics; synthetic video frame and luminance; invalid image refusal; oversized-file refusal; installed voice output to a local audio file; unavailable transcription-model refusal with no cloud fallback. Spoken proposal wrapper and private video-observation wrapper also ran successfully. See LOCAL-MEDIA.md for limitations. Native speech recognition and OCR are not claimed verified.

## Recognition milestone: earlier blockers resolved

Verified 2026-11-08: 37 Node tests and 14 native checks passed. Five generated speech cases exercised three proposals, takeoff refusal and ambiguous-intent clarification. Still and first-frame video OCR extracted both synthetic labels while keeping command-like text observation-only. Transcription and video OCR also passed in a temporary test-process sandbox denying network access; system services were not separately network-isolated. No download or cloud fallback was used. The prior asset-status gate and OCR timeout are resolved as described in LOCAL-MEDIA.md. Actual headphone/iPhone, noisy speech, semantic scene understanding and field tests remain unverified.

## Companion and recorded-scene prototype

Verified 2026-11-08: 46 Node tests passed. Five added native scene checks passed on the generated still, its locally encoded video and a text-card negative fixture. The existing 14 native speech/OCR checks remain covered by their suite. Phone-layout browser tests passed at 390px and 1280px, including offline typed proposals, local scene review, mocked speech-consent and voice-selection behavior, no overflow and zero console errors. Actual browser microphone and audio playback were not invoked. Unmocked headless Chrome had zero local synthesis voices. Real iPhone/headphone operation and a phone-to-Mini link remain unverified. See PHONE-COMPANION.md, SCENE-REVIEW.md and fixtures/README.md.

## Loopback Mini integration

Verified 2026-11-08: 55 Node tests passed, including nine bridge checks for loopback binding, Host/Origin rejection, session token and expiry, stale/future/replayed request rejection, body-arrival freshness, schema and upload limits, no-actuation state changes, concurrency and cleanup. Real local inference browser checks passed at 390px and 1280px, including native transcription, explicit review/proposal, synthetic stale rejection, completed simulation, WAV decode without playback, scene review and unsafe refusal. All request-owned temporary media was removed. This is a same-Mac loopback test, not a phone-to-Mini network test.

## Phone session protocol model

Verified 2026-11-08: 65 Node tests passed, including ten new pure in-memory protocol checks. The model rejects missing owner approval, missing secure-transport assertion, competing owners, expired/replaced/reused challenges, concurrent requests, clock rollback, stale-session replies and unreviewed proposals. All results remain review-only with actuation false. This model creates no credentials, performs no IO and is not connected to the bridge. PHONE-LINK.md records official browser/native API research and the exact remaining physical-test gates. No actual phone pairing, microphone, camera, headphone playback or network configuration was tested or changed.

## Sparse video review integration
Verified 2026-11-08T03:05:23.574902+00:00: 73 Node checks, prior native scene acceptance and the multi-frame synthetic native tests pass. The loopback browser upload was tested at 390 and 1280 px with actual Apple Vision output. A dog absent from the first half of the synthetic clip generated candidate bookmarks at 2.40 and 3.20 seconds. No identity/continuous tracking or flight-safety claim; no private footage or drone used. See MULTIFRAME-DRAFT.md for sparse-sampling limitations.
