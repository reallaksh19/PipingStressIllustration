import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { COLORS, CombinedStressState, ExpansionState, LabState, LoadsState } from './model/types';
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
  expShowBourdon: true,
  csH: 55,
  csL: 32,
  csLSign: 'tension',
  csTheory: 'vonmises',
  csAF: 0.90,
};

const presentationOverride = `
  .forceArrow { display: none !important; }
  marker[id^="tickArrow"] path { display: none !important; }

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
    grid-template-columns: minmax(560px, 1.18fr) minmax(410px, .92fr) !important;
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
    grid-template-columns: minmax(520px, 1fr) minmax(440px, 1fr) !important;
    grid-template-areas: "side section" "map note" !important;
    grid-auto-rows: minmax(315px, auto) !important;
  }
  .pipe-grid .panel:nth-child(1) { grid-area: side !important; grid-row: auto !important; grid-column: auto !important; min-height: 335px !important; }
  .pipe-grid .panel:nth-child(2) { grid-area: section !important; grid-row: auto !important; grid-column: auto !important; min-height: 335px !important; }
  .pipe-grid .panel:nth-child(3) { grid-area: map !important; grid-row: auto !important; grid-column: auto !important; }
  .pipe-grid .panel:nth-child(4) { grid-area: note !important; grid-row: auto !important; grid-column: auto !important; }
  .pipe-grid .panel:nth-child(1) .pb,
  .pipe-grid .panel:nth-child(2) .pb { min-height: 315px !important; display: flex; align-items: center; justify-content: center; }

  @media (max-width: 860px) {
    .analysis-grid { grid-template-columns: 1fr !important; grid-template-areas: "side" "local" "curve" "interp" !important; }
    .pipe-grid { grid-template-columns: 1fr !important; grid-template-areas: "side" "section" "map" "note" !important; }
  }
`;

