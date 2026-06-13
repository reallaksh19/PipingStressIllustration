import { COLORS } from '../model/types';
import { SvgDefs } from './SvgDefs';

export type CombinedStressState = {
  sH: number;   // 0-100 hoop stress % of SMYS
  sL: number;   // 0-100 longitudinal stress % of SMYS (can be + or -)
  sLSign: 'tension' | 'compression';
  theory: 'vonmises' | 'tresca';
  allowableFactor: number; // 0.72 | 0.90 — B31.3 vs B31.8 style
};

function clamp(n: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, n)); }

// ── Yield surface SVG ────────────────────────────────────────────────────────

export function CombinedStressYieldSvg({ state }: { state: CombinedStressState }) {
  const cx = 230, cy = 170, scale = 108; // scale: 1 unit (SMYS) = 108px
  const sH = state.sH / 100;
  const sLRaw = state.sL / 100;
  const sL = state.sLSign === 'compression' ? -sLRaw : sLRaw;
  const AF = state.allowableFactor;

  // Von Mises ellipse: σ1² - σ1σ2 + σ2² = 1
  // We parametrise: x = cosθ + 0.5·sinθ, y = (√3/2)·sinθ  (rotated)
  const vMPoints = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * 2 * Math.PI;
    const px = Math.cos(t) + 0.5 * Math.sin(t);
    const py = (Math.sqrt(3) / 2) * Math.sin(t);
    return `${(cx + px * scale).toFixed(1)},${(cy - py * scale).toFixed(1)}`;
  }).join(' ');

  // Tresca hexagon vertices (σ1-σ2 space at σ3=0)
  const tVerts: [number, number][] = [
    [1, 0], [1, 1], [0, 1], [-1, 0], [-1, -1], [0, -1],
  ];
  const trPoints = tVerts.map(([x, y]) =>
    `${(cx + x * scale).toFixed(1)},${(cy - y * scale).toFixed(1)}`
  ).join(' ');

  // Current operating dot
  const dotX = cx + sH * scale;
  const dotY = cy - sL * scale;

  // Combined stress checks
  const vonMisesVal = Math.sqrt(sH * sH - sH * sL + sL * sL);
  const tresca1 = Math.abs(sH - sL);
  const tresca2 = Math.abs(sH);
  const tresca3 = Math.abs(sL);
  const trescaVal = Math.max(tresca1, tresca2, tresca3);
  const checkVal = state.theory === 'vonmises' ? vonMisesVal : trescaVal;
  const pass = checkVal <= AF;
  const dotColor = pass ? COLORS.green : COLORS.red;

  // B31.8 combined stress (Von Mises form): SC = [SL²-SL·SH+SH²]^0.5
  const scPct = vonMisesVal * 100;

  return (
    <svg viewBox="0 0 460 340" role="img" aria-label="Yield surface — Von Mises ellipse and Tresca hexagon">
      <SvgDefs />
      <rect x="14" y="18" width="432" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
      <path d="M55 78H405 M55 240H405 M115 48V270 M230 48V270 M345 48V270" stroke="rgba(216,237,255,.07)" />

      <text x="230" y="36" textAnchor="middle" className="label" fill={COLORS.cyan}>
        Yield surface — {state.theory === 'vonmises' ? 'Von Mises' : 'Tresca'} in σH–σL space
      </text>

      {/* axes */}
      <path d={`M${cx - scale - 20} ${cy} H${cx + scale + 30}`}
        stroke="rgba(216,237,255,.48)" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <path d={`M${cx} ${cy + scale + 18} V${cy - scale - 18}`}
        stroke="rgba(216,237,255,.48)" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
      <text x={cx + scale + 32} y={cy + 5} fill="#a9bdd5" fontSize="11" fontWeight="900">σH</text>
      <text x={cx + 8} y={cy - scale - 20} fill="#a9bdd5" fontSize="11" fontWeight="900">σL</text>
      <text x={cx - 20} y={cy + 14} fill="#a9bdd5" fontSize="10">0</text>
      {/* SMYS tick labels */}
      {([[-1,'−S'],[1,'S']] as const).map(([v, lbl]) => {
        const n = Number(v);
        return <g key={lbl as string}>
          <text x={cx + n * scale} y={cy + 18} textAnchor="middle" fill="#a9bdd5" fontSize="10">{lbl as string}</text>
          <text x={cx - 12} y={cy - n * scale + 4} textAnchor="end" fill="#a9bdd5" fontSize="10">{lbl as string}</text>
        </g>;
      })}

      {/* Tresca hexagon */}
      <polygon points={trPoints}
        fill="rgba(255,215,91,.06)" stroke={COLORS.yellow}
        strokeWidth={state.theory === 'tresca' ? 3 : 1.4}
        strokeDasharray={state.theory === 'tresca' ? '' : '7 6'} opacity=".78" />

      {/* Von Mises ellipse */}
      <polyline points={vMPoints}
        fill="rgba(82,240,223,.07)" stroke={COLORS.cyan}
        strokeWidth={state.theory === 'vonmises' ? 3 : 1.4}
        strokeDasharray={state.theory === 'vonmises' ? '' : '7 6'} opacity=".88" />

      {/* allowable surface (scaled) */}
      <polyline
        points={Array.from({ length: 121 }, (_, i) => {
          const t = (i / 120) * 2 * Math.PI;
          const px = (Math.cos(t) + 0.5 * Math.sin(t)) * AF;
          const py = (Math.sqrt(3) / 2) * Math.sin(t) * AF;
          return `${(cx + px * scale).toFixed(1)},${(cy - py * scale).toFixed(1)}`;
        }).join(' ')}
        fill="none" stroke={COLORS.cyan}
        strokeWidth="1.5" strokeDasharray="5 5" opacity=".45" />
      <text x={cx + AF * scale * 0.72} y={cy - AF * scale * 0.55 - 8}
        fill={COLORS.cyan} fontSize="10" fontWeight="900" opacity=".7">
        {AF}S allowable
      </text>

      {/* crosshairs */}
      <path d={`M${dotX} ${cy} V${dotY}`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5" />
      <path d={`M${cx} ${dotY} H${dotX}`} stroke="rgba(255,215,91,.42)" strokeDasharray="4 5" />

      {/* operating point */}
      <circle cx={dotX} cy={dotY} r="9" fill={dotColor} stroke="#06101d" strokeWidth="2.5" />
      <circle cx={dotX} cy={dotY} r="18" fill="none" stroke={dotColor} strokeOpacity=".42" strokeWidth="3" />
      <text x={Math.min(dotX + 14, 390)} y={Math.max(dotY - 14, 34)} fill={dotColor} fontSize="12" fontWeight="900">
        operating point
      </text>
      <text x={Math.min(dotX + 14, 390)} y={Math.max(dotY + 4, 50)} className="muted">
        SC = {scPct.toFixed(1)}%S
      </text>

      <text x="230" y="298" textAnchor="middle" className="caseLabel"
        fill={pass ? COLORS.green : COLORS.red}>
        {pass
          ? `${state.theory === 'vonmises' ? 'Von Mises' : 'Tresca'} check: PASS — SC = ${scPct.toFixed(1)}%S ≤ ${(AF*100).toFixed(0)}%S`
          : `${state.theory === 'vonmises' ? 'Von Mises' : 'Tresca'} check: FAIL — SC = ${scPct.toFixed(1)}%S > ${(AF*100).toFixed(0)}%S`
        }
      </text>
    </svg>
  );
}

