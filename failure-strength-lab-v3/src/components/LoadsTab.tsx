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
    label: 'Event / dynamic',
    short: 'short event',
    color: COLORS.yellow,
    behavior: 'force-controlled',
    category: 'primary / occasional',
    route: 'Occasional stress route',
    concern: 'short-duration force demand and support reaction',
    next: 'Combined Stress · VM',
    examples: 'wind, seismic, water hammer, relief thrust, slug / blast event load',
    mistake: 'Treating guides, stops, anchors, and snubbers as one generic restraint.',
    correction: 'Occasional loads are force-controlled event loads. In this teaching view the left end is always the fixed anchor. Unrestrained means the right side has no lateral event stop and the left anchor carries the event shear/moment. Guided means a right-side lateral guide gap closes before a medium guide reaction shares the load. Arrested means a rigid stop/strut blocks right-side lateral motion and transfers a larger reaction.',
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

function loadScaleLabel(state: LoadsState) {
  return state.activeLoad === 'thermal'
    ? `ΔT slider = ${tempLabel(state.thermalDelta)}`
    : `load slider = ${pct(state.intensity)}`;
}

function activeSliderValue(state: LoadsState) {
  return state.activeLoad === 'thermal' ? state.thermalDelta : state.intensity;
}

function applicabilityText(load: LoadCategory) {
  if (load === 'weight') return 'Applicability: sustained / always present';
  if (load === 'pressure') return 'Applicability: sustained pressure case';
  if (load === 'event') return 'Applicability: occasional / short event';
  if (load === 'thermal') return 'Applicability: expansion range; cyclic if repeated operation';
  return 'Applicability: imposed support movement; usually one-time unless movement repeats';
}

export function eventRestraintLabel(value: LoadsState['restraint']) {
  if (value === 'free') return 'Unrestrained';
  if (value === 'guided') return 'Guided';
  return 'Arrested';
}

