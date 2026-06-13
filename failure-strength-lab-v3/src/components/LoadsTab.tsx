import { COLORS, LoadCategory, LoadsState } from '../model/types';
import { SvgDefs } from './SvgDefs';

type Behavior = 'force-controlled' | 'displacement-controlled';
type Category = 'primary / sustained' | 'primary / occasional' | 'secondary / expansion' | 'secondary / imposed displacement';

type LoadMeta = {
  label: string;
  short: string;
  color: string;
  behavior: Behavior;
  category: Category;
  route: string;
  concern: string;
  next: string;
  examples: string;
  mistake: string;
  correction: string;
};

const LOAD_META: Record<LoadCategory, LoadMeta> = {
  weight: {
    label: 'Weight',
    short: 'dead weight',
    color: COLORS.orange,
    behavior: 'force-controlled',
    category: 'primary / sustained',
    route: 'Sustained stress route',
    concern: 'collapse / gross plasticity if the load cannot be carried',
    next: 'Combined Stress · VM',
    examples: 'pipe self-weight, contents, insulation, valves',
    mistake: 'Treating dead weight like a self-relieving expansion strain.',
    correction: 'Weight is a real force. The pipe and supports must carry it continuously; local yielding does not make the gravity load disappear.',
  },
  pressure: {
    label: 'Pressure',
    short: 'internal pressure',
    color: COLORS.blue,
    behavior: 'force-controlled',
    category: 'primary / sustained',
    route: 'Pressure / sustained stress route',
    concern: 'hoop and longitudinal membrane stress',
    next: 'Pipe Stress · σθ σL τ',
    examples: 'design pressure, operating pressure, end-cap thrust',
    mistake: 'Calling pressure hoop stress a generic σx or σy stress.',
    correction: 'In pipe notation, pressure mainly creates σθ hoop stress and σL axial membrane stress. Use the pipe stress coordinate system.',
  },
  event: {
    label: 'Wind / seismic',
    short: 'short event',
    color: COLORS.yellow,
    behavior: 'force-controlled',
    category: 'primary / occasional',
    route: 'Occasional stress route',
    concern: 'short-duration force demand and support reaction',
    next: 'Combined Stress · VM',
    examples: 'wind, earthquake, relief thrust, blast/event load',
    mistake: 'Drawing occasional loads like permanent gravity loads.',
    correction: 'Occasional loads are still force-controlled, but they are event loads and normally belong to occasional combinations.',
  },
  thermal: {
    label: 'Thermal ΔT',
    short: 'free growth',
    color: COLORS.cyan,
    behavior: 'displacement-controlled',
    category: 'secondary / expansion',
    route: 'Expansion stress range route',
    concern: 'cyclic displacement strain range and flexibility',
    next: 'Pipe Expansion · ΔL',
    examples: 'temperature rise/fall, start-up/shutdown range',
    mistake: 'Thermal expansion is just another applied force.',
    correction: 'Thermal expansion first creates free growth ΔL. Stress appears when the system restrains that growth.',
  },
  settlement: {
    label: 'Settlement',
    short: 'support drops',
    color: COLORS.purple,
    behavior: 'displacement-controlled',
    category: 'secondary / imposed displacement',
    route: 'Imposed displacement / secondary route',
    concern: 'compatibility bending and displacement stress',
    next: 'Pipe Expansion · ΔL',
    examples: 'support settlement, anchor drift, structure movement',
    mistake: 'Settlement is a sustained force.',
    correction: 'Settlement is imposed movement. The pipe develops stress because it must fit the new support position.',
  },
  nozzle: {
    label: 'Nozzle movement',
    short: 'equipment movement',
    color: COLORS.purple,
    behavior: 'displacement-controlled',
    category: 'secondary / imposed displacement',
    route: 'Equipment displacement / secondary route',
    concern: 'nozzle load, flexibility, and displacement compatibility',
    next: 'Pipe Expansion · ΔL',
    examples: 'pump nozzle growth, vessel nozzle movement, anchor displacement',
    mistake: 'Nozzle displacement is just a point force.',
    correction: 'A nozzle movement is imposed displacement. The force is a reaction after the pipe is forced to follow the equipment movement.',
  },
};

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function tempLabel(value: number) {
  return `${Math.round(value * 2)}°C`;
}