// ─── Mohr-circle-style stress element (pipe cross-section view) ──────────────

export function CombinedStressPipeSection({ state }: { state: CombinedStressState }) {
  const sH = state.sH / 100;
  const sLraw = state.sL / 100;
  const sL = state.sLSign === 'compression' ? -sLraw : sLraw;
  const sc  = Math.sqrt(sH * sH - sH * sL + sL * sL);
  const scColor = sc > state.allowableFactor ? COLORS.red : sc > state.allowableFactor * 0.85 ? COLORS.orange : COLORS.green;
  const cx = 230, cy = 155, ro = 78, ri = 48;
  const hoopExpand = sH * 22;
  const ovalise    = Math.abs(sL) * 14;

  return (
    <svg viewBox="0 0 460 340" role="img" aria-label="Pipe cross-section showing combined stress state">
      <SvgDefs />
      <rect x="14" y="18" width="432" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
      <text x="230" y="38" textAnchor="middle" className="label" fill={COLORS.cyan}>Pipe wall stress state (cross-section)</text>
      <text x="230" y="57" textAnchor="middle" className="muted">
        S<tspan baselineShift="sub" fontSize="9">C</tspan> = [S<tspan baselineShift="sub" fontSize="9">L</tspan>² − S<tspan baselineShift="sub" fontSize="9">L</tspan>·S<tspan baselineShift="sub" fontSize="9">H</tspan> + S<tspan baselineShift="sub" fontSize="9">H</tspan>²]<tspan dy="-4" fontSize="10">½</tspan>
      </text>

      {/* pipe annulus */}
      <ellipse cx={cx} cy={cy} rx={ro + hoopExpand} ry={ro + hoopExpand * 0.42 - ovalise}
        fill="rgba(85,184,255,.12)" stroke="rgba(220,245,255,.88)" strokeWidth="4" />
      <ellipse cx={cx} cy={cy} rx={Math.max(28, ri - 4)} ry={Math.max(22, ri - ovalise * 0.4)}
        fill="rgba(6,16,29,.88)" stroke="rgba(220,245,255,.42)" strokeWidth="2.2" />
      <text x={cx} y={cy + 5} textAnchor="middle" className="muted">bore</text>

      {/* hoop stress arrows */}
      {state.sH > 5 && <>
        <path d={`M${cx - ro - hoopExpand - 22} ${cy} C${cx - ro - hoopExpand - 8} ${cy-22},${cx - ro - hoopExpand - 8} ${cy+22},${cx - ro - hoopExpand - 22} ${cy}`}
          stroke={COLORS.blue} strokeWidth="2.6" fill="none" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
        <path d={`M${cx + ro + hoopExpand + 22} ${cy} C${cx + ro + hoopExpand + 8} ${cy-22},${cx + ro + hoopExpand + 8} ${cy+22},${cx + ro + hoopExpand + 22} ${cy}`}
          stroke={COLORS.blue} strokeWidth="2.6" fill="none" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
        <text x={cx} y={cy - ro - hoopExpand - 22} textAnchor="middle"
          fill={COLORS.blue} fontSize="11" fontWeight="900">σH = {state.sH}%S</text>
      </>}

      {/* longitudinal stress: in/out of plane shown as dot/cross */}
      {state.sL > 5 && (
        state.sLSign === 'tension' ? <>
          {[[-ro*0.5,0],[ro*0.5,0],[0,-ro*0.5],[0,ro*0.5]].map(([dx,dy],i) => (
            <circle key={i} cx={cx+dx} cy={cy+dy} r="5"
              fill={COLORS.orange} stroke="#06101d" strokeWidth="1.5" />
          ))}
          <text x={cx} y={cy + ro + hoopExpand + 30} textAnchor="middle"
            fill={COLORS.orange} fontSize="11" fontWeight="900">σL tension {state.sL}%S (out of page)</text>
        </> : <>
          {[[-ro*0.5,0],[ro*0.5,0],[0,-ro*0.5],[0,ro*0.5]].map(([dx,dy],i) => (
            <g key={i}>
              <circle cx={cx+dx} cy={cy+dy} r="6" fill="rgba(255,158,58,.22)" stroke={COLORS.orange} strokeWidth="2" />
              <path d={`M${cx+dx-4} ${cy+dy-4} L${cx+dx+4} ${cy+dy+4} M${cx+dx+4} ${cy+dy-4} L${cx+dx-4} ${cy+dy+4}`}
                stroke={COLORS.orange} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          ))}
          <text x={cx} y={cy + ro + hoopExpand + 30} textAnchor="middle"
            fill={COLORS.orange} fontSize="11" fontWeight="900">σL compression {state.sL}%S (into page)</text>
        </>
      )}

      {/* SC result bar */}
      <rect x={86} y={280} width="268" height="14" rx="7"
        fill="rgba(255,255,255,.06)" stroke="rgba(216,237,255,.22)" strokeWidth="1.5" />
      <rect x={86} y={280} width={clamp(sc, 0, 1) * 268} height="14" rx="7"
        fill={`${scColor}88`} stroke={scColor} strokeWidth="1.5" />
      <text x="220" y="293" textAnchor="middle" fill={scColor} fontSize="11" fontWeight="900">
        SC = {(sc * 100).toFixed(1)}%S
      </text>
      <text x="230" y="318" textAnchor="middle" className="caseLabel" fill={scColor}>
        {sc <= state.allowableFactor
          ? `Combined check PASS: ${(sc*100).toFixed(1)}%S ≤ ${(state.allowableFactor*100).toFixed(0)}%S`
          : `Combined check FAIL: ${(sc*100).toFixed(1)}%S > ${(state.allowableFactor*100).toFixed(0)}%S`}
      </text>
    </svg>
  );
}

