# Read-only source audit

Reviewed 2026-11-08. This is a bounded source review, not a full security audit or hardware validation.

Pinned upstream: [`smichea/dji-neo2-lan-client@014e3ad0d3ee98fecba94dfa48fe512a217a155f`](https://github.com/smichea/dji-neo2-lan-client/tree/014e3ad0d3ee98fecba94dfa48fe512a217a155f).

Read README.md, docs/VALIDATION.md, src/neo2_control/control_transport.py, src/neo2_control/landing_confirmation.py and src/neo2_control/command_ingress.py. Retrieved text only. No installation, import, CLI invocation, radio connection or upstream tests were run. No upstream source is vendored into this repository.

[DJI's SDK compatibility table](https://repair.dji.com/help/content?customId=01700000763&lang=en&paperDocType=ARTICLE&re=US&spaceId=17) lists DJI Neo 2 as not SDK-compatible at review time.

| Capability | Source evidence | Project decision |
| --- | --- | --- |
| Linux BLE and Wi-Fi connection | README describes Python 3.11+, stock firmware, BlueZ, NetworkManager, FFmpeg | Potential bridge only; no macOS integration assumed |
| Video and selected telemetry | README reports reception; includes replay/synthetic work | Planned grounded read-only evaluation; not validated here |
| Vertical and yaw trials | VALIDATION reports historical short trials | Narrow reported evidence, not independent verification |
| Landing | VALIDATION reports an acknowledged LAND that did not produce landing; later successes do not establish failsafe behavior | Blocking gate |
| Horizontal control | VALIDATION says full control remains unqualified | Blocking gate |
| Link loss | VALIDATION says protections not validated | Blocking gate |
| Landing confirmation | Receiver checks types, timing and source context; snapshot sets flight_ready false | Receipt is not proof of landed aircraft or stopped motors |
| Action transport | Adapter can submit real flight actions and control channels; synthetic mode requires loopback | Do not integrate into this simulation-only prototype |
| Command ingress | Signed short-lived, single-use windows tied to connection generation | Useful design idea; source logic is not physical safety evidence |
| DJI Fly concurrency and manual takeover | No validation established by the reviewed material | Unverified; required before flight |
| Proximity values | VALIDATION says units and sentinels unresolved | Not accepted as obstacle avoidance |

Any later execution of this unrecognized-source software requires applicable action-time approval. A source pin and software tests do not establish safe flight.
