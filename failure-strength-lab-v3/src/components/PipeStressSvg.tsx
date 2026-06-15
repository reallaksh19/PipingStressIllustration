import { COLORS, LabState } from '../model/types';
import { SvgDefs } from './SvgDefs';

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function activePressure(state: LabState) {
  return state.pipeStressView === 'pressure' || state.pipeStressView === 'combined';
}
function activeBending(state: LabState) {
  return state.pipeStressView === 'bending' || state.pipeStressView === 'combined';
}
function activeTorsion(state: LabState) {
  return state.pipeStressView === 'torsion' || state.pipeStressView === 'combined';
}

type PipeStressSummary = {
  badge: string;
  color: string;
  title: string;
  copy: string;
  route: string;
};

function pipeStressSummary(state: LabState): PipeStressSummary {
  const pressureOn = activePressure(state);
  const bendingOn = activeBending(state);
  const torsionOn = activeTorsion(state);
  const highHoop = pressureOn && state.pipeHoop >= 72;
  const highBending = bendingOn && state.pipeBending >= 67;
  const highTorsion = torsionOn && state.pipeTorsion >= 67;

  if (highHoop) return {
    badge: 'pressure boundary cue',
    color: COLORS.yellow,
    title: 'Hoop-pressure cue is dominant',
    copy: 'High σθ points first to pressure-containment thinking: wall thickness, material allowable, temperature basis, corrosion allowance, and pressure design route.',
    route: 'Route pressure containment separately from sustained span stress, occasional loads, and displacement stress range.'
  };

  if (highBending) return {
    badge: 'bending / ovalisation cue',
    color: COLORS.orange,
    title: 'Longitudinal bending cue is dominant',
    copy: 'Bending creates σL tension on one side and compression on the opposite side. The source decides whether it is sustained, occasional, or displacement-range behavior.',
    route: 'Use M/Z and SIF/flexibility basis only after load source and component location are defined.'
  };

  if (highTorsion) return {
    badge: 'torsion detail cue',
    color: COLORS.purple,
    title: 'Torsional shear cue is dominant',
    copy: 'τt is twisting shear around the pipe axis. It can come from eccentric loads, skewed restraints, compact branches, or equipment connections.',
    route: 'Do not label torsion as hoop or longitudinal stress; combine and report per relevant code edition, Client criteria, and software basis.'
  };

  return {
    badge: 'component route map',
    color: COLORS.cyan,
    title: pressureOn && bendingOn && torsionOn ? 'Combined pipe components are active' : 'Pipe component definition view',
    copy: 'This tab separates hoop pressure stress, longitudinal membrane/bending stress, and torsional shear before any combined-stress or failure-theory judgment.',
    route: 'Identify component, source, category, and local detail before evaluating/reporting any stress component.'
  };
}

function pipeStressRouteRows(state: LabState) {
  const pressureOn = activePressure(state);
  const bendingOn = activeBending(state);
  const torsionOn = activeTorsion(state);
  const rows: Array<[string, string]> = [];

  if (pressureOn) {
    rows.push(['σθ hoop', `${pct(state.pipeHoop)} · pressure containment / wall-thickness route`]);
    rows.push(['σL membrane', `${pct(state.pipeAxial)} · closed-end pressure, axial force, or end-load route`]);
  }
  if (bendingOn) rows.push(['M/Z bending', `${pct(state.pipeBending)} · longitudinal tension/compression; category depends on source`]);
  if (torsionOn) rows.push(['τt torsion', `${pct(state.pipeTorsion)} · twisting shear; combine/report per project basis`]);
  rows.push(['View', state.pipeStressView]);
  return rows;
}

