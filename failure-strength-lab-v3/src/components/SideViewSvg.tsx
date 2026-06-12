import type { ReactNode } from 'react';
import { LabState, Status } from '../model/types';
import { allowableStressRangePercent, logCycles } from '../model/fatigueModel';

type SideProps = { state: LabState; status: Status };

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

export function SideViewSvg({ state, status }: SideProps) {
  if (state.mode === 'fatigue') return <FatigueSideView state={state} status={status} />;

  const key = `${state.material}-${state.staticDemand}`;
  if (key === 'ductile-tension') return <DuctileTensionView state={state} status={status} />;
  if (key === 'ductile-compression') return <DuctileCompressionView state={state} status={status} />;
  if (key === 'brittle-tension') return <BrittleTensionView state={state} status={status} />;
  return <BrittleCompressionView state={state} status={status} />;
}

function DuctileTensionView({ state, status }: SideProps) {
  const p = state.staticLoad / 100;
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  // Cap elongation so grips don't go off-canvas and neck stays positive.
  const elong = Math.min(34 * p, 28);
  const neck = high ? 22 : med ? 10 : 0;
  const leftGrip = Math.max(30, 52 - elong);
  const rightGrip = Math.min(608, 588 + elong);
  const specimenPath = `M126 170 C188 166 220 ${178 + neck * 0.3} 268 ${183 + neck} C306 ${189 + neck * 0.45} 334 ${189 + neck * 0.45} 372 ${183 + neck} C420 ${178 + neck * 0.3} 452 166 514 170 L514 250 C452 254 420 ${242 - neck * 0.3} 372 ${237 - neck} C334 ${231 - neck * 0.45} 306 ${231 - neck * 0.45} 268 ${237 - neck} C220 ${242 - neck * 0.3} 188 254 126 250 Z`;

  return <SvgFrame label="Ductile tension side view">
    {/* Tension: arrows point away from specimen */}
    <ForceArrow x1="142" y1="76" x2="64" y2="76" color="blue" dir="out" />
    <ForceArrow x1="498" y1="76" x2="576" y2="76" color="blue" dir="out" />
    <Grip x={leftGrip} label="grip" />
    <Grip x={rightGrip - 42} label="grip" />
    <path d={specimenPath} className="specimen ductile" />
    <path d="M168 188H246 M394 188H472 M168 232H246 M394 232H472" className="gaugeMarks" />
    {med && <ellipse cx="320" cy="210" rx={high ? 82 : 64} ry={high ? 36 : 44} className="yield" />}
    {high && <>
      <path d="M294 175 C302 194 300 225 292 246 M348 175 C340 194 342 225 350 246" className="neckLine" />
      <text x="320" y="292" textAnchor="middle" className="caseLabel" fill={status.color}>necking + plastic deformation</text>
    </>}
    {!high && <text x="320" y="292" textAnchor="middle" className="caseLabel" fill={status.color}>{med ? 'yield band appears before rupture' : 'elastic stretch, returns when unloaded'}</text>}
    <text x="320" y="328" textAnchor="middle" className="muted">same tensile demand; ductile response gives visible deformation warning</text>
  </SvgFrame>;
}

function DuctileCompressionView({ state, status }: SideProps) {
  const p = state.staticLoad / 100;
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  // Cap squeeze so body width stays positive.
  const squeeze = Math.min(28 * p, 24);
  const bulge = high ? 28 : med ? 16 : 2;
  const leftPlate = 78 + squeeze;
  const rightPlate = 516 - squeeze;
  const bodyPath = `M${leftPlate + 45} 174 C210 ${164 - bulge * 0.25} 254 ${161 - bulge} 320 ${166 - bulge * 0.65} C386 ${161 - bulge} 430 ${164 - bulge * 0.25} ${rightPlate - 45} 174 L${rightPlate - 45} 248 C430 ${258 + bulge * 0.25} 386 ${262 + bulge} 320 ${256 + bulge * 0.65} C254 ${262 + bulge} 210 ${258 + bulge * 0.25} ${leftPlate + 45} 248 Z`;

  return <SvgFrame label="Ductile compression side view">
    {/* Compression: arrows point inward toward specimen */}
    <ForceArrow x1="64" y1="76" x2="150" y2="76" color="orange" dir="in" />
    <ForceArrow x1="576" y1="76" x2="490" y2="76" color="orange" dir="in" />
    <CompressionPlate x={leftPlate} />
    <CompressionPlate x={rightPlate - 26} />
    <path d={bodyPath} className="specimen ductile" />
    {med && <>
      <path d="M236 178 C256 196 256 226 236 246 M320 166 C302 188 302 236 320 256 M404 178 C384 196 384 226 404 246" className="wrinkle" />
      <ellipse cx="320" cy="211" rx={high ? 116 : 90} ry={high ? 64 : 48} className="yield" />
    </>}
    {high && <path d="M220 190 C270 158 370 260 420 228" className="collapseLine" />}
    <text x="320" y="292" textAnchor="middle" className="caseLabel" fill={status.color}>{high ? 'local collapse / buckling tendency' : med ? 'barreling and wrinkle zone' : 'shortening under steady compression'}</text>
    <text x="320" y="328" textAnchor="middle" className="muted">compression should look like squash/wrinkle, not tensile necking</text>
  </SvgFrame>;
}

