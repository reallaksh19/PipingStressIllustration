(function () {
  var layerKey = 'failureStrengthLab.staticTeachingLayer';
  var collapsedKey = 'failureStrengthLab.staticEngineeringCollapsed';
  var content = {
    title: 'Static boundary: material response ≠ pipe-code check',
    intro: 'Use this tab to learn behavior, then route the pipe problem by load source and stress category.',
    concept: 'Elastic returns after unload. Yield means permanent strain. Ductile metals can plastically deform and neck; brittle failure may give little warning.',
    piping: 'F/A is direct axial stress only. Real pipe review also needs pressure containment, hoop/longitudinal stress, bending M/Z, supports, nozzles, branches, and local details.',
    b313: 'Route first: pressure → 304; sustained weight/force → 302.3.5; occasional event → 302.3.6; displacement/flexibility → 319; supports/materials → 321/323/App. A.',
    sources: 'Licensed ASME B31.3 and project specs govern. Strength-of-materials and practical pipe-stress notes are teaching references only.',
    formula: 'Direct axial only. Do not read the static picture as B31.3 acceptance or as a complete stress report.'
  };

  function activeLabel() {
    var label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
    return label && label.textContent ? label.textContent.trim() : 'Static';
  }

  function savedLayer() {
    try { return localStorage.getItem(layerKey) || 'engineer'; } catch (e) { return 'engineer'; }
  }

  function savedCollapsed() {
    try {
      var saved = localStorage.getItem(collapsedKey);
      return saved === null ? true : saved !== 'false';
    } catch (e) {
      return true;
    }
  }

  function applyLayer(layer) {
    try { localStorage.setItem(layerKey, layer); } catch (e) {}
    if (document.body.getAttribute('data-static-layer') !== layer) document.body.setAttribute('data-static-layer', layer);
    Array.prototype.forEach.call(document.querySelectorAll('.static-mode-switch button'), function (button) {
      var selected = button.getAttribute('data-layer') === layer;
      button.classList.toggle('active', selected);
      var pressed = selected ? 'true' : 'false';
      if (button.getAttribute('aria-pressed') !== pressed) button.setAttribute('aria-pressed', pressed);
    });
  }

  function applyCollapsed(panel, collapsed, persist) {
    if (!panel) return;
    panel.classList.toggle('is-collapsed', collapsed);
    panel.setAttribute('data-collapsed', collapsed ? 'true' : 'false');
    var toggle = panel.querySelector('.static-engineering-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggle.textContent = collapsed ? 'Show key points' : 'Hide key points';
    }
    if (persist) {
      try { localStorage.setItem(collapsedKey, collapsed ? 'true' : 'false'); } catch (e) {}
    }
  }

  function addText(parent, tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function addCard(grid, className, title, text) {
    var card = document.createElement('div');
    card.className = 'static-engineering-card ' + className;
    addText(card, 'b', '', title);
    addText(card, 'span', '', text);
    grid.appendChild(card);
  }

  function buildPanel() {
    var panel = document.createElement('section');
    panel.className = 'static-engineering-panel';
    panel.setAttribute('aria-label', 'Static loading engineering boundary');

    var formula = document.createElement('div');
    formula.className = 'static-formula-boundary';
    addText(formula, 'code', '', 'σ = F/A');
    addText(formula, 'span', '', content.formula);
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'static-engineering-toggle';
    toggle.setAttribute('aria-controls', 'static-engineering-key-points');
    toggle.addEventListener('click', function () {
      applyCollapsed(panel, !panel.classList.contains('is-collapsed'), true);
    });
    formula.appendChild(toggle);
    panel.appendChild(formula);

    var head = document.createElement('div');
    head.className = 'static-engineering-head';
    var headText = document.createElement('div');
    addText(headText, 'div', 'static-engineering-kicker', 'Engineering boundary');
    addText(headText, 'div', 'static-engineering-title', content.title);
    addText(headText, 'div', 'static-engineering-copy', content.intro);
    head.appendChild(headText);

    var switcher = document.createElement('div');
    switcher.className = 'static-mode-switch';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', 'Static teaching layer');
    [['beginner', 'Beginner'], ['engineer', 'Engineer'], ['code', 'Code map']].forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-layer', item[0]);
      button.textContent = item[1];
      button.addEventListener('click', function () { applyLayer(item[0]); });
      switcher.appendChild(button);
    });
    head.appendChild(switcher);
    panel.appendChild(head);

    var grid = document.createElement('div');
    grid.id = 'static-engineering-key-points';
    grid.className = 'static-engineering-grid';
    addCard(grid, 'concept', 'Concept', content.concept);
    addCard(grid, 'piping', 'Piping', content.piping);
    addCard(grid, 'b313', 'B31.3 map', content.b313);
    addCard(grid, 'sources', 'Sources', content.sources);
    panel.appendChild(grid);
    applyCollapsed(panel, savedCollapsed(), false);
    return panel;
  }

  function renderStaticPanel() {
    var label = activeLabel();
    var mode = label === 'Static' ? 'static' : label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (document.body.getAttribute('data-fs-mode') !== mode) document.body.setAttribute('data-fs-mode', mode);

    var existing = document.querySelector('.static-engineering-panel');
    if (label !== 'Static') {
      if (existing) existing.remove();
      return;
    }

    var titleRow = document.querySelector('main .title-row');
    if (!titleRow) return;

    var paragraph = titleRow.querySelector('p');
    var next = 'Material behavior first. Pipe-stress acceptance comes later through pressure, sustained, occasional, and displacement/flexibility routes.';
    if (paragraph && paragraph.textContent !== next) paragraph.textContent = next;

    if (!existing) {
      titleRow.insertAdjacentElement('afterend', buildPanel());
    } else {
      applyCollapsed(existing, savedCollapsed(), false);
    }
    applyLayer(savedLayer());
  }

  function renderLater() { setTimeout(renderStaticPanel, 0); }

  window.addEventListener('DOMContentLoaded', function () {
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      renderStaticPanel();
      if (document.querySelector('main .title-row') || attempts > 40) clearInterval(timer);
    }, 100);
    setInterval(renderStaticPanel, 1200);
    document.addEventListener('click', function (event) {
      if (event.target.closest('.lesson-tabs .tab')) renderLater();
    });
    document.addEventListener('input', function (event) {
      if (event.target.closest('aside')) renderLater();
    });
  });
})();