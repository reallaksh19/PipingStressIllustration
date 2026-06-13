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

export function BourdonEffectSvg({ state }: { state: BourdonState }) {
  const pressure = clamp(state.pressure / 100);
  const flexibility = clamp(state.flexibility / 100);
  const baseSweep = Number(state.bendAngle);
  const response = pressure * (0.42 + flexibility * 0.58);
  const openingDeg = Math.min(baseSweep * 0.38, response * baseSweep * 0.42);
  const currentSweep = Math.max(baseSweep - openingDeg, baseSweep * 0.58);
  const baseR = state.bendAngle === '180' ? 72 : state.bendAngle === '90' ? 86 : 102;
  const r0 = baseR;
  const r1 = baseR + 18 * response;
  const cx = 230;
  const cy = state.bendAngle === '180' ? 185 : 205;
  const startAngle = 180;
  const sweepToPoint = (radius: number, sweep: number) => {
    const a0 = startAngle * Math.PI / 180;
    const a1 = (startAngle - sweep) * Math.PI / 180;
    return {
      x0: cx + radius * Math.cos(a0),
      y0: cy - radius * Math.sin(a0),
      x1: cx + radius * Math.cos(a1),
      y1: cy - radius * Math.sin(a1),
      large: sweep > 180 ? 1 : 0,
      tangentX: Math.cos(a1 + Math.PI / 2),
      tangentY: -Math.sin(a1 + Math.PI / 2),
    };
  };
  const old = sweepToPoint(r0, baseSweep);
  const cur = sweepToPoint(r1, currentSweep);
  const move = Math.hypot(cur.x1 - old.x1, cur.y1 - old.y1);
  const movementPct = Math.min(100, move * 1.35);
  const reactionPct = state.endCondition === 'free' ? 0 : state.endCondition === 'guided' ? movementPct * 0.45 : movementPct * 0.92;
  const reactionColor = reactionPct > 72 ? COLORS.red : reactionPct > 44 ? COLORS.orange : COLORS.yellow;
  const pressureColor = state.pressure > 72 ? COLORS.red : state.pressure > 44 ? COLORS.orange : COLORS.blue;
  const tangentLen = 56;
  const endX = cur.x1 + cur.tangentX * tangentLen;
  const endY = cur.y1 + cur.tangentY * tangentLen;

  return <svg viewBox="0 0 640 370" role="img" aria-label="Bourdon effect in a pressurized pipe bend">
    <SvgDefs />
    <rect x="14" y="18" width="612" height="330" rx="30" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M52 116H588 M52 210H588 M52 304H588 M160 48V334 M320 48V334 M480 48V334" stroke="rgba(216,237,255,.06)" />

    <text x="320" y="42" textAnchor="middle" className="label" fill={COLORS.cyan}>Bourdon effect — pressure tends to straighten a bend</text>
    <text x="320" y="64" textAnchor="middle" className="muted">Qualitative piping visual: pressure + curvature can create bend opening and end displacement</text>

    <path d={`M${old.x0 - 64} ${old.y0} H${old.x0}`} stroke="rgba(216,237,255,.25)" strokeWidth="26" strokeLinecap="round" strokeDasharray="8 10" />
    <path d={`M${old.x0} ${old.y0} A${r0} ${r0} 0 ${old.large} 1 ${old.x1} ${old.y1}`} stroke="rgba(216,237,255,.25)" strokeWidth="26" strokeLinecap="round" fill="none" strokeDasharray="8 10" />
    <text x="140" y="307" className="muted">dashed: installed / zero-pressure bend</text>

    <path d={`M${cur.x0 - 64} ${cur.y0} H${cur.x0}`} stroke="#020813" strokeWidth="42" strokeLinecap="round" opacity=".9" />
    <path d={`M${cur.x0 - 64} ${cur.y0} H${cur.x0}`} stroke="url(#pipeStroke)" strokeWidth="30" strokeLinecap="round" />
    <path d={`M${cur.x0} ${cur.y0} A${r1} ${r1} 0 ${cur.large} 1 ${cur.x1} ${cur.y1}`} stroke="#020813" strokeWidth="42" strokeLinecap="round" fill="none" opacity=".9" />
    <path d={`M${cur.x0} ${cur.y0} A${r1} ${r1} 0 ${cur.large} 1 ${cur.x1} ${cur.y1}`} stroke="url(#pipeStroke)" strokeWidth="30" strokeLinecap="round" fill="none" />
    <path d={`M${cur.x1} ${cur.y1} L${endX} ${endY}`} stroke="#020813" strokeWidth="42" strokeLinecap="round" opacity=".9" />
    <path d={`M${cur.x1} ${cur.y1} L${endX} ${endY}`} stroke="url(#pipeStroke)" strokeWidth="30" strokeLinecap="round" />
    <path d={`M${cur.x0 - 64} ${cur.y0} H${cur.x0} M${cur.x0} ${cur.y0} A${r1} ${r1} 0 ${cur.large} 1 ${cur.x1} ${cur.y1} M${cur.x1} ${cur.y1} L${endX} ${endY}`} stroke="#06101d" strokeWidth="10" strokeLinecap="round" fill="none" opacity=".74" strokeDasharray="15 11" />

    <path d={`M${old.x1} ${old.y1} L${cur.x1} ${cur.y1}`} stroke={COLORS.cyan} strokeWidth="3" strokeLinecap="round" markerEnd="url(#arrow)" strokeDasharray="7 7" />
    <circle cx={cur.x1} cy={cur.y1} r="7" fill={COLORS.cyan} stroke="#06101d" strokeWidth="3" />
    <text x={Math.min(520, cur.x1 + 18)} y={Math.max(96, cur.y1 - 10)} fill={COLORS.cyan} fontSize="12" fontWeight="900">end movement {pct(movementPct)}</text>

    <path d={`M${cur.x0 - 46} ${cur.y0 - 40} C${cur.x0 + 50} ${cur.y0 - 72}, ${cur.x1 - 34} ${cur.y1 - 50}, ${cur.x1} ${cur.y1 - 20}`} stroke={pressureColor} strokeWidth={2 + pressure * 4} fill="none" strokeDasharray="8 7" />
    <text x="320" y="94" textAnchor="middle" fill={pressureColor} fontSize="12" fontWeight="900">internal pressure {pct(state.pressure)} creates hoop/axial stress and bend-opening tendency</text>

    {state.endCondition !== 'free' && <>
      <rect x={Math.min(560, endX + 8)} y={Math.max(94, endY - 34)} width="20" height="72" rx="7" fill="rgba(216,231,242,.22)" stroke="rgba(216,231,242,.72)" strokeWidth="2.4" />
      <path d={`M${Math.min(554, endX + 2)} ${endY} L${endX + 2} ${endY}`} stroke={reactionColor} strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowOrange)" />
      <text x="510" y="288" fill={reactionColor} fontSize="12" fontWeight="900">reaction/nozzle load {pct(reactionPct)}</text>
    </>}

    <g transform="translate(54 92)">
      <rect x="0" y="0" width="134" height="94" rx="18" fill="rgba(6,16,29,.60)" stroke="rgba(190,220,255,.18)" />
      <text x="14" y="24" fill={COLORS.yellow} fontSize="12" fontWeight="900">Active case</text>
      <text x="14" y="47" className="muted">{bendLabel(state.bendAngle)}</text>
      <text x="14" y="66" className="muted">flexibility {pct(state.flexibility)}</text>
      <text x="14" y="85" className="muted">{conditionLabel(state.endCondition)}</text>
    </g>
  </svg>;
}

