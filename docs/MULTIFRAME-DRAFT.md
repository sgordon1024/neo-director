# Sparse video review

The opt-in `video-sample` mode adds sparse multi-frame review. Existing image and first-frame modes remain available. Video uploads now use a decoder-compatible temporary .mov suffix; temporary media is removed after each request.

## Behavior

- Accept an existing local file within the same 50 MB input cap.
- Refuse unknown/nonfinite duration, zero duration or clips over 120 seconds.
- Request five uniformly spaced frames at 0%, 20%, 40%, 60% and 80% of clip duration. This deliberately sparse pass can miss events between frames and near the end.
- Decode at at most 1920×1080, report actual decoded timestamps, discard repeated timestamps, reject backwards timestamps, and keep the existing 20-second total process timeout.
- Run existing Apple Vision classification/animal observation separately for each frame. Each frame retains the source video SHA-256.
- `lib/video-review.js` validates the whole report and creates dog-candidate timestamp bookmarks. It never identifies Frank, infers continuous tracking, starts an action or declares a route safe.

## Verification status

Cloud Linux: all 72 Node tests pass, including seven new tests for later-frame candidates, negative samples, provenance, time ordering, size/duration bounds, low confidence and returned-data independence.

Mini: Swift compilation succeeded. Existing five native scene checks passed. New native checks decoded multiple frames from the constant synthetic clip and found dog candidates at 2.4 and 3.2 seconds in a mixed synthetic clip whose first half is a dog-free test card. Both reports preserved unknown safety and review-only output. All 72 Node tests also passed on the Mini.

A compiler cache collision between /tmp and /private/tmp was resolved by using a canonical absolute cache path. The existing Apple toolchain and bundled Node runtime were used; no software was installed.

**Not run:** physical iPhone testing, real-world pet accuracy or flight. The browser-to-native integration was subsequently tested as described below.

## Mac acceptance

Use the existing authorized Mini checkout and installed Apple toolchain. No downloads needed. Only the loopback review interface is supported.

```sh
swiftc -parse-as-library -module-cache-path .private/swift-cache native/Scene.swift -o .private/neo-scene
python3 tests/scene_native.py
python3 tests/video_samples_native.py
node --test tests/*.test.js
```

The new native test includes a mixed sequence with no dog initially and a dog appearing later. It verifies actual decoded dog-candidate timestamps >= 2 seconds. The JavaScript boundary rejects malformed reports, mixed hashes, reversed/repeated times, invalid durations and excessive samples. Additional codecs and long-media performance remain unverified. Input failures do not fall back to cloud processing. On this Mini, add /Applications/ChatGPT.app/Contents/Resources/cua_node/bin to PATH for the native test’s Node invocation.

This does not estimate distances, identify an individual pet, control flight, or expose a LAN listener.

## Integrated local release
The loopback lab now offers Recorded video · sparse samples, capped at 8 MB and 120 seconds. Full native upload → review → visible bookmarks passed in headless Chrome at 390 and 1280 px, with no overflow, console errors or simulation start. The synthetic late-dog clip returned 2.40 and 3.20-second bookmarks. No personal media used. The public page is only a disabled preview; iPhone transport and real-world accuracy remain unverified.
