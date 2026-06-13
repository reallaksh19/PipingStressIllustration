import { LabState, Status } from '../model/types';
import { allowableStressRangePercent, cycleLabel, logCycles } from '../model/fatigueModel';

type Item = { label: string; value: string };
type Step = { title: string; text: string };
type Readout = { headline: string; principle: string; items: Item[]; steps: Step[]; watch: string; caution: string };
type StaticHelper = { title: string; route: string; concept: string; piping: string; b313: string; mistake: string; next: string };

export function Interpretation({ state, status }: { state: LabState; status: Status }) {
  const r = state.mode === 'fatigue' ? fatigueReadout(state) : staticReadout(state);
  return <div className="interp" style={{ gap: 13 }}>
    <span className="badge" style={{ color: status.color }}>{status.badge}</span>
    <h3 className="result-title">{r.headline}</h3>
    <p className="copy">{r.principle}</p>

    <div className="table">
      {r.items.map(item => <div key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}
    </div>

    <div style={{ display: 'grid', gap: 8 }}>
      {r.steps.map((step, index) => <div className="card" key={step.title} style={{ gridTemplateColumns: '32px 1fr', alignItems: 'start' }}>
        <b style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 999, border: '1px solid rgba(82,240,223,.35)', color: '#dcfffb' }}>{index + 1}</b>
        <span><b>{step.title}</b><br/><span className="copy">{step.text}</span></span>
      </div>)}
    </div>

    {state.mode === 'static' && <StaticLearningHelpers state={state} />}

    <div className="bucket" style={{ borderColor: 'rgba(82,240,223,.28)' }}><b>Watch in the graphics</b><span className="copy">{r.watch}</span></div>
    <div className="bucket" style={{ borderColor: 'rgba(255,215,91,.28)' }}><b>Boundary</b><span className="copy">{r.caution}</span></div>
  </div>;
}

function StaticLearningHelpers({ state }: { state: LabState }) {
  const helpers = staticHelpers(state);
  return <div style={{ display: 'grid', gap: 8 }} aria-label="Static loading learning helpers">
    <div className="bucket" style={{ borderColor: 'rgba(184,132,255,.34)', background: 'rgba(184,132,255,.055)' }}>
      <b>ⓘ Tab 1 learning layer</b>
      <span className="copy">Use these helpers like a Little P.Eng-style route: mechanism → piping example → B31.3 map → common mistake. Educational interpretation only; verify exact wording and applicability in the licensed project B31.3 edition.</span>
    </div>
    {helpers.map(helper => <HelperDetails key={helper.title} helper={helper} />)}
  </div>;
}

