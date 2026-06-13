const ENRICHED_LEARNING = {
  Expansion: {
    label: 'Tab 6 · Pipe Expansion Learning Center',
    subtitle: 'Enriched: free thermal growth, restrained expansion, support boundary conditions, pressure elongation boundary, and B31.3 expansion-stress route.',
    helpers: [
      ['Free thermal growth', 'ΔL reference', 'Free thermal growth is the reference movement a pipe would like to make when temperature changes. For first-pass teaching, linear growth is approximated as ΔL = α·L·ΔT. If the line can move freely, the result is displacement, not by itself a large thermal stress.', 'In plant piping, free growth is steered by offsets, loops, guides, springs, shoes, anchors, friction, and connected equipment. Estimate where the line wants to travel before judging restraint loads, nozzle sensitivity, or support reactions.', 'Use free growth as the starting point for 319-style flexibility thinking and Appendix C-type expansion data. Code concern begins when supports, anchors, nozzles, or terminal movements turn free growth into stress range or reaction. Exact coefficients and formal-analysis triggers require licensed-code/project verification.', 'Sources: thermal expansion relation references; pipe-support thermal-movement references; ASME public B31.3 scope page. Licensed project edition required for final use.'],
      ['Restrained expansion', 'displacement stress', 'Restrained expansion occurs when free thermal movement is blocked or partially blocked. The source is temperature-driven strain, but the stress and reaction appear because boundary conditions resist that movement.', 'The restraint can be a rigid anchor, guide, line stop, frictional shoe, closed gap, stiff nozzle, structural contact, or equipment movement mismatch. A line can have adequate pressure wall thickness and still overload connected equipment if hot movement has no acceptable path.', 'Route restrained thermal behavior to displacement/flexibility logic rather than sustained dead-weight logic. High-level map: 302.3.5 displacement stress-range family, 319 flexibility analysis, 319.4.4 expansion stress-range context, and owner nozzle/support limits where applicable.', 'Sources: practical thermal expansion/support references; ASME public B31.3 scope page. Exact allowable expression, cycle factor, cold spring, and nonlinear support treatment require verification.'],
      ['Guides, anchors, and springs', 'boundary function', 'Guides steer movement, anchors fix reference points, line stops limit travel, and springs support weight while allowing vertical thermal travel. These are boundary conditions first and hardware second.', 'A well-placed guide can direct growth into a loop; a poorly placed anchor can trap thermal movement against a nozzle. Springs are used when vertical movement is expected but weight must still be carried in cold and hot cases. Friction, gaps, travel stops, and lift-off can make the real hot path nonlinear.', 'Map support-function interpretation to 319 flexibility behavior, 301.8-style movement effects, and 321 support/restraint context. This card does not size supports; it teaches how boundary conditions control displacement stress and reactions.', 'Sources: pipe-support and spring-support references; practical thermal expansion guidance; ASME public B31.3 scope page. Owner support standard and vendor data control final design.'],
      ['Pressure elongation boundary', 'pressure ≠ ΔT', 'Pressure elongation and pressure-induced bend opening are not thermal expansion. A line can move or react under pressure even with no temperature change because pressure can create axial/end-load effects and pressure-driven curvature changes.', 'In high-pressure, strongly restrained, or compact systems, pressure-extension effects may influence anchor loads, nozzle loads, or pressure-only displacement results. In flexible systems, the same tendency may be absorbed as small movement.', 'Keep pressure wall adequacy on the 304 pressure-design route. Treat pressure-induced axial movement or bend-opening consequences as pressure/flexibility interpretation that may influence sustained outputs or reactions depending on restraint and software basis.', 'Sources: pressure-boundary references; pipe flexibility/restraint references; vendor pressure-extension/Bourdon documentation must be checked against the selected software version.'],
      ['B31.3 expansion-stress lens', 'range route', 'The expansion-stress lens is about cold-to-hot displacement range, flexibility, reaction, and cycle tolerance. It should not be taught as one hot operating stress snapshot.', 'A practical model reviews expansion stress range, operating displacement, nozzle loads, anchor loads, support hot/cold loads, spring travel, guide gaps, loop flexibility, friction, and support status separately from sustained weight stress. Mitigation usually comes from routing/support changes, not wall thickness alone.', 'High-level B31.3 map: 301 design conditions, 302.3.5 displacement stress-range family, 319 flexibility analysis, 319.4.4 expansion stress-range context, 321 supports, Appendix C expansion data, and B31J or legacy Appendix D where applicable.', 'Sources: thermal expansion references; pipe-support references; ASME public B31.3 scope page. Licensed edition, owner criteria, and vendor basis control final use.']
    ]
  },
  Bourdon: {
    label: 'Tab 7 · Bourdon Effect Learning Center',
    subtitle: 'Enriched: pressure-driven bend opening, end-condition sensitivity, bend geometry, pressure/flexibility boundary, and B31.3 interpretation limits.',
    helpers: [
      ['Pressure-driven opening', 'pressure source', 'A curved pressurized member can show a pressure-driven tendency to open or straighten. In this app, the Bourdon effect is a qualitative visual analogy for pressure-induced bend movement: pressure supplies the source, curvature gives the movement direction, and boundary conditions decide whether the result is motion or reaction.', 'In piping, this concept is most useful around elbows, return bends, compact high-pressure manifolds, and equipment connections where a pressure-only case can create unexpected displacement or reaction. The engineering question is whether the effect changes a support, anchor, or nozzle decision.', 'Map pressure containment itself to the 304 pressure-design family. Treat pressure-induced bend movement as a pressure/flexibility interpretation issue that may influence sustained-force results, reactions, or modeled displacement depending on restraint and software settings. This is not a standalone B31.3 compliance route.', 'Sources: practical Bourdon-effect piping references; vendor pressure-extension/Bourdon documentation to be verified against exact software version; ASME public B31.3 scope page for scope only.'],
      ['End condition: free / guided / restrained', 'boundary condition', 'The same pressure-driven bend tendency has different consequences depending on end condition. If the ends are free, the effect appears mainly as motion; if guided, movement is steered; if restrained, the tendency becomes force and moment.', 'Near equipment nozzles, allowed versus blocked movement often controls whether pressure-induced bend behavior matters. A flexible route may absorb the tendency, while a stiff skid, short spool, or rigid anchor may convert it into reaction. Ask what the bend ends are actually allowed to do.', 'Use this card as a 301.8/319-style movement-and-flexibility interpretation map, with 304 in the background because pressure is the source. It does not certify support or nozzle acceptability; it tells the analyst to model realistic guide, anchor, gap, friction, and equipment stiffness.', 'Sources: practical Bourdon-effect and pipe-support references; vendor pressure-extension notes; licensed B31.3 and owner nozzle/support criteria required for final use.'],
      ['Bend geometry: 45 / 90 / 180', 'geometry matters', 'Bend angle and curvature change the pressure-driven movement pattern. A 45° elbow, 90° elbow, and 180° return bend should not be shown as identical because curvature path and adjacent stiffness change how the opening tendency resolves.', 'Return bends, offsets, and compact skid loops often behave differently from an isolated 90° elbow. Under pressure, geometry and restraint act together: the same pressure may be negligible in a flexible route and meaningful in a short restrained layout.', 'At code-map level, bend geometry matters through component pressure behavior and flexibility/SIF realism, not through a separate universal Bourdon-angle acceptance rule. Use 304.2-style component pressure context, 319 flexibility context, and B31J or legacy Appendix D where applicable.', 'Sources: practical Bourdon-effect discussions; SIF/flexibility references; vendor B31J or bend-modeling documentation should be verified against project edition/software version.'],
      ['Pressure/flexibility boundary', 'source vs response', 'Bourdon behavior sits at the boundary between pressure loading and flexibility response. Pressure provides the source; system flexibility, restraints, and connected equipment stiffness decide the outcome.', 'In a high-pressure compact system, anchor spacing, branch stiffness, nozzle stiffness, and support status can make pressure-only bend effects visible in reactions. In a flexible layout, the same source may produce small motion with little consequence. Pressure level alone is not the whole story.', 'Use a split route: 304 family for pressure boundary adequacy, then 319/301.8-style flexibility and movement interpretation for system consequence. The app should teach the dependency graph and require project/software verification for magnitude or acceptability claims.', 'Sources: practical Bourdon-effect references; pipe flexibility references; vendor pressure-extension/Bourdon documentation; ASME public B31.3 scope page for scope only.'],
      ['B31.3 interpretation boundary', 'educational boundary', 'This card closes the Bourdon tab by stating the boundary clearly: Bourdon effect explains pressure-induced behavior in curved geometry, but it is not a standalone compliance equation in this app. It is a behavior-explainer and modeling-awareness card.', 'The practical question is whether the effect changes a real decision: anchor load, guide direction, nozzle reaction, support design, or pressure-only displacement interpretation. High pressure, curved geometry, and strong restraint raise its importance; low pressure and flexible routing reduce it.', 'High-level B31.3 map: pressure source belongs to the 304 family, while any reaction/movement consequence is interpreted through sustained/flexibility context such as 302.3.5 and 319 depending on restraint. Exact wording, equation route, and vendor implementation require licensed-code and software-version verification.', 'Sources: ASME public B31.3 scope page for code scope only; practical Bourdon-effect piping references; vendor software documentation for pressure-extension/Bourdon settings; licensed-code and owner criteria required for final use.']
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