function BrittleTensionView({ state, status }: SideProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  const showFlaw = state.flawEnabled || med;
  const gap = high ? 30 : 0;

  return <SvgFrame label="Brittle tension side view">
    <ForceArrow x1="142" y1="76" x2="64" y2="76" color="blue" dir="out" />
    <ForceArrow x1="498" y1="76" x2="576" y2="76" color="blue" dir="out" />
    <Grip x={58} label="grip" />
    <Grip x={540} label="grip" />
    <path d={`M126 180H${316 - gap} L${316 - gap} 240H126Z`} className="specimen brittle" />
    <path d={`M${324 + gap} 180H514V240H${324 + gap}Z`} className="specimen brittle" />
    {!high && <path d="M126 180H514V240H126Z" className="specimenEdge" />}
    {showFlaw && !high && <path d="M320 178 L309 202 L322 214 L312 242" className="crack" />}
    {high && <>
      <path d="M316 178 L296 202 L318 218 L302 242" className="crack glow" />
      <path d="M324 178 L344 202 L322 218 L338 242" className="crack glow" />
      <circle cx="320" cy="210" r="74" className="fractureFlash" />
    </>}
    {!showFlaw && <text x="320" y="160" textAnchor="middle" className="muted">little visible strain before damage</text>}
    <text x="320" y="292" textAnchor="middle" className="caseLabel" fill={status.color}>{high ? 'crack opens suddenly' : showFlaw ? 'notch/crack starts opening' : 'mostly elastic: no large plastic warning'}</text>
    <text x="320" y="328" textAnchor="middle" className="muted">brittle tension: fracture-sensitive, especially with a flaw</text>
  </SvgFrame>;
}

function BrittleCompressionView({ state, status }: SideProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  const p = state.staticLoad / 100;
  const squeeze = 20 * p;
  const left = 130 + squeeze;
  const right = 510 - squeeze;

  return <SvgFrame label="Brittle compression side view">
    <ForceArrow x1="64" y1="76" x2="150" y2="76" color="orange" dir="in" />
    <ForceArrow x1="576" y1="76" x2="490" y2="76" color="orange" dir="in" />
    <CompressionPlate x={left - 46} />
    <CompressionPlate x={right + 20} />
    <rect x={left} y="170" width={right - left} height="88" rx="7" className="specimen brittle" />
    {med && <>
      <ellipse cx="320" cy="214" rx={high ? 130 : 92} ry={high ? 70 : 48} className="crushHalo" />
      <path d="M210 170 L305 258 M318 170 L430 258 M440 170 L354 258" className="crack" />
    </>}
    {high && <>
      <path d="M252 181 L228 158 L214 188 M408 246 L446 266 L438 231" className="fragment" />
      <circle cx="320" cy="214" r="80" className="fractureFlash" />
    </>}
    <text x="320" y="292" textAnchor="middle" className="caseLabel" fill={status.color}>{high ? 'crushing + diagonal splitting' : med ? 'splitting begins under compression' : 'little visible deformation'}</text>
    <text x="320" y="328" textAnchor="middle" className="muted">brittle compression: crush/split, not tensile necking</text>
  </SvgFrame>;
}