export function PipeStressSideSvg({ state }: { state: LabState }) {
  const pressureOn = activePressure(state);
  const bendingOn = activeBending(state);
  const torsionOn = activeTorsion(state);
  // Only apply component values when that component is active.
  const hoop = pressureOn ? state.pipeHoop : 0;
  const axial = pressureOn ? state.pipeAxial : 0;
  const bending = bendingOn ? state.pipeBending : 0;
  const torsion = torsionOn ? state.pipeTorsion : 0;

  const x1 = 68 - axial * 0.18;
  const x2 = 390 + axial * 0.18;
  const mid = (x1 + x2) / 2;
  const y = 156;
  // Cap sag so the bezier never folds back through the pipe body.
  const sag = Math.min(bending * 0.22, 22);
  const pipePath = bendingOn
    ? `M${x1} ${y} C${x1 + 80} ${y - sag}, ${x2 - 80} ${y + sag}, ${x2} ${y}`
    : `M${x1} ${y} H${x2}`;
  const refPath = 'M68 156 H390';
  const axialColor = axial >= 67 ? COLORS.orange : COLORS.blue;
  const bendColor = bending >= 67 ? COLORS.orange : COLORS.yellow;
  const torsionColor = torsion >= 67 ? COLORS.purple : COLORS.cyan;

  // Label y-positions spread out to avoid overlap in combined view.
  const hoopLabelY = 89;
  const axialLabelY = 269;
  const bendLabelY = bendingOn && pressureOn ? 285 : 269;
  const torsionLabelY = torsionOn && (pressureOn || bendingOn) ? (pressureOn && bendingOn ? 307 : 289) : 307;

  return <svg viewBox="0 0 460 340" role="img" aria-label="Pipe stress side view using pipe notation">
    <SvgDefs />
    <rect x="14" y="18" width="432" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M54 92H406 M54 220H406 M116 54V260 M230 54V260 M344 54V260" stroke="rgba(216,237,255,.07)" />
    <text x="230" y="42" textAnchor="middle" className="label" fill={COLORS.cyan}>Pipe stress components — side/elevation view</text>
    <text x="230" y="63" textAnchor="middle" className="muted">Pipe-local notation: σL axial/bending, σθ hoop, τt torsion</text>

    <path d={refPath} stroke="rgba(216,237,255,.24)" strokeWidth="44" strokeLinecap="round" strokeDasharray="9 11" />
    <path d={pipePath} stroke="#020813" strokeWidth="50" strokeLinecap="round" fill="none" opacity=".88" />
    <path d={pipePath} stroke="url(#pipeStroke)" strokeWidth="34" strokeLinecap="round" fill="none" />
    <path d={pipePath} stroke="#06101d" strokeWidth="13" strokeLinecap="round" fill="none" opacity=".76" strokeDasharray="18 12" />

    {pressureOn && <>
      <path d={`M${x1 + 12} 106 C${x1 + 78} ${86 - hoop * .06}, ${x2 - 78} ${86 - hoop * .06}, ${x2 - 12} 106`} stroke="rgba(85,184,255,.58)" strokeWidth="3" fill="none" strokeDasharray="8 7" />
      <path d={`M${x1 + 12} 206 C${x1 + 78} ${226 + hoop * .04}, ${x2 - 78} ${226 + hoop * .04}, ${x2 - 12} 206`} stroke="rgba(85,184,255,.36)" strokeWidth="3" fill="none" strokeDasharray="8 7" />
      <path d={`M${x1 + 12} 246 H${x2 - 12}`} stroke={axialColor} strokeWidth="2.8" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
      <text x={mid} y={axialLabelY} textAnchor="middle" fill={axialColor} fontSize="12" fontWeight="900">σL membrane {pct(axial)} — length / end-load cue</text>
      <text x={mid} y={hoopLabelY} textAnchor="middle" fill={COLORS.blue} fontSize="12" fontWeight="900">pressure creates hoop σθ in pipe wall</text>
    </>}

    {bendingOn && <>
      <path d={pipePath} stroke={bendColor} strokeWidth="3.4" strokeLinecap="round" fill="none" strokeDasharray="10 9" />
      <text x="92" y="108" fill={bendColor} fontSize="12" fontWeight="900">bending: σL tension side</text>
      <text x="292" y={pressureOn ? 225 : 218} fill={bendColor} fontSize="12" fontWeight="900">σL compression opposite</text>
      <path d={`M105 118 C170 ${100 - sag * .15}, 290 ${210 + sag * .12}, 356 202`} stroke={bendColor} strokeWidth="2" fill="none" strokeDasharray="5 7" opacity=".72" />
      <text x={mid} y={bendLabelY} textAnchor="middle" fill={bendColor} fontSize="12" fontWeight="900">M/Z bending {pct(bending)} — ovalisation cue</text>
    </>}

    {torsionOn && <>
      <path d={`M${x1 + 28} 190 L${x1 + 80} 114 M${x1 + 92} 190 L${x1 + 144} 114 M${x2 - 144} 190 L${x2 - 92} 114 M${x2 - 80} 190 L${x2 - 28} 114`} stroke={torsionColor} strokeWidth="3.1" strokeLinecap="round" opacity=".9" />
      <path d={`M${x1 + 6} 77 C${x1 + 42} 58, ${x1 + 88} 58, ${x1 + 124} 77`} stroke={torsionColor} strokeWidth="2.8" fill="none" markerEnd="url(#arrow)" />
      <path d={`M${x2 - 6} 235 C${x2 - 42} 254, ${x2 - 88} 254, ${x2 - 124} 235`} stroke={torsionColor} strokeWidth="2.8" fill="none" markerEnd="url(#arrow)" />
      <text x={mid} y={torsionLabelY} textAnchor="middle" fill={torsionColor} fontSize="12" fontWeight="900">τt torsional shear {pct(torsion)} — helical bands</text>
    </>}
  </svg>;
}

