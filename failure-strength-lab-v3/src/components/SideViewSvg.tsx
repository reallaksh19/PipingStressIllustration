import { LabState, Status } from '../model/types';

export function SideViewSvg({ state, status }: { state: LabState; status: Status }) {
  const isFatigue = state.mode === 'fatigue';
  const l = state.staticLoad;
  const duct = state.material === 'ductile';
  const tens = state.staticDemand === 'tension';
  const med = l >= 45, high = l >= 72;
  let path = 'M70 150 C155 150 205 150 230 150 C255 150 305 150 390 150';
  let damage: React.ReactNode = null;
  let msg = 'elastic response';
  let arrowClass = 'arrow';

  if (isFatigue) {
    const amp = 8 + state.fatigueStressRange * 0.16;
    path = `M72 150 C145 ${150 - amp},205 ${150 + amp},388 150`;
    msg = 'repeated stress range Δσ';
    damage = state.notchEnabled && <><rect x="222" y="109" width="18" height="82" rx="8" fill="rgba(255,215,91,.33)" stroke="#ffd75b"/><path className="crack glow" d="M231 150 C215 174,253 205,224 226"/></>;
  } else if (tens && duct) {
    const s = Math.max(0, (l - 42) / 58), neck = 18 * s;
    path = `M${70 - 18 * s} 150 C140 150 186 ${150 - neck} 215 ${150 - neck} C240 ${150 - neck} 272 150 ${390 + 18 * s} 150`;
    msg = high ? 'strong necking / plastic strain' : med ? 'yield band appears' : 'elastic stretch';
    damage = med && <ellipse cx="220" cy="150" rx="58" ry="34" className="yield"/>;
  } else if (!tens && duct) {
    const b = high ? 44 : med ? 23 : 4;
    path = `M78 150 C125 ${150 - b},160 ${150 + b},205 150 C245 ${150 - b * 0.8},292 ${150 + b * 0.75},382 150`;
    msg = high ? 'buckling / collapse tendency' : med ? 'wrinkle / squash zone' : 'steady compression';
    arrowClass = 'arrow arrowOrange';
  } else if (tens && !duct) {
    arrowClass = 'arrow arrowRed';
    msg = (state.flawEnabled || med) ? (high ? 'crack opens suddenly' : 'notch / crack warning') : 'little visible deformation';
    damage = (state.flawEnabled || med) && <path className={`crack ${high ? 'glow' : ''}`} d="M230 108 L216 139 L237 158 L222 199"/>;
  } else {
    arrowClass = 'arrow arrowOrange';
    msg = high ? 'crushing / diagonal splitting' : med ? 'splitting begins' : 'little visible deformation';
    damage = med && <><ellipse cx="230" cy="150" rx="54" ry="44" fill="rgba(255,75,100,.13)" stroke="#ff4b64" strokeWidth="2"/><path className="crack" d="M190 110 L270 195 M274 110 L190 195"/></>;
  }

  return <svg viewBox="0 0 460 300" aria-label="Side view stress demand">
    <Defs />
    <rect x="14" y="18" width="432" height="250" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)"/>
    <path d="M55 70H405 M55 130H405 M55 190H405 M115 50V238 M230 50V238 M345 50V238" stroke="rgba(216,237,255,.07)"/>
    <path className={arrowClass} d={state.mode === 'static' && state.staticDemand === 'compression' ? 'M55 72 L145 72' : 'M145 72 L72 72'}/>
    <path className={arrowClass} d={state.mode === 'static' && state.staticDemand === 'compression' ? 'M405 72 L315 72' : 'M315 72 L388 72'}/>
    <path className="pipeShadow" d={path}/>
    <path className={`pipeOuter ${isFatigue ? 'fatPulse' : ''}`} d={path}/>
    <path className={`pipeInner ${isFatigue ? 'fatPulse' : ''}`} d={path}/>
    {damage}
    <text x="230" y="247" textAnchor="middle" className="label" fill={status.color}>{msg}</text>
    <text x="230" y="269" textAnchor="middle" className="muted">{state.mode === 'fatigue' ? 'N cycles · fatigue response' : `${state.staticDemand} + ${state.material}`}</text>
  </svg>;
}

function Defs() {
  return <defs>
    <linearGradient id="pipeStroke" x1="0" x2="1"><stop offset="0" stopColor="#90a7ba"/><stop offset=".52" stopColor="#f3fbff"/><stop offset="1" stopColor="#8299ad"/></linearGradient>
    <marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L10,4 L0,8 Z" fill="#55b8ff"/></marker>
    <marker id="arrowStart" markerWidth="10" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M10,0 L0,4 L10,8 Z" fill="#55b8ff"/></marker>
    <marker id="arrowRed" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L10,4 L0,8 Z" fill="#ff4b64"/></marker>
    <marker id="arrowRedStart" markerWidth="10" markerHeight="8" refX="2" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M10,0 L0,4 L10,8 Z" fill="#ff4b64"/></marker>
  </defs>;
}
