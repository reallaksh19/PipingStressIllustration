import type { ReactNode } from 'react';
import { LabState, Status } from '../model/types';

type SideProps = { state: LabState; status: Status };

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
  const elong = 34 * p;
  const neck = high ? 26 : med ? 12 : 0;
  const leftGrip = 52 - elong;
  const rightGrip = 588 + elong;
  const specimenPath = `M126 ${170} C188 ${166} 220 ${178 + neck * 0.35} 270 ${184 + neck} C306 ${190 + neck * 0.5} 334 ${190 + neck * 0.5} 370 ${184 + neck} C420 ${178 + neck * 0.35} 452 166 514 170 L514 250 C452 254 420 ${242 - neck * 0.35} 370 ${236 - neck} C334 ${230 - neck * 0.5} 306 ${230 - neck * 0.5} 270 ${236 - neck} C220 ${242 - neck * 0.35} 188 254 126 250 Z`;

  return <SvgFrame label="Ductile tension side view">
    <ForceArrow x1="142" y1="76" x2="64" y2="76" color="blue" start />
    <ForceArrow x1="498" y1="76" x2="576" y2="76" color="blue" />
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
  const squeeze = 28 * p;
  const bulge = high ? 34 : med ? 20 : 4;
  const leftPlate = 78 + squeeze;
  const rightPlate = 516 - squeeze;
  const bodyPath = `M${leftPlate + 45} 174 C210 ${164 - bulge * 0.28} 250 ${160 - bulge} 320 ${166 - bulge * 0.7} C390 ${160 - bulge} 430 ${164 - bulge * 0.28} ${rightPlate - 45} 174 L${rightPlate - 45} 248 C430 ${258 + bulge * 0.28} 390 ${262 + bulge} 320 ${256 + bulge * 0.7} C250 ${262 + bulge} 210 ${258 + bulge * 0.28} ${leftPlate + 45} 248 Z`;

  return <SvgFrame label="Ductile compression side view">
    <ForceArrow x1="64" y1="76" x2="150" y2="76" color="orange" />
    <ForceArrow x1="576" y1="76" x2="490" y2="76" color="orange" start />
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
    <ForceArrow x1="142" y1="76" x2="64" y2="76" color="red" start />
    <ForceArrow x1="498" y1="76" x2="576" y2="76" color="red" />
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
    <ForceArrow x1="64" y1="76" x2="150" y2="76" color="orange" />
    <ForceArrow x1="576" y1="76" x2="490" y2="76" color="orange" start />
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
  const range = state.fatigueStressRange / 100;
  const cycles = state.fatigueCyclesSlider / 100;
  const severity = Math.min(1, range * 0.65 + cycles * 0.45 + (state.notchEnabled ? 0.1 : 0));
  const amp = 12 + state.fatigueStressRange * 0.18;
  const crack = 8 + severity * 34;

  return <SvgFrame label="Fatigue side view">
    <path d="M70 122 C130 88 192 88 250 122 C308 156 370 156 570 122" className="fatigueWave" />
    <text x="320" y="62" textAnchor="middle" className="muted">repeated stress range Δσ: pipe pulses, damage accumulates at local detail</text>
    <path d={`M88 214 C175 ${214 - amp}, 254 ${214 + amp}, 552 214`} className="pipeShadow fatPulse" />
    <path d={`M88 214 C175 ${214 - amp}, 254 ${214 + amp}, 552 214`} className="pipeOuter fatPulse" />
    <path d={`M88 214 C175 ${214 - amp}, 254 ${214 + amp}, 552 214`} className="pipeInner fatPulse" />
    <rect x="312" y="176" width="22" height="78" rx="9" className="weldBand" />
    {state.notchEnabled && <>
      <circle cx="326" cy="214" r={32 + severity * 34} className="hotspotHalo" />
      <path d={`M326 214 C${318 - crack * 0.45} ${228 + crack * 0.35}, ${346 + crack * 0.25} ${244 + crack}, ${314 - crack * 0.25} ${262 + crack * 0.45}`} className="crack glow" />
    </>}
    <path d="M326 214 C365 170 424 138 470 116" className="calloutLine" />
    <circle cx="484" cy="104" r="54" className="magnifier" />
    <path d="M458 112 C476 78 500 77 514 112" className="weldToe" />
    <path d={`M484 112 C${478 - crack * 0.2} ${128 + crack * 0.1}, ${497 + crack * 0.15} ${138 + crack * 0.25}, ${476 - crack * 0.1} ${150 + crack * 0.25}`} className={state.notchEnabled ? 'microCrack glow' : 'microCrackGhost'} />
    <text x="484" y="176" textAnchor="middle" className="muted">zoom: weld toe / notch</text>
    <text x="320" y="318" textAnchor="middle" className="caseLabel" fill={status.color}>cyclic hotspot: crack length responds to Δσ and N</text>
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
    <path d={`M${x + 7} 146V276 M${x + 17} 146V276`} stroke="rgba(255,255,255,.17)" strokeWidth="3" />
  </g>;
}

function ForceArrow({ x1, y1, x2, y2, color, start }: { x1: string; y1: string; x2: string; y2: string; color: 'blue' | 'orange' | 'red'; start?: boolean }) {
  const marker = color === 'red' ? 'arrowRed' : color === 'orange' ? 'arrowOrange' : 'arrow';
  const cls = color === 'red' ? 'forceArrow red' : color === 'orange' ? 'forceArrow orange' : 'forceArrow blue';
  return <path className={cls} d={`M${x1} ${y1} L${x2} ${y2}`} markerEnd={!start ? `url(#${marker})` : undefined} markerStart={start ? `url(#${marker}Start)` : undefined} />;
}

function Defs() {
  return <defs>
    <linearGradient id="specimenDuctile" x1="0" x2="1">
      <stop offset="0" stopColor="#7f96aa" />
      <stop offset=".48" stopColor="#f2fbff" />
      <stop offset="1" stopColor="#788fa4" />
    </linearGradient>
    <linearGradient id="specimenBrittle" x1="0" x2="1">
      <stop offset="0" stopColor="#9aa7b4" />
      <stop offset=".5" stopColor="#e5edf4" />
      <stop offset="1" stopColor="#7b8793" />
    </linearGradient>
    <linearGradient id="pipeStroke" x1="0" x2="1"><stop offset="0" stopColor="#90a7ba"/><stop offset=".52" stopColor="#f3fbff"/><stop offset="1" stopColor="#8299ad"/></linearGradient>
    <radialGradient id="hotspot" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="rgba(255,75,100,.48)"/><stop offset=".7" stopColor="rgba(255,158,58,.16)"/><stop offset="1" stopColor="rgba(255,158,58,0)"/></radialGradient>
    <marker id="arrow" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,5 L0,10 Z" fill="#55b8ff"/></marker>
    <marker id="arrowStart" markerWidth="12" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M12,0 L0,5 L12,10 Z" fill="#55b8ff"/></marker>
    <marker id="arrowRed" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,5 L0,10 Z" fill="#ff4b64"/></marker>
    <marker id="arrowRedStart" markerWidth="12" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M12,0 L0,5 L12,10 Z" fill="#ff4b64"/></marker>
    <marker id="arrowOrange" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,5 L0,10 Z" fill="#ff9e3a"/></marker>
    <marker id="arrowOrangeStart" markerWidth="12" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M12,0 L0,5 L12,10 Z" fill="#ff9e3a"/></marker>
  </defs>;
}
