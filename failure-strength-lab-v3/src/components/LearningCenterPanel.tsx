import { LabState } from '../model/types';

/**
 * The active Learning Center is rendered by the static fallback/enrichment layer
 * in index.html using learning-center-fallback.js + learning-center-enrichment.js.
 *
 * This legacy React panel is intentionally disabled to keep one source of truth
 * and to prevent older helper fields such as Mistake/Next from masking the
 * enriched Concept / Piping / B31.3 map / Sources content on Tabs 1–4.
 */
export function LearningCenterPanel({ state: _state }: { state: LabState }) {
  return null;
}
