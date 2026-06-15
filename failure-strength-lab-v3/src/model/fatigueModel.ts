import { COLORS, LabState, Status } from './types';

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

export function logCycles(slider: number): number {
  return 2 + (slider / 100) * 5; // 10^2 to 10^7
}

export function cycleLabel(slider: number): string {
  return `10^${logCycles(slider).toFixed(1)}`;
}

export function allowableStressRangePercent(logN: number): number {
  // Conceptual base S-N boundary only, not a design curve.
  // Clamp so the curve never goes below 12 (floor) or above 92 (ceiling).
  return Math.max(12, Math.min(92, 92 - 11.5 * (logN - 2)));
}

export function fatigueDetailFactor(notchEnabled: boolean): number {
  // Teaching modifier: weld toes/notches reduce fatigue margin versus a smooth detail.
  // This is not an ASME/owner fatigue class and must not be used as a project design factor.
  return notchEnabled ? 0.82 : 1.0;
}

export function fatigueBoundaryPercent(logN: number, notchEnabled: boolean): number {
  return Math.max(10, Math.min(92, allowableStressRangePercent(logN) * fatigueDetailFactor(notchEnabled)));
}

export function fatigueDemandRatio(s: LabState): number {
  const boundary = fatigueBoundaryPercent(logCycles(s.fatigueCyclesSlider), s.notchEnabled);
  return s.fatigueStressRange / Math.max(boundary, 1);
}

export function fatigueSeverity(s: LabState): number {
  // Severity is driven by demand / detail-adjusted teaching boundary.
  // Below about 65% of the boundary, keep the visual in low-demand range.
  return clamp((fatigueDemandRatio(s) - 0.65) / 0.55);
}

export function fatigueStatus(s: LabState): Status {
  const ratio = fatigueDemandRatio(s);
  if (ratio > 1) return { badge: 'Fatigue crack-growth watch', color: COLORS.red, title: 'High cyclic damage tendency', copy: 'Repeated stress range is above the detail-adjusted teaching boundary. Check the load source, hotspot, cycles, and project fatigue/vibration criteria.' };
  if (ratio > 0.82) return { badge: 'Fatigue-sensitive', color: COLORS.orange, title: 'Crack initiation margin is becoming important', copy: 'Repeated Δσ and cycles N make weld toes, notches, small-bore branches, and attachments important in metallic fatigue.' };
  return { badge: 'Low cyclic demand', color: COLORS.green, title: 'Small fatigue demonstration demand', copy: 'The operating point is below the detail-adjusted conceptual S-N boundary. This is a teaching visual, not a fatigue assessment.' };
}
