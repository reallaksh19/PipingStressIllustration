import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { BourdonState, COLORS, CombinedStressState, ExpansionState, LabState, LoadsState } from './model/types';
import { staticStatus } from './model/staticFailureModel';
import { cycleLabel, fatigueStatus, logCycles } from './model/fatigueModel';
import { SideViewSvg } from './components/SideViewSvg';
import { LocalViewSvg } from './components/LocalViewSvg';
import { StressStrainCurve } from './components/StressStrainCurve';
import { SNCurve } from './components/SNCurve';
import { Interpretation } from './components/Interpretation';
import { StressComponentExplanation, StressComponentsSvg, StressEngineeringNote, StressTensorCard } from './components/StressComponentsSvg';
import { PipeStressNote, PipeStressReadout, PipeStressSectionSvg, PipeStressSideSvg } from './components/PipeStressSvg';
import { LoadsClassificationMap, LoadsMistakePanel, LoadsReadout, LoadsSideSvg } from './components/LoadsTab';
import { PipeExpansionEquations, PipeExpansionReadout, PipeExpansionSideSvg } from './components/PipeExpansionTab';
import { BourdonEffectSvg, BourdonMechanismPanel, BourdonPipingRelevance, BourdonReadout } from './components/BourdonEffectTab';
import { CombinedStressPipeSection, CombinedStressReadout, CombinedStressYieldSvg } from './components/CombinedStressTab';

const initialState: LabState = {
  mode: 'static',
  material: 'ductile',
  staticDemand: 'tension',
  staticLoad: 54,
  compareCurve: false,
  flawEnabled: false,
  fatigueStressRange: 48,
  fatigueCyclesSlider: 54,
  notchEnabled: true,
  stressView: 'combined',
  sigmaX: 55,
  sigmaY: 32,
  tauXY: 46,
  showSignConvention: true,
  showPairedShear: true,
  showTensor: true,
  pipeStressView: 'combined',
  pipeHoop: 48,
  pipeAxial: 32,
  pipeBending: 46,
  pipeTorsion: 38,
  loadsActiveLoad: 'weight',
  loadsSustainedLevel: 50,
  loadsThermalDelta: 40,
  loadsDuration: 'always',
  loadsRestraint: 'guided',
  expDeltaT: 50,
  expPressure: 40,
  expRestrained: true,
  expShowBourdon: false,
  bourdonPressure: 55,
  bourdonBendAngle: '90',
  bourdonEndCondition: 'guided',
  csH: 55,
  csL: 32,
  csLSign: 'tension',
  csTheory: 'vonmises',
  csAF: 0.90,
};

