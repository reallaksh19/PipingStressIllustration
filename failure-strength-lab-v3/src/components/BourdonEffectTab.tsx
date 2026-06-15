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

function reactionFactor(condition: BourdonState['endCondition']) {
  if (condition === 'free') return 0;
  if (condition === 'guided') return 0.45;
  return 0.92;
}

function bourdonMovementCue(state: BourdonState) {
  const pressure = clamp(state.pressure / 100);
  const derivedOpening = pressureFlexibilityCue(state);
  return Math.min(100, pressure * (55 + derivedOpening * 45));
}

function bourdonReactionCue(state: BourdonState) {
  return bourdonMovementCue(state) * reactionFactor(state.endCondition);
}

function bourdonSeverity(state: BourdonState) {
  const reaction = bourdonReactionCue(state);
  if (reaction > 72) {
    return {
      color: COLORS.red,
      badge: 'reaction review',
      summary: 'Restrained pressure-straightening cue: review anchor, guide, stop, and nozzle reactions.'
    };
  }
  if (reaction > 44) {
    return {
      color: COLORS.orange,
      badge: 'restraint-sensitive',
      summary: 'Movement is being converted into support or equipment reaction; report with the operating case.'
    };
  }
  if (state.endCondition === 'free') {
    return {
      color: COLORS.green,
      badge: 'movement cue',
      summary: 'Free end mainly shows displacement; pressure containment and combined stress remain separate checks.'
    };
  }
  return {
    color: COLORS.yellow,
    badge: 'low reaction cue',
    summary: 'Pressure-driven opening exists, but current restraint cue is modest in this teaching scale.'
  };
}

function bourdonRouteRows(state: BourdonState) {
  const connected = state.endCondition !== 'free';
  return [
    {
      label: 'Driver',
      value: 'Internal pressure creates hoop/longitudinal stress and a bend-opening tendency in curved pipe.'
    },
    {
      label: 'Not a load slider',
      value: 'Opening is derived from pressure + bend curvature; do not add it again as an external force.'
    },
    {
      label: 'If free',
      value: 'Report as movement cue plus pressure stress route; reaction is near zero in this concept model.'
    },
    {
      label: connected ? 'If restrained' : 'If connected',
      value: connected
        ? 'Guides, stops, anchors, and equipment nozzles can convert the cue into reaction load.'
        : 'If later guided/anchored, the same movement tendency becomes a reaction/nozzle-load problem.'
    },
    {
      label: 'B31.3 map',
      value: 'Pressure containment → 304; stress categories/load cases → 302.3.5/302.3.6/319 as applicable; supports → 321.'
    },
    {
      label: 'Reporting boundary',
      value: 'Use relevant code edition and Client criteria before evaluating/reporting pressure-straightening movements or reactions.'
    }
  ];
}

