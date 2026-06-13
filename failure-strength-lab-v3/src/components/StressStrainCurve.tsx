import { LabState, Status, COLORS } from '../model/types';

type Pt = { x: number; y: number };

const ductileCurve = 'M64 235 C92 184 118 133 144 104 C178 70 225 73 276 88 C318 101 355 94 386 60 C399 80 390 116 360 145';
const brittleCurve = 'M64 235 C102 178 142 112 188 48';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, tRaw: number): Pt {
  const t = clamp01(tRaw);
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

function ductilePoint(loadFraction: number): Pt {
  const p = clamp01(loadFraction);
  // Marker follows the same Bezier segments as the displayed ductile curve:
  // elastic → yield/plastic hardening → ultimate tensile point → necking/rupture tail.
  if (p < 0.44) {
    return cubic({ x: 64, y: 235 }, { x: 92, y: 184 }, { x: 118, y: 133 }, { x: 144, y: 104 }, p / 0.44);
  }
  if (p < 0.76) {
    return cubic({ x: 144, y: 104 }, { x: 178, y: 70 }, { x: 225, y: 73 }, { x: 276, y: 88 }, (p - 0.44) / 0.32);
  }
  if (p < 0.92) {
    return cubic({ x: 276, y: 88 }, { x: 318, y: 101 }, { x: 355, y: 94 }, { x: 386, y: 60 }, (p - 0.76) / 0.16);
  }
  return cubic({ x: 386, y: 60 }, { x: 399, y: 80 }, { x: 390, y: 116 }, { x: 360, y: 145 }, (p - 0.92) / 0.08);
}

function brittlePoint(loadFraction: number): Pt {
  return cubic({ x: 64, y: 235 }, { x: 102, y: 178 }, { x: 142, y: 112 }, { x: 188, y: 48 }, loadFraction);
}

function markerLabel(point: Pt, p: number, ductile: boolean) {
  const nearRight = point.x > 330;
  const nearTop = point.y < 82;
  const labelX = nearRight ? point.x - 16 : point.x + 14;
  const labelY = nearTop ? point.y + 28 : Math.max(point.y - 14, 30);
  const anchor = nearRight ? 'end' : 'start';
  const copy = ductile && p >= 0.92 ? 'necking path' : 'current';
  return { labelX, labelY, anchor, copy };
}

export function StressStrainCurve({ state, status }: { state: LabState; status: Status }) {
  const duct = state.material === 'ductile';
  const p = clamp01(state.staticLoad / 100);
  const point = duct ? ductilePoint(p) : brittlePoint(p);
  const x = Math.max(64, Math.min(420, point.x));
  const y = Math.max(40, Math.min(238, point.y));
  const label = markerLabel({ x, y }, p, duct);
  const curvePath = duct ? ductileCurve : brittleCurve;
  const ghostPath = duct ? brittleCurve : ductileCurve;

  return <svg viewBox="0 0 470 300" role="img" aria-label="Stress strain curve with current point constrained to the curve">
    <rect x="12" y="12" width="446" height="270" rx="24" fill="rgba(255,255,255,.018)" stroke="rgba(190,220,255,.10)"/>
    {[0,1,2,3,4].map(i => <g key={i}><line className="gridline" x1={64+i*82} y1="38" x2={64+i*82} y2="238"/><line className="gridline" x1="60" y1={235-i*44} x2="420" y2={235-i*44}/></g>)}
    <path className="axis" d="M64 235H420"/><path className="axis" d="M64 235V38"/>
    <text x="425" y="254" className="muted">strain ε</text><text x="28" y="44" className="muted">stress σ</text>
    {state.compareCurve && <path className="ghostCurve" stroke={duct ? COLORS.red : COLORS.cyan} d={ghostPath} />}
    <path className="curve" stroke={duct ? COLORS.cyan : COLORS.red} d={curvePath} />
    {duct ? <>
      <line x1="144" y1="104" x2="144" y2="238" stroke="rgba(255,215,91,.56)" strokeDasharray="4 5"/>
      <line x1="386" y1="60" x2="386" y2="238" stroke="rgba(255,75,100,.56)" strokeDasharray="4 5"/>
      <text x="144" y="94" textAnchor="middle" fill="#ffd75b" fontSize="13" fontWeight="900">Sy</text>
      <text x="386" y="50" textAnchor="middle" fill="#ff4b64" fontSize="13" fontWeight="900">Su</text>
      <text x="247" y="66" fill="#ff9e3a" fontSize="12" fontWeight="900">plastic region</text>
      <text x="336" y="158" fill="rgba(255,158,58,.95)" fontSize="11" fontWeight="800">necking / rupture tail</text>
    </> : <>
      <line x1="188" y1="48" x2="188" y2="238" stroke="rgba(255,75,100,.56)" strokeDasharray="4 5"/>
      <text x="203" y="50" fill="#ff4b64" fontSize="13" fontWeight="900">fracture</text>
      <text x="95" y="136" fill="#ffd75b" fontSize="12" fontWeight="900">mostly elastic</text>
    </>}
    <path d={`M${x} ${y}V235`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5"/>
    <path d={`M64 ${y}H${x}`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5"/>
    <circle cx={x} cy={y} r="15" fill="none" stroke={status.color} strokeOpacity=".36" strokeWidth="3"/>
    <circle className="point" cx={x} cy={y} r="8" fill={status.color}/>
    <text x={label.labelX} y={label.labelY} textAnchor={label.anchor} className="label">{label.copy}</text>
    <text x={label.labelX} y={label.labelY + 16} textAnchor={label.anchor} className="muted">{Math.round(p * 100)}% load</text>
    <text x="235" y="276" textAnchor="middle" className="muted">{duct ? 'Ductile marker follows curve: elastic → Sy → plastic region → Su → necking/rupture tail' : 'Brittle marker follows mostly elastic curve to sudden fracture'}</text>
  </svg>;
}
