# On-device model-assisted briefs
Apple FoundationModels SystemLanguageModel was already available on the Mini. No downloads, settings changes or third-party runtime installation were required.

The local loopback lab offers Draft with local model. A fresh session with no tools generates typed count/style/subject fields. Independent JavaScript checks validate the envelope, allowed fields, supported bounds, explicit parked-van condition, named Frank condition, numeric consistency and known deterministic briefs. Unsafe flight verbs are rejected before inference. Unsupported results require clarification.

The original request remains visible. A suggestion only fills an editable review field. Propose is a separate explicit action; the model cannot start simulation or issue flight commands. The public Pages lab remains a disabled preview, and the public companion still uses deterministic templates.

## Verified
- Three synthetic paraphrases mapped correctly: four peaceful camp shots with Frank; two cinematic parked-van shots; five serene campsite pictures. Single observed latencies about 0.4–1.0 seconds, not a performance guarantee.
- Real model-to-browser flow passed at 390 and 1280 pixels, preserved original request, produced four calm compositions only after explicit Propose, and never started simulation.
- Existing model guardrail/bridge tests pass. A model call also succeeded with networking denied to the test process; Apple system services were not separately isolated.
- No microphone, private media or drone used. No cloud-model fallback exists.

## Limitations
This is a narrow draft translator, not general dialogue or scene understanding. Models can misread language; typed schema constrains syntax, not meaning. A first free-text JSON experiment failed to preserve count and output valid style; it was replaced with typed generation plus independent checks. Human review remains mandatory. Unknown details may not survive translation: compare the original before accepting. Frank is a requested subject, not recognized identity.

No iPhone-to-Mini transport, physical headphones, continuous video tracking or flight control is implemented by this milestone.

## Reproduce on the Mini
Compile native/Brief.swift using the installed Swift toolchain into .private/neo-brief, then run tests/model_native.py with Node on PATH. Start scripts/mini-bridge.mjs locally and run tests/model-bridge-browser.cjs against its loopback URL. Native binary and private test artifacts are never published.
