import type { ReactNode } from 'react';
import { LabState, Status } from '../model/types';
import { fatigueSeverity, logCycles } from '../model/fatigueModel';
import { SvgDefs } from './SvgDefs';

function PipeRing({ ovalize = 0 }: { ovalize?: number }) {
  const rxOuter = 83 + ovalize;
  const ryOuter = 70 - ovalize * .45;
  const rxInner = 47 + ovalize * .45;
  const ryInner = 39 - ovalize * .3;
  return <>
    <ellipse cx="170" cy="138" rx={rxOuter} ry={ryOuter} fill="url(#steelFace)" opacity=".88" stroke="rgba(220,235,250,.92)" strokeWidth="4" />
    <ellipse cx="170" cy="138" rx={rxInner} ry={ryInner} fill="rgba(6,16,29,.88)" stroke="rgba(220,235,250,.50)" strokeWidth="2.5" />
    <path d="M84 138 H102 M238 138 H256 M170 62 V78 M170 198 V216 M110 84 L123 96 M230 84 L217 96 M111 192 L124 180 M229 192 L216 180" stroke="rgba(85,184,255,.65)" strokeWidth="2.3" strokeLinecap="round" />
  </>;
}

export function LocalViewSvg({ state, status }: { state: LabState; status: Status }) {
  if (state.mode === 'fatigue') return <FatigueLocalView state={state} status={status} />;

  const ductile = state.material === 'ductile';
  const tension = state.staticDemand === 'tension';
  const medium = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;

  let damage: ReactNode = null;
  let caption = tension ? 'pipe wall under axial tensile demand' : 'pipe wall under compressive demand';
  const ovalize = !tension && ductile && medium ? (high ? 14 : 8) : 0;

  if (tension && ductile) {
    caption = medium ? 'pipe wall yield band / wall thinning cue' : 'pipe ring: small stress ticks only';
    damage = medium && <>
      <path d="M226 76 C244 101 247 174 224 199" fill="none" stroke="rgba(255,158,58,.95)" strokeWidth={high ? 13 : 9} strokeLinecap="round" />
      <path d="M235 101 C223 121 224 160 237 178" fill="none" stroke="#ffd75b" strokeWidth="3" strokeLinecap="round" />
      <text x="170" y="47" textAnchor="middle" fill="#ff9e3a" fontSize="12" fontWeight="900">local wall yielding / thinning</text>
    </>;
  } else if (!tension && ductile) {
    caption = medium ? 'ovalization + wrinkle/local collapse cue' : 'pipe ring under compression';
    damage = medium && <>
      <path d="M95 129 C123 105 216 105 246 130" stroke="#ff9e3a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M96 151 C128 174 214 174 245 150" stroke="#ff9e3a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M102 111 C131 128 208 153 238 175 M236 111 C207 128 132 153 101 176" stroke="rgba(255,158,58,.82)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <text x="170" y="47" textAnchor="middle" fill="#ff9e3a" fontSize="12" fontWeight="900">ovalization / wrinkle response</text>
    </>;
  } else if (tension && !ductile) {
    caption = (state.flawEnabled || medium) ? 'through-wall crack opening from flaw' : 'pipe ring: little deformation';
    damage = (state.flawEnabled || medium) && <>
      <path d="M223 73 L211 103 L236 132 L218 166 L235 202" stroke="#ff4b64" strokeWidth={high ? 6 : 4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M216 111 L245 104 M217 162 L244 170" stroke="rgba(255,75,100,.45)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="223" cy="73" r="5" fill="#ff4b64" />
      <text x="170" y="47" textAnchor="middle" fill="#ff4b64" fontSize="12" fontWeight="900">flaw opens through wall</text>
    </>;
  } else {
    caption = medium ? 'crushed wall sector + diagonal split' : 'pipe ring: compression without necking';
    damage = medium && <>
      <path d="M103 100 C135 80 210 82 238 105 L214 131 C186 115 144 116 119 133Z" fill="rgba(255,75,100,.18)" stroke="#ff4b64" strokeWidth="2.5" />
      <path className={`crack ${high ? 'glow' : ''}`} d="M108 89 L237 192 M232 87 L102 191" />
      <text x="170" y="47" textAnchor="middle" fill="#ff4b64" fontSize="12" fontWeight="900">crush / diagonal splitting</text>
    </>;
  }

  return <svg viewBox="0 0 340 300" role="img" aria-label="Pipe cross-section and local wall response">
    <SvgDefs />
    <rect x="14" y="18" width="312" height="250" rx="26" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <PipeRing ovalize={ovalize} />
    {damage}
    <text x="170" y="245" textAnchor="middle" className="label" fill={status.color}>{caption}</text>
    <text x="170" y="268" textAnchor="middle" className="muted">pipe cross-section: local wall response, not force arrows</text>
  </svg>;
}

function FatigueLocalView({ state, status }: { state: LabState; status: Status }) {
  const sev = fatigueSeverity(state);
  const crack = Math.max(4, 14 + sev * 92);
  const beachMarks = [0.25, 0.42, 0.59, 0.76].filter(v => v < sev + .2);
  const logN = logCycles(state.fatigueCyclesSlider);
  return <svg viewBox="0 0 340 300" role="img" aria-label="Fatigue local mechanism: weld toe crack initiation and growth">
    <SvgDefs />
    <rect x="14" y="18" width="312" height="250" rx="26" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />

    <text x="170" y="47" textAnchor="middle" fill="#ffd75b" fontSize="12" fontWeight="900">magnified weld toe / notch root</text>
    <path d="M66 184 H246" stroke="url(#pipeStroke)" strokeWidth="34" strokeLinecap="round" />
    <path d="M178 82 V184" stroke="#ffd75b" strokeWidth="26" strokeLinecap="round" />
    <path d="M178 124 C159 130 151 146 151 184" stroke="rgba(255,215,91,.95)" strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M151 184 L178 184" stroke="rgba(255,215,91,.85)" strokeWidth="7" strokeLinecap="round" />

    <circle cx="151" cy="184" r={24 + sev * 40} fill="rgba(255,215,91,.07)" stroke="rgba(255,215,91,.42)" strokeDasharray="4 5" />
    <circle cx="151" cy="184" r={10 + sev * 16} fill="rgba(255,75,100,.14)" stroke="rgba(255,75,100,.65)" />
    <circle cx="151" cy="184" r="4.5" fill="#ff4b64" />

    <path className="crack glow" d={`M151 184 C${166 + crack * .22} ${188 + crack * .16}, ${172 + crack * .48} ${195 + crack * .36}, ${180 + crack} ${198 + crack * .22}`} />
    {beachMarks.map((m, i) => <path key={i} d={`M${160 + m * crack} ${186 + m * crack * .18} C${168 + m * crack} ${178 + m * crack * .1}, ${181 + m * crack} ${182 + m * crack * .18}, ${187 + m * crack} ${190 + m * crack * .24}`} stroke="rgba(216,237,255,.34)" strokeWidth="1.7" fill="none" strokeDasharray="3 5" />)}

    <path d="M151 184 L106 121" stroke="rgba(216,237,255,.35)" strokeDasharray="4 5" />
    <text x="82" y="111" className="muted">initiation</text>
    <path d={`M${180 + crack} ${198 + crack * .22} L258 130`} stroke="rgba(216,237,255,.35)" strokeDasharray="4 5" />
    <text x="234" y="121" className="muted">growth front</text>

    <text x="170" y="245" textAnchor="middle" className="label" fill={status.color}>fatigue mechanism: crack initiation → propagation</text>
    <text x="170" y="268" textAnchor="middle" className="muted">Δσ={state.fatigueStressRange}% · logN={logN.toFixed(2)} · {state.notchEnabled ? 'notch/weld active' : 'plain detail'}</text>
  </svg>;
}
