import type { ReactNode } from 'react';
import { LabState, Status } from '../model/types';
import { allowableStressRangePercent, logCycles } from '../model/fatigueModel';

type LocalProps = { state: LabState; status: Status };

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

export function LocalViewSvg({ state, status }: LocalProps) {
  if (state.mode === 'fatigue') return <FatigueHotspotZoom state={state} status={status} />;

  const key = `${state.material}-${state.staticDemand}`;
  if (key === 'ductile-tension') return <PipeSectionDuctileTension state={state} status={status} />;
  if (key === 'ductile-compression') return <PipeSectionDuctileCompression state={state} status={status} />;
  if (key === 'brittle-tension') return <PipeSectionBrittleTension state={state} status={status} />;
  return <PipeSectionBrittleCompression state={state} status={status} />;
}

function PipeSectionDuctileTension({ state, status }: LocalProps) {
  const p = state.staticLoad / 100;
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  return <LocalFrame label="Ductile tension pipe wall cross-section">
    <text x="210" y="48" textAnchor="middle" className="muted">pipe wall cross-section · axial tensile demand through wall</text>
    <PipeRing />
    <StressTicks color="#55b8ff" mode="tension" />
    {med && <path d={annularArc(210, 182, 96, 52, -30, 210)} fill="rgba(255,158,58,.28)" stroke="#ff9e3a" strokeWidth="2" />}
    {high && <>
      <ellipse cx="210" cy="182" rx={82 + 10 * p} ry={88 - 10 * p} fill="none" stroke="rgba(255,158,58,.75)" strokeWidth="4" strokeDasharray="10 7" />
      <path d="M134 154 C160 176 160 188 134 210 M286 154 C260 176 260 188 286 210" className="neckLine" />
    </>}
    <Legend y="277" color={status.color} text={high ? 'ductile wall yields and thins locally before rupture' : med ? 'yield band spreads in the pipe wall' : 'uniform axial tensile stress in pipe wall'} />
    <text x="210" y="303" textAnchor="middle" className="muted">σ = F/A · axial stress acts through annular pipe-wall area</text>
  </LocalFrame>;
}

function PipeSectionDuctileCompression({ state, status }: LocalProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  return <LocalFrame label="Ductile compression pipe wall cross-section">
    <text x="210" y="48" textAnchor="middle" className="muted">pipe wall cross-section · axial compression response shown as local wall instability</text>
    <g transform={high ? 'translate(210 182) scale(1.10 .84) translate(-210 -182)' : med ? 'translate(210 182) scale(1.06 .91) translate(-210 -182)' : undefined}>
      <PipeRing />
    </g>
    <StressTicks color="#ff9e3a" mode="compression" />
    {med && <>
      <ellipse cx="210" cy="182" rx={high ? 118 : 102} ry={high ? 62 : 76} className="yield" />
      <path d="M132 142 C166 166 166 198 132 222 M210 110 C190 150 190 214 210 254 M288 142 C254 166 254 198 288 222" className="wrinkle" />
    </>}
    {high && <path d="M128 184 C164 126 256 240 296 180" className="collapseLine" />}
    <Legend y="277" color={status.color} text={high ? 'ductile pipe wall shows ovalization / local collapse tendency' : med ? 'plastic squash and wrinkle lines in wall' : 'steady compressive demand through pipe wall'} />
    <text x="210" y="303" textAnchor="middle" className="muted">compression may govern by yielding, ovalization, local buckling, or collapse</text>
  </LocalFrame>;
}

function PipeSectionBrittleTension({ state, status }: LocalProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  const showFlaw = state.flawEnabled || med;
  return <LocalFrame label="Brittle tension pipe wall cross-section">
    <text x="210" y="48" textAnchor="middle" className="muted">pipe wall cross-section · flaw opens normal to tensile stress</text>
    <PipeRing brittle />
    <StressTicks color="#ff4b64" mode="tension" />
    {showFlaw && <>
      <path d={high ? 'M210 88 L197 122 L216 154 L199 181 L218 214 L204 276' : 'M210 88 L202 122 L214 150 L204 182'} className={high ? 'crack glow' : 'crack'} />
      <path d="M184 116 C200 132 218 132 236 116" fill="none" stroke="rgba(255,75,100,.48)" strokeWidth="4" />
      <circle cx="210" cy="140" r={high ? 86 : 54} className="fractureFlash" />
    </>}
    {!showFlaw && <path d="M210 88 L210 118" className="notchGhost" />}
    <Legend y="277" color={status.color} text={high ? 'crack penetrates pipe wall with little plastic strain' : showFlaw ? 'principal tensile stress opens flaw/notch' : 'mostly elastic until a flaw becomes critical'} />
    <text x="210" y="303" textAnchor="middle" className="muted">brittle tensile failure is flaw/crack sensitive, not a long yielding process</text>
  </LocalFrame>;
}

