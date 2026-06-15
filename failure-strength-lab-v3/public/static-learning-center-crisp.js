(function () {
  var VERSION = 'static-crisp-2026-06-15-v1';

  var title = 'Tab 1 · Static Engineering Key Points';
  var subtitle = 'Behavior only: classify the piping load source and B31.3 route before any acceptance judgment.';

  var conciseHelpers = [
    [
      'Formula boundary',
      'direct axial only',
      'σ = F/A explains direct axial stress. It does not cover pipe pressure design, bending, SIFs, supports, nozzles, or thermal displacement.',
      'Use F/A only as a teaching bridge. Pipe review normally separates pressure containment, sustained bending/axial stress, occasional events, displacement range, and local detail checks.',
      'Do not treat visual yield/necking as B31.3 acceptance. Route the problem to pressure, sustained, occasional, displacement/flexibility, support, and material paragraphs.',
      'Licensed ASME B31.3 and project specifications control final wording and equations.'
    ],
    [
      'Concept',
      'elastic → yield → failure',
      'Elastic strain recovers after unloading. Yield means permanent strain. Ductile metal may plastically deform and neck; brittle fracture may give little visible warning.',
      'This explains why allowable stress, shakedown, fatigue range, and brittle-fracture screening are different engineering ideas.',
      'Connect to material suitability, design temperature, allowable stress basis, and impact-test/low-temperature review where applicable.',
      'Strength-of-materials references for stress–strain behavior; licensed B31.3 for material rules.'
    ],
    [
      'Piping',
      'load path first',
      'Static piping loads include pipe/contents/insulation weight, pressure, support reactions, steady nozzle loads, and held boundary displacement.',
      'Critical locations are usually bends, tees, branches, reducers, welded attachments, restraints, supports, and nozzles—not a plain tensile coupon.',
      'Separate pressure containment from longitudinal force/bending, support/nozzle reaction, and displacement-controlled stress range.',
      'Practical pipe-stress references such as Little P.Eng, WhatIsPiping, and software/vendor notes are interpretation aids only.'
    ],
    [
      'B31.3 map',
      'route before equation',
      'Pressure containment → 304 family. Sustained weight/force → 302.3.5 family. Occasional event → 302.3.6 family.',
      'Restrained thermal/settlement/equipment movement → displacement/flexibility route, mainly 319 and expansion-stress-range context.',
      'Supports/restraints → 321 family. Materials and allowables → 323 and Appendix A. Detail realism may need B31J or legacy Appendix D context.',
      'Paragraph-family navigation only; verify exact clause wording, equations, edition, and owner criteria.'
    ]
  ];

  var keyCards = [
    {
      cls: 'formula',
      title: 'Formula boundary',
      route: 'direct axial only',
      points: [
        'σ = F/A is useful for direct axial stress only.',
        'Pipe checks also need pressure design, bending M/Z, SIFs, supports, nozzles, and displacement range.',
        'Do not read visible yield or necking as B31.3 acceptance.'
      ]
    },
    {
      cls: 'concept',
      title: 'Concept',
      route: 'material behavior',
      points: [
        'Elastic strain recovers; yield creates permanent strain.',
        'Ductile metal can plastically deform and neck before rupture.',
        'Brittle fracture may occur with little visible deformation.'
      ]
    },
    {
      cls: 'piping',
      title: 'Piping',
      route: 'load path first',
      points: [
        'Static sources: weight, contents, pressure, support reactions, steady nozzle loads, held displacements.',
        'Hotspots: bends, tees, branches, reducers, welded attachments, supports, restraints, and nozzles.',
        'Separate pressure containment from sustained bending, occasional events, and displacement stress range.'
      ]
    },
    {
      cls: 'b313',
      title: 'B31.3 map',
      route: 'route before equation',
      points: [
        'Pressure → 304; sustained force/weight → 302.3.5; occasional event → 302.3.6.',
        'Thermal/settlement/equipment movement → 319 flexibility and displacement-stress-range logic.',
        'Supports/materials/allowables → 321, 323, Appendix A; verify licensed edition and owner criteria.'
      ]
    },
    {
      cls: 'sources',
      title: 'Sources',
      route: 'authority hierarchy',
      points: [
        'Final authority: licensed ASME B31.3 project edition and project specifications.',
        'Background: strength-of-materials stress–strain references.',
        'Interpretation aids: Little P.Eng, WhatIsPiping, and vendor/software notes; verify before project use.'
      ]
    }
  ];

  function escapeText(value) {
    return String(value || '').replace(/[&<>'"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch];
    });
  }

  function activeTabLabel() {
    var label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
    return label && label.textContent ? label.textContent.trim() : 'Static';
  }

  function overrideStaticData() {
    var data = { label: title, subtitle: subtitle, helpers: conciseHelpers };
    try { if (typeof FALLBACK_LEARNING !== 'undefined') FALLBACK_LEARNING.Static = data; } catch (e) {}
    try { if (typeof ENRICHED_LEARNING !== 'undefined') ENRICHED_LEARNING.Static = data; } catch (e) {}
  }

  function renderKeyCards() {
    overrideStaticData();
    if (activeTabLabel() !== 'Static') return;

    var panel = document.getElementById('fallback-learning-panel');
    var panelTitle = document.getElementById('fallback-learning-title');
    var heading = document.getElementById('fallback-learning-heading');
    var panelSubtitle = document.getElementById('fallback-learning-subtitle');
    var grid = document.getElementById('fallback-learning-grid');
    if (!panel || !panelTitle || !heading || !panelSubtitle || !grid) return;

    panel.hidden = false;
    panel.setAttribute('data-crisp-static', 'true');
    panelTitle.textContent = title;
    heading.textContent = title;
    panelSubtitle.textContent = subtitle;

    var route = panel.querySelector('.fallback-route');
    if (route) route.textContent = 'compact key points';
    var openLabel = panel.querySelector('.open-label');
    if (openLabel) openLabel.textContent = '▼ Open key points';
    var closeLabel = panel.querySelector('.close-label');
    if (closeLabel) closeLabel.textContent = '▲ Collapse panel';

    if (grid.getAttribute('data-crisp-version') === VERSION) return;

    grid.className = 'fallback-helper-grid fallback-keypoint-grid';
    grid.setAttribute('data-crisp-version', VERSION);
    grid.innerHTML = keyCards.map(function (card) {
      return '<section class="fallback-keycard ' + escapeText(card.cls) + '">' +
        '<div class="fallback-keycard-title"><b>' + escapeText(card.title) + '</b><span>' + escapeText(card.route) + '</span></div>' +
        '<ul>' + card.points.map(function (point) { return '<li>' + escapeText(point) + '</li>'; }).join('') + '</ul>' +
      '</section>';
    }).join('');
  }

  function scheduleRender() {
    setTimeout(renderKeyCards, 90);
  }

  function install() {
    overrideStaticData();
    scheduleRender();
    document.addEventListener('click', function (event) {
      if (event.target.closest('.lesson-tabs .tab') || event.target.closest('#fallback-learning-panel')) scheduleRender();
    });
    document.addEventListener('input', scheduleRender);
    var root = document.getElementById('root');
    if (root) {
      new MutationObserver(scheduleRender).observe(root, { childList: true, subtree: true, attributes: true });
    }
    setInterval(renderKeyCards, 1200);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
