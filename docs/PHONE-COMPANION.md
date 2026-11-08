# Field companion prototype

[Open the companion](https://sgordon1024.github.io/neo-director/companion.html).

## Delivered and verified

A touch-friendly, offline browser conversation interface supports the existing three typed requests, replies with proposed compositions, and allows local scene reports to be reviewed in memory. It never starts a simulation or issues drone commands. No recordings or reports are uploaded, and conversation state is not persisted.

The browser voice layer selects only voices reporting localService=true. If none is available, it refuses spoken output rather than selecting a remote voice. Listen is an explicit user action; audio routing remains under the device's control. No headphone pairing or routing settings are changed.

Microphone recognition is allowed only if the browser supports processLocally, reports the English pack already available with processLocally=true, and the user chooses Continue in the consent dialog. The browser can then ask for microphone permission. No automatic language-pack download, cloud fallback or background recording exists. Recognition is one utterance, bounded to 15 seconds, and stops when the page is hidden. Captured text requires explicit review and a separate Propose action. Unsafe text still reaches the same refusal policy.

## Test scope, honestly

- 390px and 1280px Chromium tests: offline reload, supported proposals, refusal, local scene JSON review, no horizontal overflow or console errors.
- Speech APIs were mocked for consent cancellation, no microphone start before Continue, no automatic submission, local-voice-only selection and missing-pack rejection. No actual microphone or audio playback was used by the tests.
- Unmocked headless Chrome reported a recognition availability API, but zero local synthesis voices. That browser therefore cannot establish real headphone playback; the implementation fails closed when a local voice is unavailable.
- Real iPhone/Safari, physical headphones, actual browser microphone permission and noisy field speech remain untested. Browser support is conditional; this is not a claim that iPhone speech input works.

## Consent and integration gates

Open the companion online once to cache it. Typing is available offline afterward. To test microphone input, the owner must explicitly choose the in-page consent and browser permission on the actual device. If installed local recognition cannot be verified, keep using typing. Do not enable cloud dictation as a workaround.

The companion currently has no phone-to-Mini connection. A separate loopback integration lab now connects a same-Mac browser to native inference and simulation; see MINI-BRIDGE.md. Testing an authenticated local Mini link would require a separately reviewed connection design and explicit consent before LAN exposure, certificate trust, pairing or network/security changes. No such changes occurred in this milestone.

A native scene JSON may be selected manually for local review. Do not share personal scene files through public issues or commits. Files up to 100 KB are accepted; schema and score bounds are validated. Imported labels are rendered as text and never supplied to the command parser.

[Browser local voice distinction](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService), [local recognition availability](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static), [processLocally](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally).

See [PHONE-LINK.md](PHONE-LINK.md) for the tested protocol model, capability research and remaining connection gates.
