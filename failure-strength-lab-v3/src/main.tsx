import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { COLORS, LabState } from './model/types';
import { staticStatus } from './model/staticFailureModel';
import { cycleLabel, fatigueStatus, logCycles } from './model/fatigueModel';
import { SideViewSvg } from './components/SideViewSvg';
import { LocalViewSvg } from './components/LocalViewSvg';
import { StressStrainCurve } from './components/StressStrainCurve';
import { SNCurve } from './components/SNCurve';
import { Interpretation } from './components/Interpretation';
import { PipeEffectPreview, StressComponentExplanation, StressComponentsSvg, StressEngineeringNote, StressTensorCard } from './components/StressComponentsSvg';

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
  showPipeEffect: false,
};

const presentationOverride = `
  .forceArrow { display: none !important; }
  marker[id^="tickArrow"] path { display: none !important; }
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
  @media (max-width: 860px) {
    .analysis-grid { grid-template-columns: 1fr !important; grid-template-areas: "side" "local" "curve" "interp" !important; }
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
        : { badge: 'Review mode', color: COLORS.cyan, title: 'Review', copy: 'Classify scenarios.' }, [state]);

  const update = (patch: Partial<LabState>) => setState(s => ({ ...s, ...patch }));
  const showNormalControls = state.stressView === 'normal' || state.stressView === 'combined';
  const showShearControls = state.stressView === 'shear' || state.stressView === 'combined';

  return <div className="app">
    <style>{presentationOverride}</style>
    <header>
      <div>
        <div className="tabs" style={{ padding: 0, borderBottom: 0, background: 'transparent', marginBottom: 8 }} aria-label="Page tab">
          <button className="tab active" type="button">Failure & Strength Lab</button>
        </div>
        <h1>Failure & Strength Lab</h1>
        <p className="subtitle">Visual demonstration of stress demand, material response, stress components, and failure interpretation. Static uses σ–ε; fatigue uses S–N for ductile metallic piping only.</p>
      </div>
      <div className="pill" style={{ color: status.color }}>{status.badge}</div>
    </header>

    <nav className="tabs" aria-label="Lesson mode">
      {(['static', 'fatigue', 'stress', 'challenge'] as const).map(mode => <button key={mode} className={`tab ${state.mode === mode ? 'active' : ''}`} onClick={() => update({ mode })}>{mode === 'static' ? 'Static Loading · σ–ε' : mode === 'fatigue' ? 'Fatigue Loading · metallic S–N' : mode === 'stress' ? 'Stress Components · σx σy τxy' : 'Quick Challenge'}</button>)}
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
          <ControlBlock title="Subtopic" tag="5A"><p className="copy">Stress components at a point. This tab defines σ and τ before pipe stress, Mohr circle, or failure theory.</p></ControlBlock>
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
            <label className="toggle"><input type="checkbox" checked={state.showPipeEffect} onChange={e => update({ showPipeEffect: e.target.checked })}/> Show pipe effect preview</label>
          </ControlBlock>
        </>}
      </aside>

      <main>
        <section className="title-row">
          <div><h2>{state.mode === 'static' ? 'Static Loading' : state.mode === 'fatigue' ? 'Fatigue Loading' : state.mode === 'stress' ? 'Stress Components at a Point' : 'Quick Challenge'}</h2><p>{state.mode === 'static' ? 'Side view is stacked above pipe-wall cross-section; curve and interpretation are stacked at right.' : state.mode === 'fatigue' ? `Ductile metallic S-N view: log10(N) = ${logCycles(state.fatigueCyclesSlider).toFixed(2)}. Cross-section stays below side view.` : state.mode === 'stress' ? 'Move the visible component sliders only: normal view resizes, shear view skews, combined view does both. Pipe preview is optional and concept-only.' : 'Review mode.'}</p></div>
          <div className="chip">{state.mode === 'fatigue' ? 'ductile metal · Δσ + N · S-N curve' : state.mode === 'stress' ? 'σx · σy · τxy · stress state only' : 'σ = F/A · ε = σ/E'}</div>
        </section>

        {(state.mode === 'static' || state.mode === 'fatigue') && <section className="grid analysis-grid">
          <Panel title="Side view" tag={state.mode === 'static' ? state.staticDemand : 'ductile metal fatigue'}><SideViewSvg state={state} status={status}/></Panel>
          <Panel title="Local / cross-section" tag={state.mode === 'fatigue' ? 'weld toe crack' : 'pipe wall section'}><LocalViewSvg state={state} status={status}/></Panel>
          <Panel title={state.mode === 'fatigue' ? 'S-N curve' : 'Stress–strain curve'} tag={state.mode === 'fatigue' ? 'ductile metal' : state.material}>{state.mode === 'fatigue' ? <SNCurve state={state} status={status}/> : <StressStrainCurve state={state} status={status}/>}</Panel>
          <Panel title="Failure interpretation" tag="engineering readout"><Interpretation state={state} status={status}/></Panel>
        </section>}

        {state.mode === 'stress' && <section className="grid stress-grid">
          <Panel title="Panel 1 · stress element" tag="resizes from visible sliders"><StressComponentsSvg state={state} status={status}/></Panel>
          <Panel title={state.showPipeEffect ? 'Panel 2 · pipe effect preview' : 'Panel 2 · component meaning'} tag={state.showPipeEffect ? 'concept bridge' : state.stressView}>{state.showPipeEffect ? <PipeEffectPreview state={state}/> : <StressComponentExplanation state={state}/>}</Panel>
          <Panel title="Panel 3 · tensor card" tag={state.showTensor ? 'visible' : 'hidden'}><StressTensorCard state={state}/></Panel>
          <Panel title="Panel 4 · engineering note" tag="not failure yet"><StressEngineeringNote state={state}/></Panel>
        </section>}

        {state.mode === 'challenge' && <section className="challenge">
          <div className="zone">
            <h3 className="result-title">Drag the idea to the correct bucket</h3>
            <p className="copy">This is a fixed review mode. It does not inherit the static demand selection.</p>
            <div className="card correct"><strong>Ductile tension</strong><span>Elongation → yielding → necking at high demand.</span></div>
            <div className="card correct"><strong>Brittle tension</strong><span>Little deformation → crack opens, especially if a flaw exists.</span></div>
            <div className="card correct"><strong>Metal fatigue</strong><span>Repeated Δσ + cycles N can initiate and grow cracks at weld/notch hotspots.</span></div>
            <div className="card correct"><strong>Stress components</strong><span>σx and σy are normal stresses; τxy is shear stress on a cut face.</span></div>
            <div className="card wrong"><strong>Brittle S-N graphics</strong><span>Do not show as normal pipe fatigue here; keep as fracture-mechanics concept text.</span></div>
          </div>
          <div className="zone">
            <h3 className="result-title">Review buckets</h3>
            <div className="bucket"><b>Static strength response</b><br/><span className="copy">σ = F/A, ε = σ/E, Sy and Su belong here.</span></div>
            <div className="bucket"><b>Stress components</b><br/><span className="copy">σx, σy, τxy, τyx describe the stress state at a point before failure theory.</span></div>
            <div className="bucket"><b>Metal fatigue response</b><br/><span className="copy">Δσ, N cycles, hotspot/notch/weld and S-N curve belong here for ductile metallic piping.</span></div>
            <div className="bucket"><b>Brittle concept</b><br/><span className="copy">Brittle risk is flaw/fracture-toughness controlled: ΔK, crack size, environment, KIC.</span></div>
            <p className="fb">Challenge principle: stress demand is applied first; material behavior changes the response, not the applied stress itself.</p>
          </div>
        </section>}
        <section className="tech"><div className="tech-label">Technical bar</div><div className="tech-text">{state.mode === 'fatigue' ? `Metal fatigue view only: Δσ = stress range, N ≈ ${cycleLabel(state.fatigueCyclesSlider)} cycles. Brittle behavior is text-only as flaw/ΔK/KIC concept, not an S-N graphic.` : state.mode === 'stress' ? `Stress components 5A: view=${state.stressView}, σx=${state.sigmaX}%, σy=${state.sigmaY}%, τxy=${state.tauXY}%. Pipe preview=${state.showPipeEffect ? 'on' : 'off'} and is concept-only.` : 'Static: σ = F/A and ε = σ/E in elastic range. Sy marks ductile yield onset; brittle response is flaw-sensitive. Static visuals intentionally avoid arrows and focus on physical response.'}</div></section>
      </main>
    </div>
  </div>;
}

function ControlBlock({ title, tag, children }: { title: string; tag?: string; children: React.ReactNode }) { return <div className="block"><div className="bt"><span>{title}</span><span>{tag}</span></div>{children}</div>; }
function Segment({ active, options, onPick }: { active: string; options: string[]; onPick: (v: string) => void }) { return <div className="seg" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>{options.map(o => <button key={o} className={active === o ? 'active' : ''} onClick={() => onPick(o)}>{o[0].toUpperCase()+o.slice(1)}</button>)}</div>; }
function Range({ value, min, max, onChange, left, mid, right }: { value: number; min: number; max: number; onChange: (v:number)=>void; left: string; mid?: string; right: string }) { return <div className="range"><div className="row"><input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}/><span className="value">{value}%</span></div><div className="labels"><span>{left}</span>{mid && <span>{mid}</span>}<span>{right}</span></div></div>; }
function Panel({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) { return <article className="panel"><div className="ph"><span>{title}</span><span>{tag}</span></div><div className="pb">{children}</div></article>; }

createRoot(document.getElementById('root')!).render(<App />);