function PipeSectionBrittleCompression({ state, status }: LocalProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  return <LocalFrame label="Brittle compression pipe wall cross-section">
    <text x="210" y="48" textAnchor="middle" className="muted">pipe wall cross-section · crushing / diagonal splitting under compression</text>
    <PipeRing brittle />
    <StressTicks color="#ff9e3a" mode="compression" />
    {med && <>
      <ellipse cx="272" cy="182" rx={high ? 58 : 42} ry={high ? 84 : 62} className="crushHalo" />
      <path d="M250 105 L286 258 M286 108 L246 252 M306 138 L270 270" className="crack" />
      <path d="M286 116 L318 92 L310 132 M276 256 L302 284 L260 276" className="fragment" />
    </>}
    <Legend y="277" color={status.color} text={high ? 'crushed wall sector with diagonal split planes' : med ? 'splitting begins in compressed brittle wall' : 'compression response without tensile necking'} />
    <text x="210" y="303" textAnchor="middle" className="muted">correct compression visual: crush/split/instability, not tensile crack opening</text>
  </LocalFrame>;
}

function FatigueHotspotZoom({ state, status }: LocalProps) {
  const logN = logCycles(state.fatigueCyclesSlider);
  const allow = allowableStressRangePercent(logN);
  const rangeRatio = state.fatigueStressRange / Math.max(allow, 1);
  const cycleRatio = state.fatigueCyclesSlider / 100;
  const materialFactor = state.material === 'brittle' ? 1.18 : 1.0;
  const notchFactor = state.notchEnabled ? 1.0 : 0.28;
  const severity = clamp((0.48 * rangeRatio + 0.52 * cycleRatio) * notchFactor * materialFactor, 0, 1);
  const crack = state.notchEnabled ? 8 + severity * 74 : 0;
  const halo = 24 + severity * 88;
  const point = rangeRatio > 1 ? 'above conceptual S-N boundary' : rangeRatio > 0.82 ? 'near conceptual S-N boundary' : 'below conceptual S-N boundary';

  return <LocalFrame label="Fatigue hotspot zoom at weld toe / notch">
    <text x="210" y="42" textAnchor="middle" className="muted">magnified pipe weld toe / notch · crack grows from local stress concentration</text>

    <path d="M58 212 H360" stroke="rgba(216,231,242,.78)" strokeWidth="30" strokeLinecap="round" />
    <path d="M58 212 H360" stroke="#06101d" strokeWidth="12" strokeLinecap="round" opacity=".82" strokeDasharray="14 12" />
    <rect x="190" y="178" width="22" height="68" rx="8" className="weldBand" />
    <path d="M192 180 C174 160 152 152 124 156 M210 180 C232 156 260 150 294 158" className="weldProfile" />

    <path d="M204 180 C236 118 288 84 346 76" className="calloutLine" />
    <circle cx="346" cy="76" r="58" className="magnifier" />
    <path d="M302 88 H388" stroke="rgba(216,231,242,.78)" strokeWidth="18" strokeLinecap="round" />
    <path d="M326 88 C337 59 364 58 374 88" className="weldToe" />
    <path d="M341 87 l-10 16" stroke="#ffd75b" strokeWidth="4" strokeLinecap="round" />

    {state.notchEnabled && <>
      <circle cx="341" cy="88" r={halo * 0.55} className="hotspotHalo" />
      <path d={`M341 88 C${330 - crack * .12} ${102 + crack * .10}, ${360 + crack * .15} ${116 + crack * .22}, ${332 - crack * .10} ${134 + crack * .30}`} className="microCrack glow" />
      <circle cx="341" cy="88" r="6" fill="#ffd75b" stroke="#06101d" strokeWidth="3" />
    </>}
    {!state.notchEnabled && <>
      <circle cx="341" cy="88" r="22" className="hotspotHalo mutedHalo" />
      <path d="M341 88 l-7 12" className="microCrackGhost" />
    </>}

    <path d="M66 112 C116 90 162 90 210 112 C258 134 304 134 354 112" className="fatigueWave" />
    <text x="210" y="278" textAnchor="middle" className="caseLabel" fill={status.color}>{state.notchEnabled ? `hotspot severity uses Δσ/allowable + cycles: ${point}` : 'hotspot hidden: only cyclic stress range is shown'}</text>
    <text x="210" y="303" textAnchor="middle" className="muted">fatigue depends on Δσ, N, weld/notch detail and environment; not a brittle-only effect</text>
  </LocalFrame>;
}

