import type { ReactNode } from 'react';
import { LabState, Status } from '../model/types';
import { fatigueSeverity } from '../model/fatigueModel';
import { SvgDefs } from './SvgDefs';

function loadLabel(load: number) {
  if (load < 45) return 'low demand';
  if (load < 72) return 'teaching limit approached';
  return 'high demand';
}

function DemandArrows({ demand }: { demand: 'tension' | 'compression' }) {
  if (demand === 'tension') {
    return <>
      <path className="arrow" d="M122 74 L54 74" markerStart="none" strokeWidth="6.2" />
      <path className="arrow" d="M338 74 L406 74" markerStart="none" strokeWidth="6.2" />
      <text x="230" y="58" textAnchor="middle" fill="#d8edff" fontSize="12" fontWeight="950">tensile demand: outward pull</text>
    </>;
  }
  return <>
    <path className="arrow arrowOrange" d="M54 74 L122 74" markerStart="none" strokeWidth="6.2" />
    <path className="arrow arrowOrange" d="M406 74 L338 74" markerStart="none" strokeWidth="6.2" />
    <text x="230" y="58" textAnchor="middle" fill="#ff9e3a" fontSize="12" fontWeight="950">compressive demand: inward push</text>
  </>;
}

function GripOrPlate({ x, compression }: { x: number; compression: boolean }) {
  return <g>
    <rect x={x} y="122" width="30" height="64" rx="7" fill="rgba(216,237,255,.16)" stroke="rgba(216,237,255,.42)" />
    {compression && <rect x={x - 4} y="116" width="38" height="76" rx="7" fill="none" stroke="rgba(255,158,58,.52)" strokeWidth="2" />}
  </g>;
}

export function SideViewSvg({ state, status }: { state: LabState; status: Status }) {
  if (state.mode === 'fatigue') return <FatigueSideView state={state} status={status} />;

  const load = state.staticLoad;
  const ductile = state.material === 'ductile';
  const tension = state.staticDemand === 'tension';
  const medium = load >= 45;
  const high = load >= 72;
  const demand = state.staticDemand;

  let specimenPath = tension
    ? 'M86 154 C156 154 210 154 236 154 C262 154 316 154 386 154'
    : 'M92 154 C154 154 208 154 236 154 C264 154 314 154 382 154';
  let overlay: ReactNode = null;
  let sideNote = `${demand} · ${loadLabel(load)}`;

  if (tension && ductile) {
    const s = Math.max(0, (load - 34) / 66);
    const neck = high ? 30 : medium ? 15 : 2;
    specimenPath = `M${86 - s * 18} 154 C141 154 184 ${154 - neck} 218 ${154 - neck} C250 ${154 - neck} 288 154 ${386 + s * 18} 154`;
    sideNote = high ? 'ductile response: elongation + necking' : medium ? 'ductile response: yield band starting' : 'ductile response: elastic stretch';
    overlay = medium && <>
      <ellipse cx="232" cy="154" rx={high ? 63 : 47} ry={high ? 31 : 23} className="yield" />
      <text x="232" y="111" textAnchor="middle" fill="#ff9e3a" fontSize="12" fontWeight="900">yield / necking response</text>
    </>;
  } else if (!tension && ductile) {
    const squash = Math.max(0, (load - 28) / 72);
    const buckle = high ? 42 : medium ? 23 : 5;
    specimenPath = `M${98 + squash * 10} 154 C137 ${154 - buckle}, 174 ${154 + buckle}, 207 154 C245 ${154 - buckle * .78}, 292 ${154 + buckle * .84}, ${376 - squash * 10} 154`;
    sideNote = high ? 'ductile response: squash + local collapse tendency' : medium ? 'ductile response: wrinkling / barreling' : 'ductile response: shortening under compression';
    overlay = medium && <>
      <ellipse cx="230" cy="154" rx="73" ry="42" className="yield" />
      <path d="M178 120 C201 141 260 164 284 189 M281 119 C257 141 201 164 177 188" stroke="#ff9e3a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="230" y="104" textAnchor="middle" fill="#ff9e3a" fontSize="12" fontWeight="900">wrinkle / instability response</text>
    </>;
  } else if (tension && !ductile) {
    sideNote = high ? 'brittle response: crack opens with little warning' : medium || state.flawEnabled ? 'brittle response: flaw-sensitive tension' : 'brittle response: little visible deformation';
    overlay = (medium || state.flawEnabled) && <>
      <path className={`crack ${high ? 'glow' : ''}`} d="M236 101 L219 135 L244 158 L224 211" />
      <text x="246" y="98" fill="#ff4b64" fontSize="12" fontWeight="900">crack normal to tensile demand</text>
    </>;
  } else {
    sideNote = high ? 'brittle response: crushing + diagonal split' : medium ? 'brittle response: local crush/split begins' : 'brittle response: little visible deformation';
    overlay = medium && <>
      <ellipse cx="236" cy="154" rx="66" ry="46" fill="rgba(255,75,100,.12)" stroke="#ff4b64" strokeWidth="2" />
      <path className={`crack ${high ? 'glow' : ''}`} d="M190 108 L286 204 M291 110 L185 202" />
      <text x="236" y="97" textAnchor="middle" fill="#ff4b64" fontSize="12" fontWeight="900">crush / diagonal split response</text>
    </>;
  }

  return <svg viewBox="0 0 460 300" role="img" aria-label="Side view showing external demand direction and material response">
    <SvgDefs />
    <rect x="14" y="18" width="432" height="250" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M55 130H405 M55 190H405 M115 50V238 M230 50V238 M345 50V238" stroke="rgba(216,237,255,.07)" />

    <DemandArrows demand={demand} />
    <GripOrPlate x={52} compression={!tension} />
    <GripOrPlate x={390} compression={!tension} />

    <path className="pipeShadow" d={specimenPath} />
    <path className="pipeOuter" d={specimenPath} />
    <path className="pipeInner" d={specimenPath} />
    {overlay}

    <text x="230" y="247" textAnchor="middle" className="label" fill={status.color}>{sideNote}</text>
    <text x="230" y="269" textAnchor="middle" className="muted">large arrows = applied demand; overlay = material response</text>
  </svg>;
}

