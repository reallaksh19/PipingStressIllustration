import { COLORS } from '../model/types';
import { SvgDefs } from './SvgDefs';

export type CombinedStressState = {
  sH: number;   // 0-100 hoop stress % of reference stress S
  sL: number;   // 0-100 longitudinal stress % of reference stress S, sign handled separately
  sLSign: 'tension' | 'compression';
  theory: 'vonmises' | 'tresca';
  allowableFactor: number; // teaching utilization limit, not a project allowable
};

type CombinedMetrics = {
  sH: number;
  sL: number;
  vonMisesVal: number;
  trescaVal: number;
  activeVal: number;
  activeName: 'Von Mises' | 'Tresca';
  activePass: boolean;
  vmPass: boolean;
  trPass: boolean;
};

type CombinedRouteRow = {
  label: string;
  value: string;
};

function clamp(n: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}

function pct(n: number) {
  return (n * 100).toFixed(1);
}

function combinedMetrics(state: CombinedStressState): CombinedMetrics {
  const sH = state.sH / 100;
  const sLRaw = state.sL / 100;
  const sL = state.sLSign === 'compression' ? -sLRaw : sLRaw;
  const vonMisesVal = Math.sqrt(Math.max(0, sH * sH - sH * sL + sL * sL));
  const trescaVal = Math.max(Math.abs(sH - sL), Math.abs(sH), Math.abs(sL));
  const activeVal = state.theory === 'vonmises' ? vonMisesVal : trescaVal;
  const activeName = state.theory === 'vonmises' ? 'Von Mises' : 'Tresca';

  return {
    sH,
    sL,
    vonMisesVal,
    trescaVal,
    activeVal,
    activeName,
    activePass: activeVal <= state.allowableFactor,
    vmPass: vonMisesVal <= state.allowableFactor,
    trPass: trescaVal <= state.allowableFactor,
  };
}

function vonMisesPoints(cx: number, cy: number, scale: number, factor = 1) {
  return Array.from({ length: 145 }, (_, i) => {
    const t = (i / 144) * 2 * Math.PI;
    const c = Math.cos(t);
    const s = Math.sin(t);
    // Exact polar form for σH² − σH·σL + σL² = factor² on the same σH/σL axes.
    // This keeps the VM ellipse axes aligned with the Tresca hexagon diagonal, avoiding visual tilt drift.
    const denom = Math.sqrt(Math.max(1e-9, c * c - c * s + s * s));
    const r = factor / denom;
    const px = r * c;
    const py = r * s;
    return `${(cx + px * scale).toFixed(1)},${(cy - py * scale).toFixed(1)}`;
  }).join(' ');
}

function trescaPoints(cx: number, cy: number, scale: number, factor = 1) {
  const verts: [number, number][] = [
    [1, 0], [1, 1], [0, 1], [-1, 0], [-1, -1], [0, -1],
  ];
  return verts
    .map(([x, y]) => `${(cx + x * factor * scale).toFixed(1)},${(cy - y * factor * scale).toFixed(1)}`)
    .join(' ');
}

function ratioColor(value: number, allowable: number) {
  return value > allowable ? COLORS.red : value > allowable * 0.85 ? COLORS.orange : COLORS.green;
}

function signInteraction(state: CombinedStressState, m: CombinedMetrics) {
  if (state.sLSign === 'compression' && state.sL > 0) {
    return 'Hoop tension with longitudinal compression increases the stress difference; both VM and Tresca can rise quickly.';
  }
  if (state.sL > state.sH * 1.25) {
    return 'Longitudinal stress dominates this teaching point; identify whether it comes from sustained bending, occasional load, thermal displacement, or terminal movement.';
  }
  if (state.sH > state.sL * 1.35) {
    return 'Hoop stress dominates this teaching point; keep pressure containment and pressure-related longitudinal effects routed separately.';
  }
  return `Balanced hoop/longitudinal input. VM=${pct(m.vonMisesVal)}%S and Tresca=${pct(m.trescaVal)}%S are theory-screen values on the same point.`;
}

function combinedRouteRows(state: CombinedStressState, m: CombinedMetrics): CombinedRouteRow[] {
  return [
    {
      label: 'Theory screen',
      value: `${m.activeName} is a yield-theory comparison on σH/σL. It is not a universal B31.3 pass/fail check.`
    },
    {
      label: 'Stress source',
      value: 'σH normally routes to pressure containment; σL may include pressure axial, weight bending, occasional bending, thermal displacement, or terminal movement.'
    },
    {
      label: 'Sign effect',
      value: signInteraction(state, m)
    },
    {
      label: 'B31.3 map',
      value: 'Pressure containment → 304; sustained force/weight → 302.3.5; occasional event → 302.3.6; displacement/flexibility → 319.'
    },
    {
      label: 'Detail basis',
      value: 'Bends, tees, branches, SIFs, flexibility factors, local stresses, and support/nozzle loads must come from the approved model basis.'
    },
    {
      label: 'Reporting boundary',
      value: 'Use relevant code edition and Client criteria before evaluating/reporting combined or equivalent stress utilization.'
    }
  ];
}

