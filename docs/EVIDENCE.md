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