function FatigueSideView({ state, status }: { state: LabState; status: Status }) {
  const sev = fatigueSeverity(state);
  const amp = 4 + state.fatigueStressRange * 0.09;
  const crackLen = state.notchEnabled ? 10 + sev * 30 : Math.max(0, sev - .35) * 20;
  const pipePath = `M70 154 C126 ${154 - amp}, 174 ${154 + amp}, 230 154 C286 ${154 - amp}, 334 ${154 + amp}, 390 154`;
  return <svg viewBox="0 0 460 300" role="img" aria-label="Fatigue side view showing cyclic demand and hotspot location">
    <SvgDefs />
    <rect x="14" y="18" width="432" height="250" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M55 130H405 M55 190H405 M115 50V238 M230 50V238 M345 50V238" stroke="rgba(216,237,255,.07)" />

    <path className="pipeShadow" d={pipePath} />
    <path className="pipeOuter fatPulse" d={pipePath} />
    <path className="pipeInner fatPulse" d={pipePath} />

    <rect x="220" y="112" width="28" height="84" rx="8" fill="rgba(255,215,91,.30)" stroke="#ffd75b" strokeWidth="2" />
    <line x1="248" y1="112" x2="248" y2="196" stroke="rgba(255,215,91,.55)" strokeWidth="4" />
    <circle cx="248" cy="154" r={18 + sev * 22} fill="rgba(255,215,91,.08)" stroke="rgba(255,215,91,.45)" strokeDasharray="4 5" />
    <circle cx="248" cy="154" r={8 + sev * 10} fill="rgba(255,75,100,.16)" stroke="#ff4b64" />
    {state.notchEnabled && <path className="crack glow" d={`M248 154 C${250 + crackLen * .35} ${166 + crackLen * .25}, ${241 - crackLen * .1} ${176 + crackLen * .55}, ${248 + crackLen * .22} ${185 + crackLen}`} />}

    <path className="arrow" d="M188 74 C206 58 232 58 250 74" markerStart="none" strokeWidth="3.4" />
    <path className="arrow" d="M276 235 C252 252 221 252 198 235" markerStart="none" strokeWidth="3.4" />
    <path className="arrow" d="M168 181 C150 166 150 143 168 128" markerStart="none" strokeWidth="3.4" />
    <path className="arrow" d="M332 128 C350 143 350 166 332 181" markerStart="none" strokeWidth="3.4" />
    <text x="230" y="57" textAnchor="middle" fill="#d8edff" fontSize="12" fontWeight="950">cyclic stress range Δσ around weld / notch</text>

    <path d="M255 148 L334 96" stroke="rgba(216,237,255,.42)" strokeDasharray="5 6" />
    <circle cx="354" cy="84" r="43" fill="rgba(6,16,29,.68)" stroke="rgba(216,237,255,.28)" />
    <path d="M332 88 L375 88" stroke="url(#pipeStroke)" strokeWidth="13" strokeLinecap="round" />
    <path d="M353 74 L353 102" stroke="#ffd75b" strokeWidth="8" strokeLinecap="round" />
    <path className="crack glow" d={`M354 88 C${360 + sev * 12} ${98 + sev * 4}, ${350 + sev * 18} ${109 + sev * 12}, ${365 + sev * 21} ${119 + sev * 24}`} />
    <text x="354" y="138" textAnchor="middle" className="muted">hotspot location</text>

    <text x="230" y="247" textAnchor="middle" className="label" fill={status.color}>fatigue side view: repeated demand + hotspot location</text>
    <text x="230" y="269" textAnchor="middle" className="muted">mechanism detail is shown separately in the local view</text>
  </svg>;
}
