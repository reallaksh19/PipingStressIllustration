import { useState } from 'react';
import { COLORS, LabState, Status } from '../model/types';
import { SvgDefs } from './SvgDefs';

type StressPanelProps = { state: LabState; status: Status };
type Point = { x: number; y: number };
type StressLearningHelper = { title: string; route: string; concept: string; piping: string; b313: string; mistake: string; next: string };

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function mid(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

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
    {/* σx ticks: bar on each x-face, then single arrow away from face – no doubled arrowheads */}
    <path d={`M${leftMid.x - 10} ${leftMid.y - 18} L${leftMid.x - 10} ${leftMid.y + 18} M${rightMid.x + 10} ${rightMid.y - 18} L${rightMid.x + 10} ${rightMid.y + 18}`} stroke={xStroke} strokeWidth="2.2" strokeLinecap="round" />
    <path d={`M${leftMid.x - 10} ${leftMid.y} L${leftMid.x - 32} ${leftMid.y}`} stroke={xStroke} strokeWidth="2.2" strokeLinecap="round" markerEnd="url(#arrow)" />
    <path d={`M${rightMid.x + 10} ${rightMid.y} L${rightMid.x + 32} ${rightMid.y}`} stroke={xStroke} strokeWidth="2.2" strokeLinecap="round" markerEnd="url(#arrow)" />
    <SvgLabel x={38} y={leftMid.y - 4} text="σx" fill={xStroke} anchor="end" size={11} />
    <SvgLabel x={38} y={leftMid.y + 10} text="x-face" fill={xStroke} anchor="end" size={10} />

    {/* σy ticks: bar on each y-face, then single arrow away from face */}
    <path d={`M${topMid.x - 22} ${topMid.y - 10} L${topMid.x + 22} ${topMid.y - 10} M${bottomMid.x - 22} ${bottomMid.y + 10} L${bottomMid.x + 22} ${bottomMid.y + 10}`} stroke={yStroke} strokeWidth="2.2" strokeLinecap="round" />
    <path d={`M${topMid.x} ${topMid.y - 10} L${topMid.x} ${topMid.y - 30}`} stroke={yStroke} strokeWidth="2.2" strokeLinecap="round" markerEnd="url(#arrow)" />
    <path d={`M${bottomMid.x} ${bottomMid.y + 10} L${bottomMid.x} ${bottomMid.y + 30}`} stroke={yStroke} strokeWidth="2.2" strokeLinecap="round" markerEnd="url(#arrow)" />
    <SvgLabel x={topMid.x} y={topMid.y - 34} text="σy" fill={yStroke} size={11} />
    <SvgLabel x={bottomMid.x} y={bottomMid.y + 44} text="y-face" fill={yStroke} size={10} />
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
    {/* Shear label: only show if normal label isn't already at y=57 */}
    <SvgLabel x={230} y={50} text="Shear stress τxy" fill={stroke} />

    {showPairs && <>
      <path d={`M${rightMid.x + 18} ${rightMid.y - len * .65} L${rightMid.x + 18} ${rightMid.y + len * .65}`} stroke={stroke} strokeWidth="2.35" strokeLinecap="round" markerEnd="url(#arrow)" />
      <path d={`M${leftMid.x - 18} ${leftMid.y + len * .65} L${leftMid.x - 18} ${leftMid.y - len * .65}`} stroke={stroke} strokeWidth="2.35" strokeLinecap="round" markerEnd="url(#arrow)" />
      <SvgLabel x={392} y={229} text="τyx pair" fill={stroke} anchor="end" />
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
  return <>
    <div className="interp stress-readout">
      <span className="badge" style={{ color: COLORS.yellow }}>boundary note</span>
      <h3 className="result-title">Do not jump to failure theory yet</h3>
      <p className="copy">This tab only defines stress components at a point. Pipe stress effects are now separated into Tab 5B; this tab is not a code check and not a failure-theory result.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">1</b><span><b>Normal stress</b><br/><span className="copy">Perpendicular to a face: σx and σy. These are generic Cartesian component labels.</span></span></div>
        <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">2</b><span><b>Shear stress</b><br/><span className="copy">Parallel to a face: τxy and the companion shear pair. Shear is not written as σxy in this view.</span></span></div>
        <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">3</b><span><b>Pipe effects moved</b><br/><span className="copy">Hoop, axial pipe stress, ovalisation, rupture cue, and torsion are handled in the separate Pipe Stress tab with σθ, σL, M, and τt sliders.</span></span></div>
      </div>
      {state.showSignConvention && <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}><b>Graphic convention</b><span className="copy">Positive normal stress is drawn as tensile/separating. Positive τxy is drawn as the top face shearing to the right with a balancing shear pair.</span></div>}
    </div>
    <StressLearningBar state={state} />
  </>;
}