function pointText(p: { x: number; y: number }) {
  return `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}

function buildBendGeometry(state: BourdonState) {
  const pressure = clamp(state.pressure / 100);
  const pressureDrivenFlex = pressureFlexibilityCue(state);
  const response = clamp(pressure * (0.42 + pressureDrivenFlex * 0.58), 0, 1);
  const open = response * 44;
  const pressureBulge = response * 8;

  if (state.bendAngle === '45') {
    const oldEnd = { x: 500, y: 150 };
    const curEnd = { x: oldEnd.x + open * 0.58, y: oldEnd.y + open * 0.10 };
    return {
      response,
      pressureDrivenFlex,
      oldEnd,
      curEnd,
      installed: 'M88 242 H282 C350 242 392 204 452 169 L500 150',
      current: `M88 242 H292 C368 ${242 - pressureBulge} ${410 + open * 0.22} ${205 - pressureBulge * 0.7} ${466 + open * 0.35} ${173 + open * 0.08} L${curEnd.x} ${curEnd.y}`,
      pressureGuide: `M132 196 C248 165 360 ${148 - open * 0.12} ${curEnd.x - 28} ${curEnd.y - 20}`,
      labelPos: { x: 308, y: 284 },
    };
  }

  if (state.bendAngle === '180') {
    const oldEnd = { x: 120, y: 108 };
    const curEnd = { x: oldEnd.x - open * 0.36, y: oldEnd.y + open * 0.12 };
    return {
      response,
      pressureDrivenFlex,
      oldEnd,
      curEnd,
      installed: 'M88 252 H286 C424 252 424 108 286 108 H120',
      current: `M88 252 H296 C${442 + open * 0.35} ${252 + pressureBulge} ${442 + open * 0.35} ${108 - pressureBulge} ${296} 108 H${curEnd.x}`,
      pressureGuide: `M132 205 C236 165 350 165 464 205`,
      labelPos: { x: 308, y: 286 },
    };
  }

  const oldEnd = { x: 388, y: 88 };
  const curEnd = { x: oldEnd.x + open * 0.70, y: oldEnd.y + open * 0.38 };
  return {
    response,
    pressureDrivenFlex,
    oldEnd,
    curEnd,
    installed: 'M88 248 H292 C378 248 388 178 388 88',
    current: `M88 248 H304 C${394 + open * 0.42} ${248 - pressureBulge} ${418 + open * 0.50} ${178 + open * 0.08} ${curEnd.x} ${curEnd.y}`,
    pressureGuide: `M132 198 C260 160 370 ${136 - open * 0.15} ${curEnd.x - 18} ${curEnd.y - 18}`,
    labelPos: { x: 304, y: 286 },
  };
}

export function BourdonEffectSvg({ state }: { state: BourdonState }) {
  const pressure = clamp(state.pressure / 100);
  const geometry = buildBendGeometry(state);
  const move = Math.hypot(geometry.curEnd.x - geometry.oldEnd.x, geometry.curEnd.y - geometry.oldEnd.y);
  const movementPct = Math.min(100, move * 1.9);
  const reactionPct = movementPct * reactionFactor(state.endCondition);
  const reactionColor = reactionPct > 72 ? COLORS.red : reactionPct > 44 ? COLORS.orange : COLORS.yellow;
  const pressureColor = state.pressure > 72 ? COLORS.red : state.pressure > 44 ? COLORS.orange : COLORS.blue;
  const pipeWidth = 40;
  const boreWidth = 13;
  const pressureWidth = 2.4 + pressure * 4.2;
  const endTag = state.endCondition === 'free' ? 'movement only' : state.endCondition === 'guided' ? 'guide reaction' : 'anchor/nozzle reaction';

  return <svg viewBox="0 0 640 330" role="img" aria-label="Bourdon effect in a pressurized pipe bend">
    <SvgDefs />
    <rect x="14" y="16" width="612" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M52 104H588 M52 188H588 M52 272H588 M160 48V296 M320 48V296 M480 48V296" stroke="rgba(216,237,255,.055)" />

    <text x="320" y="39" textAnchor="middle" className="label" fill={COLORS.cyan}>Bourdon effect — pressure opens / straightens a bend</text>
    <text x="320" y="60" textAnchor="middle" className="muted">Pressure is the driver. Bend angle scales movement; end condition converts movement to reaction.</text>

    <g aria-label="installed zero pressure reference bend">
      <path d={geometry.installed} stroke="rgba(216,237,255,.28)" strokeWidth={pipeWidth + 3} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="22 16" />
      <path d={geometry.installed} stroke="rgba(6,16,29,.68)" strokeWidth={boreWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="22 16" />
      <text x="115" y="296" className="muted">dashed = installed / zero-pressure bend</text>
    </g>

    <g aria-label="current pressurized pipe bend">
      <path d={geometry.current} stroke="#020813" strokeWidth={pipeWidth + 20} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".94" />
      <path d={geometry.current} stroke="url(#pipeStroke)" strokeWidth={pipeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={geometry.current} stroke="rgba(255,255,255,.34)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".78" />
      <path d={geometry.current} stroke="#06101d" strokeWidth={boreWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity=".84" />
      <circle cx={geometry.curEnd.x} cy={geometry.curEnd.y} r="9" fill={COLORS.cyan} stroke="#06101d" strokeWidth="3" />
    </g>

    <path d={geometry.pressureGuide} stroke={pressureColor} strokeWidth={pressureWidth} fill="none" strokeDasharray="9 8" strokeLinecap="round" />
    <path d={`M${pointText(geometry.oldEnd)} L${pointText(geometry.curEnd)}`} stroke={COLORS.cyan} strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow)" strokeDasharray="7 7" />

    {state.endCondition !== 'free' && <g aria-label="restraint reaction at pipe end">
      <rect x={Math.min(560, geometry.curEnd.x + 16)} y={Math.max(74, geometry.curEnd.y - 38)} width="20" height="76" rx="7" fill="rgba(216,231,242,.22)" stroke="rgba(216,231,242,.72)" strokeWidth="2.2" />
      <path d={`M${Math.min(550, geometry.curEnd.x + 10)} ${geometry.curEnd.y} L${geometry.curEnd.x + 2} ${geometry.curEnd.y}`} stroke={reactionColor} strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowOrange)" />
    </g>}

    <g transform="translate(444 82)">
      <rect x="0" y="0" width="164" height="134" rx="18" fill="rgba(6,16,29,.70)" stroke="rgba(190,220,255,.22)" />
      <text x="14" y="23" fill={COLORS.yellow} fontSize="12" fontWeight="900">Active case</text>
      <text x="14" y="47" className="muted">{bendLabel(state.bendAngle)}</text>
      <text x="14" y="67" className="muted">pressure {pct(state.pressure)}</text>
      <text x="14" y="87" className="muted">opening {pct(geometry.pressureDrivenFlex * 100)}</text>
      <text x="14" y="107" className="muted">movement {pct(movementPct)}</text>
      <text x="14" y="126" fill={reactionColor} fontSize="11" fontWeight="900">{endTag}: {pct(reactionPct)}</text>
    </g>

    <g transform={`translate(${geometry.labelPos.x - 100} ${geometry.labelPos.y - 18})`}>
      <rect x="0" y="0" width="200" height="28" rx="14" fill="rgba(82,240,223,.10)" stroke="rgba(82,240,223,.28)" />
      <text x="100" y="19" textAnchor="middle" fill={COLORS.cyan} fontSize="11" fontWeight="900">smooth pipe · pressure-derived cue</text>
    </g>
  </svg>;
}

export function BourdonMechanismPanel({ state }: { state: BourdonState }) {
  const pressure = clamp(state.pressure / 100);
  const derivedOpening = pressureFlexibilityCue(state);
  const straightening = Math.round(pressure * (42 + derivedOpening * 58));
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.cyan }}>mechanism</span>
    <h3 className="result-title">Pressure-derived bend opening</h3>
    <p className="copy">A Bourdon pressure gauge uses a curved tube that tends to straighten when pressurized. In piping, use the same idea only as a pressure-derived bend-opening cue: pressure is the load source, bend curvature controls visibility, and restraint decides whether movement becomes reaction.</p>
    <div className="table">
      <div><span>Pressure input</span><b>{pct(state.pressure)} · single driver</b></div>
      <div><span>Bend geometry</span><b>{bendLabel(state.bendAngle)} · curvature scale factor {bendGeometryFactor(state.bendAngle).toFixed(2)}</b></div>
      <div><span>Derived opening</span><b>{pct(derivedOpening * 100)} · pressure × bend curvature</b></div>
      <div><span>Straightening cue</span><b>{straightening}% qualitative bend-opening tendency</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
      <b>Engineering boundary</b><span className="copy">Do not report this as a separate force. Report pressure stress, operating movement, support/nozzle reactions, and combined stress using the relevant model, code edition, software setting, and Client criteria.</span>
    </div>
  </div>;
}

export function BourdonPipingRelevance({ state }: { state: BourdonState }) {
  const connected = state.endCondition !== 'free';
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.orange }}>piping relevance</span>
    <h3 className="result-title">Where pipe stress engineers care</h3>
    <div className="card correct"><strong>1 · High-pressure bends and loops</strong><span className="copy">A pressurized elbow, loop, or return bend can try to open. The movement is usually small, but it matters more in high-pressure service, large flexible loops, and long connected systems.</span></div>
    <div className="card correct"><strong>2 · Nozzle/support reactions</strong><span className="copy">If the bend is guided, stopped, anchored, or connected to equipment, the pressure-straightening cue can appear as guide load, anchor load, or equipment nozzle load.</span></div>
    <div className="card correct"><strong>3 · Model discipline</strong><span className="copy">Separate pressure containment, pressure axial effects, bend-opening movement, thermal expansion, and external forces. Do not double-count Bourdon movement as a manual external load.</span></div>
    <p className="fb">Current condition: {connected ? 'movement is restrained/connected, so reaction load is highlighted.' : 'free end moves, so displacement is visible but reaction is low.'}</p>
  </div>;
}

export function BourdonReadout({ state }: { state: BourdonState }) {
  const derivedOpening = pressureFlexibilityCue(state);
  const movement = bourdonMovementCue(state);
  const reaction = bourdonReactionCue(state);
  const status = bourdonSeverity(state);
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: status.color }}>{status.badge}</span>
    <h3 className="result-title">Bourdon effect route boundary</h3>
    <p className="copy">{status.summary}</p>
    <div className="table">
      <div><span>Pressure</span><b>{pct(state.pressure)} · drives pressure stress and bend opening</b></div>
      <div><span>Derived opening</span><b>{pct(derivedOpening * 100)} · not a separate user input</b></div>
      <div><span>Movement</span><b>{pct(movement)} · qualitative end displacement cue</b></div>
      <div><span>End condition</span><b>{conditionLabel(state.endCondition)}</b></div>
      <div><span>Reaction risk</span><b style={{ color: status.color }}>{pct(reaction)} · {reaction > 70 ? 'review nozzle/support loads' : reaction > 35 ? 'check guide/anchor reactions' : 'mainly movement cue'}</b></div>
      <div><span>Route link</span><b>Pressure stress → Combined tab; movement/reaction → flexibility/support/nozzle route.</b></div>
    </div>
    <div className="table route-table">
      {bourdonRouteRows(state).map(row => <div key={row.label}><span>{row.label}</span><b>{row.value}</b></div>)}
    </div>
  </div>;
}
