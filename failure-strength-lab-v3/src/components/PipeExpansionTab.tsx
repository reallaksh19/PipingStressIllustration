import { COLORS } from '../model/types';
import { SvgDefs } from './SvgDefs';

export type ExpansionState = {
  deltaT: number;         // 0-100  (represents 0-200 °C delta)
  pressure: number;       // 0-100
  restrained: boolean;
  showBourdon: boolean;
};

function clamp(n: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}

// α = 12e-6 /°C steel, E = 200 GPa. Displayed as % of span for illustration.
function thermalStressPct(deltaT: number) {
  // ST = E·α·ΔT. At ΔT=200°C → ~480 MPa. Normalise to 100 at ΔT=200.
  return clamp(deltaT / 100 * 100, 0, 100);
}

function pressureElongationPct(pressure: number) {
  // 0.5·SH·L/E concept — shown as fraction of thermal expansion contribution.
  return clamp(pressure * 0.35, 0, 100);
}

export function PipeExpansionSideSvg({ state }: { state: ExpansionState }) {
  const tFrac = state.deltaT / 100;
  const pFrac = state.pressure / 100;
  const maxElong = 58;
  const thermalElong = tFrac * maxElong;
  const pressElong = pFrac * maxElong * 0.35;

  const anchorX = 92;
  const freeEndX = 414;
  const pipeStart = anchorX + 24;
  const elongatedX = state.restrained ? freeEndX : freeEndX + thermalElong + pressElong;

  const thermalSt = thermalStressPct(state.deltaT);
  const stressColor = thermalSt > 72 ? COLORS.red : thermalSt > 44 ? COLORS.orange : COLORS.green;
  const pressurePct = pressureElongationPct(state.pressure);
  const noteLine1 = 'Straight pipe: thermal ΔL plus pressure elongation cue.';
  const noteLine2 = 'Bourdon bend straightening is handled in its own tab.';

  return <svg viewBox="0 0 640 330" role="img" aria-label="Pipe thermal expansion and pressure elongation">
    <SvgDefs />
    <rect x="14" y="16" width="612" height="296" rx="28" fill="rgba(255,255,255,.023)" stroke="rgba(190,220,255,.10)" />
    <path d="M52 96H588 M52 184H588 M52 272H588 M160 48V296 M320 48V296 M480 48V296" stroke="rgba(216,237,255,.06)" />

    <text x="320" y="40" textAnchor="middle" className="label" fill={COLORS.cyan}>{state.restrained ? 'Restrained straight pipe — thermal stress builds up' : 'Unrestrained straight pipe — free to elongate'}</text>
    <text x="320" y="61" textAnchor="middle" className="muted">ΔL = α·L·ΔT{state.pressure > 10 ? ' + 0.5·SH·L/E pressure elongation cue' : ''}</text>

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
      <text x={freeEndX + 9} y="142" textAnchor="middle" className="muted">wall / anchor</text>
      <path d={`M${freeEndX + 36} 190 L${freeEndX + 18} 190`} stroke={COLORS.orange} strokeWidth="5" strokeLinecap="round" markerEnd="url(#arrowOrange)" />
      <text x={freeEndX + 54} y="194" fill={COLORS.orange} fontSize="11" fontWeight="900">reaction</text>
      <rect x={pipeStart} y="232" width={clamp(thermalElong + pressElong * 0.5, 0, freeEndX - pipeStart - 8)} height="12" rx="6" fill={`${stressColor}55`} stroke={stressColor} strokeWidth="1.8" />
      <text x="290" y="259" textAnchor="middle" fill={stressColor} fontSize="12" fontWeight="900">ST ≈ {thermalSt.toFixed(0)}% of yield concept</text>
    </> : <>
      {(thermalElong + pressElong) > 4 && <>
        <path d={`M${freeEndX} 145 L${elongatedX} 145`} stroke={COLORS.cyan} strokeWidth="2" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
        <text x={(freeEndX + elongatedX) / 2} y="136" textAnchor="middle" fill={COLORS.cyan} fontSize="11" fontWeight="900">ΔL total</text>
        {state.pressure > 10 && <>
          <path d={`M${freeEndX} 224 L${freeEndX + pressElong} 224`} stroke={COLORS.blue} strokeWidth="2" strokeLinecap="round" markerStart="url(#arrowStart)" markerEnd="url(#arrow)" />
          <text x={freeEndX + pressElong / 2} y="239" textAnchor="middle" fill={COLORS.blue} fontSize="10" fontWeight="900">pressure elong.</text>
        </>}
      </>}
      <text x="294" y="259" textAnchor="middle" fill={COLORS.green} fontSize="12" fontWeight="900">Unrestrained: displacement occurs; thermal stress ≈ 0</text>
    </>}

    <g transform="translate(462 224)">
      <rect x="0" y="0" width="150" height="72" rx="15" fill="rgba(6,16,29,.72)" stroke="rgba(190,220,255,.22)" strokeWidth="1.5" />
      <text x="75" y="20" textAnchor="middle" fill={COLORS.yellow} fontSize="10" fontWeight="950">PRESSURE ELONGATION</text>
      <text x="75" y="43" textAnchor="middle" className="muted" fontSize="9">0.5·SH·L/E cue</text>
      <text x="75" y="61" textAnchor="middle" fill={COLORS.blue} fontSize="12" fontWeight="900">{pressurePct.toFixed(0)}% of span</text>
    </g>

    {state.pressure > 20 && <>
      <text x="320" y="302" textAnchor="middle" className="muted">{noteLine1}</text>
      <text x="320" y="317" textAnchor="middle" className="muted">{noteLine2}</text>
    </>}
  </svg>;
}

