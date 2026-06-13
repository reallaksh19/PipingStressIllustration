import { COLORS } from '../model/types';
import { SvgDefs } from './SvgDefs';

export type LoadsState = {
  activeLoad: LoadCategory;
  sustainedLevel: number;   // 0-100
  thermalDelta: number;     // 0-100  (maps to ΔT concept)
  occasionalOn: boolean;
};

export type LoadCategory = 'sustained' | 'occasional' | 'thermal' | 'displacement';

// ─── Side-view SVG ───────────────────────────────────────────────────────────

export function LoadsSideSvg({ state }: { state: LoadsState }) {
  const isPrimary   = state.activeLoad === 'sustained' || state.activeLoad === 'occasional';
  const isSecondary = state.activeLoad === 'thermal'   || state.activeLoad === 'displacement';
  const isSustained  = state.activeLoad === 'sustained';
  const isOccasional = state.activeLoad === 'occasional';
  const isThermal    = state.activeLoad === 'thermal';
  const isDisplace   = state.activeLoad === 'displacement';

  const thermalExpand = isThermal    ? state.thermalDelta * 0.28 : 0;
  const pressurePush  = isSustained  ? state.sustainedLevel * 0.14 : 0;
  const occasionalBow = isOccasional ? state.sustainedLevel * 0.18 : 0;

  const pipeX1 = 88 - pressurePush * 0.5;
  const pipeX2 = 552 + thermalExpand + pressurePush * 0.5;
  const pipeMid = (pipeX1 + pipeX2) / 2;
  const pipeY  = 190;
  const sag    = occasionalBow;
  const pipePath = isOccasional
    ? `M${pipeX1} ${pipeY} C${pipeX1+100} ${pipeY - sag}, ${pipeX2-100} ${pipeY + sag*0.6}, ${pipeX2} ${pipeY}`
    : `M${pipeX1} ${pipeY} H${pipeX2}`;
  const refPath = 'M88 190 H552';

  return (
    <svg viewBox="0 0 640 370" role="img" aria-label="Loads on piping — side view">
      <SvgDefs />
      <rect x="14" y="18" width="612" height="330" rx="30" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
      <path d="M52 116H588 M52 210H588 M52 304H588 M160 48V334 M320 48V334 M480 48V334" stroke="rgba(216,237,255,.06)" />

      <text x="320" y="42" textAnchor="middle" className="label" fill={COLORS.cyan}>
        {isPrimary ? 'Primary load: force-controlled stress' : 'Secondary/displacement load: self-limiting strain'}
      </text>
      <text x="320" y="64" textAnchor="middle" className="muted">
        sustained / occasional loads are not treated like thermal expansion in code logic
      </text>

      <path d={refPath} stroke="rgba(216,237,255,.18)" strokeWidth="42" strokeLinecap="round" strokeDasharray="9 11" />
      <path d={pipePath} stroke="#020813" strokeWidth="50" strokeLinecap="round" fill="none" opacity=".9" />
      <path d={pipePath} stroke="url(#pipeStroke)" strokeWidth="34" strokeLinecap="round" fill="none" />
      <path d={pipePath} stroke="#06101d" strokeWidth="13" strokeLinecap="round" fill="none" opacity=".78" strokeDasharray="18 12" />

      {/* anchors / supports */}
      <rect x="70" y="157" width="28" height="66" rx="8" fill="rgba(216,237,255,.10)" stroke="rgba(216,237,255,.42)" />
      <rect x="542" y="157" width="28" height="66" rx="8" fill="rgba(216,237,255,.10)" stroke="rgba(216,237,255,.42)" />
      <text x="84" y="240" textAnchor="middle" className="muted">support</text>
      <text x="556" y="240" textAnchor="middle" className="muted">support</text>

      {isSustained && <>
        <path d={`M${pipeMid} 95 V146`} stroke={COLORS.orange} strokeWidth="4" strokeLinecap="round" markerEnd="url(#arrowOrange)" />
        <text x={pipeMid+10} y="112" className="label" fill={COLORS.orange}>weight + pressure</text>
        <text x="320" y="308" textAnchor="middle" className="caseLabel" fill={COLORS.orange}>
          sustained load → primary stress; must be carried continuously
        </text>
      </>}

      {isOccasional && <>
        <path d="M72 92 C150 48 258 48 326 92 C414 144 500 144 578 92" stroke={COLORS.yellow} strokeWidth="3.2" fill="none" strokeDasharray="8 7" />
        <path d={`M${pipeMid-36} 82 C${pipeMid-10} 50 ${pipeMid+34} 50 ${pipeMid+62} 82`} stroke={COLORS.orange} strokeWidth="3.6" fill="none" markerEnd="url(#arrowOrange)" />
        <text x="320" y="105" textAnchor="middle" className="label" fill={COLORS.orange}>wind / seismic / relief event</text>
        <text x="320" y="308" textAnchor="middle" className="caseLabel" fill={COLORS.orange}>
          occasional load → primary stress with short-term allowance concept
        </text>
      </>}

      {isThermal && <>
        <path d={`M88 258 H${pipeX2}`} stroke="rgba(216,237,255,.28)" strokeWidth="3" strokeDasharray="6 7" />
        <path d={`M552 258 H${pipeX2}`} stroke={COLORS.cyan} strokeWidth="5" strokeLinecap="round" markerEnd="url(#arrow)" />
        <text x={(552+pipeX2)/2} y="282" textAnchor="middle" className="label" fill={COLORS.cyan}>free thermal growth ΔL</text>
        <path d="M104 125 C170 86 246 86 312 125 C384 168 470 168 536 125" stroke={COLORS.cyan} strokeWidth="3" fill="none" strokeDasharray="8 8" opacity=".7" />
        <text x="320" y="308" textAnchor="middle" className="caseLabel" fill={COLORS.cyan}>
          thermal expansion → displacement strain range; self-limiting if yielding occurs
        </text>
      </>}

      {isDisplace && <>
        <path d="M84 98 C122 54 180 54 220 98 M420 98 C460 54 518 54 556 98" stroke={COLORS.purple} strokeWidth="3.6" fill="none" markerEnd="url(#arrow)" />
        <path d="M106 170 C128 146 156 146 178 170" stroke={COLORS.purple} strokeWidth="3" fill="none" />
        <path d="M462 210 C486 238 522 238 548 210" stroke={COLORS.purple} strokeWidth="3" fill="none" />
        <text x="320" y="105" textAnchor="middle" className="label" fill={COLORS.purple}>support settlement / imposed displacement</text>
        <text x="320" y="308" textAnchor="middle" className="caseLabel" fill={COLORS.purple}>
          displacement load → secondary-type stress; compatibility controlled
        </text>
      </>}

      <g transform="translate(78 326)">
        <circle cx="0" cy="0" r="6" fill={isPrimary ? COLORS.orange : COLORS.cyan} />
        <text x="14" y="4" className="muted">
          {isPrimary ? 'Primary = force/load equilibrium; no self-relief assumption' : 'Secondary = displacement/strain compatibility; can redistribute'}
        </text>
      </g>
    </svg>
  );
}

