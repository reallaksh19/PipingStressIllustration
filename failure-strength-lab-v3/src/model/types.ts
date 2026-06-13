export type Mode = 'static' | 'fatigue' | 'stress' | 'pipe'
  | 'loads' | 'expansion' | 'combined' | 'challenge';
export type LoadCategory = 'weight' | 'pressure' | 'event' | 'thermal' | 'settlement' | 'nozzle';
export type LoadDuration = 'always' | 'short' | 'cycle';
export type LoadRestraint = 'free' | 'guided' | 'restrained';
export type Material = 'ductile' | 'brittle';
export type StaticDemand = 'tension' | 'compression';
export type StressComponentView = 'normal' | 'shear' | 'combined';
export type PipeStressView = 'pressure' | 'bending' | 'torsion' | 'combined';

export type LabState = {
  mode: Mode;
  material: Material;
  staticDemand: StaticDemand;
  staticLoad: number;
  compareCurve: boolean;
  flawEnabled: boolean;
  fatigueStressRange: number;
  fatigueCyclesSlider: number;
  notchEnabled: boolean;
  stressView: StressComponentView;
  sigmaX: number;
  sigmaY: number;
  tauXY: number;
  showSignConvention: boolean;
  showPairedShear: boolean;
  showTensor: boolean;
  pipeStressView: PipeStressView;
  pipeHoop: number;
  pipeAxial: number;
  pipeBending: number;
  pipeTorsion: number;
  loadsActiveLoad: LoadCategory;
  loadsSustainedLevel: number;
  loadsThermalDelta: number;
  loadsDuration: LoadDuration;
  loadsRestraint: LoadRestraint;
  expDeltaT: number;
  expPressure: number;
  expRestrained: boolean;
  expShowBourdon: boolean;
  csH: number;
  csL: number;
  csLSign: 'tension' | 'compression';
  csTheory: 'vonmises' | 'tresca';
  csAF: number;
};

export type Status = {
  badge: string;
  color: string;
  title: string;
  copy: string;
};

export const COLORS = {
  green: '#2fe38d',
  yellow: '#ffd75b',
  orange: '#ff9e3a',
  red: '#ff4b64',
  blue: '#55b8ff',
  cyan: '#52f0df',
  purple: '#b884ff',
};

export type LoadsState = {
  activeLoad: LoadCategory;
  intensity: number;
  thermalDelta: number;
  duration: LoadDuration;
  restraint: LoadRestraint;
};

export type ExpansionState = {
  deltaT: number;
  pressure: number;
  restrained: boolean;
  showBourdon: boolean;
};

export type CombinedStressState = {
  sH: number;
  sL: number;
  sLSign: 'tension' | 'compression';
  theory: 'vonmises' | 'tresca';
  allowableFactor: number;
};