function StressLearningBar({ state }: { state: LabState }) {
  const helpers = stressHelpers(state);
  const [active, setActive] = useState<string>(helpers[0]?.title ?? 'Cartesian notation');
  const selected = helpers.find(helper => helper.title === active) ?? helpers[0];

  return <div
    aria-label="Tab 3 learning layer status bar"
    style={{
      display: 'grid',
      gap: 9,
      padding: '12px 14px',
      borderRadius: 22,
      border: '1px solid rgba(82,240,223,.28)',
      background: 'linear-gradient(180deg,rgba(9,20,36,.94),rgba(6,16,29,.97))',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.06)',
      marginTop: 8,
    }}
  >
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, paddingRight: 6, color: '#52f0df', fontWeight: 950, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: 11 }}>ⓘ Tab 3 learning layer</span>
      {helpers.map(helper => {
        const activeButton = selected?.title === helper.title;
        return <button
          key={helper.title}
          type="button"
          onClick={() => setActive(helper.title)}
          title={`ⓘ ${helper.title}`}
          style={{
            border: `1px solid ${activeButton ? 'rgba(82,240,223,.82)' : 'rgba(190,220,255,.20)'}`,
            borderRadius: 999,
            background: activeButton ? 'linear-gradient(135deg,rgba(85,184,255,.25),rgba(82,240,223,.10))' : 'rgba(255,255,255,.045)',
            color: activeButton ? '#dcfffb' : '#d8edff',
            padding: '7px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            cursor: 'pointer',
            fontWeight: 950,
            fontSize: 12,
          }}
        >
          <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 999, background: 'rgba(6,16,29,.72)', color: '#52f0df', fontFamily: 'ui-monospace, Menlo, Consolas, monospace' }}>{stressIconFor(helper.title)}</span>
          <span>{stressShortFor(helper.title)}</span>
        </button>;
      })}
      <span style={{ marginLeft: 'auto', border: '1px solid rgba(255,215,91,.30)', borderRadius: 999, background: 'rgba(255,215,91,.08)', color: '#ffd75b', padding: '8px 11px', fontWeight: 950, fontSize: 12 }}>
        Next: Pipe Stress · σθ σL τ
      </span>
    </div>

    {selected && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8, alignItems: 'stretch' }}>
      <LearningCell title={`Concept · ${selected.route}`} text={selected.concept} color="#52f0df" />
      <LearningCell title="Piping" text={selected.piping} color="#55b8ff" />
      <LearningCell title="B31.3 map" text={selected.b313} color="#ffd75b" />
      <LearningCell title="Mistake" text={selected.mistake} color="#ff4b64" />
      <LearningCell title="Next" text={selected.next} color="#b884ff" />
    </div>}
  </div>;
}

function LearningCell({ title, text, color }: { title: string; text: string; color: string }) {
  return <div style={{ minWidth: 0, display: 'grid', gap: 3, padding: '9px 10px', borderRadius: 16, border: '1px solid rgba(190,220,255,.14)', background: 'rgba(255,255,255,.035)' }}>
    <b style={{ color, fontSize: 11, letterSpacing: '.07em', textTransform: 'uppercase' }}>{title}</b>
    <span className="copy" style={{ fontSize: 12, lineHeight: 1.32 }}>{text}</span>
  </div>;
}

function stressIconFor(title: string) {
  if (title.includes('Cartesian')) return 'x-y';
  if (title.includes('Normal')) return 'σ';
  if (title.includes('Shear')) return 'τ';
  if (title.includes('Tensor')) return '[σ]';
  return '§';
}

function stressShortFor(title: string) {
  return title
    .replace('Cartesian stress notation', 'Cartesian')
    .replace('Normal stress σx / σy', 'Normal σ')
    .replace('Shear stress τxy', 'Shear τ')
    .replace('Tensor card', 'Tensor')
    .replace('B31.3 lens for Tab 3', 'B31.3');
}

