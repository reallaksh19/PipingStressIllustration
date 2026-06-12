import { COLORS, LabState, Status } from '../model/types';
import { SvgDefs } from './SvgDefs';

type StressPanelProps = { state: LabState; status: Status };
type Point = { x: number; y: number };

function intensity(value: number) {
  if (value < 34) return 'low';
  if (value < 67) return 'medium';
  return 'high';
}

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function mid(a: Point, b: Point): Point { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }

function SvgLabel({
  x,
  y,
  text,
  fill = '#eef7ff',
  anchor = 'middle',
  size = 12,
}: {
  x: number;
  y: number;
  text: string;
  fill?: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
}) {
  return <text
    x={x}
    y={y}
    textAnchor={anchor}
    fill={fill}
    stroke="none"
    fontSize={size}
    fontWeight="900"
    fontFamily="Arial, Helvetica, sans-serif"
    opacity="1"
  >{text}</text>;
}

function StressLegend({ state }: { state: LabState }) {
  const showNormal = state.stressView === 'normal' || state.stressView === 'combined';
  const showShear = state.stressView === 'shear' || state.stressView === 'combined';
  const y = 288;

  if (showNormal && !showShear) {
    return <g>
      <SvgLabel x={126} y={y} text={`Normal stress σx ${pct(state.sigmaX)}`} fill={state.sigmaX >= 67 ? COLORS.orange : COLORS.blue} />
      <SvgLabel x={334} y={y} text={`Normal stress σy ${pct(state.sigmaY)}`} fill={state.sigmaY >= 67 ? COLORS.orange : COLORS.blue} />
    </g>;
  }

  if (showShear && !showNormal) {
    return <SvgLabel x={230} y={y} text={`Shear stress τxy ${pct(state.tauXY)}`} fill={state.tauXY >= 67 ? COLORS.purple : COLORS.cyan} />;
  }

  return <g>
    <SvgLabel x={105} y={y} text={`σx ${pct(state.sigmaX)}`} fill={state.sigmaX >= 67 ? COLORS.orange : COLORS.blue} />
    <SvgLabel x={230} y={y} text={`σy ${pct(state.sigmaY)}`} fill={state.sigmaY >= 67 ? COLORS.orange : COLORS.blue} />
    <SvgLabel x={355} y={y} text={`τxy ${pct(state.tauXY)}`} fill={state.tauXY >= 67 ? COLORS.purple : COLORS.cyan} />
  </g>;
}

export function StressComponentsSvg({ state, status }: StressPanelProps) {
  const showNormal = state.stressView === 'normal' || state.stressView === 'combined';
  const showShear = state.stressView === 'shear' || state.stressView === 'combined';
  const cx = 230;
  const cy = 160;
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

  return <svg viewBox="0 0 460 340" role="img" aria-label="Stress components at a point with conceptual exaggerated shape response">
    <SvgDefs />
    <rect x="14" y="18" width="432" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M55 78H405 M55 240H405 M115 48V270 M230 48V270 M345 48V270" stroke="rgba(216,237,255,.07)" />

    <rect x="161" y="107" width="138" height="106" rx="10" fill="none" stroke="rgba(216,237,255,.18)" strokeDasharray="7 7" />
    <SvgLabel x={230} y={100} text="undeformed reference" fill="rgba(216,237,255,.62)" size={11} />

    <polygon points={points} fill="rgba(85,184,255,.16)" stroke="rgba(220,245,255,.92)" strokeWidth="4" filter="drop-shadow(0 16px 22px rgba(0,0,0,.35))" />
    <polygon points={points} fill="none" stroke="rgba(82,240,223,.34)" strokeWidth="10" opacity=".35" />
    <circle cx={cx} cy={cy} r="5" fill={status.color} />
    <SvgLabel x={cx} y={cy + 5} text="pt" fill="rgba(6,16,29,.92)" size={11} />

    {showNormal && <NormalStressTicks state={state} p1={p1} p2={p2} p3={p3} p4={p4} />}
    {showShear && <ShearStressTicks state={state} p1={p1} p2={p2} p3={p3} p4={p4} />}

    <SvgLabel x={230} y={35} text="Stress components at a point" fill={status.color} size={14} />
    <StressLegend state={state} />
    <SvgLabel x={230} y={328} text="shape is exaggerated for teaching; it is not a strain or failure calculation" fill="rgba(216,237,255,.72)" size={11} />
  </svg>;
}