export function PipeStressSectionSvg({ state }: { state: LabState }) {
  const pressureOn = activePressure(state);
  const bendingOn = activeBending(state);
  const torsionOn = activeTorsion(state);

  // Gate on active flags so cross-section only reacts to the visible component.
  const hoop = pressureOn ? state.pipeHoop : 0;
  const bending = bendingOn ? state.pipeBending : 0;
  const torsion = torsionOn ? state.pipeTorsion : 0;

  const expansion = hoop * 0.14;
  const oval = bending * 0.22;
  const rx = 78 + expansion + oval;
  const ry = Math.max(44, 78 + expansion * 0.42 - oval * 0.68);
  const innerRx = Math.max(30, rx - 34);
  const innerRy = Math.max(20, ry - 28);
  const ruptureCue = pressureOn && hoop >= 72;
  const cx = 230;
  const cy = 153;
  const torsionColor = torsion >= 67 ? COLORS.purple : COLORS.cyan;

  // Spread label y-positions to prevent overlap when multiple components are active.
  const hoopLabelY = 268;
  const bendLabelY = pressureOn ? 284 : 268;
  const torsionLabelY = (pressureOn && bendingOn) ? 300 : (pressureOn || bendingOn) ? 284 : 268;

  return <svg viewBox="0 0 460 340" role="img" aria-label="Pipe stress cross-section with hoop, ovalisation, torsion and rupture cues">
    <SvgDefs />
    <rect x="14" y="18" width="432" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M55 84H405 M55 222H405 M115 50V268 M230 50V268 M345 50V268" stroke="rgba(216,237,255,.07)" />
    <text x="230" y="42" textAnchor="middle" className="label" fill={COLORS.cyan}>Pipe wall cross-section</text>
    <text x="230" y="63" textAnchor="middle" className="muted">Hoop, ovalisation, and torsion are shown as separate cues</text>

    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="rgba(85,184,255,.14)" stroke="rgba(220,245,255,.88)" strokeWidth="4" />
    <ellipse cx={cx} cy={cy} rx={innerRx} ry={innerRy} fill="rgba(6,16,29,.88)" stroke="rgba(220,245,255,.42)" strokeWidth="2.2" />
    <ellipse cx={cx} cy={cy} rx="78" ry="78" fill="none" stroke="rgba(216,237,255,.18)" strokeDasharray="8 8" strokeWidth="2" />

    {pressureOn && <>
      <path d={`M${cx - rx - 20} ${cy} C${cx - rx - 8} ${cy - 22}, ${cx - rx - 8} ${cy + 22}, ${cx - rx - 20} ${cy}`} stroke={COLORS.blue} strokeWidth="2.6" fill="none" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
      <path d={`M${cx + rx + 20} ${cy} C${cx + rx + 8} ${cy - 22}, ${cx + rx + 8} ${cy + 22}, ${cx + rx + 20} ${cy}`} stroke={COLORS.blue} strokeWidth="2.6" fill="none" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
      <path d={`M${cx} ${cy - ry - 20} C${cx - 24} ${cy - ry - 8}, ${cx + 24} ${cy - ry - 8}, ${cx} ${cy - ry - 20}`} stroke={COLORS.blue} strokeWidth="2.6" fill="none" markerEnd="url(#arrow)" />
      <text x={cx} y={hoopLabelY} textAnchor="middle" fill={COLORS.blue} fontSize="12" fontWeight="900">σθ hoop / circumferential membrane {pct(hoop)}</text>
    </>}

    {bendingOn && <>
      <path d={`M${cx - rx + 10} ${cy - ry - 13} C${cx - rx * .45} ${cy - ry - 26}, ${cx + rx * .45} ${cy - ry - 26}, ${cx + rx - 10} ${cy - ry - 13}`} stroke={COLORS.orange} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d={`M${cx - rx + 10} ${cy + ry + 13} C${cx - rx * .45} ${cy + ry + 26}, ${cx + rx * .45} ${cy + ry + 26}, ${cx + rx - 10} ${cy + ry + 13}`} stroke={COLORS.orange} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <text x={cx} y={bendLabelY} textAnchor="middle" fill={COLORS.orange} fontSize="12" fontWeight="900">bending ovalisation / Brazier cue {pct(bending)}</text>
    </>}

    {torsionOn && <>
      <path d={`M${cx - rx + 16} ${cy + 20} L${cx - 20} ${cy - ry + 16} M${cx - 20} ${cy + ry - 16} L${cx + rx - 16} ${cy - 20}`} stroke={torsionColor} strokeWidth="3" strokeLinecap="round" opacity=".72" />
      <text x={cx} y={torsionLabelY} textAnchor="middle" fill={torsionColor} fontSize="12" fontWeight="900">τt torsional shear bands {pct(torsion)}</text>
    </>}

    {ruptureCue && <>
      <path className="crack glow" d={`M${cx + rx - 3} ${cy - ry + 7} C${cx + rx + 16} ${cy - 31}, ${cx + rx - 9} ${cy + 26}, ${cx + rx + 9} ${cy + ry - 9}`} />
      <text x={cx + 2} y="84" textAnchor="middle" fill={COLORS.red} fontSize="12" fontWeight="900">rupture cue: high hoop stress can drive longitudinal split</text>
    </>}
  </svg>;
}