function stressHelpers(state: LabState): StressLearningHelper[] {
  const showing = state.stressView === 'normal'
    ? 'normal-stress-only view'
    : state.stressView === 'shear'
      ? 'shear-stress-only view'
      : 'combined plane-stress view';

  return [
    {
      title: 'Cartesian stress notation',
      route: showing,
      concept: 'This tab is a local 2D Cartesian stress element. σx and σy are normal stresses on x/y faces; τxy is shear. It is a notation foundation, not pipe hoop/axial notation.',
      piping: 'A pipe model may internally resolve local stresses, but piping engineers usually review results by pipe route: hoop/pressure, longitudinal sustained, expansion range, occasional, support reaction, and nozzle load.',
      b313: 'B31.3 does not route routine checks from a generic σx/σy/τxy teaching tensor. Use this as theory before the B31.3 pressure, sustained, displacement, and occasional stress routes.',
      mistake: 'Do not call σy “hoop stress” just because it is vertical on the screen. Hoop stress is σθ in cylindrical pipe notation and appears in the Pipe Stress tab.',
      next: 'Move to Pipe Stress · σθ σL τ to convert generic stress notation into pipe-specific cylindrical component names.',
    },
    {
      title: 'Normal stress σx / σy',
      route: `${pct(state.sigmaX)} / ${pct(state.sigmaY)}`,
      concept: 'Normal stress acts perpendicular to the face being considered. In this visual σx changes the x-face separation cue and σy changes the y-face separation cue.',
      piping: 'Pipe longitudinal membrane and bending stresses are normal stresses, but they are not automatically σx/σy; the coordinate system and cut plane must be defined first.',
      b313: 'For pipe work, normal stresses later map to pressure design, sustained longitudinal stress, displacement stress range, or occasional stress depending on load source and category.',
      mistake: 'Do not mix a Cartesian local-element normal stress with a B31.3 category limit without first identifying load case, pipe coordinate, temperature allowable, and SIF/flexibility treatment.',
      next: 'Use the Load Types tab after this foundation to decide whether the normal stress belongs to sustained, occasional, or displacement logic.',
    },
    {
      title: 'Shear stress τxy',
      route: `${pct(state.tauXY)} shear cue`,
      concept: 'Shear stress acts parallel to a face. τxy means shear on the x-face in the y-direction, with a balancing τyx pair in the introductory equilibrium view.',
      piping: 'Torsion, branch connections, restraints, supports, and local discontinuities can introduce shear or shear-related combined effects, but the piping route depends on the load case.',
      b313: 'Treat this as component theory. Later code interpretation depends on whether the shear contribution is part of sustained, occasional, expansion/displacement, torsion, or a local component/SIF assessment.',
      mistake: 'Do not write shear as σxy in this tab. Use τxy for shear; σ symbols are reserved for normal stress components.',
      next: 'For pipe torsion, continue to Pipe Stress where τt is shown as torsional shear in cylindrical pipe notation.',
    },
    {
      title: 'Tensor card',
      route: state.showTensor ? 'visible' : 'hidden',
      concept: 'The tensor card groups the local plane-stress terms into a compact matrix. It is useful for transformation, Mohr circle, and failure-theory background.',
      piping: 'Software stress reports may combine components, but the engineer still needs to read the correct physical route: pressure design, sustained, thermal expansion range, or occasional event.',
      b313: 'Use the tensor as mechanics background only. B31.3 paragraph mapping still starts from design condition, load source, stress category, material allowable, and component geometry.',
      mistake: 'Do not assume a visible tensor matrix means the app has performed a code-certified combined-stress calculation.',
      next: 'Use Combined Stress later for educational VM/Tresca comparison, but only after the source/category route is selected.',
    },
    {
      title: 'B31.3 lens for Tab 3',
      route: 'notation map',
      concept: 'Tab 3 answers “what are σ and τ?” before asking whether a pipe passes. It keeps generic mechanics separate from pipe-specific code categories.',
      piping: 'In real process piping, pressure creates hoop and axial components; weight and supports contribute longitudinal/bending effects; thermal/support movement creates displacement range; events are checked separately.',
      b313: 'Initial map only: 304 pressure design, 302.3.5 sustained/displacement categories, 302.3.6 occasional, 319 flexibility, Appendix D/B31J SIF/flexibility where applicable. Verify exact wording in the licensed project edition.',
      mistake: 'Do not claim B31.3 compliance from this tab. It has no pipe size, thickness, material, temperature, pressure case, SIF, support layout, or allowable-stress table lookup.',
      next: 'Next rollout should add the same full-width learning layer to Pipe Stress, because that tab introduces σθ, σL, radial concept, bending, and τt.',
    },
  ];
}