function activeMeta(state: LoadsState) {
  return LOAD_META[state.activeLoad];
}

function ArrowDefs() {
  return <defs>
    <marker id="loadArrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={COLORS.blue}/></marker>
    <marker id="loadArrowOrange" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={COLORS.orange}/></marker>
    <marker id="loadArrowYellow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={COLORS.yellow}/></marker>
    <marker id="loadArrowCyan" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={COLORS.cyan}/></marker>
    <marker id="loadArrowPurple" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={COLORS.purple}/></marker>
  </defs>;
}

export function LoadsSideSvg({ state }: { state: LoadsState }) {
  const meta = activeMeta(state);
  const level = state.activeLoad === 'thermal' ? state.thermalDelta : state.intensity;
  const pipeY = 190;
  const eventBow = state.activeLoad === 'event' ? 8 + level * 0.24 : 0;
  const settlementDrop = state.activeLoad === 'settlement' ? 12 + level * 0.34 : 0;
  const nozzleMove = state.activeLoad === 'nozzle' ? 12 + level * 0.32 : 0;
  const thermalGrowth = state.activeLoad === 'thermal' ? 18 + state.thermalDelta * 0.42 : 0;
  const restrained = state.restraint === 'restrained';

  const leftX = 90;
  const rightX = 550;
  const rightSupportY = 224 + settlementDrop;
  const pipePath = state.activeLoad === 'event'
    ? `M${leftX} ${pipeY} C205 ${pipeY - eventBow}, 340 ${pipeY + eventBow * .6}, ${rightX} ${pipeY}`
    : state.activeLoad === 'settlement'
      ? `M${leftX} ${pipeY} C210 ${pipeY - 8}, 410 ${pipeY + settlementDrop * .55}, ${rightX} ${pipeY + settlementDrop}`
      : state.activeLoad === 'nozzle'
        ? `M${leftX} ${pipeY} C220 ${pipeY}, 420 ${pipeY + nozzleMove * .38}, ${rightX} ${pipeY + nozzleMove}`
        : `M${leftX} ${pipeY} H${rightX}`;

  return <svg viewBox="0 0 640 370" role="img" aria-label="Load type physical visual">
    <SvgDefs />
    <ArrowDefs />
    <rect x="14" y="18" width="612" height="330" rx="30" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M52 116H588 M52 210H588 M52 304H588 M160 48V334 M320 48V334 M480 48V334" stroke="rgba(216,237,255,.06)" />

    <text x="320" y="42" textAnchor="middle" className="label" fill={meta.color}>{meta.label}: physical load source</text>
    <text x="320" y="64" textAnchor="middle" className="muted">first identify the source, then classify the stress route</text>

    {state.activeLoad === 'thermal' && <>
      <path d={`M${leftX} 138 H${rightX}`} stroke="rgba(216,237,255,.28)" strokeWidth="7" strokeLinecap="round" />
      <text x="320" y="124" textAnchor="middle" className="muted">cold / reference length</text>
      <path d={`M${leftX} 164 H${rightX + thermalGrowth}`} stroke={COLORS.cyan} strokeWidth="7" strokeLinecap="round" />
      <path d={`M${rightX} 164 H${rightX + thermalGrowth}`} stroke={COLORS.cyan} strokeWidth="4" markerEnd="url(#loadArrowCyan)" />
      <text x={rightX + thermalGrowth / 2} y="152" textAnchor="middle" fill={COLORS.cyan} fontSize="12" fontWeight="900">free ΔL</text>
      {restrained && <>
        <rect x="76" y="146" width="24" height="88" rx="7" fill="rgba(255,158,58,.12)" stroke="rgba(255,158,58,.62)" />
        <rect x="540" y="146" width="24" height="88" rx="7" fill="rgba(255,158,58,.12)" stroke="rgba(255,158,58,.62)" />
        <path d="M132 246 H92" stroke={COLORS.orange} strokeWidth="4" markerEnd="url(#loadArrowOrange)" />
        <path d="M508 246 H548" stroke={COLORS.orange} strokeWidth="4" markerEnd="url(#loadArrowOrange)" />
        <text x="320" y="265" textAnchor="middle" fill={COLORS.orange} fontSize="12" fontWeight="900">restrained growth creates anchor reactions</text>
      </>}
    </>}

    {state.activeLoad !== 'thermal' && <>
      <path d="M90 190 H550" stroke="rgba(216,237,255,.18)" strokeWidth="42" strokeLinecap="round" strokeDasharray="9 11" />
      <path d={pipePath} stroke="#020813" strokeWidth="50" strokeLinecap="round" fill="none" opacity=".9" />
      <path d={pipePath} stroke="url(#pipeStroke)" strokeWidth="34" strokeLinecap="round" fill="none" />
      <path d={pipePath} stroke="#06101d" strokeWidth="13" strokeLinecap="round" fill="none" opacity=".78" strokeDasharray="18 12" />
      <Support x={88} y={224} label="support" />
      <Support x={548} y={rightSupportY} label={state.activeLoad === 'settlement' ? 'settled support' : 'support'} />
    </>}

    {state.activeLoad === 'weight' && <>
      {[170, 250, 330, 410, 490].map(x => <path key={x} d={`M${x} 96 V150`} stroke={COLORS.orange} strokeWidth="4" strokeLinecap="round" markerEnd="url(#loadArrowOrange)" />)}
      <text x="320" y="92" textAnchor="middle" className="label" fill={COLORS.orange}>distributed weight, contents, insulation, valves</text>
    </>}

    {state.activeLoad === 'pressure' && <>
      <path d="M118 142 C210 120, 430 120, 522 142 M118 238 C210 260, 430 260, 522 238" stroke={COLORS.blue} strokeWidth="3" fill="none" strokeDasharray="8 7" />
      <path d="M86 190 H48" stroke={COLORS.blue} strokeWidth="4" markerEnd="url(#loadArrowBlue)" />
      <path d="M554 190 H592" stroke={COLORS.blue} strokeWidth="4" markerEnd="url(#loadArrowBlue)" />
      <text x="320" y="106" textAnchor="middle" className="label" fill={COLORS.blue}>pressure expansion + axial end-force cue</text>
    </>}

    {state.activeLoad === 'event' && <>
      <path d="M85 102 C170 58, 265 58, 330 102 C410 154, 505 154, 585 102" stroke={COLORS.yellow} strokeWidth="3.2" fill="none" strokeDasharray="8 7" />
      <path d="M102 132 H178" stroke={COLORS.yellow} strokeWidth="4" markerEnd="url(#loadArrowYellow)" />
      <path d="M455 132 H532" stroke={COLORS.yellow} strokeWidth="4" markerEnd="url(#loadArrowYellow)" />
      <text x="320" y="98" textAnchor="middle" className="label" fill={COLORS.yellow}>short event force: wind / seismic / relief</text>
    </>}

    {state.activeLoad === 'settlement' && <>
      <path d={`M548 236 V${rightSupportY + 24}`} stroke={COLORS.purple} strokeWidth="4" markerEnd="url(#loadArrowPurple)" />
      <text x="390" y="112" fill={COLORS.purple} fontSize="12" fontWeight="900">imposed support movement</text>
      <text x="320" y="300" textAnchor="middle" className="caseLabel" fill={COLORS.purple}>pipe bends because one support moved</text>
    </>}

    {state.activeLoad === 'nozzle' && <>
      <rect x="500" y={122 + nozzleMove} width="82" height="108" rx="18" fill="rgba(216,237,255,.08)" stroke="rgba(216,237,255,.42)" />
      <text x="541" y={112 + nozzleMove} textAnchor="middle" className="muted">equipment</text>
      <path d={`M500 ${pipeY + nozzleMove} H552`} stroke={COLORS.purple} strokeWidth="8" strokeLinecap="round" />
      <path d={`M480 ${pipeY} C510 ${pipeY + nozzleMove * .3}, 520 ${pipeY + nozzleMove}, 550 ${pipeY + nozzleMove}`} stroke={COLORS.purple} strokeWidth="4" fill="none" markerEnd="url(#loadArrowPurple)" />
      <text x="320" y="106" textAnchor="middle" className="label" fill={COLORS.purple}>equipment/nozzle movement forces pipe to follow</text>
    </>}

    <g transform="translate(72 318)">
      <circle cx="0" cy="0" r="6" fill={meta.color} />
      <text x="14" y="4" className="muted">{meta.behavior}; {meta.category}; restraint = {state.restraint}; duration = {state.duration}</text>
    </g>
  </svg>;
}

