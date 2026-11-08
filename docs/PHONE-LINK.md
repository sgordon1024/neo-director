# Phone-to-Mini connection design and executable model

Status: protocol behavior tested in memory; no phone transport, real pairing or device capture implemented by this milestone. The existing Mini service still binds only to loopback. The model is not an authentication library and is not wired into the server.

## Proposed first connection

Serve the phone interface and bounded API from one authenticated HTTPS origin on the Mini over an owner-approved existing local network. Keep the public Pages tracker separate. Do not make Pages probe a private address, relax CORS, bypass certificate checks, or expose the current loopback bootstrap token endpoint.

A real deployment needs an explicitly approved listener address/port, a certificate and hostname trusted by the phone, and a reviewed pairing mechanism. No certificate, account, persistent credential, firewall rule, network discovery or LAN listener has been created. Native iOS with certificate pinning is an alternative if browser trust provisioning is unacceptable; it needs a separately built/signed app and device testing. Neither option is selected or installed yet. Internet relay and cloud inference are outside the offline design.

## Pairing and request lifecycle

1. Owner opens a short pairing window on the Mini. A future implementation generates cryptographically random session material and verifies a displayed pairing challenge on both devices over authenticated transport. A short code alone is not transport authentication; rate limits and attempt limits are required.
2. One paired phone owns the session. Approval, identity and transport validation must come from trusted server state, never boolean fields supplied by a remote client.
3. Use an in-memory session with a 15-minute lifetime. Issue a single-use request challenge with a 10-second lifetime using server monotonic time. Replacement invalidates the previous challenge. A production nonce must be unpredictable; the model's sequential identifiers are deliberately synthetic.
4. Allow only transcription, observation, reviewed proposals and spoken replies. One inference job at a time; preserve bridge upload bounds, body-arrival freshness checks, timeouts and private cleanup. No remote shell, model code or flight commands.
5. Transcript and scene results require review. Spoken output requires a tap. Results never submit commands, start simulation or play automatically.
6. Disconnect, page suspension, revocation or expiry clears pending state. Late replies from an old session are discarded. Reconnect requires a new explicit session and cannot replay queued requests. Production cancellation must terminate/clean up owned inference work, not merely hide the result.

`lib/phone-session.js` is an executable protocol model with injected timestamps and synthetic identifiers. Ten tests exercise owner isolation, approval/transport prerequisites, challenge expiry and replacement, replay, concurrency, clock failure, session expiry, reconnect races, review requirements and no-actuation results. It performs no IO, captures no media and creates no credentials. Passing these tests is protocol evidence, not cryptographic or network security validation.

## Voice and camera capability plan

| Capability | Proposed behavior | Evidence / remaining gate |
| --- | --- | --- |
| Typed interaction | Keep available when capture is unsupported | Existing offline companion verified |
| Recorded audio to Mini | Explicit selection, bounded upload after pairing, native transcription, review text | Real same-Mac inference verified; phone transfer untested |
| Phone microphone | Explicit consent then browser permission; one bounded recording, visible stop, stop tracks on hide/disconnect | No permission requested; real device untested |
| Browser recognition | Require installed local model confirmation; never cloud fallback | Existing policy tested with mocks; Safari support not assumed |
| Camera still | Explicit permission and capture, local preview, separate Send action, remove unnecessary metadata before transfer | Future work; no camera opened |
| Recorded video | Short bounded clip, negotiated codec and dimensions, sampled frames with time/provenance | Existing synthetic native video checks; phone codec fixture needed |
| Headphones | Tap to play local WAV; OS controls routing; verify interruptions and Bluetooth behavior | WAV decoding verified; actual playback/routing untested |
| Background/locked phone | Pause capture and interaction; no always-listening promise | Device lifecycle testing required |

Use `MediaRecorder.isTypeSupported` and test the resulting media against the native decoder. Do not hard-code Safari to one format: WebKit documents expanded WebM/Opus and MP4 support in Safari 18.4. WebKit also documents capture permission prompts. Apple describes SpeechTranscriber as on-device and exposes installed-locale checks. These sources establish API design constraints, not the capabilities of Steve's particular phone.

Sources checked 2026-11-08: [WebKit MediaRecorder](https://webkit.org/blog/11353/mediarecorder-api/), [Safari 18.4 media capabilities](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/), [Apple SpeechAnalyzer](https://developer.apple.com/videos/play/wwdc2025/277/), [local speech availability](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static), [Apple local-network privacy](https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy).

Apple distinguishes native local-network operations from Safari traffic. Do not assume a uniform permission prompt, or change privacy settings to force access. Permission behavior must be observed on the actual OS/browser during an approved test.

## Next physical-test gate

Review the exact existing network, proposed listener and certificate trust method with the owner before enabling a phone-accessible service. Then verify pairing/revocation, airplane-mode local connectivity, phone codecs, microphone consent cancellation, track shutdown, headphone interruptions, lock-screen behavior and out-of-range disconnects with synthetic inputs first. This milestone does not prove trail range. A ground connection watchdog cannot guarantee drone stopping after radio loss; this project still has no drone transport.

## Native alternative prototype

An unsigned phone-local simulator prototype now exists. Structured planning and a synthetic animal observation work without a Mini link. Local-model constraint preservation is not yet reliable. See [simulator evidence and remaining gates](IOS-PROTOTYPE.md). This is not a physical-phone release.
