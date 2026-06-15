import { useState } from 'react';
import { COLORS, LabState, Status } from '../model/types';
import { SvgDefs } from './SvgDefs';

type StressPanelProps = { state: LabState; status: Status };
type Point = { x: number; y: number };
type StressLearningHelper = { title: string; route: string; concept: string; piping: string; b313: string; sources: string };
type StressDerived = {
  sigmaAvg: number;
  radius: number;
  sigma1: number;
  sigma2: number;
  tauMax: number;
  vonMises: number;
  principalAngleDeg: number;
};

function pct(value: number) {
  return `${Math.round(value)}%`;
}

function num(value: number) {
  return value.toFixed(1).replace(/\.0$/, '');
}

function mid(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function stressDerived(state: LabState): StressDerived {
  const sx = state.sigmaX;
  const sy = state.sigmaY;
  const t = state.tauXY;
  const sigmaAvg = (sx + sy) / 2;
  const halfDiff = (sx - sy) / 2;
  const radius = Math.sqrt(halfDiff * halfDiff + t * t);
  const sigma1 = sigmaAvg + radius;
  const sigma2 = sigmaAvg - radius;
  const tauMax = radius;
  const vonMises = Math.sqrt(Math.max(0, sx * sx - sx * sy + sy * sy + 3 * t * t));
  const principalAngleDeg = 0.5 * Math.atan2(2 * t, sx - sy) * 180 / Math.PI;
  return { sigmaAvg, radius, sigma1, sigma2, tauMax, vonMises, principalAngleDeg };
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
    stroke="rgba(6,16,29,.88)"
    strokeWidth="3"
    strokeLinejoin="round"
    paintOrder="stroke fill"
    fontSize={size}
    fontWeight="900"
    fontFamily="Arial, Helvetica, sans-serif"
    opacity="1"
  >{text}</text>;
}

function StressLegend({ state }: { state: LabState }) {
  const showNormal = state.stressView === 'normal' || state.stressView === 'combined';
  const showShear = state.stressView === 'shear' || state.stressView === 'combined';
  const d = stressDerived(state);
  const y = 286;

  if (showNormal && !showShear) {
    return <g>
      <SvgLabel x={122} y={y} text={`σx ${pct(state.sigmaX)}`} fill={state.sigmaX >= 67 ? COLORS.orange : COLORS.blue} />
      <SvgLabel x={260} y={y} text={`σy ${pct(state.sigmaY)}`} fill={state.sigmaY >= 67 ? COLORS.orange : COLORS.blue} />
      <SvgLabel x={370} y={y} text={`σ1 ${pct(d.sigma1)}`} fill={COLORS.yellow} />
    </g>;
  }

  if (showShear && !showNormal) {
    return <g>
      <SvgLabel x={160} y={y} text={`τxy ${pct(state.tauXY)}`} fill={state.tauXY >= 67 ? COLORS.purple : COLORS.cyan} />
      <SvgLabel x={306} y={y} text={`τmax ${pct(d.tauMax)}`} fill={COLORS.yellow} />
    </g>;
  }

  return <g>
    <SvgLabel x={86} y={y} text={`σx ${pct(state.sigmaX)}`} fill={state.sigmaX >= 67 ? COLORS.orange : COLORS.blue} />
    <SvgLabel x={178} y={y} text={`σy ${pct(state.sigmaY)}`} fill={state.sigmaY >= 67 ? COLORS.orange : COLORS.blue} />
    <SvgLabel x={270} y={y} text={`τxy ${pct(state.tauXY)}`} fill={state.tauXY >= 67 ? COLORS.purple : COLORS.cyan} />
    <SvgLabel x={382} y={y} text={`σ1 ${pct(d.sigma1)}`} fill={COLORS.yellow} />
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
  const d = stressDerived(state);

  return <svg viewBox="0 0 460 340" role="img" aria-label="Plane-stress components at a point with conceptual exaggerated shape response">
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

    <SvgLabel x={230} y={35} text="Plane-stress components at a point" fill={status.color} size={14} />
    <SvgLabel x={230} y={54} text={`derived: σ1 ${pct(d.sigma1)} · σ2 ${pct(d.sigma2)} · τmax ${pct(d.tauMax)}`} fill="rgba(216,237,255,.78)" size={11} />
    <StressLegend state={state} />
    <SvgLabel x={230} y={323} text="derived quantities use the teaching percent scale; not a pipe-code acceptance check" fill="rgba(216,237,255,.72)" size={10} />
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
    <path d={`M${leftMid.x - 10} ${leftMid.y - 18} L${leftMid.x - 10} ${leftMid.y + 18} M${rightMid.x + 10} ${rightMid.y - 18} L${rightMid.x + 10} ${rightMid.y + 18}`} stroke={xStroke} strokeWidth="2.2" strokeLinecap="round" />
    <path d={`M${leftMid.x - 10} ${leftMid.y} L${leftMid.x - 32} ${leftMid.y}`} stroke={xStroke} strokeWidth="2.2" strokeLinecap="round" markerEnd="url(#arrow)" />
    <path d={`M${rightMid.x + 10} ${rightMid.y} L${rightMid.x + 32} ${rightMid.y}`} stroke={xStroke} strokeWidth="2.2" strokeLinecap="round" markerEnd="url(#arrow)" />
    <SvgLabel x={38} y={leftMid.y - 4} text="σx" fill={xStroke} anchor="end" size={11} />
    <SvgLabel x={38} y={leftMid.y + 10} text="x-face" fill={xStroke} anchor="end" size={10} />

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
    <SvgLabel x={230} y={72} text="shear pair balances moment" fill={stroke} size={11} />

    {showPairs && <>
      <path d={`M${rightMid.x + 18} ${rightMid.y - len * .65} L${rightMid.x + 18} ${rightMid.y + len * .65}`} stroke={stroke} strokeWidth="2.35" strokeLinecap="round" markerEnd="url(#arrow)" />
      <path d={`M${leftMid.x - 18} ${leftMid.y + len * .65} L${leftMid.x - 18} ${leftMid.y - len * .65}`} stroke={stroke} strokeWidth="2.35" strokeLinecap="round" markerEnd="url(#arrow)" />
      <SvgLabel x={392} y={229} text="τyx pair" fill={stroke} anchor="end" />
    </>}
  </g>;
}

export function StressComponentExplanation({ state }: { state: LabState }) {
  const d = stressDerived(state);
  const modeTitle = state.stressView === 'normal' ? 'Normal stress mode' : state.stressView === 'shear' ? 'Shear stress mode' : 'Combined plane-stress state';
  const modeCopy = state.stressView === 'normal'
    ? 'Normal stress acts perpendicular to a selected cut plane. This view separates σx and σy before any pipe-coordinate or code-category interpretation.'
    : state.stressView === 'shear'
      ? 'Shear stress acts parallel to a cut plane. τxy and τyx are shown as a companion pair for static moment equilibrium of a small element.'
      : 'Combined mode shows σx, σy, and τxy together, then derives principal stress and maximum in-plane shear on the same teaching scale.';

  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.blue }}>plane stress basis</span>
    <h3 className="result-title">{modeTitle}</h3>
    <p className="copy">{modeCopy}</p>
    <div className="table">
      {(state.stressView === 'normal' || state.stressView === 'combined') && <>
        <div><span>σx</span><b>{pct(state.sigmaX)} · normal on x-face</b></div>
        <div><span>σy</span><b>{pct(state.sigmaY)} · normal on y-face</b></div>
      </>}
      {(state.stressView === 'shear' || state.stressView === 'combined') && <div><span>τxy</span><b>{pct(state.tauXY)} · shear on x-face in y direction</b></div>}
      <div><span>Principal stress</span><b>σ1 {pct(d.sigma1)} · σ2 {pct(d.sigma2)}</b></div>
      <div><span>Max in-plane shear</span><b>τmax {pct(d.tauMax)} at radius of Mohr circle</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}><b>Important boundary</b><span className="copy">The derived values are mechanics teaching values on the slider scale. They are not pipe stress allowables, not SIF-applied local stresses, and not a B31.3 acceptance result.</span></div>
  </div>;
}

