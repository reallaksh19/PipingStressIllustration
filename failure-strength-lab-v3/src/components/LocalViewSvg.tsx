import type { ReactNode } from 'react';
import { LabState, Status } from '../model/types';

type LocalProps = { state: LabState; status: Status };

export function LocalViewSvg({ state, status }: LocalProps) {
  if (state.mode === 'fatigue') return <FatigueHotspotZoom state={state} status={status} />;

  const key = `${state.material}-${state.staticDemand}`;
  if (key === 'ductile-tension') return <DuctileTensionLocal state={state} status={status} />;
  if (key === 'ductile-compression') return <DuctileCompressionLocal state={state} status={status} />;
  if (key === 'brittle-tension') return <BrittleTensionLocal state={state} status={status} />;
  return <BrittleCompressionLocal state={state} status={status} />;
}

function DuctileTensionLocal({ state, status }: LocalProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  return <LocalFrame label="Ductile tension local view">
    <ForceArrow x1="122" y1="84" x2="42" y2="84" color="blue" start />
    <ForceArrow x1="298" y1="84" x2="378" y2="84" color="blue" />
    <path d={high ? 'M126 142 C158 116 262 116 294 142 L294 222 C262 248 158 248 126 222 Z' : 'M116 132 C155 122 265 122 304 132 L304 232 C265 242 155 242 116 232 Z'} className="localMetal ductile" />
    <path d="M144 152H276 M144 202H276" className="grain" />
    {med && <ellipse cx="210" cy="182" rx={high ? 62 : 48} ry={high ? 36 : 46} className="yield" />}
    {high && <path d="M186 126 C196 154 196 210 186 238 M234 126 C224 154 224 210 234 238" className="neckLine" />}
    <text x="210" y="278" textAnchor="middle" className="caseLabel" fill={status.color}>{high ? 'local necking after plastic strain' : med ? 'yielding spreads across section' : 'uniform tensile stress field'}</text>
    <text x="210" y="303" textAnchor="middle" className="muted">cross-section/local material response</text>
  </LocalFrame>;
}

function DuctileCompressionLocal({ state, status }: LocalProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  return <LocalFrame label="Ductile compression local view">
    <ForceArrow x1="36" y1="84" x2="132" y2="84" color="orange" />
    <ForceArrow x1="384" y1="84" x2="288" y2="84" color="orange" start />
    <path d={high ? 'M110 140 C144 111 276 111 310 140 L310 224 C276 253 144 253 110 224 Z' : 'M124 138 C160 126 260 126 296 138 L296 226 C260 238 160 238 124 226 Z'} className="localMetal ductile" />
    {med && <>
      <ellipse cx="210" cy="182" rx={high ? 92 : 70} ry={high ? 54 : 42} className="yield" />
      <path d="M146 148 C184 168 236 196 274 216 M274 148 C236 168 184 196 146 216" className="wrinkle" />
      <path d="M168 132 C154 164 154 200 168 232 M252 132 C266 164 266 200 252 232" className="wrinkle soft" />
    </>}
    <text x="210" y="278" textAnchor="middle" className="caseLabel" fill={status.color}>{high ? 'local collapse / barreling zone' : med ? 'plastic squash and wrinkle lines' : 'inward compression arrows'}</text>
    <text x="210" y="303" textAnchor="middle" className="muted">compression failure may be yielding or instability</text>
  </LocalFrame>;
}

function BrittleTensionLocal({ state, status }: LocalProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  const showFlaw = state.flawEnabled || med;
  return <LocalFrame label="Brittle tension local view">
    <ForceArrow x1="122" y1="84" x2="42" y2="84" color="red" start />
    <ForceArrow x1="298" y1="84" x2="378" y2="84" color="red" />
    <path d="M112 134 H308 V230 H112 Z" className="localMetal brittle" />
    {showFlaw && <>
      <path d="M210 134 L198 164 L214 186 L202 230" className={high ? 'crack glow' : 'crack'} />
      <path d="M210 134 L224 164 L208 186 L220 230" className={high ? 'crack glow faint' : 'crack faint'} />
      <circle cx="210" cy="182" r={high ? 82 : 54} className="fractureFlash" />
    </>}
    {!showFlaw && <path d="M210 134 V230" className="notchGhost" />}
    <text x="210" y="278" textAnchor="middle" className="caseLabel" fill={status.color}>{high ? 'crack opens with little plastic strain' : showFlaw ? 'principal tensile stress opens flaw' : 'mostly elastic, flaw hidden'}</text>
    <text x="210" y="303" textAnchor="middle" className="muted">brittle tension is crack/flaw sensitive</text>
  </LocalFrame>;
}

function BrittleCompressionLocal({ state, status }: LocalProps) {
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  return <LocalFrame label="Brittle compression local view">
    <ForceArrow x1="36" y1="84" x2="132" y2="84" color="orange" />
    <ForceArrow x1="384" y1="84" x2="288" y2="84" color="orange" start />
    <rect x="112" y="136" width="196" height="92" rx="8" className="localMetal brittle" />
    {med && <>
      <ellipse cx="210" cy="182" rx={high ? 108 : 78} ry={high ? 58 : 42} className="crushHalo" />
      <path d="M126 136 L212 228 M218 136 L300 228 M304 144 L226 228" className="crack" />
      <path d="M148 228 L130 250 L166 240 M270 136 L302 112 L292 150" className="fragment" />
    </>}
    <text x="210" y="278" textAnchor="middle" className="caseLabel" fill={status.color}>{high ? 'crush zone with diagonal split planes' : med ? 'splitting begins under compression' : 'compression without necking'}</text>
    <text x="210" y="303" textAnchor="middle" className="muted">correct local view: crushing/splitting, not tensile crack opening</text>
  </LocalFrame>;
}

