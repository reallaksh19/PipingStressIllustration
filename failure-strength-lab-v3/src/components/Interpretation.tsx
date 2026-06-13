import { createPortal } from 'react-dom';
import { LabState, Status } from '../model/types';
import { allowableStressRangePercent, cycleLabel, logCycles } from '../model/fatigueModel';
import { LearningCenterPanel } from './LearningCenterPanel';

type Item = { label: string; value: string };
type Step = { title: string; text: string };
type Readout = {
  headline: string;
  principle: string;
  items: Item[];
  steps: Step[];
  watch: string;
  caution: string;
};

export function Interpretation({ state, status }: { state: LabState; status: Status }) {
  const readout = state.mode === 'fatigue' ? fatigueReadout(state) : staticReadout(state);
  const showLearning = state.mode === 'static' || state.mode === 'fatigue';

  return <>
    {showLearning && typeof document !== 'undefined' && createPortal(<LearningCenterPanel state={state} />, document.body)}
    <div
      className="interp failure-readout"
      style={{
        gap: 10,
        maxHeight: 300,
        overflowY: 'auto',
        paddingRight: 6,
      }}
    >
      <span className="badge" style={{ color: status.color }}>{status.badge}</span>
      <h3 className="result-title">{readout.headline}</h3>
      <p className="copy">{readout.principle}</p>

      <div className="table">
        {readout.items.map(item => <div key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {readout.steps.map((step, index) => <div className="card" key={step.title} style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}>
          <b style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 999, border: '1px solid rgba(82,240,223,.35)', color: '#dcfffb' }}>{index + 1}</b>
          <span><b>{step.title}</b><br/><span className="copy">{step.text}</span></span>
        </div>)}
      </div>

      <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}><b>Watch in the graphics</b><span className="copy">{readout.watch}</span></div>
      <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}><b>Boundary</b><span className="copy">{readout.caution}</span></div>
    </div>
  </>;
}

