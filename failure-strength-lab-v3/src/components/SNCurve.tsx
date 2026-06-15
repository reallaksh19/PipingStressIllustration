import { LabState, Status } from '../model/types';
import { allowableStressRangePercent, cycleLabel, fatigueBoundaryPercent, logCycles } from '../model/fatigueModel';

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function SNCurve({ state, status }: { state: LabState; status: Status }) {
  const x0 = 64;
  const y0 = 235;
  const w = 356;
  const h = 190;
  const logN = logCycles(state.fatigueCyclesSlider);
  const stressRange = state.fatigueStressRange;
  const x = x0 + ((logN - 2) / 5) * w;
  const y = y0 - clamp(stressRange, 0, 100) / 100 * h;
  const baseAllow = clamp(allowableStressRangePercent(logN), 12, 92);
  const allow = clamp(fatigueBoundaryPercent(logN, state.notchEnabled), 10, 92);
  const yAllow = y0 - (allow / 100) * h;
  const ratio = stressRange / Math.max(allow, 1);
  const pointLabel = ratio > 1 ? 'above detail boundary' : ratio > 0.82 ? 'near detail boundary' : 'below detail boundary';

  const baseBoundaryPoints = Array.from({ length: 42 }, (_, i) => {
    const t = i / 41;
    const lx = 2 + t * 5;
    const ax = x0 + t * w;
    const ay = y0 - (clamp(allowableStressRangePercent(lx), 12, 96) / 100) * h;
    return `${ax.toFixed(1)},${ay.toFixed(1)}`;
  }).join(' ');

  const boundaryPoints = Array.from({ length: 42 }, (_, i) => {
    const t = i / 41;
    const lx = 2 + t * 5;
    const ax = x0 + t * w;
    const ay = y0 - (clamp(fatigueBoundaryPercent(lx, state.notchEnabled), 10, 96) / 100) * h;
    return `${ax.toFixed(1)},${ay.toFixed(1)}`;
  }).join(' ');

  return <svg viewBox="0 0 470 300" role="img" aria-label="S-N curve showing stress range on vertical axis and log cycles on horizontal axis">
    <rect x="12" y="12" width="446" height="270" rx="24" fill="rgba(255,255,255,.018)" stroke="rgba(190,220,255,.10)"/>

    {[0, 1, 2, 3, 4, 5].map(i => {
      const gx = x0 + (i / 5) * w;
      const gy = y0 - (i / 5) * h;
      return <g key={i}>
        <line className="gridline" x1={gx} y1="38" x2={gx} y2={y0}/>
        <line className="gridline" x1={x0} y1={gy} x2={x0 + w} y2={gy}/>
      </g>;
    })}

    <path className="axis" d={`M${x0} ${y0}H${x0 + w}`}/>
    <path className="axis" d={`M${x0} ${y0}V38`}/>
    <text x="425" y="254" className="muted">cycles N, log scale</text>
    <text x="24" y="44" className="muted">Δσ</text>
    <text x="52" y="61" className="muted">high</text>
    <text x="53" y="231" className="muted">low</text>

    {state.notchEnabled && <polyline points={baseBoundaryPoints} fill="none" stroke="rgba(82,240,223,.28)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 8"/>}
    <polyline points={boundaryPoints} fill="none" stroke="#52f0df" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="226" y="98" fill="#ffd75b" fontSize="12" fontWeight="900">detail-adjusted S-N boundary</text>
    {state.notchEnabled && <text x="246" y="116" className="muted">smooth-detail curve shown faint</text>}
    <text x="65" y="254" className="muted">10²</text>
    <text x="212" y="254" className="muted">10⁴.5</text>
    <text x="397" y="254" className="muted">10⁷</text>

    <path d={`M${x} ${y}V${y0}`} stroke="rgba(255,215,91,.50)" strokeDasharray="4 5"/>
    <path d={`M${x0} ${y}H${x}`} stroke="rgba(255,215,91,.50)" strokeDasharray="4 5"/>
    <circle cx={x} cy={yAllow} r="5" fill="#52f0df" stroke="#06101d" strokeWidth="2"/>
    <path d={`M${x - 20} ${yAllow}H${x + 20}`} stroke="rgba(82,240,223,.46)" strokeWidth="2"/>
    <path d={`M${x} ${yAllow - 20}V${yAllow + 20}`} stroke="rgba(82,240,223,.46)" strokeWidth="2"/>
    <text x={Math.min(x + 13, 340)} y={Math.max(yAllow - 14, 30)} className="muted">boundary at this N</text>

    <circle className="point" cx={x} cy={y} r="9" fill={status.color}/>
    <circle cx={x} cy={y} r="16" fill="none" stroke={status.color} strokeOpacity=".45" strokeWidth="3"/>
    <text x={Math.min(x + 13, 372)} y={Math.max(y - 18, 30)} className="label">current</text>
    <text x={Math.min(x + 13, 336)} y={Math.min(Math.max(y + 22, yAllow + 30), 228)} className="muted">{pointLabel}</text>

    <text x="235" y="276" textAnchor="middle" className="muted">
      current: Δσ {stressRange}% at N ≈ {cycleLabel(state.fatigueCyclesSlider)}; detail boundary ≈ {allow.toFixed(0)}%{state.notchEnabled ? ` (base ${baseAllow.toFixed(0)}%)` : ''}
    </text>
  </svg>;
}