function App() {
  const [state, setState] = useState<LabState>(initialState);
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
    <header>
      <div>
        <div className="tabs" style={{ padding: 0, borderBottom: 0, background: 'transparent', marginBottom: 8 }} aria-label="Page tab">
          <button className="tab active" type="button">Failure & Strength Lab</button>
        </div>
        <h1>Failure & Strength Lab</h1>
        <p className="subtitle">Visual demonstration of stress demand, material response, generic stress components, pipe stress components, load categories, pipe expansion, combined stress, and failure interpretation. Static uses σ–ε; fatigue uses S–N for ductile metallic piping only.</p>
      </div>
      <div className="pill" style={{ color: status.color }}>{status.badge}</div>
    </header>

    <nav className="tabs" aria-label="Lesson mode">
      {(['static', 'fatigue', 'stress', 'pipe', 'loads', 'expansion', 'combined', 'challenge'] as const).map(mode => <button key={mode} className={`tab ${state.mode === mode ? 'active' : ''}`} onClick={() => update({ mode })}>{mode === 'static' ? 'Static Loading · σ–ε' : mode === 'fatigue' ? 'Fatigue · S–N' : mode === 'stress' ? 'Stress Components' : mode === 'pipe' ? 'Pipe Stress · σθ σL τ' : mode === 'loads' ? 'Load Types · source route' : mode === 'expansion' ? 'Pipe Expansion · ΔL' : mode === 'combined' ? 'Combined Stress · VM' : 'Quick Challenge'}</button>)}
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
            <Segment active={state.loadsActiveLoad} options={['weight','pressure','event','thermal','settlement','nozzle']} onPick={v => update({ loadsActiveLoad: v as any })}/>
          </ControlBlock>
          {state.loadsActiveLoad !== 'thermal' && <ControlBlock title="Intensity" tag={`${state.loadsSustainedLevel}%`}><Range value={state.loadsSustainedLevel} min={0} max={100} onChange={v => update({ loadsSustainedLevel: v })} left="low" mid="design" right="high" /></ControlBlock>}
          {state.loadsActiveLoad === 'thermal' && <ControlBlock title="Temperature rise ΔT" tag={`${state.loadsThermalDelta * 2}°C`}><Range value={state.loadsThermalDelta} min={0} max={100} onChange={v => update({ loadsThermalDelta: v })} left="0°C" mid="100°C" right="200°C" /></ControlBlock>}
          <ControlBlock title="Duration" tag={state.loadsDuration}><Segment active={state.loadsDuration} options={['always','short','cycle']} onPick={v => update({ loadsDuration: v as any })}/></ControlBlock>
          <ControlBlock title="Restraint" tag={state.loadsRestraint}><Segment active={state.loadsRestraint} options={['free','guided','restrained']} onPick={v => update({ loadsRestraint: v as any })}/></ControlBlock>
          <ControlBlock title="Purpose" tag="classify"><p className="copy">Pick the real source first. The tab then separates force-controlled loads from displacement-controlled loads before sending the concept to the next module.</p></ControlBlock>
        </>}
        {state.mode === 'expansion' && <>
          <ControlBlock title="Pipe condition" tag={state.expRestrained ? 'restrained' : 'unrestrained'}><Segment active={state.expRestrained ? 'restrained' : 'unrestrained'} options={['restrained','unrestrained']} onPick={v => update({ expRestrained: v === 'restrained' })}/></ControlBlock>
          <ControlBlock title="Temperature rise ΔT" tag={`${state.expDeltaT * 2}°C`}><Range value={state.expDeltaT} min={0} max={100} onChange={v => update({ expDeltaT: v })} left="0°C" mid="100°C" right="200°C" /></ControlBlock>
          <ControlBlock title="Internal pressure" tag={`${state.expPressure}%`}><Range value={state.expPressure} min={0} max={100} onChange={v => update({ expPressure: v })} left="low" mid="moderate" right="high" /></ControlBlock>
          <ControlBlock title="Bourdon effect"><label className="toggle"><input type="checkbox" checked={state.expShowBourdon} onChange={e => update({ expShowBourdon: e.target.checked })} /> Show bend straightening</label></ControlBlock>
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
          <div><h2>{state.mode === 'static' ? 'Static Loading' : state.mode === 'fatigue' ? 'Fatigue Loading' : state.mode === 'stress' ? 'Stress Components at a Point' : state.mode === 'pipe' ? 'Pipe Stress Components' : state.mode === 'loads' ? 'Load Types' : state.mode === 'expansion' ? 'Pipe Expansion' : state.mode === 'combined' ? 'Combined Stress' : 'Quick Challenge'}</h2><p>{state.mode === 'static' ? 'Side view is stacked above pipe-wall cross-section; curve and interpretation are stacked at right.' : state.mode === 'fatigue' ? `Ductile metallic S-N view: log10(N) = ${logCycles(state.fatigueCyclesSlider).toFixed(2)}. Cross-section stays below side view.` : state.mode === 'stress' ? 'Move only the visible generic stress sliders: normal view resizes, shear view skews, combined view does both. Pipe stress has been moved to its own tab.' : state.mode === 'pipe' ? 'Use pipe-specific sliders for σθ hoop, σL axial membrane, bending ovalisation, and τt torsion shear. This is still concept-level, not a code check.' : state.mode === 'loads' ? 'Classification dashboard: identify the physical source, classify force/displacement behavior, then choose the stress route.' : state.mode === 'expansion' ? 'Show free or restrained thermal expansion, pressure elongation, and Bourdon effect.' : state.mode === 'combined' ? 'Compare Von Mises and Tresca combined-stress checks for hoop and longitudinal stress.' : 'Review mode.'}</p></div>
          <div className="chip">{state.mode === 'fatigue' ? 'ductile metal · Δσ + N · S-N curve' : state.mode === 'stress' ? 'σx · σy · τxy · generic stress point' : state.mode === 'pipe' ? 'σθ · σL · M · τt · pipe notation' : state.mode === 'loads' ? 'source · behavior · route' : state.mode === 'expansion' ? 'ΔL · αLΔT · Bourdon' : state.mode === 'combined' ? 'σH · σL · VM/Tresca' : 'σ = F/A · ε = σ/E'}</div>
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
          const es: ExpansionState = { deltaT: state.expDeltaT, pressure: state.expPressure, restrained: state.expRestrained, showBourdon: state.expShowBourdon };
          return <section className="grid analysis-grid"><Panel title="Pipe expansion / Bourdon" tag={state.expRestrained ? 'restrained' : 'unrestrained'}><PipeExpansionSideSvg state={es} /></Panel><Panel title="Equations" tag="ΔL formulas"><PipeExpansionEquations state={es} /></Panel><Panel title="Engineering interpretation" tag="B31.3 context"><PipeExpansionReadout state={es} /></Panel></section>;
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
            <div className="bucket"><b>Load classification</b><br/><span className="copy">Weight/pressure/event are force-controlled; thermal/settlement/nozzle movement are displacement-controlled.</span></div>
            <div className="bucket"><b>Metal fatigue response</b><br/><span className="copy">Δσ, N cycles, hotspot/notch/weld and S-N curve belong here for ductile metallic piping.</span></div>
            <p className="fb">Challenge principle: choose the right coordinate system and load route first.</p>
          </div>
        </section>}
        <section className="tech"><div className="tech-label">Technical bar</div><div className="tech-text">{state.mode === 'fatigue' ? `Metal fatigue view only: Δσ = stress range, N ≈ ${cycleLabel(state.fatigueCyclesSlider)} cycles. Brittle behavior is text-only as flaw/ΔK/KIC concept, not an S-N graphic.` : state.mode === 'stress' ? `Stress components 5A: generic point stress view=${state.stressView}, σx=${state.sigmaX}%, σy=${state.sigmaY}%, τxy=${state.tauXY}%. Pipe stress has been moved to Tab 5B.` : state.mode === 'pipe' ? `Pipe stress 5B: view=${state.pipeStressView}, σθ=${state.pipeHoop}%, σL=${state.pipeAxial}%, bending=${state.pipeBending}%, τt=${state.pipeTorsion}%. Concept-level only; no failure-theory or code-check calculation.` : state.mode === 'loads' ? `Loads dashboard: source=${state.loadsActiveLoad}, intensity=${state.loadsSustainedLevel}%, ΔT scale=${state.loadsThermalDelta * 2}°C, duration=${state.loadsDuration}, restraint=${state.loadsRestraint}.` : state.mode === 'expansion' ? `Expansion tab: ΔT=${state.expDeltaT * 2}°C, pressure=${state.expPressure}%, ${state.expRestrained ? 'restrained thermal stress shown' : 'free elongation shown'}, Bourdon=${state.expShowBourdon ? 'on' : 'off'}.` : state.mode === 'combined' ? `Combined stress tab: σH=${state.csH}%S, σL=${state.csL}%S ${state.csLSign}, theory=${state.csTheory}, allowable=${(state.csAF*100).toFixed(0)}%S.` : 'Static: σ = F/A and ε = σ/E in elastic range. Sy marks ductile yield onset; brittle response is flaw-sensitive. Static visuals intentionally avoid arrows and focus on physical response.'}</div></section>
      </main>
    </div>
  </div>;
}

function ControlBlock({ title, tag, children }: { title: string; tag?: string; children: React.ReactNode }) { return <div className="block"><div className="bt"><span>{title}</span><span>{tag}</span></div>{children}</div>; }
function Segment({ active, options, onPick }: { active: string; options: string[]; onPick: (v: string) => void }) { return <div className="seg" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>{options.map(o => <button key={o} className={active === o ? 'active' : ''} onClick={() => onPick(o)}>{o === 'windSeismic' ? 'Wind/seismic' : o[0].toUpperCase()+o.slice(1)}</button>)}</div>; }
function Range({ value, min, max, onChange, left, mid, right }: { value: number; min: number; max: number; onChange: (v:number)=>void; left: string; mid?: string; right: string }) { return <div className="range"><div className="row"><input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}/><span className="value">{value}%</span></div><div className="labels"><span>{left}</span>{mid && <span>{mid}</span>}<span>{right}</span></div></div>; }
function Panel({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) { return <article className="panel"><div className="ph"><span>{title}</span><span>{tag}</span></div><div className="pb">{children}</div></article>; }

createRoot(document.getElementById('root')!).render(<App />);