function staticReadout(state: LabState): Readout {
  const ductile = state.material === 'ductile';
  const tension = state.staticDemand === 'tension';
  const load = state.staticLoad;
  const level = load < 45 ? 'Elastic teaching range' : load < 72 ? 'Transition / yield-sensitive range' : load < 93 ? 'Damage range' : 'Rupture range';

  if (ductile && tension) {
    return {
      headline: load >= 93 ? 'Ductile rupture follows necking' : load >= 76 ? 'Ductile tensile necking follows plastic deformation' : load >= 45 ? 'Ductile tension is in plastic deformation range' : 'Ductile tension gives visible warning before rupture',
      principle: 'For ductile static tension, read the sequence as elastic stretch → yield/plastic deformation → necking → rupture. The visual focus is staged deformation, not arrow direction.',
      items: [
        { label: 'Demand', value: 'Static axial tension' },
        { label: 'Material', value: 'Ductile metal' },
        { label: 'Range', value: level },
        { label: 'Failure mode', value: load >= 93 ? 'Rupture after necking' : load >= 76 ? 'Necking after plasticity' : load >= 45 ? 'Plastic deformation' : 'Elastic stretch' },
      ],
      steps: [
        { title: 'Elastic response', text: 'Strain follows stress and should recover when unloaded.' },
        { title: 'Plastic deformation', text: 'After yield, permanent strain spreads along the specimen before the neck forms.' },
        { title: 'Necking and rupture', text: 'At high demand plastic strain localizes, area reduces, and final separation occurs after the necking stage.' },
      ],
      watch: 'Side view separates broad plastic deformation, later necking, and final rupture to match the σ–ε curve sequence.',
      caution: 'This is a teaching visualization. It is not an allowable-stress or code compliance check.',
    };
  }

  if (ductile && !tension) {
    return {
      headline: load >= 72 ? 'Ductile compression is governed by plastic instability' : 'Ductile compression should read as squash, not fracture opening',
      principle: 'For static compression, the important behavior is shortening, barreling, ovalization, wrinkling, local buckling, or collapse.',
      items: [
        { label: 'Demand', value: 'Static axial compression' },
        { label: 'Material', value: 'Ductile metal' },
        { label: 'Range', value: level },
        { label: 'Failure mode', value: load >= 72 ? 'Local buckling / collapse' : 'Yield / ovalization watch' },
      ],
      steps: [
        { title: 'Shortening', text: 'The member shortens under compressive demand.' },
        { title: 'Plastic squash', text: 'The wall may barrel, wrinkle, or ovalize after yielding.' },
        { title: 'Instability', text: 'At high demand the limit state becomes local buckling or collapse, not tensile necking.' },
      ],
      watch: 'Compression plates, barreling body, wrinkle lines, and ovalized pipe-wall cross-section.',
      caution: 'Compression capacity also depends on geometry, slenderness, boundary conditions, and imperfections; this panel is conceptual only.',
    };
  }

  if (!ductile && tension) {
    return {
      headline: load >= 72 ? 'Brittle tension is flaw-controlled fracture risk' : 'Brittle tension gives little deformation warning',
      principle: 'For brittle static tension, the key idea is a crack or flaw opening under tensile stress. Do not interpret it as yielding and necking.',
      items: [
        { label: 'Demand', value: 'Static axial tension' },
        { label: 'Material', value: 'Brittle / low ductility' },
        { label: 'Range', value: level },
        { label: 'Failure mode', value: state.flawEnabled || load >= 45 ? 'Flaw opening / fracture' : 'Elastic until critical flaw' },
      ],
      steps: [
        { title: 'Little plasticity', text: 'Visible strain may stay small even as stress rises.' },
        { title: 'Flaw sensitivity', text: 'A notch, crack, or defect concentrates tensile stress.' },
        { title: 'Sudden fracture', text: 'When the flaw becomes critical, separation can occur with little warning.' },
      ],
      watch: 'Crack path through the pipe wall and fracture flash; no ductile yield band should be expected.',
      caution: 'Brittle fracture is governed by flaw size, stress state, toughness, and environment. This is not an S-N fatigue model.',
    };
  }

  return {
    headline: load >= 72 ? 'Brittle compression shows crushing and splitting' : 'Brittle compression is shown as crush/split tendency',
    principle: 'Brittle compression should not be drawn like tensile crack opening or ductile necking. The concept is crushing, shear splitting, or diagonal fracture.',
    items: [
      { label: 'Demand', value: 'Static axial compression' },
      { label: 'Material', value: 'Brittle / low ductility' },
      { label: 'Range', value: level },
      { label: 'Failure mode', value: load >= 72 ? 'Crush / diagonal split' : 'Compression damage watch' },
    ],
    steps: [
      { title: 'Compression demand', text: 'The member is pushed into a shorter state.' },
      { title: 'Crush zone', text: 'Local crushing or splitting starts before a ductile-looking neck appears.' },
      { title: 'Break-up', text: 'At high demand diagonal split planes or fragments dominate the visual.' },
    ],
    watch: 'Crush halo, diagonal cracks, fragments, and compressed pipe-wall sector.',
    caution: 'Actual brittle compression strength depends strongly on confinement, geometry, flaws, and support condition.',
  };
}

function fatigueReadout(state: LabState): Readout {
  const logN = logCycles(state.fatigueCyclesSlider);
  const boundary = allowableStressRangePercent(logN);
  const ratio = state.fatigueStressRange / Math.max(boundary, 1);
  const verdict = ratio > 1 ? 'Above boundary' : ratio > 0.82 ? 'Near boundary' : 'Below boundary';

  return {
    headline: ratio > 1 ? 'Metal fatigue crack-growth risk is high' : ratio > 0.82 ? 'Metal fatigue hotspot is becoming important' : 'Metal fatigue demand is currently low in this teaching view',
    principle: 'For ductile metallic piping, fatigue is controlled by repeated stress range Δσ, cycles N, and local stress raisers such as weld toes or notches. Brittle material is text-only here.',
    items: [
      { label: 'Demand', value: `Repeated Δσ = ${state.fatigueStressRange}%` },
      { label: 'Cycles', value: `${cycleLabel(state.fatigueCyclesSlider)} cycles` },
      { label: 'S-N position', value: `${verdict} · limit ≈ ${boundary.toFixed(0)}%` },
      { label: 'Hotspot', value: state.notchEnabled ? 'Weld/notch active' : 'Smooth detail selected' },
    ],
    steps: [
      { title: 'Cyclic range', text: 'The pipe sees repeated stress range, not a single static load.' },
      { title: 'Local initiation', text: 'The weld toe or notch concentrates stress and can initiate a microcrack.' },
      { title: 'Crack propagation', text: 'The cross-section shows cycle-by-cycle growth, beach marks, and final fracture cue.' },
    ],
    watch: 'Use side view to locate the cyclic hotspot; use cross-section to understand crack initiation and growth through wall thickness.',
    caution: 'The S-N curve is conceptual. Once a real crack exists, assessment normally moves toward fracture mechanics, inspection data, ΔK, and critical crack size.',
  };
}