function NormalStressTicks({ state, p1, p2, p3, p4 }: { state: LabState; p1: Point; p2: Point; p3: Point; p4: Point }) {
  const xStroke = state.sigmaX >= 67 ? COLORS.orange : COLORS.blue;
  const yStroke = state.sigmaY >= 67 ? COLORS.orange : COLORS.blue;
  const leftMid = mid(p1, p4);
  const rightMid = mid(p2, p3);
  const topMid = mid(p1, p2);
  const bottomMid = mid(p4, p3);

  return <g>
    <path d={`M${leftMid.x - 10} ${leftMid.y - 21} L${leftMid.x - 10} ${leftMid.y + 21} M${rightMid.x + 10} ${rightMid.y - 21} L${rightMid.x + 10} ${rightMid.y + 21}`} stroke={xStroke} strokeWidth="2.2" strokeLinecap="round" />
    <path d={`M${leftMid.x - 34} ${leftMid.y} L${leftMid.x - 18} ${leftMid.y} M${rightMid.x + 18} ${rightMid.y} L${rightMid.x + 34} ${rightMid.y}`} stroke={xStroke} strokeWidth="2.2" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
    <SvgLabel x={42} y={128} text="Normal stress σx" fill={xStroke} anchor="start" />
    <SvgLabel x={418} y={128} text="x-face" fill={xStroke} anchor="end" />

    <path d={`M${topMid.x - 26} ${topMid.y - 10} L${topMid.x + 26} ${topMid.y - 10} M${bottomMid.x - 26} ${bottomMid.y + 10} L${bottomMid.x + 26} ${bottomMid.y + 10}`} stroke={yStroke} strokeWidth="2.2" strokeLinecap="round" />
    <path d={`M${topMid.x} ${topMid.y - 32} L${topMid.x} ${topMid.y - 18} M${bottomMid.x} ${bottomMid.y + 18} L${bottomMid.x} ${bottomMid.y + 32}`} stroke={yStroke} strokeWidth="2.2" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
    <SvgLabel x={230} y={57} text="Normal stress σy" fill={yStroke} />
    <SvgLabel x={230} y={264} text="y-face" fill={yStroke} />
  </g>;
}

function ShearStressTicks({ state, p1, p2, p3, p4 }: { state: LabState; p1: Point; p2: Point; p3: Point; p4: Point }) {
  const stroke = state.tauXY >= 67 ? COLORS.purple : COLORS.cyan;
  const len = 12 + state.tauXY * 0.16;
  const topMid = mid(p1, p2);
  const bottomMid = mid(p4, p3);
  const leftMid = mid(p1, p4);
  const rightMid = mid(p2, p3);
  const showPairs = state.showPairedShear;

  return <g>
    <path d={`M${topMid.x - len} ${topMid.y - 17} L${topMid.x + len} ${topMid.y - 17}`} stroke={stroke} strokeWidth="2.35" strokeLinecap="round" markerEnd="url(#arrow)" />
    <path d={`M${bottomMid.x + len} ${bottomMid.y + 17} L${bottomMid.x - len} ${bottomMid.y + 17}`} stroke={stroke} strokeWidth="2.35" strokeLinecap="round" markerEnd="url(#arrow)" />
    <SvgLabel x={230} y={57} text="Shear stress τxy" fill={stroke} />

    {showPairs && <>
      <path d={`M${rightMid.x + 18} ${rightMid.y - len * .65} L${rightMid.x + 18} ${rightMid.y + len * .65}`} stroke={stroke} strokeWidth="2.35" strokeLinecap="round" markerEnd="url(#arrow)" />
      <path d={`M${leftMid.x - 18} ${leftMid.y + len * .65} L${leftMid.x - 18} ${leftMid.y - len * .65}`} stroke={stroke} strokeWidth="2.35" strokeLinecap="round" markerEnd="url(#arrow)" />
      <SvgLabel x={392} y={229} text="τyx pair" fill={stroke} anchor="end" />
    </>}
  </g>;
}