function PipeRing({ brittle = false }: { brittle?: boolean }) {
  return <g>
    <path d="M210 182 m -100 0 a100 100 0 1 0 200 0 a100 100 0 1 0 -200 0 M210 182 m -54 0 a54 54 0 1 1 108 0 a54 54 0 1 1 -108 0" fill={brittle ? 'url(#localBrittle)' : 'url(#localDuctile)'} fillRule="evenodd" stroke="rgba(235,247,255,.78)" strokeWidth="3" />
    <circle cx="210" cy="182" r="54" fill="rgba(6,16,29,.92)" stroke="rgba(190,220,255,.18)" strokeWidth="2" />
    <circle cx="210" cy="182" r="100" fill="none" stroke="rgba(255,255,255,.20)" strokeWidth="2" />
    <text x="210" y="187" textAnchor="middle" className="muted">bore</text>
  </g>;
}

function StressTicks({ color, mode }: { color: string; mode: 'tension' | 'compression' }) {
  const data = [
    [210, 70, 210, 104], [210, 294, 210, 260], [98, 182, 132, 182], [322, 182, 288, 182],
    [130, 102, 154, 126], [290, 102, 266, 126], [130, 262, 154, 238], [290, 262, 266, 238],
  ];
  return <g opacity=".88">
    {data.map(([x1, y1, x2, y2], i) => {
      const inward = mode === 'compression';
      const a = inward ? [x1, y1, x2, y2] : [x2, y2, x1, y1];
      return <path key={i} d={`M${a[0]} ${a[1]} L${a[2]} ${a[3]}`} stroke={color} strokeWidth="4" strokeLinecap="round" markerEnd={`url(#tickArrow${mode === 'compression' ? 'Orange' : color === '#ff4b64' ? 'Red' : 'Blue'})`} />;
    })}
  </g>;
}

function annularArc(cx: number, cy: number, ro: number, ri: number, a0: number, a1: number) {
  const p = (r: number, a: number) => {
    const rad = (a - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [x1, y1] = p(ro, a0);
  const [x2, y2] = p(ro, a1);
  const [x3, y3] = p(ri, a1);
  const [x4, y4] = p(ri, a0);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${x1} ${y1} A${ro} ${ro} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${ri} ${ri} 0 ${large} 0 ${x4} ${y4} Z`;
}

function Legend({ y, color, text }: { y: string; color: string; text: string }) {
  return <text x="210" y={y} textAnchor="middle" className="caseLabel" fill={color}>{text}</text>;
}

function LocalFrame({ children, label }: { children: ReactNode; label: string }) {
  return <svg viewBox="0 0 420 330" role="img" aria-label={label}>
    <Defs />
    <rect x="12" y="14" width="396" height="300" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M42 84H378 M42 182H378 M42 278H378 M126 38V292 M210 38V292 M294 38V292" stroke="rgba(216,237,255,.055)" />
    {children}
  </svg>;
}

function Defs() {
  return <defs>
    <linearGradient id="localDuctile" x1="0" x2="1"><stop offset="0" stopColor="#728ba2"/><stop offset=".5" stopColor="#eef7ff"/><stop offset="1" stopColor="#6d8399"/></linearGradient>
    <linearGradient id="localBrittle" x1="0" x2="1"><stop offset="0" stopColor="#8d98a4"/><stop offset=".5" stopColor="#dce7f2"/><stop offset="1" stopColor="#777f8a"/></linearGradient>
    <radialGradient id="hotspot" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="rgba(255,75,100,.52)"/><stop offset=".72" stopColor="rgba(255,158,58,.18)"/><stop offset="1" stopColor="rgba(255,158,58,0)"/></radialGradient>
    <marker id="tickArrowBlue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#55b8ff"/></marker>
    <marker id="tickArrowRed" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ff4b64"/></marker>
    <marker id="tickArrowOrange" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ff9e3a"/></marker>
  </defs>;
}