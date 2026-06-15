import { COLORS } from '../model/types';
import { SvgDefs } from './SvgDefs';

export type ExpansionState = {
  deltaT: number;         // 0-100  (represents 0-200 °C delta)
  pressure: number;       // 0-100  (conceptual pressure/hoop-stress cue)
  restrained: boolean;
  showBourdon: boolean;
};

const STEEL_ALPHA = 12e-6; // /°C, teaching value only
const STEEL_E_MPA = 200_000; // MPa, teaching value only
const STEEL_NU = 0.30;

function clamp(n: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}

function deltaTC(state: ExpansionState) {
  return state.deltaT * 2;
}

function thermalStressPct(deltaT: number) {
  // Ideal fully restrained straight-member stress: ST = E·α·ΔT.
  // At ΔT=200°C: 200000 MPa * 12e-6/°C * 200°C ≈ 480 MPa.
  // This is intentionally normalized as a teaching severity, not a code allowable ratio.
  return clamp(deltaT / 100 * 100, 0, 100);
}

function freeThermalMovementPct(deltaT: number) {
  return clamp(deltaT / 100, 0, 1);
}

function pressureElongationPct(pressure: number) {
  // Closed-end thin-wall teaching cue:
  // εL,p ≈ (SL - ν·SH)/E, with SL ≈ 0.5·SH.
  // Therefore εL,p ≈ (0.5 - ν)·SH/E, not a raw 0.5·SH/E shortcut.
  return clamp(pressure * (0.5 - STEEL_NU), 0, 100);
}

function expansionSummary(state: ExpansionState) {
  const dT = deltaTC(state);
  const thermalPct = thermalStressPct(state.deltaT);
  const freeMove = freeThermalMovementPct(state.deltaT);
  const pressurePct = pressureElongationPct(state.pressure);
  const dominant = state.restrained
    ? 'restrained thermal displacement route'
    : state.pressure > 35
      ? 'free thermal growth plus pressure axial-strain cue'
      : 'free thermal displacement route';
  const severity = state.restrained
    ? thermalPct > 72 ? 'high restraint reaction cue' : thermalPct > 44 ? 'moderate restraint reaction cue' : 'low restraint reaction cue'
    : freeMove > 0.72 ? 'large free displacement cue' : freeMove > 0.44 ? 'moderate free displacement cue' : 'small free displacement cue';

  return {
    dT,
    thermalPct,
    pressurePct,
    dominant,
    severity,
    b313Route: state.restrained
      ? 'Route restrained thermal growth as displacement/flexibility and reaction/nozzle/support evaluation, not as ordinary sustained weight stress.'
      : 'Route free growth as displacement/clearance/flexibility review; stress appears when movement is restrained by anchors, guides, stops, equipment, or supports.',
  };
}

function expansionRouteRows(state: ExpansionState) {
  const summary = expansionSummary(state);
  return [
    ['Thermal movement', 'ΔL = α·L·ΔT; free growth is displacement, not primary force stress.'],
    ['Restrained case', state.restrained ? 'Ideal ST = E·α·ΔT shown as reaction cue; real piping response depends on flexibility and restraint stiffness.' : 'Unrestrained straight pipe elongates; check clearance, support travel, and connected-equipment movement.'],
    ['Pressure elongation', `Use εL,p ≈ (SL − ν·SH)/E; thin-wall closed-end cue ≈ (0.5 − ν)·SH/E ≈ ${(0.5 - STEEL_NU).toFixed(2)}·SH/E.`],
    ['B31.3 map', 'Thermal/equipment/support movement → 319 flexibility / displacement-stress-range route; pressure design remains 304; sustained weight remains 302.3.5.'],
    ['Reporting boundary', 'Use relevant code edition and Client criteria before evaluating/reporting expansion stresses, movements, reactions, or nozzle loads.'],
    ['Current emphasis', summary.dominant],
  ] as const;
}

