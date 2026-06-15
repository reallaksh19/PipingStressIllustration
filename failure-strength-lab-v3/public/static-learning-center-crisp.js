(function () {
  /* Compatibility shim for older cached pages that still load this file.
     It is the final guard for the Static Learning Center: one flat set of
     engineering key-point cards, no nested helper blocks and no repeated
     Concept/Piping/B31.3 sections. */
  window.STATIC_CRISP_LEARNING_ENABLED = true;

  var VERSION = 'static-single-owner-v5';
  var TITLE = 'Tab 1 · Static Engineering Key Points';
  var SUBTITLE = 'Behavior only: identify load source and B31.3 route before acceptance judgment.';

  var CARDS = [
    {
      cls: 'formula',
      title: 'Formula boundary',
      route: 'direct axial only',
      points: [
        'σ = F/A explains direct axial stress only.',
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
        'Ductile metal may plastically deform and neck before rupture.',
        'Brittle fracture may occur with little visible deformation.'
      ]
    },
    {
      cls: 'piping',
      title: 'Piping',
      route: 'load path first',
      points: [
        'Static sources include weight, contents, pressure, support reactions, steady nozzle loads, and held displacements.',
        'Hotspots are bends, tees, branches, reducers, welded attachments, supports, restraints, and nozzles.',
        'Separate pressure containment from sustained bending, occasional events, and displacement stress range.'
      ]
    },
    {
      cls: 'b313',
      title: 'B31.3 map',
      route: 'route before equation',
      points: [
        'Pressure → 304; sustained force/weight → 302.3.5; occasional event → 302.3.6.',
        'Thermal, settlement, and equipment movement → 319 flexibility / displacement-stress-range logic.',
        'Supports/materials/allowables → 321, 323, Appendix A; verify licensed edition and owner criteria.'
      ]
    },
    {
      cls: 'sources',
      title: 'Sources',
      route: 'authority hierarchy',
      points: [
        'Final authority: licensed ASME B31.3 project edition and project specifications.',
        'Background only: strength-of-materials and practical pipe-stress references.',
        'Interpretation aids such as Little P.Eng, WhatIsPiping, and vendor notes must be verified before project use.'
      ]
    }
  ];

  function esc(value) {
    return String(value || '').replace(/[&<>'"]/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch];
    });
  }

  function isStaticActive() {
    var label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
    if (label && /static/i.test(label.textContent || '')) return true;
    if (document.body && document.body.getAttribute('data-fs-mode') === 'static') return true;
    var h2 = document.querySelector('h2');
    return Boolean(h2 && /Static Loading/i.test(h2.textContent || ''));
  }

  function patchDataSources() {
    var compact = {
      label: TITLE,
      subtitle: SUBTITLE,
      route: 'compact key points',
      helpers: [[
        'Formula boundary',
        'direct axial only',
        'σ = F/A explains direct axial stress only. Pipe checks also need pressure design, bending M/Z, SIFs, supports, nozzles, and displacement range.',
        'Static sources include weight, contents, pressure, support reactions, steady nozzle loads, and held displacements. Separate pressure containment from sustained bending, occasional events, and displacement stress range.',
        'Pressure → 304; sustained force/weight → 302.3.5; occasional event → 302.3.6; displacement/flexibility → 319; supports/materials/allowables → 321/323/Appendix A.',
        'Licensed ASME B31.3 project edition and project specifications control final wording and equations.'
      ]]
    };
    try { if (typeof FALLBACK_LEARNING !== 'undefined') FALLBACK_LEARNING.Static = compact; } catch (e) {}
    try { if (typeof ENRICHED_LEARNING !== 'undefined') ENRICHED_LEARNING.Static = compact; } catch (e) {}
  }

  function html() {
    return CARDS.map(function (card) {
      return '<section class="fallback-keycard ' + esc(card.cls) + '">' +
        '<div class="fallback-keycard-title"><b>' + esc(card.title) + '</b><span>' + esc(card.route) + '</span></div>' +
        '<ul>' + card.points.map(function (point) { return '<li>' + esc(point) + '</li>'; }).join('') + '</ul>' +
      '</section>';
    }).join('');
  }

  var rendering = false;
  function renderStaticKeyPoints() {
    patchDataSources();
    if (!isStaticActive()) return;

    var panel = document.getElementById('fallback-learning-panel');
    var panelTitle = document.getElementById('fallback-learning-title');
    var heading = document.getElementById('fallback-learning-heading');
    var subtitle = document.getElementById('fallback-learning-subtitle');
    var grid = document.getElementById('fallback-learning-grid');
    if (!panel || !panelTitle || !heading || !subtitle || !grid) return;

    var hasOldHelperBlocks = Boolean(grid.querySelector('.fallback-helper'));
    var alreadyStable = grid.getAttribute('data-static-version') === VERSION &&
      grid.querySelectorAll('.fallback-keycard').length === CARDS.length &&
      !hasOldHelperBlocks;

    panel.hidden = false;
    panel.setAttribute('data-crisp-static', 'true');
    panel.setAttribute('data-static-owner', 'single-owner-compat');
    panelTitle.textContent = TITLE;
    heading.textContent = TITLE;
    subtitle.textContent = SUBTITLE;

    var route = panel.querySelector('.fallback-route');
    if (route) route.textContent = 'compact key points';
    var openLabel = panel.querySelector('.open-label');
    if (openLabel) openLabel.textContent = '▼ Open key points';
    var closeLabel = panel.querySelector('.close-label');
    if (closeLabel) closeLabel.textContent = '▲ Collapse panel';

    if (alreadyStable) return;

    rendering = true;
    grid.className = 'fallback-helper-grid fallback-keypoint-grid';
    grid.removeAttribute('data-fallback-version');
    grid.removeAttribute('data-crisp-version');
    grid.setAttribute('data-static-version', VERSION);
    grid.innerHTML = html();
    rendering = false;
  }

  var scheduled = false;
  function scheduleRender(delay) {
    if (delay) {
      setTimeout(scheduleRender, delay);
      return;
    }
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      renderStaticKeyPoints();
    });
  }

  function install() {
    patchDataSources();
    renderStaticKeyPoints();
    scheduleRender(60);
    scheduleRender(200);
    scheduleRender(800);

    document.addEventListener('click', function (event) {
      if (event.target.closest('.lesson-tabs .tab')) {
        scheduleRender();
        scheduleRender(100);
        scheduleRender(300);
      }
    });

    var panel = document.getElementById('fallback-learning-panel');
    if (panel) {
      new MutationObserver(function () {
        if (!rendering) scheduleRender();
      }).observe(panel, { childList: true, subtree: true, characterData: true });
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
