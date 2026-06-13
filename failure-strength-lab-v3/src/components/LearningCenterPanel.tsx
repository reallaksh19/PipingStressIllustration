import { LabState } from '../model/types';
import { allowableStressRangePercent, cycleLabel, logCycles } from '../model/fatigueModel';

type LearningHelper = {
  title: string;
  route: string;
  concept: string;
  piping: string;
  b313: string;
  mistake: string;
  next: string;
};

export function LearningCenterPanel({ state }: { state: LabState }) {
  const helpers = state.mode === 'static'
    ? staticLearningHelpers(state)
    : state.mode === 'fatigue'
      ? fatigueLearningHelpers(state)
      : [];

  if (helpers.length === 0) return null;

  const label = state.mode === 'fatigue' ? 'Tab 2 · Fatigue Learning Center' : 'Tab 1 · Static Learning Center';
  const subtitle = state.mode === 'fatigue'
    ? 'Stress range, cycles, hotspot detail, S-N limitation, and B31.3 fatigue route.'
    : 'Material response, static demand, pipe-wall behavior, stress-strain limits, and B31.3 route.';

  return <section aria-label={`${label} helper content`} className="learningCenterStandalone">
    <div className="learningCenterHead">
      <div>
        <div className="learningKicker">ⓘ Learning Center</div>
        <h3>{label}</h3>
        <p>{subtitle}</p>
      </div>
      <span className="learningRouteChip">Outside failure interpretation</span>
    </div>
    <div className="learningCards">
      {helpers.map((helper, index) => <details key={`${helper.title}-${helper.route}`} open={index === 0 || helper.title.includes('B31.3')}>
        <summary>{helper.title}<span>{helper.route}</span></summary>
        <div className="learningCells">
          <LearningCell title="Concept" text={helper.concept} tone="concept" />
          <LearningCell title="Piping" text={helper.piping} tone="piping" />
          <LearningCell title="B31.3 map" text={helper.b313} tone="code" />
          <LearningCell title="Mistake" text={helper.mistake} tone="mistake" />
          <LearningCell title="Next" text={helper.next} tone="next" />
        </div>
      </details>)}
    </div>
  </section>;
}

function LearningCell({ title, text, tone }: { title: string; text: string; tone: 'concept' | 'piping' | 'code' | 'mistake' | 'next' }) {
  return <div className={`learningCell ${tone}`}>
    <b>{title}</b>
    <span>{text}</span>
  </div>;
}

function staticLearningHelpers(state: LabState): LearningHelper[] {
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
      mistake: 'Do not read the stress-strain curve as a B31.3 pass/fail curve. B31.3 normally uses allowable stresses and stress categories, not this full curve as the design check.',
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
      title: 'Stress-strain curve',
      route: 'education only',
      concept: 'The curve teaches elastic response, yield, plasticity, ultimate strength, and rupture/fracture behavior. The moving point is a teaching marker, not a code-calculated stress point.',
      piping: 'In piping work, the stress-strain idea helps interpret yielding and brittle behavior, but routine code checks are performed by stress category and allowable limits.',
      b313: 'Use as background only. For code route, map to allowable stress S/Sh/Sc and stress categories; verify exact paragraph references and material tables in the project B31.3 edition.',
      mistake: 'Do not compare this plotted point directly with B31.3 allowable stress. The plotted scale is normalized and qualitative.',
      next: 'For a code-style stress route, use Combined Stress only after selecting the correct source/category in Load Types.',
    },
    {
      title: 'B31.3 lens for Tab 1',
      route: 'paragraph map',
      concept: 'Tab 1 is the foundation: material response and static behavior. It prepares the user to understand why B31.3 separates pressure design, sustained stress, occasional stress, and displacement range.',
      piping: 'A pipe stress engineer typically checks routing, supports, nozzle loads, sustained/operating/test/occasional cases, and material/temperature limits using a model and project code basis.',
      b313: 'Initial map: 301 design conditions, 304 pressure design, 302.3.5 sustained/displacement stress categories, 302.3.6 occasional stress, 319 flexibility, 321 supports, 323 materials, Appendix A allowables. Educational paragraph map only.',
      mistake: 'Do not say code compliant from this tab. It has no pipe size, material, temperature, pressure, support layout, SIF/flexibility factors, or load combinations.',
      next: 'Next helper rollout should start with Load Types because it decides which B31.3 route is relevant.',
    },
  ];
}

