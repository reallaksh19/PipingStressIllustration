import { LabState, Status, COLORS } from '../model/types';

export function StressStrainCurve({ state, status }: { state: LabState; status: Status }) {
  const duct = state.material === 'ductile';
  const p = state.staticLoad / 100;
  let x: number, y: number;

  // Ductile: elastic (0–0.44) → yield plateau (0.44–0.76) → necking/rupture (0.76–1.0)
  if (duct) {
    if (p < 0.44) { x = 64 + p * 180; y = 235 - p * 300; }
    else if (p < 0.76) { x = 143 + (p - 0.44) * 430; y = 104 - (p - 0.44) * 50; }
    else { x = 281 + (p - 0.76) * 330; y = 89 + (p - 0.76) * 230; }
  } else {
    // Brittle: linear up to fracture at x=188. Cap x so dot never overshoots the fracture line.
    x = 64 + Math.min(p, 1) * 124;
    y = 235 - Math.min(p, 1) * 185;
  }
  x = Math.max(64, Math.min(420, x));
  y = Math.max(40, Math.min(238, y));

  return <svg viewBox="0 0 470 300" role="img" aria-label="Stress strain curve">
    <rect x="12" y="12" width="446" height="270" rx="24" fill="rgba(255,255,255,.018)" stroke="rgba(190,220,255,.10)"/>
    {[0,1,2,3,4].map(i => <g key={i}><line className="gridline" x1={64+i*82} y1="38" x2={64+i*82} y2="238"/><line className="gridline" x1="60" y1={235-i*44} x2="420" y2={235-i*44}/></g>)}
    <path className="axis" d="M64 235H420"/><path className="axis" d="M64 235V38"/>
    <text x="425" y="254" className="muted">strain ε</text><text x="28" y="44" className="muted">stress σ</text>
    {state.compareCurve && <path className="ghostCurve" stroke={duct ? COLORS.red : COLORS.cyan} d={duct ? 'M64 235 C102 178 142 112 188 48' : 'M64 235 C92 184 118 133 144 104 C178 70 225 73 276 88 C318 101 355 94 386 60 C399 80 390 116 360 145'} />}
    <path className="curve" stroke={duct ? COLORS.cyan : COLORS.red} d={duct ? 'M64 235 C92 184 118 133 144 104 C178 70 225 73 276 88 C318 101 355 94 386 60 C399 80 390 116 360 145' : 'M64 235 C102 178 142 112 188 48'} />
    {duct ? <><line x1="144" y1="104" x2="144" y2="238" stroke="rgba(255,215,91,.56)" strokeDasharray="4 5"/><line x1="386" y1="60" x2="386" y2="238" stroke="rgba(255,75,100,.56)" strokeDasharray="4 5"/><text x="144" y="94" textAnchor="middle" fill="#ffd75b" fontSize="13" fontWeight="900">Sy</text><text x="386" y="50" textAnchor="middle" fill="#ff4b64" fontSize="13" fontWeight="900">Su</text><text x="247" y="66" fill="#ff9e3a" fontSize="12" fontWeight="900">plastic region</text></> : <><line x1="188" y1="48" x2="188" y2="238" stroke="rgba(255,75,100,.56)" strokeDasharray="4 5"/><text x="203" y="50" fill="#ff4b64" fontSize="13" fontWeight="900">fracture</text><text x="95" y="136" fill="#ffd75b" fontSize="12" fontWeight="900">mostly elastic</text></>}
    <path d={`M${x} ${y}V235`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5"/><path d={`M64 ${y}H${x}`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5"/>
    <circle className="point" cx={x} cy={y} r="8" fill={status.color}/><text x={Math.min(x+12,378)} y={Math.max(y-12,30)} className="label">current</text>
    <text x="235" y="276" textAnchor="middle" className="muted">{duct ? 'Ductile: elastic → Sy → plastic region → Su → rupture zone' : 'Brittle: mostly elastic → crack/fracture with little plastic strain'}</text>
  </svg>;
}
