import { COLORS, LabState, Status } from '../model/types';
import { SvgDefs } from './SvgDefs';

type StressPanelProps = { state: LabState; status: Status };

function intensity(value: number) {
  if (value < 34) return 'low';
  if (value < 67) return 'medium';
  return 'high';
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

export function StressComponentsSvg({ state, status }: StressPanelProps) {
  const showNormal = state.stressView === 'normal' || state.stressView === 'combined';
  const showShear = state.stressView === 'shear' || state.stressView === 'combined';
  const cx = 230;
  const cy = 154;
  const width = showNormal ? 112 + state.sigmaX * 0.72 : 122;
  const height = showNormal ? 92 + state.sigmaY * 0.62 : 106;
  const skew = showShear ? state.tauXY * 0.38 : 0;
  const topShift = skew / 2;
  const bottomShift = -skew / 2;
  const left = cx - width / 2;
  const right = cx + width / 2;
  const top = cy - height / 2;
  const bottom = cy + height / 2;
  const p1 = { x: left + topShift, y: top };
  const p2 = { x: right + topShift, y: top };
  const p3 = { x: right + bottomShift, y: bottom };
  const p4 = { x: left + bottomShift, y: bottom };
  const points = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`;

  return <svg viewBox="0 0 460 320" role="img" aria-label="Stress components at a point with conceptual exaggerated shape response">
    <SvgDefs />
    <rect x="14" y="18" width="432" height="274" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M55 72H405 M55 236H405 M115 44V264 M230 44V264 M345 44V264" stroke="rgba(216,237,255,.07)" />

    <rect x="161" y="101" width="138" height="106" rx="10" fill="none" stroke="rgba(216,237,255,.18)" strokeDasharray="7 7" />
    <text x="230" y="88" textAnchor="middle" className="muted">undeformed reference element</text>

    <polygon points={points} fill="rgba(85,184,255,.16)" stroke="rgba(220,245,255,.92)" strokeWidth="4" filter="drop-shadow(0 16px 22px rgba(0,0,0,.35))" />
    <polygon points={points} fill="none" stroke="rgba(82,240,223,.34)" strokeWidth="10" opacity=".35" />
    <circle cx={cx} cy={cy} r="5" fill={status.color} />
    <text x={cx} y={cy + 5} textAnchor="middle" fill="rgba(6,16,29,.85)" fontSize="11" fontWeight="950">pt</text>

    {showNormal && <NormalStressTicks state={state} p1={p1} p2={p2} p3={p3} p4={p4} />}
    {showShear && <ShearStressTicks state={state} p1={p1} p2={p2} p3={p3} p4={p4} />}

    <text x="230" y="34" textAnchor="middle" className="label" fill={status.color}>Stress components at a point</text>
    <text x="230" y="278" textAnchor="middle" className="label">conceptual exaggerated shape response</text>
    <text x="230" y="300" textAnchor="middle" className="muted">σx changes width · σy changes height · τxy skews the element</text>
  </svg>;
}

function NormalStressTicks({ state, p1, p2, p3, p4 }: { state: LabState; p1: Point; p2: Point; p3: Point; p4: Point }) {
  const xStroke = state.sigmaX >= 67 ? COLORS.orange : COLORS.blue;
  const yStroke = state.sigmaY >= 67 ? COLORS.orange : COLORS.blue;
  const sxLabel = `σx ${pct(state.sigmaX)} (${intensity(state.sigmaX)})`;
  const syLabel = `σy ${pct(state.sigmaY)} (${intensity(state.sigmaY)})`;
  const leftMid = mid(p1, p4);
  const rightMid = mid(p2, p3);
  const topMid = mid(p1, p2);
  const bottomMid = mid(p4, p3);

  return <g>
    <path d={`M${leftMid.x - 15} ${leftMid.y - 36} L${leftMid.x - 15} ${leftMid.y + 36} M${rightMid.x + 15} ${rightMid.y - 36} L${rightMid.x + 15} ${rightMid.y + 36}`} stroke={xStroke} strokeWidth="4" strokeLinecap="round" />
    <path d={`M${leftMid.x - 48} ${leftMid.y} L${leftMid.x - 20} ${leftMid.y} M${rightMid.x + 20} ${rightMid.y} L${rightMid.x + 48} ${rightMid.y}`} stroke={xStroke} strokeWidth="4" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
    <text x="70" y="154" textAnchor="middle" className="stressLabel" fill={xStroke}>{sxLabel}</text>
    <text x="390" y="154" textAnchor="middle" className="stressLabel" fill={xStroke}>normal to x-face</text>

    <path d={`M${topMid.x - 42} ${topMid.y - 15} L${topMid.x + 42} ${topMid.y - 15} M${bottomMid.x - 42} ${bottomMid.y + 15} L${bottomMid.x + 42} ${bottomMid.y + 15}`} stroke={yStroke} strokeWidth="4" strokeLinecap="round" />
    <path d={`M${topMid.x} ${topMid.y - 50} L${topMid.x} ${topMid.y - 20} M${bottomMid.x} ${bottomMid.y + 20} L${bottomMid.x} ${bottomMid.y + 50}`} stroke={yStroke} strokeWidth="4" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
    <text x="230" y="64" textAnchor="middle" className="stressLabel" fill={yStroke}>{syLabel}</text>
    <text x="230" y="254" textAnchor="middle" className="stressLabel" fill={yStroke}>normal to y-face</text>
  </g>;
}

function ShearStressTicks({ state, p1, p2, p3, p4 }: { state: LabState; p1: Point; p2: Point; p3: Point; p4: Point }) {
  const stroke = state.tauXY >= 67 ? COLORS.purple : COLORS.cyan;
  const len = 24 + state.tauXY * 0.32;
  const topMid = mid(p1, p2);
  const bottomMid = mid(p4, p3);
  const leftMid = mid(p1, p4);
  const rightMid = mid(p2, p3);
  const showPairs = state.showPairedShear;

  return <g>
    <path d={`M${topMid.x - len} ${topMid.y - 28} L${topMid.x + len} ${topMid.y - 28}`} stroke={stroke} strokeWidth="4.6" strokeLinecap="round" markerEnd="url(#arrow)" />
    <path d={`M${bottomMid.x + len} ${bottomMid.y + 28} L${bottomMid.x - len} ${bottomMid.y + 28}`} stroke={stroke} strokeWidth="4.6" strokeLinecap="round" markerEnd="url(#arrow)" />
    <text x={topMid.x} y={topMid.y - 39} textAnchor="middle" className="stressLabel" fill={stroke}>τxy {pct(state.tauXY)}</text>

    {showPairs && <>
      <path d={`M${rightMid.x + 34} ${rightMid.y - len * .72} L${rightMid.x + 34} ${rightMid.y + len * .72}`} stroke={stroke} strokeWidth="4.6" strokeLinecap="round" markerEnd="url(#arrow)" />
      <path d={`M${leftMid.x - 34} ${leftMid.y + len * .72} L${leftMid.x - 34} ${leftMid.y - len * .72}`} stroke={stroke} strokeWidth="4.6" strokeLinecap="round" markerEnd="url(#arrow)" />
      <text x={rightMid.x + 48} y={rightMid.y} className="stressLabel" fill={stroke}>τyx pair</text>
    </>}
  </g>;
}

export function StressComponentExplanation({ state }: { state: LabState }) {
  const modeTitle = state.stressView === 'normal' ? 'Normal stress mode' : state.stressView === 'shear' ? 'Shear stress mode' : 'Combined stress state';
  const modeCopy = state.stressView === 'normal'
    ? 'Normal stress acts perpendicular to the selected cut plane. In this teaching graphic, σx widens the element and σy increases its height.'
    : state.stressView === 'shear'
      ? 'Shear stress acts parallel to the cut plane. τxy skews the element to show angular distortion as a visual cue.'
      : 'Combined mode shows normal stress and shear stress together. Width, height, and skew respond independently to their sliders.';

  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.blue }}>stress state only</span>
    <h3 className="result-title">{modeTitle}</h3>
    <p className="copy">{modeCopy}</p>
    <div className="table">
      <div><span>σx</span><b>{pct(state.sigmaX)} · normal on x-face</b></div>
      <div><span>σy</span><b>{pct(state.sigmaY)} · normal on y-face</b></div>
      <div><span>τxy</span><b>{pct(state.tauXY)} · shear on x-face in y direction</b></div>
      <div><span>Shape cue</span><b>{state.stressView === 'shear' ? 'skew only' : state.stressView === 'normal' ? 'resize only' : 'resize + skew'}</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}><b>Important distinction</b><span className="copy">The resized/skewed object is exaggerated for learning. It is not a calculated strain result and it is not a failure prediction.</span></div>
  </div>;
}

export function StressTensorCard({ state }: { state: LabState }) {
  if (!state.showTensor) {
    return <div className="interp stress-readout">
      <span className="badge" style={{ color: COLORS.cyan }}>tensor hidden</span>
      <h3 className="result-title">Tensor card is optional</h3>
      <p className="copy">Enable “show tensor matrix” in the controls to connect the graphic to the 2D plane-stress notation.</p>
      <div className="bucket"><b>Why optional?</b><span className="copy">The first objective is visual: perpendicular normal stress versus parallel shear stress.</span></div>
    </div>;
  }

  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.cyan }}>plane stress tensor</span>
    <h3 className="result-title">2D stress state notation</h3>
    <div className="tensor-card" aria-label="Plane stress tensor matrix">
      <span>[</span>
      <div className="tensor-grid">
        <b>σx</b><b>τxy</b>
        <b>τyx</b><b>σy</b>
      </div>
      <span>]</span>
    </div>
    <p className="copy">For static equilibrium of a small stress element, the companion shear is shown as τxy = τyx in this introductory view.</p>
    <div className="table">
      <div><span>Matrix value</span><b>[{pct(state.sigmaX)}, {pct(state.tauXY)}; {pct(state.tauXY)}, {pct(state.sigmaY)}]</b></div>
      <div><span>Next later</span><b>stress transformation and Mohr circle</b></div>
    </div>
  </div>;
}

export function StressEngineeringNote({ state }: { state: LabState }) {
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.yellow }}>boundary note</span>
    <h3 className="result-title">Do not jump to failure theory yet</h3>
    <p className="copy">This tab only defines stress components at a point. It deliberately avoids von Mises, Tresca, Rankine, Mohr circle, allowable stress, and pipe hoop stress.</p>
    <div style={{ display: 'grid', gap: 8 }}>
      <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">1</b><span><b>Normal stress</b><br/><span className="copy">Perpendicular to a face: σx and σy.</span></span></div>
      <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">2</b><span><b>Shear stress</b><br/><span className="copy">Parallel to a face: τxy and the companion shear pair.</span></span></div>
      <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">3</b><span><b>Shape response</b><br/><span className="copy">Width, height, and skew are controlled by sliders for visual intuition only.</span></span></div>
    </div>
    {state.showSignConvention && <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}><b>Graphic convention</b><span className="copy">Positive normal stress is drawn as tensile/separating. Positive τxy is drawn as the top face shearing to the right with a balancing shear pair.</span></div>}
  </div>;
}

type Point = { x: number; y: number };
function mid(a: Point, b: Point): Point { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
