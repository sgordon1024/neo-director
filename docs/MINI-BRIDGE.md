# Mini integration lab: loopback milestone

[Public interface preview](https://sgordon1024.github.io/neo-director/bridge.html). The preview cannot contact localhost or any Mini. To run the actual integration, start the server on the Mini and open its loopback URL on that same Mac.

## Completed and verified

A dependency-free Node HTTP service now connects the review interface to local Apple speech transcription, scene analysis and spoken WAV replies, plus the deterministic proposal/simulation engine. It binds only to `127.0.0.1`; no LAN binding option exists.

```text
Same-Mac browser → loopback session and bounded requests
  Recorded audio → local SpeechTranscriber → review text only
  Explicit reviewed text → strict planner → proposed shot sequence
  Recorded image/video → local Vision → observation notes only
  Explicit text → installed local voice → WAV, no autoplay
  Explicit simulation controls → independent synthetic-data supervisor
```

55 Node tests passed, including nine bridge tests. Real local-inference browser checks passed at 390 × 844 and 1280 × 844: synthetic audio transcription, explicit review and proposal, stale-telemetry refusal, complete simulated sequence, generated WAV decoding without playback, scene review without commands, unsafe-request refusal and zero browser console errors. Request-owned temporary directories were absent after the tests.

The browser tests used the actual local inference executables, not mocked speech/scene responses. Inputs were synthetic. No microphone, headphone routing, audio playback, private media, drone, LAN connection or host network/security configuration was used or changed.

## Run on the Mini

Compile the native tools using LOCAL-MEDIA.md and SCENE-REVIEW.md, then:

```sh
node scripts/mini-bridge.mjs
```

Open the printed `http://127.0.0.1:8766` URL on the same Mac. Choose Connect local session. Optional positional argument selects a different port, never a different interface. If the port is occupied the service stops; it never terminates or reconfigures an existing service. Stop this service with Ctrl-C. It is not installed as a daemon or started automatically.

The Pages version is a preview and keeps Connect disabled. It does not probe a local IP, call localhost, or attempt to bypass mixed-content/CORS rules.

## Request boundary

- A random in-memory bearer token lasts 15 minutes. It is never printed, persisted or placed in a URL. Restart the service to create a new session.
- Host must match the exact loopback address. API requests reject cross-site fetch metadata and mismatched Origin. Mutations also require the token and exact same Origin.
- Each mutation carries a unique request ID and a timestamp. Requests more than 10 seconds old, more than 1 second in the future, repeated IDs and expired sessions are rejected. Freshness is checked again after the request body arrives.
- Schemas allow only known fields and operations. No model-generated code, arbitrary shell arguments, user-chosen executable, drone transport or cloud joystick exists.
- At most one inference job runs at a time. Media uploads are bounded to 8 MB, JSON to 4 KB, and connections to eight. Child processes have bounded timeouts. Native image/audio bounds still apply.
- Media is written under a request-owned, private temporary directory inside `.private`, then removed in a finally block on success or failure. A forced process kill or machine crash can leave an ignored private directory; no promise of forensic erasure is made.
- Responses use no-store caching. Static files come from a fixed allowlist, never arbitrary paths. Errors do not expose native error details, input names or private contents. The UI has no microphone/camera/geolocation capability; the local server explicitly disables them with an app response policy.

The bootstrap token endpoint is intended for a trusted local user/browser. It is not authentication against malicious code already running on the Mac and is not suitable for LAN exposure. Do not change the bind address to expose this prototype.

## API contract

| Route | Input | Result |
| --- | --- | --- |
| GET /api/session | Same-origin loopback bootstrap | Session expiry, capabilities and in-memory token |
| POST /api/plan | JSON command only | Proposal, refusal or clarification; actuation false |
| POST /api/simulation | JSON action and synthetic telemetry state | Start/step/stop or blocked state; actuation false |
| POST /api/transcribe | Raw local recording | Transcript requiring review; no simulation started |
| POST /api/scene/image or /video | Raw recorded media | Review-only candidates; safety unknown; no command |
| POST /api/speech | JSON command only | Local WAV containing a proposal or refusal; no autoplay |

Unknown routes, extra fields, unsupported telemetry and direct-flight requests do not gain execution privileges.

## Phone-to-Mini architecture still gated

Actual phone-to-Mini connectivity is not delivered by this milestone. A later implementation must serve the phone UI and API from an authenticated HTTPS origin, use explicit owner-approved pairing rather than this local bootstrap, establish per-client ownership and server-issued freshness challenges, and require consent for any LAN listener, certificate trust, pairing or device permission. It must not disable browser protections or change van networking/services as a shortcut.

Before that step: review the intended existing transport with the owner, specify exactly which address/port and trust changes would be needed, and obtain approval. No pairing, certificate, firewall, Tailscale, network or security settings were changed here. Physical iPhone/headphone operation and field-range testing remain unverified.

## Reproduce checks

```sh
node --test tests/*.test.js
# In another terminal, with the loopback bridge running:
node tests/bridge-browser.cjs
```

The browser test uses existing Chrome/Playwright and the synthetic fixtures produced by earlier native tests. It does not play audio or open a microphone. Set BRIDGE_URL only to an authorized loopback test instance. The public preview is checked separately by tests/bridge-preview.cjs.

See [PHONE-LINK.md](PHONE-LINK.md) for the tested protocol model, capability research and remaining connection gates.
