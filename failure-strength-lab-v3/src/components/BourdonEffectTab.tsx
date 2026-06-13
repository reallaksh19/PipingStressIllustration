import { BourdonState, COLORS } from '../model/types';
import { SvgDefs } from './SvgDefs';

function clamp(n: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function conditionLabel(condition: BourdonState['endCondition']) {
  if (condition === 'free') return 'free end: movement is visible';
  if (condition === 'guided') return 'guided end: guide reaction appears';
  return 'restrained end: nozzle/anchor reaction rises';
}

function bendLabel(angle: BourdonState['bendAngle']) {
  if (angle === '45') return '45° bend';
  if (angle === '90') return '90° elbow';
  return '180° return bend';
}

function bendGeometryFactor(angle: BourdonState['bendAngle']) {
  if (angle === '45') return 0.76;
  if (angle === '90') return 1.0;
  return 1.18;
}

function pressureFlexibilityCue(state: BourdonState) {
  // Teaching cue only: pressure activates the bend-opening response; bend angle scales visibility.
  const pressure = clamp(state.pressure / 100);
  return clamp(pressure * bendGeometryFactor(state.bendAngle), 0, 1);
}

function pointText(p: { x: number; y: number }) {
  return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}

function buildBendGeometry(state: BourdonState) {
  const pressure = clamp(state.pressure / 100);
  const pressureDrivenFlex = pressureFlexibilityCue(state);
  const response = clamp(pressure * (0.42 + pressureDrivenFlex * 0.58), 0, 1);
  const open = response * 46;
  const pressureBulge = response * 9;

  if (state.bendAngle === '45') {
    const oldEnd = { x: 484, y: 150 };
    const curEnd = { x: oldEnd.x + open * 0.55, y: oldEnd.y + open * 0.12 };
    return {
      response,
      pressureDrivenFlex,
      oldEnd,
      curEnd,
      installed: 'M96 242 H270 C334 242 376 205 434 170 L484 150',
      current: `M96 242 H280 C350 ${242 - pressureBulge} ${392 + open * 0.25} ${205 - pressureBulge * 0.7} ${448 + open * 0.35} ${174 + open * 0.08} L${curEnd.x} ${curEnd.y}`,
      pressureGuide: `M130 202 C242 178 354 ${160 - open * 0.15} ${curEnd.x - 28} ${curEnd.y - 20}`,
      labelPos: { x: 326, y: 292 },
    };
  }

  if (state.bendAngle === '180') {
    const oldEnd = { x: 112, y: 118 };
    const curEnd = { x: oldEnd.x - open * 0.38, y: oldEnd.y + open * 0.14 };
    return {
      response,
      pressureDrivenFlex,
      oldEnd,
      curEnd,
      installed: 'M96 252 H278 C402 252 402 116 278 116 H112',
      current: `M96 252 H286 C${420 + open * 0.42} ${252 + pressureBulge} ${420 + open * 0.42} ${116 - pressureBulge} ${286} 116 H${curEnd.x}`,
      pressureGuide: `M138 205 C232 171 332 171 444 205`,
      labelPos: { x: 323, y: 294 },
    };
  }

  const oldEnd = { x: 372, y: 98 };
  const curEnd = { x: oldEnd.x + open * 0.72, y: oldEnd.y + open * 0.42 };
  return {
    response,
    pressureDrivenFlex,
    oldEnd,
    curEnd,
    installed: 'M96 248 H282 C360 248 372 188 372 98',
    current: `M96 248 H292 C${374 + open * 0.45} ${248 - pressureBulge} ${400 + open * 0.58} ${188 + open * 0.10} ${curEnd.x} ${curEnd.y}`,
    pressureGuide: `M130 204 C250 170 350 ${145 - open * 0.18} ${curEnd.x - 16} ${curEnd.y - 18}`,
    labelPos: { x: 326, y: 294 },
  };
}

export function BourdonEffectSvg({ state }: { state: BourdonState }) {
  const pressure = clamp(state.pressure / 100);
  const geometry = buildBendGeometry(state);
  const move = Math.hypot(geometry.curEnd.x - geometry.oldEnd.x, geometry.curEnd.y - geometry.oldEnd.y);
  const movementPct = Math.min(100, move * 1.9);
  const reactionPct = state.endCondition === 'free' ? 0 : state.endCondition === 'guided' ? movementPct * 0.45 : movementPct * 0.92;
  const reactionColor = reactionPct > 72 ? COLORS.red : reactionPct > 44 ? COLORS.orange : COLORS.yellow;
  const pressureColor = state.pressure > 72 ? COLORS.red : state.pressure > 44 ? COLORS.orange : COLORS.blue;
  const pipeWidth = 34;
  const boreWidth = 11;
  const pressureWidth = 2.5 + pressure * 5;

  return <svg viewBox="0 0 640 370" role="img" aria-label="Bourdon effect in a pressurized pipe bend">
    <SvgDefs />
    <rect x="14" y="18" width="612" height="330" rx="30" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M52 116H588 M52 210H588 M52 304H588 M160 48V334 M320 48V334 M480 48V334" stroke="rgba(216,237,255,.055)" />

    <text x="320" y="42" textAnchor="middle" className="label" fill={COLORS.cyan}>Bourdon effect — pressure tends to straighten a bend</text>
    <text x="320" y="64" textAnchor="middle" className="muted">Pressure drives the opening response; geometry and end condition decide visible movement/reaction</text>

    <g aria-label="installed zero pressure reference bend">
      <path d={geometry.installed} stroke="rgba(216,237,255,.32)" strokeWidth={pipeWidth + 2} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="18 13" />
      <path d={geometry.installed} stroke="rgba(6,16,29,.70)" strokeWidth={boreWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="18 13" />
      <text x="110" y="318" className="muted">dashed ghost = installed / zero-pressure bend shape</text>
    </g>

    <g aria-label="current pressurized pipe bend">
      <path d={geometry.current} stroke="#020813" strokeWidth={pipeWidth + 20} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".92" />
      <path d={geometry.current} stroke="url(#pipeStroke)" strokeWidth={pipeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={geometry.current} stroke="rgba(255,255,255,.32)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".75" />
      <path d={geometry.current} stroke="#06101d" strokeWidth={boreWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".82" />
      <circle cx={geometry.curEnd.x} cy={geometry.curEnd.y} r="9" fill={COLORS.cyan} stroke="#06101d" strokeWidth="3" />
    </g>

    <path d={`M${pointText(geometry.oldEnd)} L${pointText(geometry.curEnd)}`} stroke={COLORS.cyan} strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow)" strokeDasharray="7 7" />
    <text x={Math.min(548, geometry.curEnd.x + 14)} y={Math.max(86, geometry.curEnd.y - 12)} fill={COLORS.cyan} fontSize="12" fontWeight="900">end movement {pct(movementPct)}</text>

    <path d={geometry.pressureGuide} stroke={pressureColor} strokeWidth={pressureWidth} fill="none" strokeDasharray="9 8" strokeLinecap="round" />
    <text x="320" y="92" textAnchor="middle" fill={pressureColor} fontSize="12" fontWeight="900">internal pressure {pct(state.pressure)} → pressure-driven bend opening {pct(geometry.pressureDrivenFlex * 100)}</text>

    {state.endCondition !== 'free' && <g aria-label="restraint reaction at pipe end">
      <rect x={Math.min(575, geometry.curEnd.x + 18)} y={Math.max(80, geometry.curEnd.y - 42)} width="22" height="84" rx="7" fill="rgba(216,231,242,.22)" stroke="rgba(216,231,242,.72)" strokeWidth="2.4" />
      <path d={`M${Math.min(565, geometry.curEnd.x + 12)} ${geometry.curEnd.y} L${geometry.curEnd.x + 2} ${geometry.curEnd.y}`} stroke={reactionColor} strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowOrange)" />
      <text x="498" y="292" fill={reactionColor} fontSize="12" fontWeight="900">reaction / nozzle load {pct(reactionPct)}</text>
    </g>}

    <g transform="translate(466 108)">
      <rect x="0" y="0" width="138" height="116" rx="18" fill="rgba(6,16,29,.62)" stroke="rgba(190,220,255,.20)" />
      <text x="14" y="24" fill={COLORS.yellow} fontSize="12" fontWeight="900">Active case</text>
      <text x="14" y="48" className="muted">{bendLabel(state.bendAngle)}</text>
      <text x="14" y="68" className="muted">pressure {pct(state.pressure)}</text>
      <text x="14" y="88" className="muted">derived opening {pct(geometry.pressureDrivenFlex * 100)}</text>
      <text x="14" y="108" className="muted">{state.endCondition === 'free' ? 'free end' : state.endCondition === 'guided' ? 'guided end' : 'restrained end'}</text>
    </g>

    <g transform={`translate(${geometry.labelPos.x - 86} ${geometry.labelPos.y - 18})`}>
      <rect x="0" y="0" width="172" height="28" rx="14" fill="rgba(82,240,223,.10)" stroke="rgba(82,240,223,.28)" />
      <text x="86" y="19" textAnchor="middle" fill={COLORS.cyan} fontSize="11" fontWeight="900">smooth pipe · opening from pressure</text>
    </g>
  </svg>;
}

export function BourdonMechanismPanel({ state }: { state: BourdonState }) {
  const pressure = clamp(state.pressure / 100);
  const derivedOpening = pressureFlexibilityCue(state);
  const straightening = Math.round(pressure * (42 + derivedOpening * 58));
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.cyan }}>mechanism</span>
    <h3 className="result-title">Why a bend opens under pressure</h3>
    <p className="copy">A Bourdon tube pressure gauge uses a curved flattened tube that tends to straighten or uncoil when pressurized. For piping, do not treat elbow flexibility as a user load slider: the visible opening response should be driven by pressure, while bend angle only scales how visible the movement is.</p>
    <div className="table">
      <div><span>Pressure input</span><b>{pct(state.pressure)}</b></div>
      <div><span>Bend geometry</span><b>{bendLabel(state.bendAngle)}</b></div>
      <div><span>Derived opening response</span><b>{pct(derivedOpening * 100)} · driven by pressure and bend curvature</b></div>
      <div><span>Straightening cue</span><b>{straightening}% qualitative bend-opening tendency</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
      <b>Important distinction</b><span className="copy">Pressure creates hoop/axial stress in the pipe wall. In a curved component it can also create a small displacement-like bend-opening cue that matters if the end is guided, stopped, anchored, or connected to equipment.</span>
    </div>
  </div>;
}

