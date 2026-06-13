const ENRICHED_LEARNING = {
  Expansion: {
    label: 'Tab 6 · Pipe Expansion Learning Center',
    subtitle: 'Enriched: free thermal growth, restrained expansion, support boundary conditions, pressure elongation boundary, and B31.3 expansion-stress route.',
    helpers: [
      [
        'Free thermal growth',
        'ΔL reference',
        'Free thermal growth is the reference movement a pipe would like to make when temperature changes. For first-pass teaching, linear growth is approximated as ΔL = α·L·ΔT, where α is the coefficient of linear thermal expansion, L is the reference length, and ΔT is the temperature change. If the line can move freely, this is displacement, not by itself a large thermal stress.',
        'In real piping, free growth is rarely fully free; it is steered by offsets, loops, guides, springs, shoes, anchors, friction, and connected equipment. The practical value is to estimate where the pipe wants to travel before judging restraint loads. Long hot rack lines, heater outlet lines, and exchanger connections can move enough that layout and support strategy must be planned before final stress calculation.',
        'Use free growth as the starting point for 319-style flexibility thinking and Appendix C-type expansion data, not as a direct pass/fail check. Code concern begins when supports, anchors, nozzles, or terminal movements turn free growth into stress range or reaction. Exact coefficients, reference temperature, and formal-analysis triggers must be verified in the licensed project edition and owner basis.',
        'Sources: thermal expansion reference for ΔL/L = αΔT; pipe-support references for thermal-movement support function; ASME public B31.3 scope page. Licensed-code text and project expansion-coefficient tables require verification.'
      ],
      [
        'Restrained expansion',
        'displacement stress',
        'Restrained expansion occurs when a pipe’s free thermal movement is blocked or partially blocked. The source is temperature-driven strain, but the stress and reaction appear because boundary conditions resist that movement. This is displacement-controlled behavior: it may be self-limiting in code philosophy, yet it can still create high nozzle loads, local yielding, or cyclic stress-range concern.',
        'The restraint can be a rigid anchor, guide, line stop, frictional shoe, closed support gap, stiff nozzle, structural steel contact, or equipment movement mismatch. A line may satisfy pressure wall requirements and still overload a pump, exchanger, or support because the hot movement has no acceptable path. The learning card should make clear that restraint quality matters as much as temperature rise.',
        'Route restrained thermal behavior to displacement/flexibility logic rather than sustained dead-weight logic. High-level paragraph-family map: 302.3.5 displacement stress-range philosophy, 319 flexibility analysis, 319.4.4 expansion stress-range context, and project nozzle/support criteria. Exact allowable expressions, cycle factors, cold-spring treatment, and nonlinear support assumptions need licensed-code and project verification.',
        'Sources: thermal-stress references for constrained expansion causing stress; practical pipe-support/thermal-movement sources; ASME B31.3 public scope page. Owner criteria may govern reactions even when line stress is acceptable.'
      ],
      [
        'Guides, anchors, and springs',
        'boundary function',
        'Guides steer movement, anchors fix reference points, line stops limit travel, and springs support weight while allowing vertical thermal movement. These devices are boundary conditions first and hardware second. Their function decides how much of the free thermal movement becomes safe travel and how much becomes stress or reaction.',
        'A well-placed guide can direct growth into a loop, while a poorly placed anchor can trap thermal movement against a nozzle. Springs are used when vertical movement is expected but weight must still be carried through cold and hot cases. Friction, gaps, travel stops, and support lift-off can make the real hot load path nonlinear, so the model should match the intended support function.',
        'Map support-function interpretation to 319 flexibility behavior, 301.8-style movement effects, and 321 support/restraint context, with manufacturer data and owner support standards where applicable. This card should not size springs or certify support design; it should teach that boundary conditions control displacement stress and reaction paths.',
        'Sources: pipe-support references describing spring supports and thermal movement accommodation; practical thermal expansion/support guidance; ASME public B31.3 scope page. Final support design needs project support standard and vendor data.'
      ],
      [
        'Pressure elongation boundary',
        'pressure ≠ ΔT',
        'Pressure elongation and pressure-induced bend opening are not thermal expansion. A line can move or react under pressure even with no temperature change, because pressure can create axial/end-load effects and pressure-driven curvature changes. This boundary prevents learners from assuming every movement in the Expansion tab is caused by ΔT.',
        'In high-pressure, strongly restrained, or compact systems, pressure-extension effects may influence anchor loads, nozzle loads, or pressure-only displacement results. In a more flexible system, the same pressure-driven tendency may be absorbed as small movement. The teaching rule is simple: pressure supplies a different source, and restraint/flexibility decides whether it becomes significant.',
        'Keep pressure wall adequacy on the 304 pressure-design route. Treat pressure-induced axial movement or bend-opening consequences as pressure/flexibility interpretation that may influence sustained outputs or reactions depending on the project software basis. This is not a standalone B31.3 compliance card; verify pressure-extension/Bourdon settings, edition treatment, and owner requirements before making project claims.',
        'Sources: pressure piping/process-piping references for pressure-boundary context; pipe support/flexibility references for restraint sensitivity; vendor pressure-extension/Bourdon documentation should be verified against the exact software version before over-specific wording.'
      ],
      [
        'B31.3 expansion-stress lens',
        'range route',
        'The expansion-stress lens is about cold-to-hot displacement range, flexibility, reaction, and cycle tolerance. It should not be taught as one hot operating stress snapshot. The learner should see two states: where the pipe wants to be cold, where it wants to be hot, and how restraints turn the range between them into stress and load.',
        'A practical stress model reviews expansion stress range, operating displacement, nozzle loads, anchor loads, support hot/cold loads, spring travel, guide gaps, loop flexibility, friction, and support status separately from sustained weight stress. Mitigation usually comes from routing/support changes, not wall thickness alone. This is the central workflow for hot piping connected to sensitive equipment.',
        'High-level B31.3 map: 301 design conditions, 302.3.5 displacement stress-range family, 319 flexibility analysis, 319.4.4 expansion stress-range context, 321 supports, Appendix C expansion data, and B31J or legacy Appendix D for SIF/flexibility where applicable. This is paragraph-family navigation only; exact wording, formula, cycle factor, and project owner limits require licensed-code verification.',
        'Sources: thermal expansion relation references; pipe-support references for springs and movement; ASME public B31.3 scope page. Licensed B31.3 edition, owner stress criteria, and vendor software basis control final use.'
      ]
    ]
  }
};