function FatigueSideView({ state, status }: SideProps) {
  const logN = logCycles(state.fatigueCyclesSlider);
  const allow = allowableStressRangePercent(logN);
  const rangeRatio = state.fatigueStressRange / Math.max(allow, 1);
  const cycleRatio = state.fatigueCyclesSlider / 100;
  const notchFactor = state.notchEnabled ? 1 : 0.28;
  const severity = clamp((0.58 * rangeRatio + 0.42 * cycleRatio) * notchFactor);
  const halo = state.notchEnabled ? 18 + severity * 40 : 14 + severity * 18;
  // amp drives the cyclic pipe wave – keep it bounded so paths don't exit the frame.
  const amp = 4 + Math.min(14, state.fatigueStressRange * 0.09);
  const pipeTop = `M82 ${196 - amp * 0.25} C172 ${184 - amp}, 245 ${184 - amp}, 320 ${198 - amp * 0.25} C412 ${212 + amp}, 502 ${212 + amp}, 570 ${200 + amp * 0.2}`;
  const pipeBottom = `M82 ${244 + amp * 0.2} C172 ${256 + amp}, 245 ${256 + amp}, 320 ${242 + amp * 0.25} C412 ${228 - amp}, 502 ${228 - amp}, 570 ${240 - amp * 0.2}`;
  const centreLine = `M82 220 C172 ${208 - amp}, 245 ${208 - amp}, 320 220 C412 ${232 + amp}, 502 ${232 + amp}, 570 220`;
  const ghostUp = `M82 ${214 - amp} C172 ${202 - amp}, 245 ${202 - amp}, 320 ${214 - amp} C412 ${226}, 502 ${226}, 570 ${216}`;
  const ghostDown = `M82 ${226 + amp} C172 ${238}, 245 ${238}, 320 ${226 + amp} C412 ${214 + amp}, 502 ${214 + amp}, 570 ${224 + amp}`;
  const modeText = !state.notchEnabled
    ? 'smooth detail: no weld/notch hotspot – lower fatigue sensitivity'
    : rangeRatio > 1 ? 'high Δσ: welded attachment toe is fatigue-critical'
    : rangeRatio > 0.82 ? 'near S-N boundary: hotspot must be watched'
    : 'low Δσ: hotspot shown, crack mechanism stays in local view';
  const hotspotLabel = state.notchEnabled ? 'weld toe / notch hotspot' : 'smooth pipe: lower concentration';

  return <SvgFrame label="Fatigue side view: ductile metallic pipe cyclic motion and welded attachment hotspot">
    <text x="320" y="50" textAnchor="middle" className="muted">ductile metallic pipe fatigue only: cyclic pipe motion creates Δσ at a welded attachment toe</text>

    <path d="M72 104 C122 78 178 78 228 104 C278 130 338 130 388 104 C438 78 510 78 568 104" className="fatigueWave" />
    <text x="320" y="82" textAnchor="middle" className="muted">brittle behavior is concept text only; no brittle S-N graphics are shown</text>

    <path d={ghostUp} fill="none" stroke="rgba(85,184,255,.22)" strokeWidth="5" strokeLinecap="round" strokeDasharray="9 8" />
    <path d={ghostDown} fill="none" stroke="rgba(255,158,58,.18)" strokeWidth="5" strokeLinecap="round" strokeDasharray="9 8" />
    <path d={pipeTop} className="pipeOuter fatPulse" fill="none" />
    <path d={pipeBottom} className="pipeOuter fatPulse" fill="none" />
    <path d={centreLine} className="pipeInner fatPulse" fill="none" />

    <path d="M76 174 V266 M570 174 V266" stroke="rgba(216,237,255,.18)" strokeWidth="5" strokeLinecap="round" />
    <path d="M96 186 C110 200 110 240 96 254 M550 186 C536 200 536 240 550 254" stroke="rgba(216,237,255,.18)" strokeWidth="3" fill="none" />

    <path d="M292 166 H392 V205 C362 214 326 214 292 205 Z" fill="rgba(216,237,255,.10)" stroke="rgba(216,237,255,.40)" strokeWidth="2" />
    <path d="M294 204 C316 194 340 194 363 204" className="weldProfile" />
    <path d="M364 204 C376 198 386 198 396 204" className="weldProfile" />
    <path d="M298 206 C308 220 380 220 392 206" stroke="rgba(255,215,91,.38)" strokeWidth="5" strokeLinecap="round" fill="none" />
    <text x="342" y="156" textAnchor="middle" className="muted">welded lug / branch detail</text>

    <circle cx="298" cy="206" r={halo} className={state.notchEnabled ? 'hotspotHalo' : 'hotspotHalo mutedHalo'} />
    <circle cx="298" cy="206" r="6" fill="#ffd75b" stroke="#06101d" strokeWidth="3" />
    <circle cx="392" cy="206" r={state.notchEnabled ? Math.max(16, halo * 0.72) : 12} className="hotspotHalo mutedHalo" />
    <circle cx="392" cy="206" r="4" fill="#ffd75b" stroke="#06101d" strokeWidth="2" />
    {state.notchEnabled && severity > 0.45 && <path d="M298 206 l-10 16" className="microCrack glow" />}
    <text x="438" y="208" className="muted">{hotspotLabel}</text>

    <CyclicArrow x1={170} y1={150} x2={220} y2={128} color="blue" />
    <CyclicArrow x1={470} y1={292} x2={420} y2={314} color="orange" />
    <text x="184" y="123" className="muted">cycle A</text>
    <text x="426" y="330" className="muted">cycle B</text>

    <path d="M298 206 C250 276 204 302 158 318" className="calloutLine" />
    <g transform="translate(78 306)">
      <circle cx="0" cy="0" r="6" fill="#52f0df" /><text x="14" y="4" className="muted">1 cyclic displacement / vibration</text>
      <circle cx="230" cy="0" r="6" fill="#ffd75b" /><text x="244" y="4" className="muted">2 stress raiser at weld toe</text>
    </g>
    <text x="320" y="342" textAnchor="middle" className="caseLabel" fill={status.color}>{modeText}</text>
  </SvgFrame>;
}