const presentationOverride = `
  .forceArrow { display: none !important; }
  marker[id^="tickArrow"] path { display: none !important; }

  .appHeader {
    padding: 18px 22px !important;
    gap: 16px !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
  }
  .brandRow {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  .appIcon {
    flex: 0 0 54px;
    width: 54px;
    height: 54px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    color: var(--cyan);
    background: radial-gradient(circle at 34% 26%, rgba(82,240,223,.30), transparent 43%), linear-gradient(135deg, rgba(85,184,255,.20), rgba(184,132,255,.12));
    border: 1px solid rgba(82,240,223,.62);
    box-shadow: inset 0 0 30px rgba(82,240,223,.10), 0 10px 28px rgba(0,0,0,.28);
    font-size: 27px;
    font-weight: 950;
    letter-spacing: -.05em;
  }
  .eyebrow {
    margin-bottom: 4px;
    color: var(--cyan);
    font-size: 12px;
    font-weight: 950;
    letter-spacing: .13em;
    text-transform: uppercase;
  }
  .appHeader h1 {
    font-size: clamp(29px, 2.45vw, 40px) !important;
    letter-spacing: -.045em !important;
  }
  .appHeader .subtitle {
    margin-top: 8px !important;
    max-width: 1040px !important;
    font-size: 14px !important;
  }
  .statusStack {
    display: grid;
    justify-items: end;
    gap: 8px;
  }
  .modeMini {
    color: var(--muted);
    font-size: 12px;
    font-weight: 900;
    white-space: nowrap;
  }
  .lesson-tabs {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
    gap: 8px !important;
    padding: 12px 14px !important;
    overflow: visible !important;
  }
  .lesson-tabs .tab {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    min-width: 0;
    padding: 10px 11px !important;
    border-radius: 18px !important;
    font-size: 13px;
  }
  .tabIcon {
    flex: 0 0 25px;
    width: 25px;
    height: 25px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    color: #dcfffb;
    border: 1px solid rgba(216,237,255,.20);
    background: rgba(255,255,255,.06);
    font-size: 12px;
    font-weight: 950;
    line-height: 1;
  }
  .tab.active .tabIcon {
    color: #06101d;
    background: var(--cyan);
    border-color: var(--cyan);
    box-shadow: 0 0 18px rgba(82,240,223,.34);
  }
  .tabLabel {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Stress-components labels: keep the generic 5A SVG as direct text only. */
  .stress-grid svg rect[fill="#071525"] { display: none !important; }
  .stress-grid svg rect[width="4"][rx="2"] { display: none !important; }
  .stress-grid svg text[fill="#eef7ff"] {
    fill: var(--text) !important;
    paint-order: normal !important;
    font-size: 12px !important;
    font-weight: 950 !important;
    filter: drop-shadow(0 1px 5px rgba(0,0,0,.92));
  }

  .analysis-grid {
    grid-template-columns: minmax(300px, 1.18fr) minmax(260px, .92fr) !important;
    grid-template-areas: "side curve" "local interp" !important;
    grid-auto-rows: minmax(300px, auto) !important;
  }
  .analysis-grid .panel:nth-child(1) { grid-area: side !important; grid-row: auto !important; grid-column: auto !important; min-height: 300px !important; }
  .analysis-grid .panel:nth-child(2) { grid-area: local !important; grid-row: auto !important; grid-column: auto !important; min-height: 300px !important; }
  .analysis-grid .panel:nth-child(3) { grid-area: curve !important; grid-row: auto !important; grid-column: auto !important; }
  .analysis-grid .panel:nth-child(4) { grid-area: interp !important; grid-row: auto !important; grid-column: auto !important; }
  .analysis-grid .panel:nth-child(1) .pb,
  .analysis-grid .panel:nth-child(2) .pb { min-height: 300px !important; display: flex; align-items: center; justify-content: center; }
  .analysis-grid .panel:nth-child(1) svg { min-height: 310px !important; }
  .analysis-grid .panel:nth-child(2) svg { max-height: 350px; }

  .pipe-grid {
    grid-template-columns: minmax(300px, 1fr) minmax(260px, 1fr) !important;
    grid-template-areas: "side section" "map note" !important;
    grid-auto-rows: minmax(315px, auto) !important;
  }
  .pipe-grid .panel:nth-child(1) { grid-area: side !important; grid-row: auto !important; grid-column: auto !important; min-height: 335px !important; }
  .pipe-grid .panel:nth-child(2) { grid-area: section !important; grid-row: auto !important; grid-column: auto !important; min-height: 335px !important; }
  .pipe-grid .panel:nth-child(3) { grid-area: map !important; grid-row: auto !important; grid-column: auto !important; }
  .pipe-grid .panel:nth-child(4) { grid-area: note !important; grid-row: auto !important; grid-column: auto !important; }
  .pipe-grid .panel:nth-child(1) .pb,
  .pipe-grid .panel:nth-child(2) .pb { min-height: 315px !important; display: flex; align-items: center; justify-content: center; }

  @media (max-width: 680px) {
    .appHeader { grid-template-columns: 1fr !important; }
    .statusStack { justify-items: start; }
    .brandRow { align-items: flex-start; }
    .appIcon { width: 46px; height: 46px; flex-basis: 46px; border-radius: 15px; }
    .lesson-tabs { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }
    .analysis-grid { grid-template-columns: 1fr !important; grid-template-areas: "side" "local" "curve" "interp" !important; }
    .pipe-grid { grid-template-columns: 1fr !important; grid-template-areas: "side" "section" "map" "note" !important; }
  }
`;

type Mode = LabState['mode'];

const modeTabs: Array<{ mode: Mode; icon: string; label: string; title: string }> = [
  { mode: 'static', icon: 'σ', label: 'Static', title: 'Static Loading · stress–strain' },
  { mode: 'fatigue', icon: 'N', label: 'Fatigue', title: 'Fatigue Loading · S–N' },
  { mode: 'stress', icon: 'τ', label: 'Stress Pt', title: 'Stress Components at a Point' },
  { mode: 'pipe', icon: 'θ', label: 'Pipe Stress', title: 'Pipe Stress · σθ σL τ' },
  { mode: 'loads', icon: 'P/S', label: 'Loads', title: 'Load Types · source route' },
  { mode: 'expansion', icon: 'ΔL', label: 'Expansion', title: 'Pipe Expansion · ΔL' },
  { mode: 'bourdon', icon: 'B', label: 'Bourdon', title: 'Bourdon Effect · bend straightening' },
  { mode: 'combined', icon: 'VM', label: 'Combined', title: 'Combined Stress · VM/Tresca' },
  { mode: 'challenge', icon: '?', label: 'Review', title: 'Quick Challenge' },
];

function activeMode(mode: Mode) {
  return modeTabs.find(item => item.mode === mode) ?? modeTabs[0];
}

function modeTitle(mode: Mode) {
  if (mode === 'static') return 'Static Loading';
  if (mode === 'fatigue') return 'Fatigue Loading';
  if (mode === 'stress') return 'Stress Components at a Point';
  if (mode === 'pipe') return 'Pipe Stress Components';
  if (mode === 'loads') return 'Load Types';
  if (mode === 'expansion') return 'Pipe Expansion';
  if (mode === 'bourdon') return 'Bourdon Effect';
  if (mode === 'combined') return 'Combined Stress';
  return 'Quick Challenge';
}

