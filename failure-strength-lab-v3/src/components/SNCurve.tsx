import { LabState, Status } from '../model/types';
import { allowableStressRangePercent, logCycles } from '../model/fatigueModel';

export function SNCurve({ state, status }: { state: LabState; status: Status }) {
  const x0 = 64, y0 = 235, w = 356, h = 190;
  const logN = logCycles(state.fatigueCyclesSlider);
  const x = x0 + ((logN - 2) / 5) * w;
  const y = y0 - (state.fatigueStressRange / 100) * h;
  const allow = allowableStressRangePercent(logN);

  return <svg viewBox="0 0 470 300" role="img" aria-label="S-N curve with log cycle axis">
    <rect x="12" y="12" width="446" height="270" rx="24" fill="rgba(255,255,255,.018)" stroke="rgba(190,220,255,.10)"/>
    {[0,1,2,3,4].map(i => <g key={i}><line className="gridline" x1={x0+i*82} y1="38" x2={x0+i*82} y2="238"/><line className="gridline" x1="60" y1={235-i*44} x2="420" y2={235-i*44}/></g>)}
    <path className="axis" d="M64 235H420"/><path className="axis" d="M64 235V38"/>
    <text x="425" y="254" className="muted">log N</text><text x="28" y="44" className="muted">Δσ</text>
    <path className="curve" stroke="#52f0df" d="M64 54 C112 70 155 98 198 130 C252 167 308 190 420 209"/>
    <text x="65" y="254" className="muted">10²</text><text x="217" y="254" className="muted">10⁴.5</text><text x="397" y="254" className="muted">10⁷</text>
    <text x="278" y="94" fill="#ffd75b" fontSize="12" fontWeight="900">conceptual boundary</text>
    <path d={`M${x} ${y}V235`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5"/>
    <path d={`M64 ${y}H${x}`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5"/>
    <circle className="point" cx={x} cy={y} r="8" fill={status.color}/><text x={Math.min(x+12,382)} y={Math.max(y-12,30)} className="label">current</text>
    <text x="235" y="276" textAnchor="middle" className="muted">S-N: log10(N) = {logN.toFixed(2)}; allowable at this N ≈ {allow.toFixed(0)}%</text>
  </svg>;
}
