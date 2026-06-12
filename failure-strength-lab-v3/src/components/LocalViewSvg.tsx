import { LabState, Status } from '../model/types';

export function LocalViewSvg({ state, status }: { state: LabState; status: Status }) {
  const isFatigue = state.mode === 'fatigue';
  const duct = state.material === 'ductile';
  const tens = state.staticDemand === 'tension';
  const med = state.staticLoad >= 45;
  const high = state.staticLoad >= 72;
  let damage: React.ReactNode = null;
  let msg = 'axial tensile arrows';
  let arrowClass = 'arrow';

  if (isFatigue) {
    msg = 'crack initiation/growth hotspot';
    damage = <><path d="M170 72L170 106" stroke="#ffd75b" strokeWidth="6" strokeLinecap="round"/><text x="170" y="60" textAnchor="middle" fill="#ffd75b" fontSize="12" fontWeight="900">weld/notch</text><path className="crack glow" d="M170 106 C142 142,198 174,160 224"/></>;
  } else if (tens && duct) {
    damage = med && <><ellipse cx="170" cy="138" rx="46" ry="58" className="yield"/><path d="M170 82C158 105 158 170 170 194" stroke="#ff9e3a" strokeWidth="3" fill="none"/></>;
    msg = med ? 'yield band / necking section' : 'axial tensile arrows';
  } else if (!tens && duct) {
    arrowClass = 'arrow arrowOrange';
    damage = med && <><ellipse cx="170" cy="138" rx="72" ry="48" className="yield"/><path d="M115 97C142 122 197 154 225 180 M225 98C198 122 142 155 115 180" stroke="#ff9e3a" strokeWidth="3" fill="none"/></>;
    msg = med ? 'barreling / local wrinkle' : 'compressive arrows inward';
  } else if (tens && !duct) {
    arrowClass = 'arrow arrowRed';
    damage = (state.flawEnabled || med) && <path className={`crack ${high ? 'glow' : ''}`} d="M170 75L156 113L180 137L162 205"/>;
    msg = (state.flawEnabled || med) ? 'crack normal to tension' : 'little visible deformation';
  } else {
    arrowClass = 'arrow arrowOrange';
    damage = med && <><ellipse cx="170" cy="138" rx="70" ry="50" fill="rgba(255,75,100,.13)"/><path className="crack" d="M112 88L228 190 M232 88L108 190"/></>;
    msg = med ? 'crushing / diagonal split' : 'compression without necking';
  }

  const isComp = state.mode === 'static' && state.staticDemand === 'compression';
  return <svg viewBox="0 0 340 300" aria-label="Local cross-section view">
    <rect x="14" y="18" width="312" height="250" rx="26" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)"/>
    <ellipse cx="170" cy="138" rx="78" ry="66" fill="rgba(85,184,255,.08)" stroke="rgba(220,235,250,.78)" strokeWidth="4"/>
    <ellipse cx="170" cy="138" rx="46" ry="38" fill="rgba(6,16,29,.74)" stroke="rgba(220,235,250,.35)" strokeWidth="2.5"/>
    <path className={arrowClass} d={isComp ? 'M30 138 L100 138' : 'M96 138 L34 138'}/>
    <path className={arrowClass} d={isComp ? 'M310 138 L240 138' : 'M244 138 L306 138'}/>
    {damage}
    <text x="170" y="245" textAnchor="middle" className="label" fill={status.color}>{msg}</text>
    <text x="170" y="268" textAnchor="middle" className="muted">cross-section / local damage view</text>
  </svg>;
}