function contextControlText(state: LoadsState) {
  if (state.activeLoad === 'thermal') {
    if (state.restraint === 'free') return 'thermal condition = left anchor reference; right end expands freely';
    if (state.restraint === 'guided') return 'thermal condition = left anchor + side guide; axial growth remains free';
    return 'thermal condition = left and right anchors block axial growth and create reactions';
  }
  if (state.activeLoad === 'event') {
    if (state.restraint === 'free') return 'event condition = left anchor only; right side unrestrained laterally';
    if (state.restraint === 'guided') return 'event condition = left anchor + right lateral guide gap/contact';
    return 'event condition = left anchor + right rigid lateral stop/strut';
  }
  return 'no duration/restraint knob for this load source';
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
  const level = activeSliderValue(state);
  const pipeY = 190;
  const leftX = 96;
  const rightX = 526;
  const supportY = 224;
  const restrained = state.restraint === 'restrained';
  const guided = state.restraint === 'guided';
  const eventMode = state.activeLoad === 'event';
  const thermalMode = state.activeLoad === 'thermal';
  const hasRestraintControl = thermalMode || eventMode;

  const guideGap = 38;
  const eventFreeTipDrop = eventMode ? 14 + level * 0.52 : 0;
  const guidedContactRatio = eventMode && guided ? Math.max(0, Math.min(1, (eventFreeTipDrop - guideGap) / 34)) : 0;
  const guidedContact = guidedContactRatio > 0;
  const eventTipDrop = eventMode
    ? state.restraint === 'free'
      ? eventFreeTipDrop
      : guided
        ? Math.min(eventFreeTipDrop, guideGap + guidedContactRatio * 8)
        : 8 + level * 0.06
    : 0;
  const eventMidBow = eventMode
    ? state.restraint === 'free'
      ? eventTipDrop * 0.88
      : guided
        ? eventTipDrop * 0.68
        : eventTipDrop * 0.40
    : 0;
  const eventArrow = eventMode ? 28 + level * 0.36 : 0;
  const eventLeftReaction = eventMode
    ? state.restraint === 'free'
      ? 36 + level * 0.36
      : guided
        ? (guidedContact ? 24 + level * 0.12 : 32 + level * 0.28)
        : 18 + level * 0.10
    : 0;
  const guidedReaction = eventMode && guided && guidedContact ? 18 + guidedContactRatio * (22 + level * 0.15) : 0;
  const arrestedReaction = eventMode && restrained ? 58 + level * 0.56 : 0;

  const weightSag = state.activeLoad === 'weight' ? 4 + level * 0.24 : 0;
  const pressureBulge = state.activeLoad === 'pressure' ? 6 + level * 0.24 : 0;
  const pressureEndForce = state.activeLoad === 'pressure' ? 18 + level * 0.38 : 0;
  const settlementDrop = state.activeLoad === 'settlement' ? 6 + level * 0.58 : 0;
  const thermalGrowth = thermalMode ? 10 + state.thermalDelta * 0.48 : 0;
  const thermalReaction = thermalMode && restrained ? 32 + state.thermalDelta * 0.42 : 0;
  const rightSupportY = supportY + settlementDrop;

  const pipePath = state.activeLoad === 'weight'
    ? `M${leftX} ${pipeY} C210 ${pipeY + weightSag}, 410 ${pipeY + weightSag}, ${rightX} ${pipeY}`
    : eventMode
      ? `M${leftX} ${pipeY} C196 ${pipeY + eventMidBow * 0.28}, 352 ${pipeY + eventMidBow}, ${rightX} ${pipeY + eventTipDrop}`
      : state.activeLoad === 'settlement'
        ? `M${leftX} ${pipeY} C210 ${pipeY - 6}, 410 ${pipeY + settlementDrop * .52}, ${rightX} ${pipeY + settlementDrop}`
        : `M${leftX} ${pipeY} H${rightX}`;

  return <svg viewBox="0 0 640 370" role="img" aria-label="Load type physical visual">
    <SvgDefs />
    <ArrowDefs />
    <rect x="14" y="18" width="612" height="330" rx="30" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M52 116H588 M52 210H588 M52 304H588 M160 48V334 M320 48V334 M480 48V334" stroke="rgba(216,237,255,.06)" />

    <text x="320" y="42" textAnchor="middle" className="label" fill={meta.color}>{meta.label}: physical load source</text>
    <text x="320" y="64" textAnchor="middle" className="muted">{loadScaleLabel(state)}{hasRestraintControl ? ` · ${contextControlText(state)}` : ''}</text>

    {thermalMode && <>
      <Support x={leftX - 2} y={supportY} label="left anchor" />
      <Support x={rightX + 2} y={supportY} label={state.restraint === 'free' ? 'free slide end' : guided ? 'side guide' : 'right anchor'} />
      <path d={`M${leftX} ${pipeY - 24} H${rightX}`} stroke="rgba(216,237,255,.32)" strokeWidth="7" strokeLinecap="round" />
      <text x="320" y={pipeY - 40} textAnchor="middle" className="muted">cold / reference length; left anchor is fixed datum</text>

      {!restrained && <>
        <path d={`M${leftX} ${pipeY + 6} H${rightX + thermalGrowth}`} stroke={COLORS.cyan} strokeWidth="9" strokeLinecap="round" />
        <path d={`M${rightX} ${pipeY + 6} H${rightX + thermalGrowth}`} stroke={COLORS.cyan} strokeWidth="4" markerEnd="url(#loadArrowCyan)" />
        <circle cx={leftX} cy={pipeY + 6} r="7" fill={COLORS.cyan} />
        <text x={rightX + thermalGrowth / 2} y={pipeY - 4} textAnchor="middle" fill={COLORS.cyan} fontSize="12" fontWeight="900">hot pipe grows right from fixed left anchor</text>
      </>}

      {restrained && <>
        <path d={`M${leftX} ${pipeY + 6} H${rightX}`} stroke={COLORS.cyan} strokeWidth="9" strokeLinecap="round" />
        <path d={`M${rightX} ${pipeY + 6} H${rightX + thermalGrowth}`} stroke="rgba(82,240,223,.42)" strokeWidth="4" strokeDasharray="8 7" markerEnd="url(#loadArrowCyan)" />
        <circle cx={leftX} cy={pipeY + 6} r="7" fill={COLORS.orange} />
        <circle cx={rightX} cy={pipeY + 6} r="7" fill={COLORS.orange} />
        <text x={rightX + thermalGrowth / 2} y={pipeY - 4} textAnchor="middle" fill={COLORS.cyan} fontSize="12" fontWeight="900">ghost free ΔL blocked between anchors</text>
      </>}

      {guided && <>
        <rect x={rightX + 8} y={pipeY - 58} width="16" height="124" rx="6" fill="rgba(82,240,223,.06)" stroke="rgba(82,240,223,.55)" />
        <path d={`M${rightX - 30} ${pipeY - 26} H${rightX + 18} M${rightX - 30} ${pipeY + 44} H${rightX + 18}`} stroke={COLORS.cyan} strokeWidth="2.4" strokeDasharray="6 6" />
        <path d={`M${rightX + 18} ${pipeY + 34} H${rightX + thermalGrowth}`} stroke={COLORS.cyan} strokeWidth="2.6" strokeDasharray="5 6" markerEnd="url(#loadArrowCyan)" />
        <text x="320" y="278" textAnchor="middle" fill={COLORS.cyan} fontSize="12" fontWeight="900">GUIDED: left anchor fixes datum; side guide controls lateral drift; axial ΔL still slides</text>
      </>}

      {restrained && <>
        <rect x={leftX - 30} y={pipeY - 68} width="32" height="142" rx="6" fill="rgba(255,158,58,.20)" stroke="rgba(255,158,58,.92)" />
        <rect x={rightX - 2} y={pipeY - 68} width="32" height="142" rx="6" fill="rgba(255,158,58,.20)" stroke="rgba(255,158,58,.92)" />
        <path d={`M${leftX + 84} ${pipeY + 6} H${leftX - thermalReaction}`} stroke={COLORS.orange} strokeWidth="6.2" markerEnd="url(#loadArrowOrange)" />
        <path d={`M${rightX - 84} ${pipeY + 6} H${rightX + thermalReaction}`} stroke={COLORS.orange} strokeWidth="6.2" markerEnd="url(#loadArrowOrange)" />
        <path d={`M${leftX + 6} ${pipeY - 54} L${leftX + 56} ${pipeY + 58} M${rightX + 24} ${pipeY - 54} L${rightX - 30} ${pipeY + 58}`} stroke="rgba(255,158,58,.70)" strokeWidth="3.6" strokeLinecap="round" />
        <text x="320" y="278" textAnchor="middle" fill={COLORS.orange} fontSize="12" fontWeight="900">ARRESTED: both anchors oppose the blocked axial thermal growth</text>
      </>}

      {state.restraint === 'free' && <text x="320" y="278" textAnchor="middle" className="muted">unrestrained right end: ΔT slider changes free extension; no axial thermal reaction</text>}
    </>}

    {!thermalMode && <>
      <path d={`M${leftX} ${pipeY} H${rightX}`} stroke="rgba(216,237,255,.18)" strokeWidth="42" strokeLinecap="round" strokeDasharray="9 11" />
      <path d={pipePath} stroke="#020813" strokeWidth="50" strokeLinecap="round" fill="none" opacity=".9" />
      <path d={pipePath} stroke="url(#pipeStroke)" strokeWidth={state.activeLoad === 'pressure' ? 34 + level * 0.045 : 34} strokeLinecap="round" fill="none" />
      <path d={pipePath} stroke="#06101d" strokeWidth="13" strokeLinecap="round" fill="none" opacity=".78" strokeDasharray="18 12" />
      <Support x={leftX - 2} y={supportY} label={eventMode ? 'left anchor' : 'support'} />
      <Support x={rightX + 2} y={rightSupportY} label={eventMode && guided ? 'right guide gap' : eventMode && restrained ? 'right rigid stop' : eventMode ? 'free right end' : state.activeLoad === 'settlement' ? 'settled support' : 'support'} />
    </>}

    {state.activeLoad === 'weight' && <>
      {[150, 210, 270, 330, 390, 450, 510].map((x, i) => {
        const active = i > 0 && i < 6;
        const top = 100 - level * 0.10;
        const bottom = 143 + level * 0.12;
        return active && <path key={x} d={`M${x} ${top} V${bottom}`} stroke={COLORS.orange} strokeWidth={2.6 + level * 0.026} strokeLinecap="round" markerEnd="url(#loadArrowOrange)" />;
      })}
      <path d={`M112 ${pipeY + 33 + weightSag} C230 ${pipeY + 50 + weightSag * .35}, 410 ${pipeY + 50 + weightSag * .35}, 528 ${pipeY + 33 + weightSag}`} stroke="rgba(255,158,58,.40)" strokeWidth="3" fill="none" strokeDasharray="7 7" />
      <text x="320" y="92" textAnchor="middle" className="label" fill={COLORS.orange}>distributed weight demand {pct(level)}</text>
    </>}

    {state.activeLoad === 'pressure' && <>
      <path d={`M118 ${142 - pressureBulge} C210 ${120 - pressureBulge}, 430 ${120 - pressureBulge}, 522 ${142 - pressureBulge}`} stroke={COLORS.blue} strokeWidth={2.4 + level * 0.022} fill="none" strokeDasharray="8 7" />
      <path d={`M118 ${238 + pressureBulge} C210 ${260 + pressureBulge}, 430 ${260 + pressureBulge}, 522 ${238 + pressureBulge}`} stroke={COLORS.blue} strokeWidth={2.4 + level * 0.022} fill="none" strokeDasharray="8 7" />
      <path d={`M86 190 H${86 - pressureEndForce}`} stroke={COLORS.blue} strokeWidth={3 + level * 0.025} markerEnd="url(#loadArrowBlue)" />
      <path d={`M554 190 H${554 + pressureEndForce}`} stroke={COLORS.blue} strokeWidth={3 + level * 0.025} markerEnd="url(#loadArrowBlue)" />
      <text x="320" y="106" textAnchor="middle" className="label" fill={COLORS.blue}>pressure expansion + axial end force {pct(level)}</text>
    </>}

    {eventMode && <>
      <path d={`M${leftX - 4} ${pipeY + 40} C194 ${pipeY + 46 + eventMidBow * .30}, 350 ${pipeY + 42 + eventMidBow}, ${rightX + 44} ${pipeY + eventTipDrop + 28}`} stroke={COLORS.yellow} strokeWidth={2.4 + level * 0.025} fill="none" strokeDasharray="8 7" />
      {[150, 300, 450].map((x, i) => <path key={x} d={`M${x} ${pipeY - 102 - i * 8} V${pipeY - 102 + eventArrow}`} stroke={COLORS.yellow} strokeWidth={3 + level * 0.026} markerEnd="url(#loadArrowYellow)" />)}
      <circle cx="320" cy={pipeY + Math.min(30, eventMidBow * .55)} r={12 + level * 0.18} fill="none" stroke="rgba(255,215,91,.34)" strokeWidth="3" strokeDasharray="6 7" />
      <text x="320" y="94" textAnchor="middle" className="label" fill={COLORS.yellow}>event load is lateral; left side is always anchored</text>

      <path d={`M${leftX - 38} ${pipeY + 92} V${pipeY + 18 - eventLeftReaction * .30}`} stroke={COLORS.orange} strokeWidth={state.restraint === 'free' ? 5.6 : guided ? 4.5 : 3.8} markerEnd="url(#loadArrowOrange)" />
      <text x={leftX + 34} y={pipeY + 98} fill={COLORS.orange} fontSize="10" fontWeight="900">left anchor reaction</text>

      {guided && <>
        <rect x={rightX - 58} y={pipeY + guideGap + 20} width="116" height="16" rx="5" fill="rgba(82,240,223,.08)" stroke="rgba(82,240,223,.72)" />
        <rect x={rightX - 58} y={pipeY + guideGap + 54} width="116" height="7" rx="3" fill="rgba(82,240,223,.12)" stroke="rgba(82,240,223,.45)" />
        <path d={`M${rightX - 48} ${pipeY + eventTipDrop + 18} V${pipeY + guideGap + 20} M${rightX + 48} ${pipeY + eventTipDrop + 18} V${pipeY + guideGap + 20}`} stroke={COLORS.cyan} strokeWidth="2.4" strokeDasharray="5 5" />
        <path d={`M${rightX - 52} ${pipeY + guideGap + 20} H${rightX + 52}`} stroke="rgba(82,240,223,.42)" strokeWidth="2" strokeDasharray="6 6" />
        <text x={rightX} y={pipeY + guideGap + 78} textAnchor="middle" fill={COLORS.cyan} fontSize="10" fontWeight="900">right lateral guide gap</text>
        {guidedContact ? <>
          <circle cx={rightX} cy={pipeY + guideGap + 20} r="6" fill={COLORS.cyan} />
          <path d={`M${rightX} ${pipeY + guideGap + 88} V${pipeY + guideGap + 20 - guidedReaction}`} stroke={COLORS.cyan} strokeWidth="3.6" markerEnd="url(#loadArrowCyan)" />
          <text x="320" y="262" textAnchor="middle" className="muted">after gap closure: right guide reaction shares load with left anchor</text>
        </> : <text x="320" y="262" textAnchor="middle" className="muted">gap open: right end travels laterally; left anchor carries event reaction</text>}
        <text x="320" y="286" textAnchor="middle" className="muted">GUIDED: left anchor fixed; right guide reaction is lateral/perpendicular after contact</text>
      </>}

      {restrained && <>
        <rect x={rightX - 66} y={pipeY + 28} width="132" height="26" rx="6" fill="rgba(255,158,58,.28)" stroke="rgba(255,158,58,.96)" />
        <rect x={rightX - 90} y={pipeY + 86} width="180" height="22" rx="5" fill="rgba(255,158,58,.20)" stroke="rgba(255,158,58,.70)" />
        <path d={`M${rightX - 54} ${pipeY + 96} L${rightX - 12} ${pipeY + 32} M${rightX + 54} ${pipeY + 96} L${rightX + 12} ${pipeY + 32}`} stroke={COLORS.orange} strokeWidth="5.2" strokeLinecap="round" />
        <circle cx={rightX - 12} cy={pipeY + 32} r="7" fill={COLORS.orange} />
        <circle cx={rightX + 12} cy={pipeY + 32} r="7" fill={COLORS.orange} />
        <path d={`M${rightX} ${pipeY + 126} V${pipeY + 32 - arrestedReaction * .38}`} stroke={COLORS.orange} strokeWidth="6.8" markerEnd="url(#loadArrowOrange)" />
        <text x="320" y="286" textAnchor="middle" className="muted">ARRESTED: right rigid stop takes dominant lateral reaction; left anchor still reacts</text>
      </>}

      {state.restraint === 'free' && <text x="320" y="286" textAnchor="middle" className="muted">UNRESTRAINED: right side has no lateral stop; left anchor reaction and displacement are largest</text>}
      <text x="320" y="308" textAnchor="middle" className="caseLabel" fill={COLORS.yellow}>left anchored lateral event {pct(level)} · {eventRestraintLabel(state.restraint)}</text>
    </>}

    {state.activeLoad === 'settlement' && <>
      <path d={`M${rightX + 2} 236 V${rightSupportY + 24}`} stroke={COLORS.purple} strokeWidth={3 + level * 0.03} markerEnd="url(#loadArrowPurple)" />
      <path d={`M386 225 C440 ${230 + settlementDrop * .2}, 510 ${240 + settlementDrop * .55}, 572 ${244 + settlementDrop}`} stroke="rgba(184,132,255,.42)" strokeWidth="3" fill="none" strokeDasharray="7 7" />
      <text x="390" y="112" fill={COLORS.purple} fontSize="12" fontWeight="900">support settlement {pct(level)}</text>
      <text x="320" y="300" textAnchor="middle" className="caseLabel" fill={COLORS.purple}>pipe bends because one support moved down</text>
    </>}

    <g transform="translate(68 322)">
      <circle cx="0" cy="0" r="6" fill={meta.color}/>
      <text x="14" y="4" className="muted">{meta.behavior}; {meta.category}; {applicabilityText(state.activeLoad)}; {contextControlText(state)}</text>
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
  const displacementLoads: LoadCategory[] = ['thermal', 'settlement'];

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
      <div><span>Applicability</span><b>{applicabilityText(state.activeLoad).replace('Applicability: ', '')}</b></div>
      <div><span>Route</span><b>{meta.route}</b></div>
      <div><span>Main concern</span><b>{meta.concern}</b></div>
      <div><span>Next tab</span><b>{meta.next}</b></div>
      <div><span>{isThermal ? 'ΔT scale' : 'Intensity'}</span><b>{isThermal ? tempLabel(state.thermalDelta) : pct(state.intensity)}</b></div>
      {(state.activeLoad === 'thermal' || state.activeLoad === 'event') && <div><span>Context control</span><b>{contextControlText(state)}</b></div>}
    </div>
    {state.activeLoad === 'event' && <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.42)' }}><b>Event restraint meaning</b><span className="copy">Left side is always the fixed anchor. Unrestrained = right side has no lateral stop, so left anchor reaction and motion are largest. Guided = right lateral guide gap/contact shares load only after contact. Arrested = right rigid stop/strut blocks lateral event-direction motion and takes dominant reaction; a snubber is only a locked impulse analogue, not a hard stop.</span></div>}
    {state.activeLoad === 'thermal' && <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.38)' }}><b>Thermal restraint meaning</b><span className="copy">Left side is always the fixed datum. Unrestrained = right end grows freely. Guided = lateral guidance while axial thermal sliding remains visible. Arrested = left and right anchors block axial growth and create large anchor reactions.</span></div>}
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
    {state.activeLoad === 'event' && <div className="card correct"><strong>Terminology fix</strong><span>Guide ≠ line stop, snubber ≠ hard stop, anchor ≠ event-only restraint. The SVG now uses a constant left anchor and changes only the right-side lateral event restraint: unrestrained, guided gap/contact, or arrested rigid stop.</span></div>}
    {state.activeLoad === 'thermal' && <div className="card correct"><strong>Thermal fix</strong><span>A side guide should not look like an anchor. The left side is a fixed datum; guided thermal motion slides axially; arrested/anchored thermal growth becomes reaction between anchors.</span></div>}
    <div className="table">
      <div><span>Applicability</span><b>{applicabilityText(state.activeLoad).replace('Applicability: ', '')}</b></div>
      {(state.activeLoad === 'thermal' || state.activeLoad === 'event') && <div><span>Responsive context</span><b>{contextControlText(state)}</b></div>}
      <div><span>Classification</span><b>{meta.category}</b></div>
    </div>
    <p className="fb">Correct sequence: source → force/displacement behavior → stress route → detailed equation.</p>
  </div>;
}

// Backward-compatible export name for older imports.
export function LoadsCodeTable({ state }: { state: LoadsState }) {
  return <LoadsClassificationMap state={state} />;
}