// ── Yield surface SVG ────────────────────────────────────────────────────────

export function CombinedStressYieldSvg({ state }: { state: CombinedStressState }) {
  const cx = 230;
  const cy = 164;
  const scale = 96; // one fixed scale: 1.0S = 96px for both VM and Tresca
  const AF = state.allowableFactor;
  const m = combinedMetrics(state);
  const dotX = cx + m.sH * scale;
  const dotY = cy - m.sL * scale;
  const activeColor = state.theory === 'vonmises' ? COLORS.cyan : COLORS.yellow;
  const inactiveColor = state.theory === 'vonmises' ? COLORS.yellow : COLORS.cyan;
  const dotColor = ratioColor(m.activeVal, AF);

  return (
    <svg viewBox="0 0 460 340" role="img" aria-label="Yield theory comparison — Von Mises ellipse and Tresca hexagon on common scale">
      <SvgDefs />
      <rect x="14" y="18" width="432" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
      <path d="M55 68H405 M55 164H405 M55 260H405 M134 48V282 M230 48V282 M326 48V282" stroke="rgba(216,237,255,.07)" />

      <text x="230" y="36" textAnchor="middle" className="label" fill={COLORS.cyan}>
        Yield-theory screen in σH–σL space
      </text>

      {/* axes: both checks use these same S-based axes */}
      <path d={`M${cx - scale - 24} ${cy} H${cx + scale + 34}`}
        stroke="rgba(216,237,255,.48)" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <path d={`M${cx} ${cy + scale + 24} V${cy - scale - 24}`}
        stroke="rgba(216,237,255,.48)" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <text x={cx + scale + 36} y={cy + 5} fill="#a9bdd5" fontSize="11" fontWeight="900">σH / S</text>
      <text x={cx + 8} y={cy - scale - 26} fill="#a9bdd5" fontSize="11" fontWeight="900">σL / S</text>
      <text x={cx - 20} y={cy + 14} fill="#a9bdd5" fontSize="10">0</text>
      {([[-1, '−1.0S'], [1, '1.0S']] as const).map(([v, lbl]) => {
        const n = Number(v);
        return <g key={lbl as string}>
          <text x={cx + n * scale} y={cy + 18} textAnchor="middle" fill="#a9bdd5" fontSize="10">{lbl as string}</text>
          <text x={cx - 12} y={cy - n * scale + 4} textAnchor="end" fill="#a9bdd5" fontSize="10">{lbl as string}</text>
        </g>;
      })}

      {/* Full-strength reference surfaces. These never rescale when the theory toggles. */}
      <polygon points={trescaPoints(cx, cy, scale, 1)}
        fill="rgba(255,215,91,.045)" stroke={COLORS.yellow}
        strokeWidth={state.theory === 'tresca' ? 3 : 1.25}
        strokeDasharray={state.theory === 'tresca' ? '' : '7 6'} opacity=".74" />
      <polyline points={vonMisesPoints(cx, cy, scale, 1)}
        fill="rgba(82,240,223,.055)" stroke={COLORS.cyan}
        strokeWidth={state.theory === 'vonmises' ? 3 : 1.25}
        strokeDasharray={state.theory === 'vonmises' ? '' : '7 6'} opacity=".82" />

      {/* Teaching envelopes: same factor, same axes, different geometry. */}
      <polygon points={trescaPoints(cx, cy, scale, AF)}
        fill="none" stroke={state.theory === 'tresca' ? COLORS.yellow : inactiveColor}
        strokeWidth={state.theory === 'tresca' ? 2.2 : 1.1}
        strokeDasharray="5 5" opacity={state.theory === 'tresca' ? .72 : .32} />
      <polyline points={vonMisesPoints(cx, cy, scale, AF)}
        fill="none" stroke={state.theory === 'vonmises' ? COLORS.cyan : inactiveColor}
        strokeWidth={state.theory === 'vonmises' ? 2.2 : 1.1}
        strokeDasharray="5 5" opacity={state.theory === 'vonmises' ? .72 : .32} />
      <text x={300} y={80} fill={activeColor} fontSize="10" fontWeight="900" opacity=".88">
        teaching limit = {(AF * 100).toFixed(0)}%S, no graph rescale
      </text>

      {/* crosshairs and operating point */}
      <path d={`M${dotX} ${cy} V${dotY}`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5" />
      <path d={`M${cx} ${dotY} H${dotX}`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5" />
      <circle cx={dotX} cy={dotY} r="9" fill={dotColor} stroke="#06101d" strokeWidth="2.5" />
      <circle cx={dotX} cy={dotY} r="18" fill="none" stroke={dotColor} strokeOpacity=".42" strokeWidth="3" />
      <text x={Math.min(dotX + 14, 390)} y={Math.max(dotY - 14, 38)} fill={dotColor} fontSize="12" fontWeight="900">
        input point
      </text>
      <text x={Math.min(dotX + 14, 390)} y={Math.max(dotY + 4, 54)} className="muted">
        VM {pct(m.vonMisesVal)}%S · Tresca {pct(m.trescaVal)}%S
      </text>

      <text x="104" y="300" textAnchor="start" fill={m.vmPass ? COLORS.green : COLORS.red} fontSize="11" fontWeight="900">
        VM = {pct(m.vonMisesVal)}%S {m.vmPass ? '✓' : '✗'}
      </text>
      <text x="230" y="300" textAnchor="middle" fill="#a9bdd5" fontSize="11" fontWeight="900">
        limit = {(AF * 100).toFixed(0)}%S
      </text>
      <text x="356" y="300" textAnchor="end" fill={m.trPass ? COLORS.green : COLORS.red} fontSize="11" fontWeight="900">
        Tresca = {pct(m.trescaVal)}%S {m.trPass ? '✓' : '✗'}
      </text>
      <text x="230" y="320" textAnchor="middle" className="caseLabel" fill={m.activePass ? COLORS.green : COLORS.red}>
        {m.activeName} theory screen: {m.activePass ? 'inside' : 'over'} — SC = {pct(m.activeVal)}%S {m.activePass ? '≤' : '>'} {(AF * 100).toFixed(0)}%S
      </text>
    </svg>
  );
}

// ─── Pipe cross-section view ─────────────────────────────────────────────────

export function CombinedStressPipeSection({ state }: { state: CombinedStressState }) {
  const m = combinedMetrics(state);
  const scColor = ratioColor(m.activeVal, state.allowableFactor);
  const cx = 230;
  const cy = 155;
  const ro = 78;
  const ri = 48;
  const hoopExpand = Math.abs(m.sH) * 22;
  const ovalise = Math.abs(m.sL) * 14;

  return (
    <svg viewBox="0 0 460 340" role="img" aria-label="Pipe cross-section showing combined stress state">
      <SvgDefs />
      <rect x="14" y="18" width="432" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
      <text x="230" y="38" textAnchor="middle" className="label" fill={COLORS.cyan}>Pipe wall stress state (cross-section)</text>
      <text x="230" y="57" textAnchor="middle" className="muted">
        Same σH/σL input; result bar follows active theory: {m.activeName}
      </text>

      {/* pipe annulus */}
      <ellipse cx={cx} cy={cy} rx={ro + hoopExpand} ry={ro + hoopExpand * 0.42 - ovalise}
        fill="rgba(85,184,255,.12)" stroke="rgba(220,245,255,.88)" strokeWidth="4" />
      <ellipse cx={cx} cy={cy} rx={Math.max(28, ri - 4)} ry={Math.max(22, ri - ovalise * 0.4)}
        fill="rgba(6,16,29,.88)" stroke="rgba(220,245,255,.42)" strokeWidth="2.2" />
      <text x={cx} y={cy + 5} textAnchor="middle" className="muted">bore</text>

      {/* hoop stress arrows */}
      {state.sH > 5 && <>
        <path d={`M${cx - ro - hoopExpand - 22} ${cy} C${cx - ro - hoopExpand - 8} ${cy - 22},${cx - ro - hoopExpand - 8} ${cy + 22},${cx - ro - hoopExpand - 22} ${cy}`}
          stroke={COLORS.blue} strokeWidth="2.6" fill="none" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
        <path d={`M${cx + ro + hoopExpand + 22} ${cy} C${cx + ro + hoopExpand + 8} ${cy - 22},${cx + ro + hoopExpand + 8} ${cy + 22},${cx + ro + hoopExpand + 22} ${cy}`}
          stroke={COLORS.blue} strokeWidth="2.6" fill="none" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
        <text x={cx} y={cy - ro - hoopExpand - 22} textAnchor="middle"
          fill={COLORS.blue} fontSize="11" fontWeight="900">σH = {state.sH}%S</text>
      </>}

      {/* longitudinal stress: in/out of plane shown as dot/cross */}
      {state.sL > 5 && (
        state.sLSign === 'tension' ? <>
          {[[-ro * 0.5, 0], [ro * 0.5, 0], [0, -ro * 0.5], [0, ro * 0.5]].map(([dx, dy], i) => (
            <circle key={i} cx={cx + dx} cy={cy + dy} r="5"
              fill={COLORS.orange} stroke="#06101d" strokeWidth="1.5" />
          ))}
          <text x={cx} y={cy + ro + hoopExpand + 30} textAnchor="middle"
            fill={COLORS.orange} fontSize="11" fontWeight="900">σL tension {state.sL}%S (out of page)</text>
        </> : <>
          {[[-ro * 0.5, 0], [ro * 0.5, 0], [0, -ro * 0.5], [0, ro * 0.5]].map(([dx, dy], i) => (
            <g key={i}>
              <circle cx={cx + dx} cy={cy + dy} r="6" fill="rgba(255,158,58,.22)" stroke={COLORS.orange} strokeWidth="2" />
              <path d={`M${cx + dx - 4} ${cy + dy - 4} L${cx + dx + 4} ${cy + dy + 4} M${cx + dx + 4} ${cy + dy - 4} L${cx + dx - 4} ${cy + dy + 4}`}
                stroke={COLORS.orange} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ))}
          <text x={cx} y={cy + ro + hoopExpand + 30} textAnchor="middle"
            fill={COLORS.orange} fontSize="11" fontWeight="900">σL compression {state.sL}%S (into page)</text>
        </>
      )}

      {/* Active-theory result bar */}
      <rect x={76} y={276} width="308" height="14" rx="7"
        fill="rgba(255,255,255,.06)" stroke="rgba(216,237,255,.22)" strokeWidth="1.5" />
      <rect x={76} y={276} width={clamp(m.activeVal, 0, 1) * 308} height="14" rx="7"
        fill={`${scColor}88`} stroke={scColor} strokeWidth="1.5" />
      <path d={`M${76 + clamp(state.allowableFactor, 0, 1) * 308} 272 V295`} stroke="rgba(216,237,255,.72)" strokeWidth="2" />
      <text x="230" y="289" textAnchor="middle" fill={scColor} fontSize="11" fontWeight="900">
        {m.activeName} SC = {pct(m.activeVal)}%S
      </text>
      <text x="230" y="318" textAnchor="middle" className="caseLabel" fill={scColor}>
        {m.activePass
          ? `${m.activeName} screen inside teaching limit: ${pct(m.activeVal)}%S ≤ ${(state.allowableFactor * 100).toFixed(0)}%S`
          : `${m.activeName} screen exceeds teaching limit: ${pct(m.activeVal)}%S > ${(state.allowableFactor * 100).toFixed(0)}%S`}
      </text>
    </svg>
  );
}

// ─── Readout panel ────────────────────────────────────────────────────────────

export function CombinedStressReadout({ state }: { state: CombinedStressState }) {
  const m = combinedMetrics(state);
  const AF = state.allowableFactor;
  const color = m.activePass ? COLORS.green : COLORS.red;

  return (
    <div className="interp stress-readout">
      <span className="badge" style={{ color }}>
        {m.activeName} theory · fixed σH/σL scale
      </span>
      <h3 className="result-title">
        {m.activePass ? 'Equivalent-stress screen: inside teaching limit' : 'Equivalent-stress screen: over teaching limit'}
      </h3>
      <p className="copy">
        Von Mises and Tresca compare the same hoop/longitudinal input point on one S-based graph. This tab is a yield-theory screen for combined stress interaction; it is not a universal B31.3 acceptance calculation. First classify the source of each stress component, then report by the applicable code/project route.
      </p>
      <div className="table">
        <div><span>σH input</span><b>{state.sH}%S ({state.sH > 67 ? 'high pressure-driven cue' : 'moderate pressure cue'})</b></div>
        <div><span>σL input</span><b>{state.sL}%S {state.sLSign}</b></div>
        <div><span>Von Mises SC</span>
          <b style={{ color: m.vmPass ? COLORS.green : COLORS.red }}>
            {pct(m.vonMisesVal)}%S {m.vmPass ? 'inside' : 'over'} {(AF * 100).toFixed(0)}%S
          </b>
        </div>
        <div><span>Tresca SC</span>
          <b style={{ color: m.trPass ? COLORS.green : COLORS.red }}>
            {pct(m.trescaVal)}%S {m.trPass ? 'inside' : 'over'} {(AF * 100).toFixed(0)}%S
          </b>
        </div>
        <div><span>Active theory</span><b>{state.theory === 'vonmises' ? 'Von Mises (distortion energy, ellipse)' : 'Tresca (maximum shear, hexagon)'}</b></div>
      </div>
      <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
        <b>Scale correction</b>
        <span className="copy">Both surfaces use σH/S and σL/S axes. The dashed teaching envelope is scaled by the selected limit; the graph itself does not resize when switching between Von Mises and Tresca.</span>
      </div>
      <div className="table route-table">
        {combinedRouteRows(state, m).map(row => <div key={row.label}><span>{row.label}</span><b>{row.value}</b></div>)}
      </div>
    </div>
  );
}