function SvgFrame({ children, label }: { children: ReactNode; label: string }) {
  return <svg viewBox="0 0 640 370" role="img" aria-label={label}>
    <Defs />
    <rect x="14" y="18" width="612" height="330" rx="30" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M52 116H588 M52 210H588 M52 304H588 M160 48V334 M320 48V334 M480 48V334" stroke="rgba(216,237,255,.06)" />
    {children}
  </svg>;
}

function Grip({ x, label }: { x: number; label: string }) {
  return <g>
    <rect x={x} y="146" width="54" height="128" rx="12" className="grip" />
    <path d={`M${x + 13} 162V258 M${x + 27} 162V258 M${x + 41} 162V258`} stroke="rgba(255,255,255,.18)" strokeWidth="3" />
    <text x={x + 27} y="137" textAnchor="middle" className="muted">{label}</text>
  </g>;
}

function CompressionPlate({ x }: { x: number }) {
  return <g>
    <rect x={x} y="128" width="28" height="166" rx="8" className="plate" />
    <path d={`M${x + 8} 146H${x + 20} M${x + 8} 170H${x + 20} M${x + 8} 194H${x + 20} M${x + 8} 218H${x + 20} M${x + 8} 242H${x + 20} M${x + 8} 266H${x + 20}`} stroke="rgba(255,255,255,.18)" strokeWidth="3" />
  </g>;
}

/**
 * ForceArrow – dir controls arrowhead placement:
 *   'out' = arrowhead at x2,y2 end (tensile: arrow tip points away from specimen)
 *   'in' = arrowhead at x1,y1 end (compressive: arrow tip points toward specimen)
 * We achieve 'in' by drawing the path from x2→x1 so markerEnd is at x1,y1.
 */
function ForceArrow({
  x1, y1, x2, y2, color, dir = 'out',
}: {
  x1: string; y1: string; x2: string; y2: string;
  color: 'blue' | 'orange';
  dir?: 'in' | 'out';
}) {
  const marker = color === 'orange' ? 'arrowOrange' : 'arrow';
  const cls = color === 'orange' ? 'forceArrow orange' : 'forceArrow blue';
  // For 'in' (compression) flip the path direction so the arrowhead ends at the specimen side.
  const d = dir === 'in'
    ? `M${x2} ${y2} L${x1} ${y1}`
    : `M${x1} ${y1} L${x2} ${y2}`;
  return <path className={cls} d={d} markerEnd={`url(#${marker})`} />;
}

function CyclicArrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: 'blue' | 'orange' }) {
  const marker = color === 'orange' ? 'arrowOrange' : 'arrow';
  const stroke = color === 'orange' ? '#ff9e3a' : '#55b8ff';
  return <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={stroke} strokeWidth="4" strokeLinecap="round" fill="none" markerEnd={`url(#${marker})`} opacity=".86" />;
}

function Defs() {
  return <defs>
    <linearGradient id="specimenDuctile" x1="0" x2="1"><stop offset="0" stopColor="#6f879f"/><stop offset=".48" stopColor="#eef7ff"/><stop offset="1" stopColor="#6d849a"/></linearGradient>
    <linearGradient id="specimenBrittle" x1="0" x2="1"><stop offset="0" stopColor="#8b96a2"/><stop offset=".52" stopColor="#dfe8f2"/><stop offset="1" stopColor="#727b85"/></linearGradient>
    <linearGradient id="pipeStroke" x1="0" x2="1"><stop offset="0" stopColor="#5d758e"/><stop offset=".5" stopColor="#e8f7ff"/><stop offset="1" stopColor="#607993"/></linearGradient>
    <radialGradient id="hotspot" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="rgba(255,75,100,.52)"/><stop offset=".72" stopColor="rgba(255,158,58,.18)"/><stop offset="1" stopColor="rgba(255,158,58,0)"/></radialGradient>
    <marker id="arrow" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,5 L0,10 Z" fill="#55b8ff"/></marker>
    <marker id="arrowOrange" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,5 L0,10 Z" fill="#ff9e3a"/></marker>
  </defs>;
}
