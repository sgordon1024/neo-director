# Architecture

## Running today

```text
Typed request → strict allowlist parser → immutable structured proposal
                                              ↓
Synthetic sample → independent safety policy → step-based simulation

Local GPX → XML validation → segmented haversine length
Synthetic GPS → freshness/accuracy checks → approximate remaining length
```

`director.js` is a pure module with no IO or actuator API. `supervise` validates the entire canonical plan independently of the parser, rejects unknown fields and stale/future samples, and permits simulation only. Plans expire after 60 seconds; synthetic telemetry after 5 seconds. Loss or staleness blocks advancement and requires a new proposal. Explicit stop clears the plan. Three manually advanced composition steps represent 24 seconds of proposed footage; no physical trajectory is modeled.

`route.js` rejects malformed/out-of-range coordinates, XML entities and DTDs, missing points and invalid segment structure. GPX uploads are limited to 2 MB. Route length excludes gaps between segments. Remaining distance requires one segment, GPS age at most 10 seconds, reported accuracy at most 30 meters and a nearest route vertex within 100 meters. These conservative demo thresholds are not a navigation certification. Elevation, sparse point interpolation, loop disambiguation and live GPS are not implemented.

The browser UI uses textContent for output, has no analytics or external runtime dependencies, and keeps local file data in memory. The service worker caches only fixed public app assets. It does not cache uploaded files or requests to external domains. Refreshing discards user input. The static app is not a security boundary against a user modifying JavaScript, but no drone interface exists to actuate anything.

## Intended later architecture

```text
Headphones ↔ iPhone companion ↔ local speech on Mini
                                  ↓
                    local vision / shot planner
                                  ↓ proposal only
                    independent deterministic supervisor
                                  ↓ separately gated
                    optional dedicated Linux bridge
                                  ↓
                              DJI Neo 2
```

Live speech conversation, semantic scene understanding, companion app and drone bridge remain planned. Native recorded-speech transcription and OCR are now separately verified with synthetic fixtures. The Mini stays in the van, which limits local connectivity on trails. Offline operation requires locally available models and data, not cloud ChatGPT. No cloud joystick or arbitrary model-generated code execution is allowed. Recognition is not obstacle avoidance.

Grounded read-only video and telemetry must come before actuation. Any transport integration changes this architecture's risk and requires separate review and physical/manual takeover. A ground watchdog cannot guarantee stopping after radio loss.

## Native media baseline

`native/Media.swift` reads bounded local media. Default image/video operations return dimensions and grayscale statistics, not model-generated scene descriptions. `scripts/local-director.mjs` generates proposal-only summaries using the same strict intent grammar and writes local audio with the installed system voice. It validates observations before saving them privately, keeping recognized text in an explicit review-only field and discarding command fields. Speech recognition requires verified local asset readiness and returns a transcript requiring explicit review. Still and video OCR run on a detached worker to avoid blocking the main actor. Neither transcript nor OCR automatically enters the planner or starts simulation. All native operations have bounded process timeouts. See LOCAL-MEDIA.md for exact evidence and limitations.