export function StressTensorCard({ state }: { state: LabState }) {
  const d = stressDerived(state);

  if (!state.showTensor) {
    return <div className="interp stress-readout">
      <span className="badge" style={{ color: COLORS.cyan }}>tensor hidden</span>
      <h3 className="result-title">Tensor card is optional</h3>
      <p className="copy">Enable “show tensor matrix” to connect the graphic to 2D plane-stress notation, principal stress, and Mohr-circle background.</p>
      <div className="bucket"><b>Why optional?</b><span className="copy">The first objective is visual: perpendicular normal stress versus parallel shear stress. The tensor adds the derived mechanics layer.</span></div>
    </div>;
  }

  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.cyan }}>symmetric stress tensor</span>
    <h3 className="result-title">2D stress state notation</h3>
    <div className="tensor-card" aria-label="Plane stress tensor matrix">
      <span>[</span>
      <div className="tensor-grid">
        <b>σx</b><b>τxy</b>
        <b>τyx</b><b>σy</b>
      </div>
      <span>]</span>
    </div>
    <p className="copy">For a classical small element without body couples, shear symmetry is shown as τxy = τyx. The panel now derives principal values from the same tensor.</p>
    <div className="table">
      <div><span>Matrix value</span><b>[{pct(state.sigmaX)}, {pct(state.tauXY)}; {pct(state.tauXY)}, {pct(state.sigmaY)}]</b></div>
      <div><span>Center / radius</span><b>σavg {pct(d.sigmaAvg)} · R {pct(d.radius)}</b></div>
      <div><span>Principal stresses</span><b>σ1 {pct(d.sigma1)} · σ2 {pct(d.sigma2)}</b></div>
      <div><span>θp</span><b>{num(d.principalAngleDeg)}° from x-face orientation</b></div>
      <div><span>VM background</span><b>σv {pct(d.vonMises)} · educational only</b></div>
    </div>
  </div>;
}