function Support({ x, y, label }: { x: number; y: number; label: string }) {
  return <g>
    <path d={`M${x - 28} ${y} H${x + 28} L${x + 14} ${y + 30} H${x - 14} Z`} fill="rgba(216,237,255,.10)" stroke="rgba(216,237,255,.42)" />
    <text x={x} y={y + 48} textAnchor="middle" className="muted">{label}</text>
  </g>;
}

export function LoadsClassificationMap({ state }: { state: LoadsState }) {
  const meta = activeMeta(state);
  const forceLoads: LoadCategory[] = ['weight', 'pressure', 'event'];
  const displacementLoads: LoadCategory[] = ['thermal', 'settlement', 'nozzle'];

  const row = (load: LoadCategory) => {
    const m = LOAD_META[load];
    const active = state.activeLoad === load;
    return <div className={active ? 'card correct' : 'card'} style={{ borderColor: active ? m.color : undefined }} key={load}>
      <strong style={{ color: m.color }}>{m.label}</strong>
      <span className="copy">{m.category}</span>
    </div>;
  };

  return <div className="interp stress-readout">
    <span className="badge" style={{ color: meta.color }}>classification map</span>
    <h3 className="result-title">Force-controlled vs displacement-controlled</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div className="bucket" style={{ borderColor: 'rgba(255,158,58,.28)' }}>
        <b>FORCE-CONTROLLED</b>
        <span className="copy">Primary / occasional route</span>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>{forceLoads.map(row)}</div>
      </div>
      <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
        <b>DISPLACEMENT-CONTROLLED</b>
        <span className="copy">Secondary / expansion route</span>
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>{displacementLoads.map(row)}</div>
      </div>
    </div>
    <p className="fb">Active: {meta.label} → {meta.behavior}</p>
  </div>;
}