export function PipeEffectPreview({ state }: { state: LabState }) {
  const normalVisible = state.stressView === 'normal' || state.stressView === 'combined';
  const shearVisible = state.stressView === 'shear' || state.stressView === 'combined';
  const hoop = normalVisible ? state.sigmaY : 0;
  const axial = normalVisible ? state.sigmaX : 0;
  const shear = shearVisible ? state.tauXY : 0;
  const pressureExpansion = hoop * 0.13;
  const axialExtension = axial * 0.34;
  const bendingOvalisation = state.stressView === 'combined' ? Math.max(0, axial - 38) * 0.22 : 0;
  const ruptureCue = hoop >= 72 && normalVisible;
  const rx = 56 + pressureExpansion + bendingOvalisation;
  const ry = Math.max(38, 56 + pressureExpansion * 0.35 - bendingOvalisation * 0.72);
  const splitX = 116 + rx;
  const shearSkew = shear * 0.22;
  const basePipeX1 = 222;
  const basePipeX2 = 382;
  const pipeX1 = basePipeX1 - axialExtension * 0.45;
  const pipeX2 = basePipeX2 + axialExtension * 0.45;
  const pipeMid = (pipeX1 + pipeX2) / 2;
  const axialColor = axial >= 67 ? COLORS.orange : COLORS.blue;
  const axialLabel = `σL axial stretch cue ${pct(axial)}`;
  const caption = state.stressView === 'normal'
    ? 'Normal bridge: σL changes pipe length cue; σθ changes hoop expansion cue.'
    : state.stressView === 'shear'
      ? 'Shear bridge: torsion-like diagonal surface shear. No rupture claim.'
      : 'Combined bridge: axial stretch, hoop expansion, bending ovalisation, and shear distortion cues.';

  return <svg viewBox="0 0 460 340" role="img" aria-label="Pipe effect preview from stress components">
    <SvgDefs />
    <rect x="14" y="18" width="432" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <text x="230" y="40" textAnchor="middle" className="label" fill={COLORS.cyan}>Pipe effect preview</text>
    <text x="230" y="61" textAnchor="middle" className="muted">concept bridge only — not a failure-theory calculation</text>

    <g transform={`translate(${shearSkew * .18},0)`}>
      <path d={`M${basePipeX1} 128 H${basePipeX2}`} stroke="rgba(216,237,255,.22)" strokeWidth="44" strokeLinecap="round" strokeDasharray="8 10" />
      <path d={`M${pipeX1} 128 H${pipeX2}`} stroke="#020813" strokeWidth="48" strokeLinecap="round" opacity=".88" />
      <path d={`M${pipeX1} 128 H${pipeX2}`} stroke="url(#pipeStroke)" strokeWidth="34" strokeLinecap="round" />
      <path d={`M${pipeX1} 128 H${pipeX2}`} stroke="#06101d" strokeWidth="13" strokeLinecap="round" opacity=".76" strokeDasharray="18 12" />
      {normalVisible && <>
        <path d={`M${pipeX1 + 12} 87 C${pipeX1 + 54} ${70 - axialExtension * .05}, ${pipeX2 - 54} ${70 - axialExtension * .05}, ${pipeX2 - 12} 87 M${pipeX1 + 12} 169 C${pipeX1 + 54} ${186 + axialExtension * .05}, ${pipeX2 - 54} ${186 + axialExtension * .05}, ${pipeX2 - 12} 169`} stroke="rgba(85,184,255,.55)" strokeWidth="3" fill="none" strokeDasharray="7 7" />
        <path d={`M${basePipeX1} 195 H${basePipeX2}`} stroke="rgba(216,237,255,.22)" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 6" />
        <path d={`M${pipeX1} 195 H${pipeX2}`} stroke={axialColor} strokeWidth="2.8" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
        <text x={pipeMid} y="217" textAnchor="middle" fill={axialColor} fontSize="12" fontWeight="900">{axialLabel}</text>
      </>}
      {shearVisible && <>
        <path d={`M${pipeX1 + 18} 159 L${pipeX1 + 60} 98 M${pipeX1 + 62} 159 L${pipeX1 + 104} 98 M${pipeX2 - 104} 159 L${pipeX2 - 62} 98 M${pipeX2 - 60} 159 L${pipeX2 - 18} 98`} stroke={shear >= 67 ? COLORS.purple : COLORS.cyan} strokeWidth="3.2" strokeLinecap="round" opacity=".86" />
        <text x={pipeMid} y={normalVisible ? 238 : 226} textAnchor="middle" className="muted">τ / diagonal shear bands</text>
      </>}
    </g>

    <g>
      <ellipse cx="116" cy="146" rx={rx} ry={ry} fill="rgba(85,184,255,.14)" stroke="rgba(220,245,255,.88)" strokeWidth="4" />
      <ellipse cx="116" cy="146" rx={Math.max(20, rx - 30)} ry={Math.max(16, ry - 24)} fill="rgba(6,16,29,.88)" stroke="rgba(220,245,255,.42)" strokeWidth="2" />
      {normalVisible && <>
        <path d={`M${116 - rx - 15} 146 C${116 - rx - 4} ${126 - pressureExpansion * .25}, ${116 - rx - 4} ${166 + pressureExpansion * .25}, ${116 - rx - 15} 146 M${116 + rx + 15} 146 C${116 + rx + 4} ${126 - pressureExpansion * .25}, ${116 + rx + 4} ${166 + pressureExpansion * .25}, ${116 + rx + 15} 146`} stroke={COLORS.blue} strokeWidth="2.4" fill="none" markerEnd="url(#arrow)" markerStart="url(#arrowStart)" />
        <text x="116" y="236" textAnchor="middle" className="muted">σθ / hoop expansion cue</text>
      </>}
      {bendingOvalisation > 0 && <>
        <path d={`M${116 - rx + 8} ${146 - ry - 12} C${116 - rx * .35} ${146 - ry - 24}, ${116 + rx * .35} ${146 - ry - 24}, ${116 + rx - 8} ${146 - ry - 12}`} stroke={COLORS.orange} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={`M${116 - rx + 8} ${146 + ry + 12} C${116 - rx * .35} ${146 + ry + 24}, ${116 + rx * .35} ${146 + ry + 24}, ${116 + rx - 8} ${146 + ry + 12}`} stroke={COLORS.orange} strokeWidth="3" fill="none" strokeLinecap="round" />
        <text x="116" y="265" textAnchor="middle" className="muted">ovalisation: bending/Brazier concept</text>
      </>}
      {ruptureCue && <>
        <path className="crack glow" d={`M${splitX - 4} ${146 - ry + 5} C${splitX + 12} ${146 - ry * .35}, ${splitX - 10} ${146 + ry * .25}, ${splitX + 7} ${146 + ry - 6}`} />
        <text x="116" y="286" textAnchor="middle" fill={COLORS.red} fontSize="12" fontWeight="900">rupture cue: hoop-dominant longitudinal split</text>
      </>}
    </g>

    <g>
      <rect x="200" y="247" width="224" height="49" rx="15" fill="rgba(255,255,255,.045)" stroke="rgba(216,237,255,.16)" />
      <text x="212" y="267" fill="#d8edff" fontSize="12" fontWeight="900">{caption}</text>
      <text x="212" y="286" className="muted">Use Tab 5B later for real pipe components: σθ, σL, σr, and τ.</text>
    </g>
  </svg>;
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
      {(state.stressView === 'normal' || state.stressView === 'combined') && <>
        <div><span>σx</span><b>{pct(state.sigmaX)} · normal on x-face</b></div>
        <div><span>σy</span><b>{pct(state.sigmaY)} · normal on y-face</b></div>
      </>}
      {(state.stressView === 'shear' || state.stressView === 'combined') && <div><span>τxy</span><b>{pct(state.tauXY)} · shear on x-face in y direction</b></div>}
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
    <p className="copy">This tab only defines stress components at a point. The optional pipe preview is only a bridge to pipe stress effects; it is not a code check and not a failure-theory result.</p>
    <div style={{ display: 'grid', gap: 8 }}>
      <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">1</b><span><b>Normal stress</b><br/><span className="copy">Perpendicular to a face: σx and σy. Pipe preview maps this only as a concept bridge to axial/hoop effects.</span></span></div>
      <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">2</b><span><b>Shear stress</b><br/><span className="copy">Parallel to a face: τxy and the companion shear pair. Pipe preview shows torsion-like diagonal shear bands.</span></span></div>
      <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">3</b><span><b>Pipe effects</b><br/><span className="copy">Ovalisation is shown only as bending/Brazier concept. Rupture cue is shown only as hoop-dominant pressure concept.</span></span></div>
    </div>
    {state.showSignConvention && <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}><b>Graphic convention</b><span className="copy">Positive normal stress is drawn as tensile/separating. Positive τxy is drawn as the top face shearing to the right with a balancing shear pair.</span></div>}
  </div>;
}