export function PipeExpansionReadout({ state }: { state: ExpansionState }) {
  const thermalSt = thermalStressPct(state.deltaT);
  const stressColor = thermalSt > 72 ? COLORS.red : thermalSt > 44 ? COLORS.orange : COLORS.green;
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.cyan }}>thermal / pressure elongation</span>
    <h3 className="result-title">{state.restrained ? 'Restrained pipe — thermal stress accumulates' : 'Unrestrained pipe — elongation without stress'}</h3>
    <p className="copy">A steel pipe expands by ΔL = α·L·ΔT when heated. If the ends are free, it gets longer with little thermal stress. If restrained, it develops compressive thermal stress ST = E·α·ΔT. Pressure elongation is shown separately as a straight-pipe axial strain cue.</p>
    <div className="table">
      <div><span>Thermal ΔT</span><b>{state.deltaT * 2}°C (conceptual scale)</b></div>
      <div><span>Restrained?</span><b>{state.restrained ? 'Yes — stress builds' : 'No — free elongation'}</b></div>
      <div><span>ST concept</span><b style={{ color: stressColor }}>≈ {thermalSt.toFixed(0)}% of yield-level stress</b></div>
      <div><span>Pressure elong.</span><b>0.5·SH·L/E — straight-pipe axial elongation cue</b></div>
      <div><span>Bourdon effect</span><b>Moved to dedicated Bourdon Effect tab</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}>
      <b>ASME B31.3 context</b><span className="copy">Thermal expansion stress is checked as an expansion stress range. Sustained pressure/weight checks and expansion checks are kept separate in piping codes; this visual is concept-level only.</span>
    </div>
  </div>;
}

export function PipeExpansionEquations({ state }: { state: ExpansionState }) {
  return <div className="interp stress-readout">
    <span className="badge" style={{ color: COLORS.yellow }}>key equations</span>
    <h3 className="result-title">Expansion and pressure elongation formulas</h3>
    <div className="table">
      <div><span>Thermal elong.</span><b>ΔL<sub>T</sub> = α · L · ΔT</b></div>
      <div><span>Pressure elong.</span><b>ΔL<sub>P</sub> = 0.5 · S<sub>H</sub> · L / E</b></div>
      <div><span>Hoop shrinkage</span><b>ΔD = −ν · S<sub>H</sub> · D / E (diametric)</b></div>
      <div><span>Restrained ST</span><b>S<sub>T</sub> = E · α · ΔT</b></div>
      <div><span>Total longit. SL</span><b>S<sub>L</sub> = S<sub>P</sub> + S<sub>T</sub> + S<sub>B</sub></b></div>
      <div><span>α steel</span><b>≈ 12 × 10⁻⁶ /°C</b></div>
      <div><span>E steel</span><b>≈ 200 GPa (207,000 MPa)</b></div>
      <div><span>ν steel</span><b>≈ 0.3 (Poisson's ratio)</b></div>
    </div>
    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}>
      <b>Equivalent temperature for pressure elongation</b><span className="copy">A hoop stress of 207 MPa (30 ksi) produces a pressure elongation equivalent to about a 20°C temperature-rise scale in this teaching model. Use the Bourdon Effect tab for curved-bend straightening.</span>
    </div>
  </div>;
}