export function BourdonMechanismPanel({ state }: { state: BourdonState }) {
  const straightening = Math.round(clamp(state.pressure / 100) * (40 + state.flexibility * 0.45));
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.cyan }}>mechanism</span>
    <h3 className="result-title">Why a bend opens under pressure</h3>
    <p className="copy">A Bourdon tube pressure gauge uses a curved flattened tube that tends to straighten or uncoil when pressurized. In piping, the same teaching idea is useful: internal pressure in a curved component can produce a small bend-opening displacement, especially in flexible bends or loops.</p>
    <div className="table">
      <div><span>Pressure input</span><b>{pct(state.pressure)}</b></div>
      <div><span>Bend geometry</span><b>{bendLabel(state.bendAngle)}</b></div>
      <div><span>Flexibility</span><b>{pct(state.flexibility)} · higher flexibility exaggerates opening</b></div>
      <div><span>Straightening cue</span><b>{straightening}% qualitative bend-opening tendency</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
      <b>Important distinction</b><span className="copy">This is not the same as thermal expansion. Pressure is a sustained load, but in a curved bend it can also create displacement-like movement that matters for support and nozzle-load review.</span>
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
    <div className="card correct"><strong>3 · Flexibility model</strong><span className="copy">A stress model should separate straight-pipe pressure elongation, bend-opening tendency, thermal expansion, and external force loads.</span></div>
    <p className="fb">Current condition: {connected ? 'movement is restrained/connected, so reaction load is highlighted.' : 'free end moves, so displacement is visible but reaction is low.'}</p>
  </div>;
}

export function BourdonReadout({ state }: { state: BourdonState }) {
  const pressure = clamp(state.pressure / 100);
  const flex = clamp(state.flexibility / 100);
  const movement = Math.min(100, pressure * (52 + flex * 48));
  const reaction = state.endCondition === 'free' ? 0 : state.endCondition === 'guided' ? movement * 0.45 : movement * 0.92;
  const color = reaction > 72 ? COLORS.red : reaction > 44 ? COLORS.orange : COLORS.green;
  return <div className="interp stress-readout">
    <span className="badge" style={{ color }}>readout</span>
    <h3 className="result-title">Bourdon effect check route</h3>
    <p className="copy">Use this tab as a screening concept before detailed stress analysis. It shows why pressure can do more than only hoop/axial stress in a curved pipe component.</p>
    <div className="table">
      <div><span>Pressure</span><b>{pct(state.pressure)} · drives pressure stress and bend opening</b></div>
      <div><span>Movement</span><b>{pct(movement)} · qualitative end displacement</b></div>
      <div><span>End condition</span><b>{conditionLabel(state.endCondition)}</b></div>
      <div><span>Reaction risk</span><b style={{ color }}>{pct(reaction)} · {reaction > 70 ? 'review nozzle/support loads' : reaction > 35 ? 'check guide/anchor reactions' : 'mainly movement cue'}</b></div>
      <div><span>Next link</span><b>Combined stress for pressure stress; expansion/flexibility model for displacement</b></div>
    </div>
  </div>;
}