export function PipeExpansionSideSvg({ state }: { state: ExpansionState }) {
  const tFrac = state.deltaT / 100;
  const pFrac = state.pressure / 100;
  const maxElong = 58;
  const thermalElong = tFrac * maxElong;
  const pressElong = pFrac * maxElong * (0.5 - STEEL_NU);

  const anchorX = 92;
  const freeEndX = 414;
  const pipeStart = anchorX + 24;
  const elongatedX = state.restrained ? freeEndX : freeEndX + thermalElong + pressElong;

  const summary = expansionSummary(state);
  const stressColor = summary.thermalPct > 72 ? COLORS.red : summary.thermalPct > 44 ? COLORS.orange : COLORS.green;

  return <svg viewBox="0 0 640 330" role="img" aria-label="Pipe thermal expansion and pressure elongation">
    <SvgDefs />
    <rect x="14" y="16" width="612" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M52 96H588 M52 184H588 M52 272H588 M160 48V296 M320 48V296 M480 48V296" stroke="rgba(216,237,255,.06)" />

    <text x="320" y="40" textAnchor="middle" className="label" fill={COLORS.cyan}>{state.restrained ? 'Restrained straight pipe — thermal reaction cue' : 'Unrestrained straight pipe — free expansion cue'}</text>
    <text x="320" y="61" textAnchor="middle" className="muted">Thermal movement routes through flexibility / displacement range, not sustained weight stress.</text>

    <path d={`M${pipeStart} 160 H${freeEndX}`} stroke="rgba(216,237,255,.18)" strokeWidth="34" strokeLinecap="round" strokeDasharray="10 14" />
    <text x={(pipeStart + freeEndX) / 2} y="126" textAnchor="middle" className="muted">cold / installed position</text>

    <path d={`M${pipeStart} 190 H${elongatedX}`} stroke="#020813" strokeWidth="44" strokeLinecap="round" opacity=".88" />
    <path d={`M${pipeStart} 190 H${elongatedX}`} stroke={state.restrained ? stressColor : 'url(#pipeStroke)'} strokeWidth="30" strokeLinecap="round" opacity={state.restrained ? 0.78 : 1} />
    <path d={`M${pipeStart} 190 H${elongatedX}`} stroke="#06101d" strokeWidth="10" strokeLinecap="round" opacity=".72" strokeDasharray="17 12" />

    <g aria-label="left anchor">
      <rect x={anchorX - 12} y="158" width="22" height="64" rx="6" fill="rgba(216,231,242,.22)" stroke="rgba(216,231,242,.72)" strokeWidth="2.5" />
      <path d={`M${anchorX - 20} 222 H${anchorX + 10}`} stroke="rgba(216,231,242,.55)" strokeWidth="3" strokeLinecap="round" />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M${anchorX - 20 + i * 10} 222 L${anchorX - 26 + i * 10} 234`} stroke="rgba(216,231,242,.38)" strokeWidth="2" strokeLinecap="round" />)}
      <text x={anchorX} y="145" textAnchor="middle" className="muted">anchor</text>
    </g>

    {state.restrained ? <>
      <rect x={freeEndX} y="154" width="18" height="72" rx="6" fill="rgba(216,231,242,.28)" stroke="rgba(216,231,242,.72)" strokeWidth="3" />
      <text x={freeEndX + 9} y="142" textAnchor="middle" className="muted">stop</text>
      <path d={`M${freeEndX + 36} 190 L${freeEndX + 18} 190`} stroke={COLORS.orange} strokeWidth="5" strokeLinecap="round" markerEnd="url(#arrowOrange)" />
      <text x={freeEndX + 54} y="194" fill={COLORS.orange} fontSize="11" fontWeight="900">reaction</text>
      <rect x={pipeStart} y="232" width={clamp(thermalElong + pressElong * 0.5, 0, freeEndX - pipeStart - 8)} height="12" rx="6" fill={`${stressColor}55`} stroke={stressColor} strokeWidth="1.8" />
      <text x="290" y="259" textAnchor="middle" fill={stressColor} fontSize="12" fontWeight="900">ideal ST cue ≈ {summary.thermalPct.toFixed(0)}%</text>
    </> : <>
      {(thermalElong + pressElong) > 4 && <>
        <path d={`M${freeEndX} 145 L${elongatedX} 145`} stroke={COLORS.cyan} strokeWidth="2" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
        <text x={(freeEndX + elongatedX) / 2} y="136" textAnchor="middle" fill={COLORS.cyan} fontSize="11" fontWeight="900">ΔL total</text>
        {state.pressure > 10 && <>
          <path d={`M${freeEndX} 224 L${freeEndX + pressElong} 224`} stroke={COLORS.blue} strokeWidth="2" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
          <text x={freeEndX + pressElong / 2} y="239" textAnchor="middle" fill={COLORS.blue} fontSize="10" fontWeight="900">pressure strain cue</text>
        </>}
      </>}
      <text x="294" y="259" textAnchor="middle" fill={COLORS.green} fontSize="12" fontWeight="900">free growth: movement first, stress only if restrained</text>
    </>}

    <g transform="translate(456 224)">
      <rect x="0" y="0" width="156" height="72" rx="15" fill="rgba(6,16,29,.72)" stroke="rgba(190,220,255,.22)" strokeWidth="1.5" />
      <text x="78" y="20" textAnchor="middle" fill={COLORS.yellow} fontSize="10" fontWeight="950">PRESSURE AXIAL STRAIN</text>
      <text x="78" y="43" textAnchor="middle" className="muted" fontSize="9">(SL − νSH)L/E cue</text>
      <text x="78" y="61" textAnchor="middle" fill={COLORS.blue} fontSize="12" fontWeight="900">{summary.pressurePct.toFixed(0)}% of span</text>
    </g>

    {state.pressure > 20 && <>
      <text x="320" y="302" textAnchor="middle" className="muted">Straight-pipe pressure elongation is kept separate from Bourdon bend opening.</text>
      <text x="320" y="317" textAnchor="middle" className="muted">Bend straightening belongs in the Bourdon tab.</text>
    </>}
  </svg>;
}

export function PipeExpansionReadout({ state }: { state: ExpansionState }) {
  const summary = expansionSummary(state);
  const stressColor = summary.thermalPct > 72 ? COLORS.red : summary.thermalPct > 44 ? COLORS.orange : COLORS.green;
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: state.restrained ? COLORS.orange : COLORS.cyan }}>{summary.severity}</span>
    <h3 className="result-title">{state.restrained ? 'Restrained thermal growth creates secondary reaction' : 'Free expansion creates displacement before stress'}</h3>
    <p className="copy">Thermal growth is a displacement source. In real piping, stress appears when anchors, guides, stops, equipment, or support friction restrain that movement. Keep pressure containment, sustained weight, and expansion/flexibility routes separate.</p>
    <div className="table">
      <div><span>Thermal ΔT</span><b>{summary.dT}°C conceptual scale</b></div>
      <div><span>Free thermal strain</span><b>αΔT ≈ {(STEEL_ALPHA * summary.dT * 1e6).toFixed(0)} microstrain</b></div>
      <div><span>Restrained?</span><b>{state.restrained ? 'Yes — reaction/stress cue shown' : 'No — movement/clearance cue shown'}</b></div>
      <div><span>Ideal ST cue</span><b style={{ color: stressColor }}>EαΔT ≈ {summary.thermalPct.toFixed(0)}% teaching severity</b></div>
      <div><span>Pressure elongation</span><b>εL,p ≈ (SL − νSH)/E, not a Bourdon bend effect</b></div>
      <div><span>Bourdon effect</span><b>Moved to dedicated Bourdon Effect tab</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}>
      <b>Route boundary</b><span className="copy">{summary.b313Route} Use relevant code edition and Client criteria before evaluating/reporting expansion stresses, movements, reactions, or nozzle loads.</span>
    </div>
  </div>;
}

export function PipeExpansionEquations({ state }: { state: ExpansionState }) {
  const rows = expansionRouteRows(state);
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.yellow }}>expansion route map</span>
    <h3 className="result-title">Movement first; stress route after restraint</h3>
    <div className="table">
      <div><span>Thermal elong.</span><b>ΔL<sub>T</sub> = α · L · ΔT</b></div>
      <div><span>Pressure axial strain</span><b>ΔL<sub>P</sub> ≈ (S<sub>L</sub> − νS<sub>H</sub>) · L / E</b></div>
      <div><span>Thin-wall closed end</span><b>S<sub>L</sub> ≈ 0.5S<sub>H</sub> → ε<sub>L,p</sub> ≈ (0.5 − ν)S<sub>H</sub>/E</b></div>
      <div><span>Restrained ideal stress</span><b>S<sub>T,ideal</sub> = E · α · ΔT</b></div>
      <div><span>Steel teaching values</span><b>α≈12×10⁻⁶/°C, E≈200 GPa, ν≈0.30</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
      <b>Engineering route rows</b>
      <div className="table mini-table">
        {rows.map(([name, value]) => <div key={name}><span>{name}</span><b>{value}</b></div>)}
      </div>
    </div>
  </div>;
}