function fatigueLearningHelpers(state: LabState): LearningHelper[] {
  const logN = logCycles(state.fatigueCyclesSlider);
  const boundary = allowableStressRangePercent(logN);
  const nearBoundary = state.fatigueStressRange / Math.max(boundary, 1) > 0.82;
  const hotspotText = state.notchEnabled ? 'weld/notch hotspot active' : 'smooth detail selected';

  return [
    {
      title: 'Stress range Δσ',
      route: 'cyclic range',
      concept: `Fatigue is controlled by repeated stress range, not one static peak. Current Δσ is ${state.fatigueStressRange}% in this normalized teaching view.`,
      piping: 'Repeated stress range can come from startup/shutdown, thermal cycling, vibration, pressure pulsation, slugging, relief events, rotating equipment, or cyclic support movement.',
      b313: 'Map cyclic displacement-type behavior to displacement stress-range / flexibility route: 302.3.5(d), 319, and 319.4.4 family. Severe cyclic service may need deeper project fatigue assessment.',
      mistake: 'Do not judge fatigue only from maximum stress. Lower stress repeated many times can be more damaging than one high static event.',
      next: 'Use Load Types to classify the source, then use Pipe Expansion or Combined Stress only after the stress-range route is clear.',
    },
    {
      title: 'Cycles N',
      route: 'life axis',
      concept: `The S-N axis is logarithmic: the current display is about ${cycleLabel(state.fatigueCyclesSlider)} cycles. Higher cycle count reduces the acceptable stress-range cue.`,
      piping: 'Batch operation, compressor/pump pulsation, repeated trips, thermal swing count, and flow-induced vibration cycles can dominate fatigue risk even when sustained stress looks acceptable.',
      b313: 'Use B31.3 expansion-stress-range and cycle-factor interpretation for displacement cycles. For vibration or pulsation, treat this app panel as screening and move to project-specific dynamic/fatigue evaluation.',
      mistake: 'Do not combine always-present sustained stress and cyclic stress range into one generic slider. The number of reversals/cycles matters.',
      next: 'Review hotspot and S-N limitation helpers before using the failure interpretation readout.',
    },
    {
      title: 'Weld toe / notch hotspot',
      route: hotspotText,
      concept: state.notchEnabled
        ? 'A local discontinuity concentrates cyclic stress. The weld toe/notch is the likely crack-initiation point in the teaching visual.'
        : 'A smooth detail lowers local concentration, but fatigue can still occur if stress range and cycles are high enough.',
      piping: 'Real piping fatigue often initiates at weld toes, branch connections, small-bore connections, socket welds, clamps, pipe shoes, and local attachment details.',
      b313: 'Map local geometry effects to flexibility/SIF logic where applicable: 319 and Appendix D / B31J-type interpretation. Exact treatment depends on component and project method.',
      mistake: 'Do not assume nominal pipe span stress alone captures weld-toe, branch-connection, or attachment fatigue hotspot demand.',
      next: 'Use the local/cross-section panel to track initiation, growth, beach marks, and final fracture cue.',
    },
    {
      title: 'S-N curve limitation',
      route: nearBoundary ? 'near/above boundary' : 'below boundary',
      concept: `The curve is a teaching boundary. Current approximate boundary is ${boundary.toFixed(0)}%, so the point is ${nearBoundary ? 'near/above' : 'below'} the fatigue warning line.`,
      piping: 'The app shows the S-N idea because fatigue can occur below yield. Real piping fatigue also needs detail class, environment, weld quality, mean stress, temperature, inspection data, and load history.',
      b313: 'Do not treat this as the actual B31.3 equation. B31.3 normally routes cyclic displacement through expansion stress range; crack-like conditions may need fracture mechanics outside this simple view.',
      mistake: 'Do not call the displayed S-N point B31.3 pass/fail. It is normalized educational screening.',
      next: 'After S-N, move to Combined Stress only for educational combination; for code work, first choose sustained/occasional/displacement route.',
    },
    {
      title: 'B31.3 lens for Tab 2',
      route: 'fatigue map',
      concept: 'Tab 2 teaches cyclic damage: initiation at a stress raiser, cycle-by-cycle crack growth, and final fracture after enough repetitions.',
      piping: 'A pipe stress engineer should connect fatigue to load source, stress range, local SIF/detail, supports/restraints, vibration, thermal cycles, and inspection/monitoring strategy.',
      b313: 'Initial map: displacement stress range 302.3.5(d), flexibility analysis 319, expansion stress range 319.4.4 family, occasional/dynamic route 302.3.6 family, and SIF/flexibility via Appendix D / B31J where applicable. Educational paragraph map only.',
      mistake: 'Do not use a generic material S-N curve as a substitute for project fatigue requirements, code stress-range equations, dynamic analysis, or fracture assessment.',
      next: 'Next tab helper rollout should move to Stress Components so users separate σx/σy/τxy notation from pipe hoop/axial notation.',
    },
  ];
}