export function LoadsReadout({ state }: { state: LoadsState }) {
  const meta = activeMeta(state);
  const isThermal = state.activeLoad === 'thermal';
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: meta.color }}>stress route</span>
    <h3 className="result-title">Selected: {meta.label}</h3>
    <p className="copy">{meta.examples}</p>
    <div className="table">
      <div><span>Source</span><b>{meta.short}</b></div>
      <div><span>Load type</span><b>{meta.behavior}</b></div>
      <div><span>Category</span><b>{meta.category}</b></div>
      <div><span>Route</span><b>{meta.route}</b></div>
      <div><span>Main concern</span><b>{meta.concern}</b></div>
      <div><span>Next tab</span><b>{meta.next}</b></div>
      <div><span>{isThermal ? 'ΔT scale' : 'Intensity'}</span><b>{isThermal ? tempLabel(state.thermalDelta) : pct(state.intensity)}</b></div>
    </div>
    <div className="bucket" style={{ borderColor: `${meta.color}66` }}><b>Teaching boundary</b><span className="copy">This tab classifies the load. It does not replace sustained, occasional, expansion, or displacement-stress code checks.</span></div>
  </div>;
}

export function LoadsMistakePanel({ state }: { state: LoadsState }) {
  const meta = activeMeta(state);
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.red }}>common mistake</span>
    <h3 className="result-title">Correct the load concept first</h3>
    <div className="card wrong"><strong>Mistake</strong><span>{meta.mistake}</span></div>
    <div className="card correct"><strong>Correction</strong><span>{meta.correction}</span></div>
    <div className="table">
      <div><span>Duration</span><b>{state.duration}</b></div>
      <div><span>Restraint</span><b>{state.restraint}</b></div>
      <div><span>Classification</span><b>{meta.category}</b></div>
    </div>
    <p className="fb">Correct sequence: source → force/displacement behavior → stress route → detailed equation.</p>
  </div>;
}

// Backward-compatible export name for older imports.
export function LoadsCodeTable({ state }: { state: LoadsState }) {
  return <LoadsClassificationMap state={state} />;
}
