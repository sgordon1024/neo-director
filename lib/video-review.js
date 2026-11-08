import {sceneReview} from '../docs/scene-policy.js';

// Review sparse samples only. Never infer identity, absence, continuity or flight safety.
export function reviewSampledVideo(value) {
  if (!value || value.schema !== 2 || value.mode !== 'video-sample-observation-only' ||
      value.sampling !== 'five-uniform-requests-first-80-percent' ||
      value.safetyAssessment !== 'unknown' || value.requiresHumanReview !== true ||
      typeof value.sourceSHA256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sourceSHA256) ||
      !Number.isFinite(value.durationSeconds) || value.durationSeconds <= 0 || value.durationSeconds > 120 ||
      !Array.isArray(value.frames) || value.frames.length < 1 || value.frames.length > 5) {
    throw new Error('Unsupported sampled-video report');
  }
  let previous = -1;
  const frames = value.frames.map(raw => {
    const frame = sceneReview(raw);
    const time = frame.frameTimeSeconds;
    if (frame.sourceSHA256 !== value.sourceSHA256 || !Number.isFinite(time) ||
        time <= previous || time > value.durationSeconds) throw new Error('Invalid sample provenance or time');
    previous = time;
    return frame;
  });
  const dogCandidates = frames.flatMap(frame => frame.animalCandidates
    .filter(candidate => candidate.label.toLowerCase() === 'dog' && candidate.score >= .6)
    .map(candidate => ({frameTimeSeconds: frame.frameTimeSeconds, score: candidate.score, box: {...candidate.box}})));
  return {schema: 2, mode: value.mode, sourceSHA256: value.sourceSHA256,
    durationSeconds: value.durationSeconds, frames, dogCandidates,
    safetyAssessment: 'unknown', requiresHumanReview: true, actuation: false,
    notes: [dogCandidates.length ? 'Dog candidates at sampled times need human identity review. This does not identify Frank.' :
      'No confident dog candidate in the samples. This does not prove no dog appears in the video.',
      'Sparse samples do not establish a continuous track. Events between samples and near the end may be missed.',
      'Candidate timestamps are review bookmarks, not approved shots or safe flight paths.']};
}