// ─── Readout ────────────────────────────────────────────────────────────────

export function LoadsReadout({ state }: { state: LoadsState }) {
  const primary = state.activeLoad === 'sustained' || state.activeLoad === 'occasional';
  const sustained = state.activeLoad === 'sustained';
  const occasional = state.activeLoad === 'occasional';
  const thermal = state.activeLoad === 'thermal';
  const displacement = state.activeLoad === 'displacement';

  return (
    <div className="interp stress-readout">
      <span className="badge" style={{ color: primary ? COLORS.orange : COLORS.cyan }}>
        {primary ? 'primary load path' : 'secondary / displacement path'}
      </span>
      <h3 className="result-title">
        {sustained ? 'Sustained load: weight + pressure' :
         occasional ? 'Occasional load: wind / seismic / relief' :
         thermal ? 'Thermal expansion load' : 'Imposed displacement load'}
      </h3>
      <p className="copy">
        {sustained && 'Sustained loads generate primary stresses required for force equilibrium. They do not disappear by local yielding.'}
        {occasional && 'Occasional loads are also force-controlled, but code checks commonly permit short-duration occasional allowances.'}
        {thermal && 'Thermal expansion creates displacement strain. In a flexible system the pipe moves; in a restrained system stress develops from blocked expansion.'}
        {displacement && 'Support settlement, anchor movement, or imposed nozzle displacement is displacement-controlled. The concern is compatibility and cyclic strain range.'}
      </p>

      <div className="table">
        <div><span>Class</span><b>{primary ? 'Primary' : 'Secondary / displacement'}</b></div>
        <div><span>Controlled by</span><b>{primary ? 'force equilibrium' : 'compatibility / imposed movement'}</b></div>
        <div><span>Typical examples</span><b>{sustained ? 'weight, pressure' : occasional ? 'wind, seismic, relief thrust' : thermal ? 'thermal ΔT expansion' : 'settlement, anchor displacement, nozzle movement'}</b></div>
        <div><span>Failure concern</span><b>{primary ? 'collapse / gross plasticity if too high' : 'fatigue / ratcheting / displacement stress range'}</b></div>
      </div>

      <div className="bucket" style={{ borderColor: primary ? 'rgba(255,158,58,.28)' : 'rgba(82,240,223,.28)' }}>
        <b>Teaching boundary</b>
        <span className="copy">This tab only classifies load type. Detailed sustained, occasional, and expansion-stress equations come in later checks.</span>
      </div>
    </div>
  );
}

// ─── Code concept table ─────────────────────────────────────────────────────

export function LoadsCodeTable() {
  return (
    <div className="interp stress-readout">
      <span className="badge" style={{ color: COLORS.yellow }}>code concept map</span>
      <h3 className="result-title">How piping codes separate loads</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <div className="card correct"><strong>Sustained</strong><span className="copy">Weight + pressure. Primary stress category. Typical check: longitudinal sustained stress against hot allowable.</span></div>
        <div className="card correct"><strong>Occasional</strong><span className="copy">Wind, earthquake, relief, blast/event loads. Treated with occasional load combinations and temporary allowances.</span></div>
        <div className="card correct"><strong>Expansion / thermal</strong><span className="copy">Displacement stress range from thermal growth. The system may self-relieve through flexibility and yielding.</span></div>
        <div className="card correct"><strong>Imposed displacement</strong><span className="copy">Anchor, support, settlement, nozzle movement. Compatibility-controlled, not simple force equilibrium.</span></div>
      </div>
      <p className="fb">Correct sequence: classify the load first, then choose the appropriate stress equation and allowable basis.</p>
    </div>
  );
}
