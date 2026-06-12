import { COLORS, LabState, Status } from './types';

export function logCycles(slider: number): number {
  return 2 + (slider / 100) * 5; // 10^2 to 10^7
}

export function cycleLabel(slider: number): string {
  return `10^${logCycles(slider).toFixed(1)}`;
}

export function allowableStressRangePercent(logN: number): number {
  // Conceptual decreasing S-N boundary only, not a design curve.
  // Clamp so the curve never goes below 12 (floor) or above 92 (ceiling).
  return Math.max(12, Math.min(92, 92 - 11.5 * (logN - 2)));
}

export function fatigueSeverity(s: LabState): number {
  const allow = allowableStressRangePercent(logCycles(s.fatigueCyclesSlider));
  const over = (s.fatigueStressRange - allow) / 35;
  const notch = s.notchEnabled ? 0.13 : 0;
  return Math.max(0, Math.min(1, 0.28 + over + notch));
}

export function fatigueStatus(s: LabState): Status {
  const sev = fatigueSeverity(s);
  if (sev > 0.68) return { badge: 'Fatigue crack growth', color: COLORS.red, title: 'High cyclic damage tendency', copy: 'This fatigue view is limited to ductile metallic piping: cyclic Δσ can initiate and grow a crack at a weld/notch hotspot.' };
  if (sev > 0.42) return { badge: 'Fatigue-sensitive', color: COLORS.orange, title: 'Crack growth is becoming important', copy: 'Repeated Δσ and cycles N make local notch/weld details important in metallic fatigue.' };
  return { badge: 'Low cyclic demand', color: COLORS.green, title: 'Small fatigue demonstration demand', copy: 'The operating point is below the conceptual S-N boundary. This is a teaching visual, not fatigue assessment.' };
}
