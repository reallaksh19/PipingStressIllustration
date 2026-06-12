import { COLORS, LabState, Status } from './types';

export function logCycles(slider: number): number {
  return 2 + (slider / 100) * 5; // 10^2 to 10^7
}

export function cycleLabel(slider: number): string {
  return `10^${logCycles(slider).toFixed(1)}`;
}

export function allowableStressRangePercent(logN: number): number {
  // Conceptual decreasing S-N boundary only, not a design curve.
  return 92 - 11.5 * (logN - 2);
}

export function fatigueSeverity(s: LabState): number {
  const allow = allowableStressRangePercent(logCycles(s.fatigueCyclesSlider));
  const over = (s.fatigueStressRange - allow) / 35;
  const notch = s.notchEnabled ? 0.13 : 0;
  const brittle = s.material === 'brittle' ? 0.1 : 0;
  return Math.max(0, Math.min(1, 0.28 + over + notch + brittle));
}

export function fatigueStatus(s: LabState): Status {
  const sev = fatigueSeverity(s);
  if (sev > 0.68) return { badge: 'Fatigue crack growth', color: COLORS.red, title: 'High cyclic damage tendency', copy: s.material === 'ductile' ? 'Ductile fatigue is shown as crack initiation/growth at a local hotspot after repeated cycles.' : 'Brittle/crack-sensitive fatigue emphasizes crack propagation with little visible plastic warning.' };
  if (sev > 0.42) return { badge: 'Fatigue-sensitive', color: COLORS.orange, title: 'Crack growth is becoming important', copy: 'Repeated Δσ and cycles N make local notch/weld details important.' };
  return { badge: 'Low cyclic demand', color: COLORS.green, title: 'Small fatigue demonstration demand', copy: 'The operating point is below the conceptual S-N boundary. This is a teaching visual, not fatigue assessment.' };
}