function escapeEnrichedLearningText(value) {
  return String(value || '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}

function activeEnrichedTabLabel() {
  const label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
  return label ? label.textContent.trim() : 'Static';
}

function renderEnrichedLearning() {
  const data = ENRICHED_LEARNING[activeEnrichedTabLabel()];
  if (!data) return;
  const layer = document.getElementById('fallback-learning-panel');
  const title = document.getElementById('fallback-learning-title');
  const heading = document.getElementById('fallback-learning-heading');
  const subtitle = document.getElementById('fallback-learning-subtitle');
  const grid = document.getElementById('fallback-learning-grid');
  if (!layer || !title || !heading || !subtitle || !grid) return;
  if (document.querySelector('.learning-center-panel')) return;
  layer.hidden = false;
  title.textContent = data.label;
  heading.textContent = data.label;
  subtitle.textContent = data.subtitle;
  grid.innerHTML = data.helpers.map((helper, index) => {
    const [hTitle, route, concept, piping, b313, sources] = helper.map(escapeEnrichedLearningText);
    return `<details class="fallback-helper" ${index === 0 || hTitle.includes('B31.3') ? 'open' : ''}>
      <summary><span>${hTitle}</span><span class="fallback-helper-route"><span>${route}</span><span class="show-label">▼ Show</span><span class="hide-label">▲ Hide</span></span></summary>
      <div class="fallback-helper-body">
        <div class="fallback-cell"><b style="color:#52f0df">Concept</b><span>${concept}</span></div>
        <div class="fallback-cell"><b style="color:#55b8ff">Piping</b><span>${piping}</span></div>
        <div class="fallback-cell"><b style="color:#ffd75b">B31.3 map</b><span>${b313}</span></div>
        ${sources ? `<div class="fallback-cell"><b style="color:#b884ff">Sources</b><span>${sources}</span></div>` : ''}
      </div>
    </details>`;
  }).join('');
}

function scheduleEnrichedLearningRender() {
  setTimeout(renderEnrichedLearning, 30);
}

window.addEventListener('DOMContentLoaded', () => {
  scheduleEnrichedLearningRender();
  document.addEventListener('click', event => {
    if (event.target.closest('.lesson-tabs .tab')) scheduleEnrichedLearningRender();
  });
  const root = document.getElementById('root');
  if (root) new MutationObserver(scheduleEnrichedLearningRender).observe(root, { childList: true, subtree: true, attributes: true });
});