export function StressEngineeringNote({ state }: { state: LabState }) {
  const d = stressDerived(state);

  return <>
    <div className="interp stress-readout">
      <span className="badge" style={{ color: COLORS.yellow }}>route boundary</span>
      <h3 className="result-title">Local tensor first, pipe category later</h3>
      <p className="copy">This tab defines local stress components and derived mechanics quantities. It deliberately stops before pipe-specific notation, load-case routing, SIFs, and code acceptance.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">1</b><span><b>Component basis</b><br/><span className="copy">σx and σy are normal stresses. τxy is shear. The coordinate system and cut plane must be known before the component name has engineering meaning.</span></span></div>
        <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">2</b><span><b>Derived values</b><br/><span className="copy">σ1 = {pct(d.sigma1)}, σ2 = {pct(d.sigma2)}, τmax = {pct(d.tauMax)}, and σv = {pct(d.vonMises)} on the teaching scale.</span></span></div>
        <div className="card" style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}><b className="stepNo">3</b><span><b>Pipe route not automatic</b><br/><span className="copy">Hoop, longitudinal, bending, torsion, pressure design, sustained, occasional, and displacement stress range are handled in later tabs.</span></span></div>
      </div>
      {state.showSignConvention && <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}><b>Graphic convention</b><span className="copy">Positive normal stress is drawn as tensile/separating. Positive τxy is drawn as the top face shearing to the right with a balancing shear pair.</span></div>}
    </div>
    <StressLearningBar state={state} />
  </>;
}

function StressLearningBar({ state }: { state: LabState }) {
  const helpers = stressHelpers(state);
  const [active, setActive] = useState<string>(helpers[0]?.title ?? 'Component boundary');
  const selected = helpers.find(helper => helper.title === active) ?? helpers[0];

  return <div
    aria-label="Tab 3 engineering key points"
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
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, paddingRight: 6, color: '#52f0df', fontWeight: 950, letterSpacing: '.08em', textTransform: 'uppercase', fontSize: 11 }}>ⓘ Tab 3 engineering layer</span>
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
        Boundary: mechanics only, not B31.3 pass/fail
      </span>
    </div>

    {selected && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8, alignItems: 'stretch' }}>
      <LearningCell title={`Concept · ${selected.route}`} text={selected.concept} color="#52f0df" />
      <LearningCell title="Piping" text={selected.piping} color="#55b8ff" />
      <LearningCell title="B31.3 map" text={selected.b313} color="#ffd75b" />
      <LearningCell title="Sources" text={selected.sources} color="#b884ff" />
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
  if (title.includes('Component')) return 'σ/τ';
  if (title.includes('Principal')) return 'σ1';
  if (title.includes('Shear')) return 'τ';
  if (title.includes('Tensor')) return '[σ]';
  return '§';
}

