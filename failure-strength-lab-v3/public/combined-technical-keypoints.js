(function () {
  var VERSION = 'combined-technical-v1';
  var KEY_POINT_SET = {
    label: 'Tab 7 · Combined Stress Engineering Key Points',
    subtitle: 'Theory screen only: classify each stress source before reporting combined/equivalent stress utilization.',
    route: 'combined key points',
    cards: [
      {
        cls: 'formula',
        title: 'Boundary',
        route: 'theory ≠ code check',
        points: [
          'Von Mises and Tresca compare the same σH/σL input point on one S-based graph.',
          'The selected limit is a teaching envelope, not a project allowable stress by itself.',
          'Do not report a universal combined-stress pass/fail before classifying source and load case.'
        ]
      },
      {
        cls: 'concept',
        title: 'Concept',
        route: 'interaction matters',
        points: [
          'Von Mises uses distortion-energy interaction; Tresca uses maximum-shear interaction.',
          'Hoop tension plus longitudinal compression can increase equivalent stress because the stress difference is larger.',
          'Switching theory changes the acceptance geometry, not the actual stress input point.'
        ]
      },
      {
        cls: 'piping',
        title: 'Piping',
        route: 'source first',
        points: [
          'σH usually comes from internal pressure; σL may come from pressure axial effect, weight bending, occasional event, thermal displacement, or terminal movement.',
          'Bends, tees, branches, trunnions, supports, and nozzles may need approved SIF/flexibility/local-stress basis.',
          'A combined value is meaningful only when the contributing load case and component definitions are traceable.'
        ]
      },
      {
        cls: 'b313',
        title: 'B31.3 map',
        route: 'route before report',
        points: [
          'Pressure containment → 304; sustained force/weight → 302.3.5; occasional event → 302.3.6.',
          'Thermal/support/equipment displacement → 319 flexibility and displacement-stress-range logic.',
          'Use relevant code edition and Client criteria before evaluating/reporting combined or equivalent stress utilization.'
        ]
      },
      {
        cls: 'sources',
        title: 'Sources',
        route: 'authority hierarchy',
        points: [
          'Final authority: relevant code edition, Client criteria, project specifications, and validated software basis.',
          'Background: Von Mises, Tresca, thin-wall cylinder stresses, and pipe-stress category references.',
          'Practical interpretation aids must be verified before project evaluation or reporting.'
        ]
      }
    ]
  };

  function activeLabel() {
    var label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
    return label && label.textContent ? label.textContent.trim() : '';
  }

  function escapeLearningText(value) {
    return String(value || '').replace(/[&<>'"]/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[ch];
    });
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function setPanelTitle(panel, title, tag) {
    if (!panel) return;
    var spans = panel.querySelectorAll('.ph > span');
    if (spans[0]) setText(spans[0], title);
    if (spans[1]) setText(spans[1], tag);
  }

  function renderKeypoints() {
    if (activeLabel() !== 'Combined') return;
    var layer = document.getElementById('fallback-learning-panel');
    var title = document.getElementById('fallback-learning-title');
    var heading = document.getElementById('fallback-learning-heading');
    var subtitle = document.getElementById('fallback-learning-subtitle');
    var grid = document.getElementById('fallback-learning-grid');
    if (!layer || !title || !heading || !subtitle || !grid) return;

    layer.hidden = false;
    layer.setAttribute('data-crisp-combined', 'true');
    layer.setAttribute('data-combined-owner', 'combined-technical-keypoints');
    title.textContent = KEY_POINT_SET.label;
    heading.textContent = KEY_POINT_SET.label;
    subtitle.textContent = KEY_POINT_SET.subtitle;
    var routeEl = layer.querySelector('.fallback-route');
    if (routeEl) routeEl.textContent = KEY_POINT_SET.route;
    var openLabel = layer.querySelector('.open-label');
    if (openLabel) openLabel.textContent = '▼ Open key points';
    var closeLabel = layer.querySelector('.close-label');
    if (closeLabel) closeLabel.textContent = '▲ Collapse panel';

    var fingerprint = VERSION + '|' + KEY_POINT_SET.cards.length;
    if (grid.getAttribute('data-combined-version') === fingerprint &&
      grid.querySelectorAll('.fallback-keycard').length === KEY_POINT_SET.cards.length &&
      !grid.querySelector('.fallback-helper')) {
      return;
    }

    grid.className = 'fallback-helper-grid fallback-keypoint-grid';
    grid.setAttribute('data-combined-version', fingerprint);
    grid.innerHTML = KEY_POINT_SET.cards.map(function (card) {
      return '<section class="fallback-keycard ' + escapeLearningText(card.cls) + '">' +
        '<div class="fallback-keycard-title"><b>' + escapeLearningText(card.title) + '</b><span>' + escapeLearningText(card.route) + '</span></div>' +
        '<ul>' + card.points.map(function (point) { return '<li>' + escapeLearningText(point) + '</li>'; }).join('') + '</ul>' +
        '</section>';
    }).join('');
  }

  function compactCombinedCopy() {
    if (activeLabel() !== 'Combined') return;
    document.body.setAttribute('data-fs-mode', 'combined');

    var titleCopy = document.querySelector('main .title-row p');
    setText(titleCopy, 'Equivalent-stress theory screen; route pressure, sustained, occasional, and displacement components before reporting.');

    var panels = document.querySelectorAll('main .analysis-grid .panel');
    setPanelTitle(panels[0], 'Panel 1 · yield-theory surface', 'VM / Tresca');
    setPanelTitle(panels[1], 'Panel 2 · pipe section', 'σH + σL');
    setPanelTitle(panels[2], 'Panel 3 · route screen', 'not universal code check');

    Array.prototype.forEach.call(document.querySelectorAll('aside .block .bt span:first-child'), function (node) {
      if (node.textContent === 'Allowable factor') setText(node, 'Teaching limit');
      if (node.textContent === 'Failure theory') setText(node, 'Equivalent-stress theory');
    });

    var tech = document.querySelector('.tech .tech-text');
    if (tech && tech.textContent && tech.textContent.indexOf('Combined stress tab:') === 0) {
      tech.textContent = tech.textContent.replace('allowable=', 'teaching limit=') + ' Theory screen only; final reporting needs route/category and Client criteria.';
    }
  }

  function render() {
    compactCombinedCopy();
    renderKeypoints();
  }

  var raf = 0;
  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = 0;
      render();
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      render();
      if (activeLabel() === 'Combined' || attempts > 40) clearInterval(timer);
    }, 100);

    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('.lesson-tabs, aside')) {
        schedule();
        setTimeout(schedule, 120);
      }
    }, true);

    var root = document.getElementById('root');
    if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true, characterData: true });
  });
})();