function modeCopy(state: LabState) {
  if (state.mode === 'static') return 'Side view is stacked above pipe-wall cross-section; curve and interpretation are stacked at right.';
  if (state.mode === 'fatigue') return `Ductile metallic S-N view: log10(N) = ${logCycles(state.fatigueCyclesSlider).toFixed(2)}. Cross-section stays below side view.`;
  if (state.mode === 'stress') return 'Generic Cartesian stress components before pipe notation, Mohr circle, or failure theory.';
  if (state.mode === 'pipe') return 'Pipe-specific sliders for hoop, axial, bending ovalisation, and torsional shear. Concept-level, not a code check.';
  if (state.mode === 'loads') return 'Classification dashboard: identify the physical source, behavior, and stress route.';
  if (state.mode === 'expansion') return 'Free or restrained thermal expansion and straight-pipe pressure elongation.';
  if (state.mode === 'bourdon') return 'Pressure-induced bend straightening, end displacement, and nozzle/support reaction relevance.';
  if (state.mode === 'combined') return 'Compare Von Mises and Tresca checks for hoop and longitudinal stress.';
  return 'Review mode.';
}

function modeChip(state: LabState) {
  if (state.mode === 'fatigue') return 'ductile metal · Δσ + N';
  if (state.mode === 'stress') return 'σx · σy · τxy';
  if (state.mode === 'pipe') return 'σθ · σL · M · τt';
  if (state.mode === 'loads') return 'source · behavior · route';
  if (state.mode === 'expansion') return 'ΔL · αLΔT';
  if (state.mode === 'bourdon') return 'pressure-driven opening';
  if (state.mode === 'combined') return 'σH · σL · VM/Tresca';
  return 'σ = F/A · ε = σ/E';
}