export function PipeStressReadout({ state }: { state: LabState }) {
  const summary = pipeStressSummary(state);
  const rows = pipeStressRouteRows(state);

  return <div className="interp stress-readout">
    <span className="badge" style={{ color: summary.color }}>{summary.badge}</span>
    <h3 className="result-title">Pipe stress route map</h3>
    <p className="copy">{summary.copy}</p>
    <div className="table">
      {rows.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
      <b>Coordinate systems are separate</b>
      <span className="copy">Generic σx/σy/τxy stays in the stress-point tab. This pipe tab uses σθ hoop, σL longitudinal/membrane or bending, σr radial concept, and τt torsional shear. Do not report a component until local pipe axes and load source are clear.</span>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}>
      <b>Route before equation</b>
      <span className="copy">{summary.route}</span>
    </div>
  </div>;
}

export function PipeStressNote({ state }: { state: LabState }) {
  const rupture = activePressure(state) && state.pipeHoop >= 72;
  const oval = activeBending(state) && state.pipeBending >= 38;
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.yellow }}>concept boundary</span>
    <h3 className="result-title">Pipe component boundaries before code check</h3>
    <div className="card correct"><strong>Hoop stress σθ</strong><span className="copy">Circumferential membrane stress caused mainly by pressure. Treat pressure containment as wall-thickness / rating / material basis, not support-span tuning.</span></div>
    <div className="card correct"><strong>Longitudinal stress σL</strong><span className="copy">Includes pressure/end-load membrane, direct axial force, and bending M/Z. Source decides sustained, occasional, or displacement/flexibility route.</span></div>
    <div className="card correct"><strong>Bending and ovalisation</strong><span className="copy">Bending creates longitudinal tension and compression across the section. Ovalisation is a local cross-section cue, not hoop pressure by itself.</span></div>
    <div className="card correct"><strong>Torsion shear τt</strong><span className="copy">Twisting shear around the pipe axis. Do not label it as pressure rupture or ordinary longitudinal membrane stress.</span></div>
    <div className="card correct"><strong>B31.3 route map</strong><span className="copy">Pressure → 304 family; sustained force/weight → 302.3.5; occasional event → 302.3.6; displacement/flexibility → 319; supports/materials/allowables → 321/323/Appendix A. Use relevant code edition and Client criteria before evaluating/reporting any stress components.</span></div>
    <p className="fb">Current emphasis: {rupture ? 'high hoop-pressure rupture cue is active.' : oval ? 'bending ovalisation cue is active.' : 'component definition; no combined-stress acceptance calculation yet.'}</p>
  </div>;
}