function FatigueHotspotZoom({ state, status }: LocalProps) {
  const range = state.fatigueStressRange / 100;
  const cycles = state.fatigueCyclesSlider / 100;
  const materialFactor = state.material === 'brittle' ? 1.16 : 1.0;
  const notchFactor = state.notchEnabled ? 1.25 : 0.65;
  const severity = Math.min(1, (range * 0.58 + cycles * 0.42) * notchFactor * materialFactor);
  const crack = state.notchEnabled ? 10 + severity * 68 : 0;
  const halo = 34 + severity * 76;

  return <LocalFrame label="Fatigue hotspot zoom">
    <text x="210" y="50" textAnchor="middle" className="muted">magnified weld toe / notch detail</text>
    <path d="M82 214 C126 150 170 132 210 142 C250 132 294 150 338 214" className="pipeWall" />
    <path d="M146 202 C166 162 190 154 210 162 C230 154 254 162 274 202" className="weldProfile" />
    <path d="M210 160 V236" className="weldCentre" />
    {state.notchEnabled && <>
      <circle cx="210" cy="166" r={halo} className="hotspotHalo" />
      <path d={`M210 166 C${198 - crack * 0.23} ${184 + crack * 0.08}, ${232 + crack * 0.16} ${202 + crack * 0.25}, ${202 - crack * 0.16} ${222 + crack * 0.32}`} className="crack glow" />
      <circle cx="210" cy="166" r="7" fill="#ffd75b" stroke="#06101d" strokeWidth="3" />
    </>}
    {!state.notchEnabled && <>
      <circle cx="210" cy="166" r="28" className="hotspotHalo mutedHalo" />
      <text x="210" y="248" textAnchor="middle" className="muted">hotspot disabled: no explicit notch/weld crack shown</text>
    </>}
    <path d="M95 92 C138 72 174 72 210 92 C246 112 282 112 325 92" className="fatigueWave" />
    <text x="210" y="278" textAnchor="middle" className="caseLabel" fill={status.color}>{state.notchEnabled ? 'crack length grows with Δσ and N' : 'stress range shown without explicit local flaw'}</text>
    <text x="210" y="303" textAnchor="middle" className="muted">fatigue = cyclic crack initiation/growth mechanism</text>
  </LocalFrame>;
}

function LocalFrame({ children, label }: { children: ReactNode; label: string }) {
  return <svg viewBox="0 0 420 330" role="img" aria-label={label}>
    <Defs />
    <rect x="12" y="14" width="396" height="300" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M42 84H378 M42 182H378 M42 278H378 M126 38V292 M210 38V292 M294 38V292" stroke="rgba(216,237,255,.055)" />
    {children}
  </svg>;
}

function ForceArrow({ x1, y1, x2, y2, color, start }: { x1: string; y1: string; x2: string; y2: string; color: 'blue' | 'orange' | 'red'; start?: boolean }) {
  const marker = color === 'red' ? 'arrowRed' : color === 'orange' ? 'arrowOrange' : 'arrow';
  const cls = color === 'red' ? 'forceArrow red' : color === 'orange' ? 'forceArrow orange' : 'forceArrow blue';
  return <path className={cls} d={`M${x1} ${y1} L${x2} ${y2}`} markerEnd={!start ? `url(#${marker})` : undefined} markerStart={start ? `url(#${marker}Start)` : undefined} />;
}

function Defs() {
  return <defs>
    <linearGradient id="localDuctile" x1="0" x2="1"><stop offset="0" stopColor="#7e95a8"/><stop offset=".5" stopColor="#eef7ff"/><stop offset="1" stopColor="#758ba0"/></linearGradient>
    <linearGradient id="localBrittle" x1="0" x2="1"><stop offset="0" stopColor="#8d98a4"/><stop offset=".5" stopColor="#dce7f2"/><stop offset="1" stopColor="#777f8a"/></linearGradient>
    <radialGradient id="hotspot" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="rgba(255,75,100,.48)"/><stop offset=".72" stopColor="rgba(255,158,58,.16)"/><stop offset="1" stopColor="rgba(255,158,58,0)"/></radialGradient>
    <marker id="arrow" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,5 L0,10 Z" fill="#55b8ff"/></marker>
    <marker id="arrowStart" markerWidth="12" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M12,0 L0,5 L12,10 Z" fill="#55b8ff"/></marker>
    <marker id="arrowRed" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,5 L0,10 Z" fill="#ff4b64"/></marker>
    <marker id="arrowRedStart" markerWidth="12" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M12,0 L0,5 L12,10 Z" fill="#ff4b64"/></marker>
    <marker id="arrowOrange" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L12,5 L0,10 Z" fill="#ff9e3a"/></marker>
    <marker id="arrowOrangeStart" markerWidth="12" markerHeight="10" refX="2" refY="5" orient="auto" markerUnits="strokeWidth"><path d="M12,0 L0,5 L12,10 Z" fill="#ff9e3a"/></marker>
  </defs>;
}
