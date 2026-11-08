# Neo Director

[Open the progress tracker and offline tools](https://sgordon1024.github.io/neo-director/)

A working, dependency-free typed cinematography director prototype. It produces structured proposals, runs a step-based simulated shot sequence, refuses unsafe or ambiguous requests, and calculates local GPX route length. It cannot connect to or control a drone.

[Open the field companion](https://sgordon1024.github.io/neo-director/companion.html) for a phone-friendly typed conversation, local-only voice checks and scene-note review. Actual iPhone/headphone audio remains unverified.

[Mini integration lab](docs/MINI-BRIDGE.md) now connects the browser review flow to real local speech/scene inference and simulation on loopback only. Actual phone-to-Mini networking remains gated.

## Try it

Open the tracker, then select Open studio. Visit online once and wait for “Offline cache ready.” Reload once, then disconnect. The cached app can propose and simulate shots offline in browsers supporting service workers. Browser eviction, private browsing and first visits without internet can prevent caching. A cached verification timestamp may be older than the live site.

Supported requests:

- `plan campsite`
- `plan campsite with Frank`
- `plan parked van`

Choose Propose shots, Start simulation, then Next simulated shot three times. Each step represents an 8-second proposed composition; it is not a physical simulation or real elapsed flight time. Inject stale synthetic telemetry to see the supervisor block. A blocked simulation requires a new proposal. Stop clears the proposal, and never sends a landing command.

Upload a local GPX to calculate length with haversine distance, keeping track gaps separate. Coordinates are used in memory only. The synthetic GPS demo approximates remaining distance from the nearest route vertex. Sparse vertices and looping routes can make this estimate misleading; it is not navigation. Live GPS ingestion and map matching are not implemented.

## Run locally

Use an existing Node.js 20+ and Python 3 runtime. No package installation is needed.

```sh
node --test tests/*.test.js
python3 -m http.server 8765 --bind 127.0.0.1 --directory docs
```

Open `http://127.0.0.1:8765`. For browser tests, point `PLAYWRIGHT_MODULE` to an existing trusted Playwright installation and `CHROME_PATH` to an existing Chrome executable, then run `node tests/browser.cjs` and `node tests/timeline.cjs`. Set `BASE_URL` to test a deployed site. No runtime or model was installed for this project.

## What this is building toward

Headphones and an iPhone communicate with local speech, vision and shot planning on a Mini in the van. That is a future integration. No speech recognition model, vision model, LLM, iPhone companion or headphone interface is running in the browser. Separate native tools now transcribe synthetic recorded speech on-device, read text from still/video frames and write local spoken summaries. See [local media](docs/LOCAL-MEDIA.md), [phone companion](docs/PHONE-COMPANION.md) and [scene review](docs/SCENE-REVIEW.md) for tested capabilities and remaining limits. This prototype uses a strict deterministic grammar, not general conversation. It is separate from cloud ChatGPT, whose voice service is not promised offline. Van-based local radio range limits trail use.

DJI lists Neo 2 as not SDK-compatible. The experimental Linux client is a research lead, not a DJI Fly plugin or a proven safety system. No third-party drone software was executed. No drone radio, flight, motors, firmware, vehicle service, security or network configuration was changed.

## Project records

- [Architecture](docs/ARCHITECTURE.md)
- [Safety and validation gates](docs/SAFETY.md)
- [Source audit and capability matrix](docs/SOURCE-AUDIT.md)
- [Hardware inventory boundaries](docs/INVENTORY.md)
- [Roadmap](docs/ROADMAP.md)
- [Verification evidence](docs/EVIDENCE.md)

Pages deploys from `main:/docs` using GitHub's built-in Pages build. The existing OAuth token cannot publish workflow files, so this project does not require a new token or workflow scope. Public status contains project facts and synthetic examples only, with no real route, photo, account or credential data.