// ─── Readout panel ────────────────────────────────────────────────────────────

export function CombinedStressReadout({ state }: { state: CombinedStressState }) {
  const sH = state.sH / 100;
  const sLraw = state.sL / 100;
  const sL = state.sLSign === 'compression' ? -sLraw : sLraw;
  const vonMisesVal = Math.sqrt(sH*sH - sH*sL + sL*sL);
  const trescaVal   = Math.max(Math.abs(sH - sL), Math.abs(sH), Math.abs(sL));
  const AF = state.allowableFactor;
  const vmPass = vonMisesVal <= AF;
  const trPass = trescaVal   <= AF;
  const checkVal = state.theory === 'vonmises' ? vonMisesVal : trescaVal;
  const pass = checkVal <= AF;
  const color = pass ? COLORS.green : COLORS.red;

  return (
    <div className="interp stress-readout">
      <span className="badge" style={{ color }}>
        {state.theory === 'vonmises' ? 'Von Mises criterion' : 'Tresca criterion'}
      </span>
      <h3 className="result-title">
        {pass ? 'Combined stress check: PASS' : 'Combined stress check: FAIL'}
      </h3>
      <p className="copy">
        The combined stress S<sub>C</sub> accounts for both hoop and longitudinal stress acting simultaneously. For a thin-wall pipeline, the 2-D Von Mises form is S<sub>C</sub> = [S<sub>L</sub>² − S<sub>L</sub>·S<sub>H</sub> + S<sub>H</sub>²]<sup>½</sup>. ASME B31.8 clause 833.4(a)–(2) requires S<sub>C</sub> ≤ 0.9·S·T. ASME B31.3 uses a similar allowable stress S<sub>h</sub> for sustained cases.
      </p>
      <div className="table">
        <div><span>σH input</span><b>{state.sH}%S ({state.sH > 67 ? 'high — rupture zone' : 'moderate'})</b></div>
        <div><span>σL input</span><b>{state.sL}%S {state.sLSign}</b></div>
        <div><span>Von Mises SC</span>
          <b style={{ color: vmPass ? COLORS.green : COLORS.red }}>
            {(vonMisesVal*100).toFixed(1)}%S {vmPass ? '✓' : '✗'} vs {(AF*100).toFixed(0)}%S
          </b>
        </div>
        <div><span>Tresca SC</span>
          <b style={{ color: trPass ? COLORS.green : COLORS.red }}>
            {(trescaVal*100).toFixed(1)}%S {trPass ? '✓' : '✗'} vs {(AF*100).toFixed(0)}%S
          </b>
        </div>
        <div><span>Active theory</span><b>{state.theory === 'vonmises' ? 'Von Mises (energy, ellipse)' : 'Tresca (shear, hexagon)'}</b></div>
      </div>
      <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
        <b>Why Von Mises for pipelines?</b>
        <span className="copy">Von Mises is slightly less conservative than Tresca (ellipse is ~15% larger). PDO GU969 and ASME B31.8 both specify Von Mises for combined stress assessment of ductile steel pipelines.</span>
      </div>
      <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}>
        <b>B31.3 vs B31.8 allowable</b>
        <span className="copy">B31.3 compares sustained SL against 1.0·Sh. B31.8 uses the combined Von Mises SC ≤ 0.9·S·T. The slider lets you compare both allowable factors.</span>
      </div>
    </div>
  );
}