function App() {
  const [state, setState] = useState<LabState>(initialState);
  const active = activeMode(state.mode);
  const status = useMemo(() => state.mode === 'fatigue'
    ? fatigueStatus(state)
    : state.mode === 'static'
      ? staticStatus(state)
      : state.mode === 'stress'
        ? { badge: 'Stress state only', color: COLORS.blue, title: 'Stress components', copy: 'Component definition before failure theory.' }
        : state.mode === 'pipe'
          ? { badge: 'Pipe stress 5B', color: COLORS.cyan, title: 'Pipe stress components', copy: 'Pipe-specific cylindrical notation.' }
          : state.mode === 'loads'
            ? { badge: 'Load source', color: COLORS.orange, title: 'Load classification dashboard', copy: 'Classifying force-controlled and displacement-controlled load routes.' }
            : state.mode === 'expansion'
              ? { badge: 'Pipe expansion', color: COLORS.cyan, title: 'Thermal & pressure elongation', copy: 'ΔL = α·L·ΔT — restrained or free.' }
              : state.mode === 'bourdon'
                ? { badge: 'Bourdon effect', color: COLORS.purple, title: 'Pressure bend straightening', copy: 'Internal pressure can open a curved bend and create end displacement/reaction.' }
                : state.mode === 'combined'
                  ? { badge: 'Combined stress', color: COLORS.yellow, title: 'Von Mises / Tresca check', copy: 'SC = [SL²−SL·SH+SH²]^½' }
                  : { badge: 'Review mode', color: COLORS.cyan, title: 'Review', copy: 'Classify scenarios.' }, [state]);

  const update = (patch: Partial<LabState>) => setState(s => ({ ...s, ...patch }));
  const showNormalControls = state.stressView === 'normal' || state.stressView === 'combined';
  const showShearControls = state.stressView === 'shear' || state.stressView === 'combined';
  const showPipePressureControls = state.pipeStressView === 'pressure' || state.pipeStressView === 'combined';
  const showPipeBendingControls = state.pipeStressView === 'bending' || state.pipeStressView === 'combined';
  const showPipeTorsionControls = state.pipeStressView === 'torsion' || state.pipeStressView === 'combined';

  return <div className="app">
    <style>{presentationOverride}</style>
    <header className="appHeader">
      <div>
        <div className="brandRow">
          <div className="appIcon" aria-hidden="true">σ</div>
          <div>
            <div className="eyebrow">Interactive Piping Stress Visual Lab</div>
            <h1>Failure & Strength Lab</h1>
          </div>
        </div>
        <p className="subtitle">Piping stress concepts from load source to stress components, expansion, Bourdon bend opening, combined stress, and failure interpretation.</p>
      </div>
      <div className="statusStack">
        <div className="pill" style={{ color: status.color }}>{status.badge}</div>
        <div className="modeMini">{active.title}</div>
      </div>
    </header>

    <nav className="tabs lesson-tabs" aria-label="Lesson mode">
      {modeTabs.map(item => <button key={item.mode} title={item.title} className={`tab ${state.mode === item.mode ? 'active' : ''}`} onClick={() => update({ mode: item.mode })}>
        <span className="tabIcon">{item.icon}</span><span className="tabLabel">{item.label}</span>
      </button>)}
    </nav>

    <div className="content">
      <aside>
        {state.mode === 'static' && <>
          <ControlBlock title="Material response" tag="curve"><Segment active={state.material} options={['ductile', 'brittle']} onPick={v => update({ material: v as any })}/></ControlBlock>
          <ControlBlock title="Stress demand" tag="static"><Segment active={state.staticDemand} options={['tension', 'compression']} onPick={v => update({ staticDemand: v as any })}/></ControlBlock>
          <ControlBlock title="Static load level" tag={`${state.staticLoad}%`}><Range value={state.staticLoad} min={0} max={100} onChange={v => update({ staticLoad: v })} left="elastic" mid="near Sy" right="damage" /></ControlBlock>
          <ControlBlock title="Compare"><label className="toggle"><input type="checkbox" checked={state.compareCurve} onChange={e => update({ compareCurve: e.target.checked })}/> Compare with ghost material curve</label></ControlBlock>
          {state.material === 'brittle' && state.staticDemand === 'tension' && <ControlBlock title="Flaw"><label className="toggle"><input type="checkbox" checked={state.flawEnabled} onChange={e => update({ flawEnabled: e.target.checked })}/> Show notch / crack flaw</label></ControlBlock>}
          <ControlBlock title="Static display rule" tag="no arrows"><p className="copy">Static graphics show grips, plates, deformation, cracking, yielding, and pipe-wall response. Direction arrows are intentionally removed for both ductile and brittle cases.</p></ControlBlock>
        </>}
        {state.mode === 'fatigue' && <>
          <ControlBlock title="Scope" tag="metallic"><p className="copy">Fatigue graphics and S-N slider are shown only for ductile metallic piping. No brittle-material fatigue slider or brittle graphics are used.</p></ControlBlock>
          <ControlBlock title="Stress range Δσ" tag={`${state.fatigueStressRange}%`}><Range value={state.fatigueStressRange} min={10} max={95} onChange={v => update({ fatigueStressRange: v })} left="low" right="high" /></ControlBlock>
          <ControlBlock title="Cycles N" tag={cycleLabel(state.fatigueCyclesSlider)}><Range value={state.fatigueCyclesSlider} min={0} max={100} onChange={v => update({ fatigueCyclesSlider: v })} left="10²" mid="log scale" right="10⁷" /></ControlBlock>
          <ControlBlock title="Hotspot"><label className="toggle"><input type="checkbox" checked={state.notchEnabled} onChange={e => update({ notchEnabled: e.target.checked })}/> Show weld/notch hotspot</label></ControlBlock>
          <ControlBlock title="Brittle concept only" tag="text"><p className="copy">Brittle materials are treated as flaw/fracture-toughness controlled: existing crack size, stress intensity range ΔK, environment, and KIC govern risk. This is concept-only here; no brittle S-N graphics.</p></ControlBlock>
        </>}
        {state.mode === 'stress' && <>
          <ControlBlock title="Subtopic" tag="5A"><p className="copy">Generic stress components at a point. This tab defines Cartesian σx, σy, and τxy before pipe stress, Mohr circle, or failure theory.</p></ControlBlock>
          <ControlBlock title="Component view" tag={state.stressView}><Segment active={state.stressView} options={['normal', 'shear', 'combined']} onPick={v => update({ stressView: v as any })}/></ControlBlock>
          {showNormalControls && <>
            <ControlBlock title="Normal stress σx" tag={`${state.sigmaX}%`}><Range value={state.sigmaX} min={0} max={100} onChange={v => update({ sigmaX: v })} left="low" mid="width cue" right="high" /></ControlBlock>
            <ControlBlock title="Normal stress σy" tag={`${state.sigmaY}%`}><Range value={state.sigmaY} min={0} max={100} onChange={v => update({ sigmaY: v })} left="low" mid="height cue" right="high" /></ControlBlock>
          </>}
          {showShearControls && <ControlBlock title="Shear stress τxy" tag={`${state.tauXY}%`}><Range value={state.tauXY} min={0} max={100} onChange={v => update({ tauXY: v })} left="low" mid="skew cue" right="high" /></ControlBlock>}
          <ControlBlock title="Display options">
            <label className="toggle"><input type="checkbox" checked={state.showSignConvention} onChange={e => update({ showSignConvention: e.target.checked })}/> Show sign convention</label>
            {showShearControls && <label className="toggle"><input type="checkbox" checked={state.showPairedShear} onChange={e => update({ showPairedShear: e.target.checked })}/> Show paired shear τxy / τyx</label>}
            <label className="toggle"><input type="checkbox" checked={state.showTensor} onChange={e => update({ showTensor: e.target.checked })}/> Show tensor matrix</label>
          </ControlBlock>
        </>}
        {state.mode === 'pipe' && <>
          <ControlBlock title="Subtopic" tag="5B"><p className="copy">Pipe stress components use cylindrical notation. This tab is separate from generic σx/σy/τxy so hoop stress is not confused with Cartesian normal stress.</p></ControlBlock>
          <ControlBlock title="Pipe component view" tag={state.pipeStressView}><Segment active={state.pipeStressView} options={['pressure', 'bending', 'torsion', 'combined']} onPick={v => update({ pipeStressView: v as any })}/></ControlBlock>
          {showPipePressureControls && <>
            <ControlBlock title="Hoop stress σθ" tag={`${state.pipeHoop}%`}><Range value={state.pipeHoop} min={0} max={100} onChange={v => update({ pipeHoop: v })} left="low" mid="pressure cue" right="rupture cue" /></ControlBlock>
            <ControlBlock title="Axial membrane σL" tag={`${state.pipeAxial}%`}><Range value={state.pipeAxial} min={0} max={100} onChange={v => update({ pipeAxial: v })} left="low" mid="length cue" right="high" /></ControlBlock>
          </>}
          {showPipeBendingControls && <ControlBlock title="Bending effect M" tag={`${state.pipeBending}%`}><Range value={state.pipeBending} min={0} max={100} onChange={v => update({ pipeBending: v })} left="straight" mid="ovalisation" right="collapse cue" /></ControlBlock>}
          {showPipeTorsionControls && <ControlBlock title="Torsional shear τt" tag={`${state.pipeTorsion}%`}><Range value={state.pipeTorsion} min={0} max={100} onChange={v => update({ pipeTorsion: v })} left="low" mid="shear bands" right="high" /></ControlBlock>}
          <ControlBlock title="Notation rule" tag="separate"><p className="copy">Do not read σx or σy as hoop. In this tab: σθ is hoop, σL is axial/longitudinal, σr is radial concept text, and τt is torsion shear.</p></ControlBlock>
        </>}
        {state.mode === 'loads' && <>
          <ControlBlock title="Load source" tag={state.loadsActiveLoad}>
            <Segment active={state.loadsActiveLoad} options={['weight','pressure','event','thermal','settlement']} onPick={v => update({ loadsActiveLoad: v as any })}/>
          </ControlBlock>
          {state.loadsActiveLoad === 'weight' && <ControlBlock title="Weight load level" tag={`${state.loadsSustainedLevel}%`}><Range value={state.loadsSustainedLevel} min={0} max={100} onChange={v => update({ loadsSustainedLevel: v })} left="light" mid="design" right="heavy" /></ControlBlock>}
          {state.loadsActiveLoad === 'pressure' && <ControlBlock title="Pressure level" tag={`${state.loadsSustainedLevel}%`}><Range value={state.loadsSustainedLevel} min={0} max={100} onChange={v => update({ loadsSustainedLevel: v })} left="low" mid="design" right="high" /></ControlBlock>}
          {state.loadsActiveLoad === 'event' && <>
            <ControlBlock title="Event intensity" tag={`${state.loadsSustainedLevel}%`}><Range value={state.loadsSustainedLevel} min={0} max={100} onChange={v => update({ loadsSustainedLevel: v })} left="low" mid="event" right="severe" /></ControlBlock>
            <ControlBlock title="Dynamic restraint" tag={state.loadsRestraint}><Segment active={state.loadsRestraint} options={['free','guided','restrained']} onPick={v => update({ loadsRestraint: v as any })}/><p className="copy">Shown only for occasional/event loads: free = no stop; guided = guide/stop; restrained = snubber or hard stop.</p></ControlBlock>
          </>}
          {state.loadsActiveLoad === 'thermal' && <>
            <ControlBlock title="Temperature rise ΔT" tag={`${state.loadsThermalDelta * 2}°C`}><Range value={state.loadsThermalDelta} min={0} max={100} onChange={v => update({ loadsThermalDelta: v })} left="0°C" mid="100°C" right="200°C" /></ControlBlock>
            <ControlBlock title="Thermal restraint" tag={state.loadsRestraint}><Segment active={state.loadsRestraint} options={['free','guided','restrained']} onPick={v => update({ loadsRestraint: v as any })}/><p className="copy">Shown only for thermal ΔT: free growth has no reaction; guided/restrained cases show secondary reaction.</p></ControlBlock>
          </>}
          {state.loadsActiveLoad === 'settlement' && <ControlBlock title="Settlement amount" tag={`${state.loadsSustainedLevel}%`}><Range value={state.loadsSustainedLevel} min={0} max={100} onChange={v => update({ loadsSustainedLevel: v })} left="none" mid="support drop" right="large" /></ControlBlock>}
          <ControlBlock title="Applicability" tag="read-only"><p className="copy">Duration is not a global knob. Weight/pressure are sustained, event is occasional, thermal is an expansion range, and settlement is imposed movement.</p></ControlBlock>
        </>}
        {state.mode === 'expansion' && <>
          <ControlBlock title="Pipe condition" tag={state.expRestrained ? 'restrained' : 'unrestrained'}><Segment active={state.expRestrained ? 'restrained' : 'unrestrained'} options={['restrained','unrestrained']} onPick={v => update({ expRestrained: v === 'restrained' })}/></ControlBlock>
          <ControlBlock title="Temperature rise ΔT" tag={`${state.expDeltaT * 2}°C`}><Range value={state.expDeltaT} min={0} max={100} onChange={v => update({ expDeltaT: v })} left="0°C" mid="100°C" right="200°C" /></ControlBlock>
          <ControlBlock title="Internal pressure" tag={`${state.expPressure}%`}><Range value={state.expPressure} min={0} max={100} onChange={v => update({ expPressure: v })} left="low" mid="moderate" right="high" /></ControlBlock>
          <ControlBlock title="Bourdon moved" tag="new tab"><p className="copy">Bend straightening is now handled in the dedicated Bourdon Effect tab with pressure, bend angle, and end-condition controls.</p></ControlBlock>
        </>}
        {state.mode === 'bourdon' && <>
          <ControlBlock title="Internal pressure" tag={`${state.bourdonPressure}%`}><Range value={state.bourdonPressure} min={0} max={100} onChange={v => update({ bourdonPressure: v })} left="low" mid="design" right="high" /></ControlBlock>
          <ControlBlock title="Bend angle" tag={`${state.bourdonBendAngle}°`}><Segment active={state.bourdonBendAngle} options={['45','90','180']} onPick={v => update({ bourdonBendAngle: v as any })}/></ControlBlock>
          <ControlBlock title="Opening response" tag="derived"><p className="copy">No elbow-flexibility slider. The bend-opening cue is derived from internal pressure and bend angle. Pressure is the active load input.</p></ControlBlock>
          <ControlBlock title="End condition" tag={state.bourdonEndCondition}><Segment active={state.bourdonEndCondition} options={['free','guided','restrained']} onPick={v => update({ bourdonEndCondition: v as any })}/><p className="copy">Free end shows displacement. Guided/restrained cases convert part of bend opening into reaction/nozzle load.</p></ControlBlock>
          <ControlBlock title="Scope" tag="qualitative"><p className="copy">This is a piping relevance visual, not a code formula. Use it to understand pressure-induced bend opening before detailed stress analysis.</p></ControlBlock>
        </>}
        {state.mode === 'combined' && <>
          <ControlBlock title="Failure theory" tag={state.csTheory}><Segment active={state.csTheory} options={['vonmises','tresca']} onPick={v => update({ csTheory: v as any })}/></ControlBlock>
          <ControlBlock title="Hoop stress σH" tag={`${state.csH}%S`}><Range value={state.csH} min={0} max={100} onChange={v => update({ csH: v })} left="0" mid="0.5S" right="S" /></ControlBlock>
          <ControlBlock title="Longitudinal stress σL" tag={`${state.csL}%S`}><Range value={state.csL} min={0} max={100} onChange={v => update({ csL: v })} left="0" mid="0.5S" right="S" /></ControlBlock>
          <ControlBlock title="σL sign" tag={state.csLSign}><Segment active={state.csLSign} options={['tension','compression']} onPick={v => update({ csLSign: v as any })}/></ControlBlock>
          <ControlBlock title="Allowable factor" tag={`${(state.csAF*100).toFixed(0)}%S`}><Segment active={String(state.csAF)} options={['0.72','0.9']} onPick={v => update({ csAF: Number(v) })}/></ControlBlock>
        </>}
      </aside>

      <main>
        <section className="title-row">
          <div><h2>{modeTitle(state.mode)}</h2><p>{modeCopy(state)}</p></div>
          <div className="chip">{modeChip(state)}</div>
        </section>

        {(state.mode === 'static' || state.mode === 'fatigue') && <section className="grid analysis-grid">
          <Panel title="Side view" tag={state.mode === 'static' ? state.staticDemand : 'ductile metal fatigue'}><SideViewSvg state={state} status={status}/></Panel>
          <Panel title="Local / cross-section" tag={state.mode === 'fatigue' ? 'weld toe crack' : 'pipe wall section'}><LocalViewSvg state={state} status={status}/></Panel>
          <Panel title={state.mode === 'fatigue' ? 'S-N curve' : 'Stress–strain curve'} tag={state.mode === 'fatigue' ? 'ductile metal' : state.material}>{state.mode === 'fatigue' ? <SNCurve state={state} status={status}/> : <StressStrainCurve state={state} status={status}/>}</Panel>
          <Panel title="Failure interpretation" tag="engineering readout"><Interpretation state={state} status={status}/></Panel>
        </section>}

        {state.mode === 'stress' && <section className="grid stress-grid">
          <Panel title="Panel 1 · stress element" tag="generic Cartesian"><StressComponentsSvg state={state} status={status}/></Panel>
          <Panel title="Panel 2 · component meaning" tag={state.stressView}><StressComponentExplanation state={state}/></Panel>
          <Panel title="Panel 3 · tensor card" tag={state.showTensor ? 'visible' : 'hidden'}><StressTensorCard state={state}/></Panel>
          <Panel title="Panel 4 · engineering note" tag="not failure yet"><StressEngineeringNote state={state}/></Panel>
        </section>}

        {state.mode === 'pipe' && <section className="grid pipe-grid">
          <Panel title="Panel 1 · pipe side view" tag={state.pipeStressView}><PipeStressSideSvg state={state}/></Panel>
          <Panel title="Panel 2 · pipe cross-section" tag="σθ / ovalisation / rupture"><PipeStressSectionSvg state={state}/></Panel>
          <Panel title="Panel 3 · component map" tag="pipe notation"><PipeStressReadout state={state}/></Panel>
          <Panel title="Panel 4 · concept boundaries" tag="before failure theory"><PipeStressNote state={state}/></Panel>
        </section>}

        {state.mode === 'loads' && (() => {
          const ls: LoadsState = { activeLoad: state.loadsActiveLoad, intensity: state.loadsSustainedLevel, thermalDelta: state.loadsThermalDelta, duration: state.loadsDuration, restraint: state.loadsRestraint };
          return <section className="grid pipe-grid">
            <Panel title="Panel 1 · physical load visual" tag={state.loadsActiveLoad}><LoadsSideSvg state={ls} /></Panel>
            <Panel title="Panel 2 · classification map" tag="force vs displacement"><LoadsClassificationMap state={ls} /></Panel>
            <Panel title="Panel 3 · stress route" tag="next module"><LoadsReadout state={ls} /></Panel>
            <Panel title="Panel 4 · common mistake" tag="correction"><LoadsMistakePanel state={ls} /></Panel>
          </section>;
        })()}

        {state.mode === 'expansion' && (() => {
          const es: ExpansionState = { deltaT: state.expDeltaT, pressure: state.expPressure, restrained: state.expRestrained, showBourdon: false };
          return <section className="grid analysis-grid"><Panel title="Pipe expansion / pressure elongation" tag={state.expRestrained ? 'restrained' : 'unrestrained'}><PipeExpansionSideSvg state={es} /></Panel><Panel title="Equations" tag="ΔL formulas"><PipeExpansionEquations state={es} /></Panel><Panel title="Engineering interpretation" tag="B31.3 context"><PipeExpansionReadout state={es} /></Panel></section>;
        })()}

        {state.mode === 'bourdon' && (() => {
          const bs: BourdonState = { pressure: state.bourdonPressure, bendAngle: state.bourdonBendAngle, endCondition: state.bourdonEndCondition };
          return <section className="grid pipe-grid">
            <Panel title="Panel 1 · bend straightening visual" tag={`${state.bourdonBendAngle}° bend`}><BourdonEffectSvg state={bs} /></Panel>
            <Panel title="Panel 2 · mechanism" tag="pressure + curvature"><BourdonMechanismPanel state={bs} /></Panel>
            <Panel title="Panel 3 · piping relevance" tag="nozzle/support"><BourdonPipingRelevance state={bs} /></Panel>
            <Panel title="Panel 4 · readout" tag="screening cue"><BourdonReadout state={bs} /></Panel>
          </section>;
        })()}

        {state.mode === 'combined' && (() => {
          const cs: CombinedStressState = { sH: state.csH, sL: state.csL, sLSign: state.csLSign, theory: state.csTheory, allowableFactor: state.csAF };
          return <section className="grid analysis-grid"><Panel title="Yield surface" tag={state.csTheory}><CombinedStressYieldSvg state={cs} /></Panel><Panel title="Pipe cross-section" tag="σH + σL combined"><CombinedStressPipeSection state={cs} /></Panel><Panel title="Combined stress check" tag="B31.3 / B31.8"><CombinedStressReadout state={cs} /></Panel></section>;
        })()}

        {state.mode === 'challenge' && <section className="challenge">
          <div className="zone">
            <h3 className="result-title">Drag the idea to the correct bucket</h3>
            <p className="copy">This is a fixed review mode. It does not inherit the static demand selection.</p>
            <div className="card correct"><strong>Ductile tension</strong><span>Elongation → yielding → necking at high demand.</span></div>
            <div className="card correct"><strong>Brittle tension</strong><span>Little deformation → crack opens, especially if a flaw exists.</span></div>
            <div className="card correct"><strong>Metal fatigue</strong><span>Repeated Δσ + cycles N can initiate and grow cracks at weld/notch hotspots.</span></div>
            <div className="card correct"><strong>Generic stress components</strong><span>σx and σy are normal stresses; τxy is shear stress on a cut face.</span></div>
            <div className="card correct"><strong>Pipe stress components</strong><span>σθ is hoop, σL is axial/longitudinal, σr is radial, and τt is torsional shear.</span></div>
            <div className="card wrong"><strong>Brittle S-N graphics</strong><span>Do not show as normal pipe fatigue here; keep as fracture-mechanics concept text.</span></div>
          </div>
          <div className="zone">
            <h3 className="result-title">Review buckets</h3>
            <div className="bucket"><b>Static strength response</b><br/><span className="copy">σ = F/A, ε = σ/E, Sy and Su belong here.</span></div>
            <div className="bucket"><b>Generic stress state</b><br/><span className="copy">σx, σy, τxy, τyx describe stress at a point before pipe-specific notation.</span></div>
            <div className="bucket"><b>Pipe stress components</b><br/><span className="copy">Pressure → σθ and σL; bending → longitudinal tension/compression and ovalisation; torsion → τt.</span></div>
            <div className="bucket"><b>Load classification</b><br/><span className="copy">Weight/pressure/event are force-controlled; thermal and settlement are displacement-controlled.</span></div>
            <div className="bucket"><b>Metal fatigue response</b><br/><span className="copy">Δσ, N cycles, hotspot/notch/weld and S-N curve belong here for ductile metallic piping.</span></div>
            <p className="fb">Challenge principle: choose the right coordinate system and load route first.</p>
          </div>
        </section>}
        <section className="tech"><div className="tech-label">Technical bar</div><div className="tech-text">{state.mode === 'fatigue' ? `Metal fatigue view only: Δσ = stress range, N ≈ ${cycleLabel(state.fatigueCyclesSlider)} cycles. Brittle behavior is text-only as flaw/ΔK/KIC concept, not an S-N graphic.` : state.mode === 'stress' ? `Stress components 5A: generic point stress view=${state.stressView}, σx=${state.sigmaX}%, σy=${state.sigmaY}%, τxy=${state.tauXY}%. Pipe stress has been moved to Tab 5B.` : state.mode === 'pipe' ? `Pipe stress 5B: view=${state.pipeStressView}, σθ=${state.pipeHoop}%, σL=${state.pipeAxial}%, bending=${state.pipeBending}%, τt=${state.pipeTorsion}%. Concept-level only; no failure-theory or code-check calculation.` : state.mode === 'loads' ? `Loads dashboard: source=${state.loadsActiveLoad}, intensity=${state.loadsSustainedLevel}%, ΔT scale=${state.loadsThermalDelta * 2}°C, context=${state.loadsActiveLoad === 'thermal' ? `thermal restraint ${state.loadsRestraint}` : state.loadsActiveLoad === 'event' ? `dynamic restraint ${state.loadsRestraint}` : 'no global duration/restraint control'}.` : state.mode === 'expansion' ? `Expansion tab: ΔT=${state.expDeltaT * 2}°C, pressure=${state.expPressure}%, ${state.expRestrained ? 'restrained thermal stress shown' : 'free elongation shown'}, Bourdon moved to dedicated tab.` : state.mode === 'bourdon' ? `Bourdon tab: pressure=${state.bourdonPressure}%, bend=${state.bourdonBendAngle}°, end=${state.bourdonEndCondition}. Opening response is derived from pressure and bend angle, not a separate elbow-flexibility slider.` : state.mode === 'combined' ? `Combined stress tab: σH=${state.csH}%S, σL=${state.csL}%S ${state.csLSign}, theory=${state.csTheory}, allowable=${(state.csAF*100).toFixed(0)}%S.` : 'Static: σ = F/A and ε = σ/E in elastic range. Sy marks ductile yield onset; brittle response is flaw-sensitive. Static visuals intentionally avoid arrows and focus on physical response.'}</div></section>
      </main>
    </div>
  </div>;
}

function ControlBlock({ title, tag, children }: { title: string; tag?: string; children: React.ReactNode }) { return <div className="block"><div className="bt"><span>{title}</span><span>{tag}</span></div>{children}</div>; }
function Segment({ active, options, onPick }: { active: string; options: string[]; onPick: (v: string) => void }) {
  const columns = options.length >= 5 ? 3 : options.length;
  return <div className="seg" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{options.map(o => <button key={o} className={active === o ? 'active' : ''} onClick={() => onPick(o)}>{o === 'windSeismic' ? 'Wind/seismic' : o[0].toUpperCase()+o.slice(1)}</button>)}</div>;
}
function Range({ value, min, max, onChange, left, mid, right }: { value: number; min: number; max: number; onChange: (v:number)=>void; left: string; mid?: string; right: string }) { return <div className="range"><div className="row"><input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}/></div><div className="labels"><span>{left}</span>{mid && <span>{mid}</span>}<span>{right}</span></div></div>; }
function Panel({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) { return <article className="panel"><div className="ph"><span>{title}</span><span>{tag}</span></div><div className="pb">{children}</div></article>; }

createRoot(document.getElementById('root')!).render(<App />);
