export type Mode = 'static' | 'fatigue' | 'stress' | 'pipe' | 'challenge';
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