function stressShortFor(title: string) {
  return title
    .replace('Component boundary', 'Boundary')
    .replace('Principal stress and Mohr radius', 'Principal')
    .replace('Shear pair and equilibrium', 'Shear pair')
    .replace('B31.3 lens for Tab 3', 'B31.3');
}

function stressHelpers(state: LabState): StressLearningHelper[] {
  const d = stressDerived(state);
  const showing = state.stressView === 'normal'
    ? 'normal-stress view'
    : state.stressView === 'shear'
      ? 'shear-stress view'
      : 'combined plane-stress view';

  return [
    {
      title: 'Component boundary',
      route: showing,
      concept: 'This tab is a local 2D Cartesian stress element. σx and σy are normal stresses on x/y faces; τxy is shear on the x-face in the y-direction.',
      piping: 'A piping model may resolve local components, but engineers normally route results by physical source: pressure containment, sustained weight, occasional event, displacement range, support reaction, or nozzle load.',
      b313: 'Do not route B31.3 checks directly from generic σx/σy/τxy. First identify design condition, load source, pipe coordinate, component geometry, and applicable stress category.',
      sources: 'Strength-of-materials plane-stress theory; licensed ASME B31.3 and owner specifications for final route and wording.'
    },
    {
      title: 'Principal stress and Mohr radius',
      route: `σ1 ${pct(d.sigma1)} · σ2 ${pct(d.sigma2)}`,
      concept: 'Principal stresses are the normal stresses on rotated planes where in-plane shear becomes zero. The radius equals maximum in-plane shear on this teaching scale.',
      piping: 'Principal stress is useful mechanics background, but piping reports usually require category-specific quantities such as hoop, longitudinal, bending, torsional shear, and displacement stress range.',
      b313: 'Use principal/VM/Tresca ideas as background only until the Combined tab. B31.3 paragraph routing still starts from pressure, sustained, occasional, or displacement/flexibility logic.',
      sources: 'Classical stress transformation and Mohr circle references; project code edition for acceptance rules.'
    },
    {
      title: 'Shear pair and equilibrium',
      route: `τxy ${pct(state.tauXY)} · τmax ${pct(d.tauMax)}`,
      concept: 'For the classical small element used here, the companion shear τyx is shown with τxy so the element satisfies moment equilibrium.',
      piping: 'Torsion, restraints, branch details, and local discontinuities can create shear-related effects, but the route depends on the load case and pipe detail.',
      b313: 'Shear contribution may enter sustained, occasional, expansion/displacement, torsion, or local/SIF assessment depending on the physical source. Do not label it by symbol alone.',
      sources: 'Statics/stress-element equilibrium; pipe-stress software and B31.3 project notes for how torsion/local effects are reported.'
    },
    {
      title: 'Tensor card',
      route: state.showTensor ? 'visible' : 'hidden',
      concept: 'The tensor card groups the local plane-stress terms and makes stress transformation, principal stress, Mohr circle, and equivalent-stress teaching possible.',
      piping: 'Software may combine components internally, but the engineer still has to read the correct physical route and whether a local detail requires SIF/flexibility or separate evaluation.',
      b313: 'Tensor notation is mechanics background. Code mapping still needs pipe size, wall, material, temperature, load case, SIF/flexibility treatment, support/nozzle context, and allowables.',
      sources: 'Mechanics of materials for tensor notation; licensed B31.3, B31J/project basis, and owner specifications for project acceptance.'
    },
    {
      title: 'B31.3 lens for Tab 3',
      route: 'notation before equation',
      concept: 'Tab 3 answers “what are σ and τ?” before asking whether a pipe passes. It separates generic mechanics from pipe-specific cylindrical notation and code categories.',
      piping: 'Pressure creates hoop/longitudinal effects; weight and supports create longitudinal/bending effects; thermal/support movement creates displacement range; events are checked separately.',
      b313: 'Initial map only: pressure design → 304; sustained/displacement categories → 302.3.5 family; occasional → 302.3.6; flexibility → 319; supports/materials/allowables → 321/323/Appendix A. Verify licensed edition.',
      sources: 'Licensed ASME B31.3 project edition controls final wording; public mechanics references are background only.'
    },
  ];
}