function HelperDetails({ helper }: { helper: StaticHelper }) {
  const gridStyle = { display: 'grid', gridTemplateColumns: '112px 1fr', gap: 6, alignItems: 'start' } as const;
  return <details className="card" style={{ borderColor: 'rgba(82,240,223,.26)' }}>
    <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', fontWeight: 950 }}>
      <span>ⓘ {helper.title}</span>
      <span style={{ color: '#52f0df', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}>{helper.route}</span>
    </summary>
    <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
      <div style={gridStyle}><b>Concept</b><span className="copy">{helper.concept}</span></div>
      <div style={gridStyle}><b>Piping use</b><span className="copy">{helper.piping}</span></div>
      <div style={gridStyle}><b>B31.3 map</b><span className="copy">{helper.b313}</span></div>
      <div style={gridStyle}><b>Mistake</b><span className="copy">{helper.mistake}</span></div>
      <div style={gridStyle}><b>Next</b><span className="copy">{helper.next}</span></div>
    </div>
  </details>;
}

function staticHelpers(state: LabState): StaticHelper[] {
  const ductile = state.material === 'ductile';
  const tension = state.staticDemand === 'tension';
  const demand = tension ? 'axial tension' : 'axial compression';
  const materialRoute = ductile ? 'ductile metal' : 'low ductility';
  const limitState = ductile
    ? tension ? 'yielding, plastic localization, necking, and rupture warning' : 'yielding, ovalisation, wrinkling, local buckling, or collapse warning'
    : tension ? 'flaw opening and sudden fracture sensitivity' : 'crushing, diagonal splitting, and brittle break-up sensitivity';

  return [
    {
      title: 'Material response',
      route: materialRoute,
      concept: ductile
        ? 'Ductile material gives deformation warning: elastic strain first, then yield/plastic strain, then a high-demand damage region.'
        : 'Brittle or low-ductility behavior may stay visually elastic until a flaw or local damage becomes critical.',
      piping: ductile
        ? 'Most metallic process piping is treated through allowable stress and stress-category checks, but ductility still matters for warning, redistribution, impact testing, and low-temperature service.'
        : 'Low-temperature service, cast/fragile materials, old damage, flaws, or unsuitable material selection can make fracture sensitivity more important than visible yielding.',
      b313: 'Map to material suitability and allowable-stress basis: Chapter III / para. 323 family and Appendix A allowable tables. Verify the exact material, temperature, service, and edition in the licensed code.',
      mistake: 'Do not read the σ–ε curve as a B31.3 pass/fail curve. B31.3 normally uses allowable stresses and stress categories, not this full curve as the design check.',
      next: 'For pipe-specific components, go to Pipe Stress · σθ σL τ after understanding the material response.',
    },
    {
      title: 'Static demand visual',
      route: demand,
      concept: `The selected static case is ${demand}. The picture exaggerates ${limitState}; it is not showing calculated code stress.`,
      piping: tension
        ? 'Axial tension may appear from pressure end load, equipment pull, installation fit-up, or imposed displacement, depending on the load source.'
        : 'Compression can appear through restraint, anchor movement, settlement, column-like behavior, or local instability; geometry and boundary conditions matter.',
      b313: 'For sustained force-origin loading, connect later to the sustained longitudinal stress route in the 302.3.5 family. For imposed displacement, connect to the displacement/flexibility route instead.',
      mistake: 'Do not classify a load only by whether the pipe looks stretched or compressed. First identify the physical source: force-controlled or displacement-controlled.',
      next: 'Use Load Types · source route to classify whether the same visual belongs to sustained, occasional, or displacement stress logic.',
    },
    {
      title: 'Pipe-wall section',
      route: 'local wall',
      concept: 'The cross-section helper shows the pipe wall as an annulus. Static axial stress acts through the metal wall area, while local yield/crush/fracture depends on material and geometry.',
      piping: 'Real pipe wall checks also need diameter, thickness, corrosion allowance, ovality, weld efficiency, material allowable, temperature, and load category.',
      b313: 'Pressure boundary design belongs to the 304 family. Sustained longitudinal stress belongs to the 302.3.5 family. This panel is only a visual bridge to those checks.',
      mistake: 'Do not use this annular picture as a wall-thickness calculator. It does not include pressure-design equations, corrosion allowance, joint quality, or material-table values.',
      next: 'Use Pipe Stress · σθ σL τ for hoop and longitudinal component names before any combined check.',
    },
    {
      title: 'Stress–strain curve',
      route: 'education only',
      concept: 'The curve teaches elastic response, yield, plasticity, ultimate strength, and rupture/fracture behavior. The moving point is a teaching marker, not a code-calculated stress point.',
      piping: 'In piping work, the stress-strain idea helps interpret yielding and brittle behavior, but routine code checks are performed by stress category and allowable limits.',
      b313: 'Use as background only. For code route, map to allowable stress S/Sh/Sc and stress categories; verify exact para. references and material tables in the project B31.3 edition.',
      mistake: 'Do not compare this plotted point directly with B31.3 allowable stress. The plotted scale is normalized and qualitative.',
      next: 'For a code-style stress route, use Combined Stress only after selecting the correct source/category in Load Types.',
    },
    {
      title: 'B31.3 lens for Tab 1',
      route: 'paragraph map',
      concept: 'Tab 1 is the foundation: material response and static behavior. It prepares the user to understand why B31.3 separates pressure design, sustained stress, occasional stress, and displacement range.',
      piping: 'A pipe stress engineer typically checks routing, supports, nozzle loads, sustained/operating/test/occasional cases, and material/temperature limits using a model and project code basis.',
      b313: 'Initial map: 301 design conditions, 304 pressure design, 302.3.5 sustained/displacement stress categories, 302.3.6 occasional stress, 319 flexibility, 321 supports, 323 materials, Appendix A allowables. Educational paragraph map only.',
      mistake: 'Do not say “code compliant” from this tab. It has no pipe size, material, temperature, pressure, support layout, SIF/flexibility factors, or load combinations.',
      next: 'Next helper rollout should start with Load Types because it decides which B31.3 route is relevant.',
    },
  ];
}

function staticReadout(state: LabState): Readout {
  const ductile = state.material === 'ductile';
  const tension = state.staticDemand === 'tension';
  const load = state.staticLoad;
  const level = load < 45 ? 'Elastic teaching range' : load < 72 ? 'Transition / yield-sensitive range' : 'Damage range';

  if (ductile && tension) {
    return {
      headline: load >= 72 ? 'Ductile tensile plasticity controls the picture' : 'Ductile tension gives visible warning before rupture',
      principle: 'For ductile static tension, read the sequence as elastic stretch → yield → plastic strain localization. The visual focus is deformation, not arrow direction.',
      items: [
        { label: 'Demand', value: 'Static axial tension' },
        { label: 'Material', value: 'Ductile metal' },
        { label: 'Range', value: level },
        { label: 'Failure mode', value: load >= 72 ? 'Necking / rupture risk' : 'Yield / deformation watch' },
      ],
      steps: [
        { title: 'Elastic response', text: 'Strain follows stress and should recover when unloaded.' },
        { title: 'Yielding starts', text: 'Permanent strain appears once the simplified Sy region is reached.' },
        { title: 'Plastic localization', text: 'At high demand the section necks; remaining area reduces and rupture becomes plausible.' },
      ],
      watch: 'Dog-bone stretch, yield band, and necking lines in side view; wall thinning/yield band in cross-section.',
      caution: 'This is a teaching visualization. It is not an allowable-stress or code compliance check.',
    };
  }

  if (ductile && !tension) {
    return {
      headline: load >= 72 ? 'Ductile compression is governed by plastic instability' : 'Ductile compression should read as squash, not fracture opening',
      principle: 'For static compression, the important behavior is shortening, barreling, ovalization, wrinkling, local buckling, or collapse.',
      items: [
        { label: 'Demand', value: 'Static axial compression' },
        { label: 'Material', value: 'Ductile metal' },
        { label: 'Range', value: level },
        { label: 'Failure mode', value: load >= 72 ? 'Local buckling / collapse' : 'Yield / ovalization watch' },
      ],
      steps: [
        { title: 'Shortening', text: 'The member shortens under compressive demand.' },
        { title: 'Plastic squash', text: 'The wall may barrel, wrinkle, or ovalize after yielding.' },
        { title: 'Instability', text: 'At high demand the limit state becomes local buckling or collapse, not tensile necking.' },
      ],
      watch: 'Compression plates, barreling body, wrinkle lines, and ovalized pipe-wall cross-section.',
      caution: 'Compression capacity also depends on geometry, slenderness, boundary conditions, and imperfections; this panel is conceptual only.',
    };
  }

  if (!ductile && tension) {
    return {
      headline: load >= 72 ? 'Brittle tension is flaw-controlled fracture risk' : 'Brittle tension gives little deformation warning',
      principle: 'For brittle static tension, the key idea is a crack or flaw opening under tensile stress. Do not interpret it as yielding and necking.',
      items: [
        { label: 'Demand', value: 'Static axial tension' },
        { label: 'Material', value: 'Brittle / low ductility' },
        { label: 'Range', value: level },
        { label: 'Failure mode', value: state.flawEnabled || load >= 45 ? 'Flaw opening / fracture' : 'Elastic until critical flaw' },
      ],
      steps: [
        { title: 'Little plasticity', text: 'Visible strain may stay small even as stress rises.' },
        { title: 'Flaw sensitivity', text: 'A notch, crack, or defect concentrates tensile stress.' },
        { title: 'Sudden fracture', text: 'When the flaw becomes critical, separation can occur with little warning.' },
      ],
      watch: 'Crack path through the pipe wall and fracture flash; no ductile yield band should be expected.',
      caution: 'Brittle fracture is governed by flaw size, stress state, toughness, and environment. This is not an S-N fatigue model.',
    };
  }

  return {
    headline: load >= 72 ? 'Brittle compression shows crushing and splitting' : 'Brittle compression is shown as crush/split tendency',
    principle: 'Brittle compression should not be drawn like tensile crack opening or ductile necking. The concept is crushing, shear splitting, or diagonal fracture.',
    items: [
      { label: 'Demand', value: 'Static axial compression' },
      { label: 'Material', value: 'Brittle / low ductility' },
      { label: 'Range', value: level },
      { label: 'Failure mode', value: load >= 72 ? 'Crush / diagonal split' : 'Compression damage watch' },
    ],
    steps: [
      { title: 'Compression demand', text: 'The member is pushed into a shorter state.' },
      { title: 'Crush zone', text: 'Local crushing or splitting starts before a ductile-looking neck appears.' },
      { title: 'Break-up', text: 'At high demand diagonal split planes or fragments dominate the visual.' },
    ],
    watch: 'Crush halo, diagonal cracks, fragments, and compressed pipe-wall sector.',
    caution: 'Actual brittle compression strength depends strongly on confinement, geometry, flaws, and support condition.',
  };
}

function fatigueReadout(state: LabState): Readout {
  const logN = logCycles(state.fatigueCyclesSlider);
  const boundary = allowableStressRangePercent(logN);
  const ratio = state.fatigueStressRange / Math.max(boundary, 1);
  const verdict = ratio > 1 ? 'Above boundary' : ratio > 0.82 ? 'Near boundary' : 'Below boundary';

  return {
    headline: ratio > 1 ? 'Metal fatigue crack-growth risk is high' : ratio > 0.82 ? 'Metal fatigue hotspot is becoming important' : 'Metal fatigue demand is currently low in this teaching view',
    principle: 'For ductile metallic piping, fatigue is controlled by repeated stress range Δσ, cycles N, and local stress raisers such as weld toes or notches. Brittle material is text-only here.',
    items: [
      { label: 'Demand', value: `Repeated Δσ = ${state.fatigueStressRange}%` },
      { label: 'Cycles', value: `${cycleLabel(state.fatigueCyclesSlider)} cycles` },
      { label: 'S-N position', value: `${verdict} · limit ≈ ${boundary.toFixed(0)}%` },
      { label: 'Hotspot', value: state.notchEnabled ? 'Weld/notch active' : 'Smooth detail selected' },
    ],
    steps: [
      { title: 'Cyclic range', text: 'The pipe sees repeated stress range, not a single static load.' },
      { title: 'Local initiation', text: 'The weld toe or notch concentrates stress and can initiate a microcrack.' },
      { title: 'Crack propagation', text: 'The cross-section shows cycle-by-cycle growth, beach marks, and final fracture cue.' },
    ],
    watch: 'Use side view to locate the cyclic hotspot; use cross-section to understand crack initiation and growth through wall thickness.',
    caution: 'The S-N curve is conceptual. Once a real crack exists, assessment normally moves toward fracture mechanics, inspection data, ΔK, and critical crack size.',
  };
}