export function BourdonPipingRelevance({ state }: { state: BourdonState }) {
  const connected = state.endCondition !== 'free';
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.orange }}>piping relevance</span>
    <h3 className="result-title">Where pipe stress engineers care</h3>
    <div className="card correct"><strong>1 · Elbows and loops</strong><span className="copy">A pressurized elbow or return bend can try to open. The movement is normally small, but it can accumulate in flexible loops or high-pressure service.</span></div>
    <div className="card correct"><strong>2 · Nozzle loads</strong><span className="copy">If the bend is connected to equipment, straightening displacement can become reaction load at a nozzle, anchor, guide, or stop.</span></div>
    <div className="card correct"><strong>3 · Model discipline</strong><span className="copy">Separate pressure stress, bend-opening displacement tendency, thermal expansion, and external force loads. Do not use a free flexibility slider as a load.</span></div>
    <p className="fb">Current condition: {connected ? 'movement is restrained/connected, so reaction load is highlighted.' : 'free end moves, so displacement is visible but reaction is low.'}</p>
  </div>;
}

export function BourdonReadout({ state }: { state: BourdonState }) {
  const pressure = clamp(state.pressure / 100);
  const derivedOpening = pressureFlexibilityCue(state);
  const movement = Math.min(100, pressure * (55 + derivedOpening * 45));
  const reaction = state.endCondition === 'free' ? 0 : state.endCondition === 'guided' ? movement * 0.45 : movement * 0.92;
  const color = reaction > 72 ? COLORS.red : reaction > 44 ? COLORS.orange : COLORS.green;
  return <div className="interp stress-readout">
    <span className="badge" style={{ color }}>readout</span>
    <h3 className="result-title">Bourdon effect check route</h3>
    <p className="copy">The only load slider here is pressure. The opening/flexibility cue is derived from pressure and bend angle, then end condition decides whether the result is seen as movement or reaction.</p>
    <div className="table">
      <div><span>Pressure</span><b>{pct(state.pressure)} · drives pressure stress and bend opening</b></div>
      <div><span>Derived opening</span><b>{pct(derivedOpening * 100)} · not a separate user input</b></div>
      <div><span>Movement</span><b>{pct(movement)} · qualitative end displacement</b></div>
      <div><span>End condition</span><b>{conditionLabel(state.endCondition)}</b></div>
      <div><span>Reaction risk</span><b style={{ color }}>{pct(reaction)} · {reaction > 70 ? 'review nozzle/support loads' : reaction > 35 ? 'check guide/anchor reactions' : 'mainly movement cue'}</b></div>
      <div><span>Next link</span><b>Combined stress for pressure stress; expansion/flexibility model for displacement</b></div>
    </div>
  </div>;
}
