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
};

function App() {
  const [state, setState] = useState<LabState>(initialState);
  const status = useMemo(() => state.mode === 'fatigue' ? fatigueStatus(state) : state.mode === 'static' ? staticStatus(state) : { badge: 'Review mode', color: COLORS.cyan, title: 'Review', copy: 'Classify scenarios.' }, [state]);
  const update = (patch: Partial<LabState>) => setState(s => ({ ...s, ...patch }));

  return <div className="app">
    <header>
      <div>
        <h1>Failure & Strength Lab v3</h1>
        <p className="subtitle">React/Vite source. Static uses σ–ε; fatigue uses a log-scale S-N curve.</p>
      </div>
      <div className="pill" style={{ color: status.color }}>{status.badge}</div>
    </header>

    <nav className="tabs">
      {(['static', 'fatigue', 'challenge'] as const).map(mode => <button key={mode} className={`tab ${state.mode === mode ? 'active' : ''}`} onClick={() => update({ mode })}>{mode === 'static' ? 'Static Loading · σ–ε' : mode === 'fatigue' ? 'Fatigue Loading · S–N' : 'Quick Challenge'}</button>)}
    </nav>

    <div className="content">
      <aside>
        {state.mode === 'static' && <>
          <ControlBlock title="Material response" tag="curve"><Segment active={state.material} options={['ductile', 'brittle']} onPick={v => update({ material: v as any })}/></ControlBlock>
          <ControlBlock title="Stress demand" tag="static"><Segment active={state.staticDemand} options={['tension', 'compression']} onPick={v => update({ staticDemand: v as any })}/></ControlBlock>
          <ControlBlock title="Static load level" tag={`${state.staticLoad}%`}><Range value={state.staticLoad} min={0} max={100} onChange={v => update({ staticLoad: v })} left="elastic" mid="near Sy" right="damage" /></ControlBlock>
          <ControlBlock title="Compare"><label className="toggle"><input type="checkbox" checked={state.compareCurve} onChange={e => update({ compareCurve: e.target.checked })}/> Compare with ghost material curve</label></ControlBlock>
          {state.material === 'brittle' && state.staticDemand === 'tension' && <ControlBlock title="Flaw"><label className="toggle"><input type="checkbox" checked={state.flawEnabled} onChange={e => update({ flawEnabled: e.target.checked })}/> Show notch / crack flaw</label></ControlBlock>}
        </>}
        {state.mode === 'fatigue' && <>
          <ControlBlock title="Material response" tag="fatigue"><Segment active={state.material} options={['ductile', 'brittle']} onPick={v => update({ material: v as any })}/></ControlBlock>
          <ControlBlock title="Stress range Δσ" tag={`${state.fatigueStressRange}%`}><Range value={state.fatigueStressRange} min={10} max={95} onChange={v => update({ fatigueStressRange: v })} left="low" right="high" /></ControlBlock>
          <ControlBlock title="Cycles N" tag={cycleLabel(state.fatigueCyclesSlider)}><Range value={state.fatigueCyclesSlider} min={0} max={100} onChange={v => update({ fatigueCyclesSlider: v })} left="10²" mid="log scale" right="10⁷" /></ControlBlock>
          <ControlBlock title="Hotspot"><label className="toggle"><input type="checkbox" checked={state.notchEnabled} onChange={e => update({ notchEnabled: e.target.checked })}/> Show weld/notch hotspot</label></ControlBlock>
        </>}
      </aside>

      <main>
        <section className="title-row">
          <div><h2>{state.mode === 'static' ? 'Static Loading' : state.mode === 'fatigue' ? 'Fatigue Loading' : 'Quick Challenge'}</h2><p>{state.mode === 'static' ? 'Side view, local/cross-section, and stress–strain curve update together.' : state.mode === 'fatigue' ? `S-N curve uses log10(N) = ${logCycles(state.fatigueCyclesSlider).toFixed(2)}.` : 'Review mode.'}</p></div>
          <div className="chip">{state.mode === 'fatigue' ? 'Δσ + N · S-N curve' : 'σ = F/A · ε = σ/E'}</div>
        </section>

        {state.mode !== 'challenge' && <section className="grid">
          <Panel title="Side view" tag={state.mode === 'static' ? state.staticDemand : 'cyclic Δσ'}><SideViewSvg state={state} status={status}/></Panel>
          <Panel title="Local / cross-section" tag={state.mode === 'fatigue' ? 'hotspot' : state.staticDemand === 'tension' ? 'axial pull' : 'inward compression'}><LocalViewSvg state={state} status={status}/></Panel>
          <Panel title={state.mode === 'fatigue' ? 'S-N curve' : 'Stress–strain curve'} tag={state.material}>{state.mode === 'fatigue' ? <SNCurve state={state} status={status}/> : <StressStrainCurve state={state} status={status}/>}</Panel>
          <Panel title="Failure interpretation" tag="conceptual"><Interpretation state={state} status={status}/></Panel>
        </section>}

        {state.mode === 'challenge' && <section className="challenge"><p>Challenge cards can be added here.</p></section>}
        <section className="tech"><div className="tech-label">Technical bar</div><div className="tech-text">{state.mode === 'fatigue' ? `Fatigue: Δσ = stress range, N ≈ ${cycleLabel(state.fatigueCyclesSlider)} cycles. S-N uses log-cycle mapping.` : 'Static: σ = F/A and ε = σ/E in elastic range. Sy marks ductile yield onset; Su is maximum engineering stress before final rupture zone.'}</div></section>
      </main>
    </div>
  </div>;
}

function ControlBlock({ title, tag, children }: { title: string; tag?: string; children: React.ReactNode }) { return <div className="block"><div className="bt"><span>{title}</span><span>{tag}</span></div>{children}</div>; }
function Segment({ active, options, onPick }: { active: string; options: string[]; onPick: (v: string) => void }) { return <div className="seg">{options.map(o => <button key={o} className={active === o ? 'active' : ''} onClick={() => onPick(o)}>{o[0].toUpperCase()+o.slice(1)}</button>)}</div>; }
function Range({ value, min, max, onChange, left, mid, right }: { value: number; min: number; max: number; onChange: (v:number)=>void; left: string; mid?: string; right: string }) { return <div className="range"><div className="row"><input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}/><span className="value">{value}%</span></div><div className="labels"><span>{left}</span>{mid && <span>{mid}</span>}<span>{right}</span></div></div>; }
function Panel({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) { return <article className="panel"><div className="ph"><span>{title}</span><span>{tag}</span></div><div className="pb">{children}</div></article>; }

createRoot(document.getElementById('root')!).render(<App />);
