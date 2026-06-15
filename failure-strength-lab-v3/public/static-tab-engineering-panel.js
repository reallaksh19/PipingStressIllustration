(function () {
  var layerKey = 'failureStrengthLab.staticTeachingLayer';
  var content = {
    title: 'Static tab boundary: material behavior to piping stress route to B31.3 map',
    intro: 'This tab teaches material response. It is not a complete pipe-code acceptance check.',
    concept: 'Static loading is slow or steady enough that inertia and cyclic damage are not the controlling teaching effect. Elastic response returns after unloading; yield introduces permanent strain; ductile material may neck before rupture; brittle material may fracture with little warning.',
    piping: 'Real piping stress is not only F/A. Static sources include weight, contents, pressure, support reactions, steady nozzle loads, and held displacements. Critical locations are often bends, tees, branches, reducers, welded attachments, restraints, supports, and nozzles.',
    b313: 'B31.3 routes load effects by category: pressure design, sustained stress, occasional stress, and displacement stress range or flexibility. Do not wait for visible yielding or rupture. Verify paragraph wording, equations, allowables, and load combinations against the licensed project edition.',
    sources: 'Licensed ASME B31.3 project edition; strength-of-materials stress-strain references; practical pipe-stress guidance such as Little P.Eng, WhatIsPiping, and software/vendor notes for interpretation only.',
    formula: 'F/A is direct axial stress only. Pipe bending needs M/Z logic, pressure containment needs pressure-design wall-thickness logic, and thermal movement needs displacement/flexibility routing.'
  };

  function activeLabel() {
    var label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
    return label && label.textContent ? label.textContent.trim() : 'Static';
  }

  function savedLayer() {
    try { return localStorage.getItem(layerKey) || 'engineer'; } catch (e) { return 'engineer'; }
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

    var head = document.createElement('div');
    head.className = 'static-engineering-head';
    var headText = document.createElement('div');
    addText(headText, 'div', 'static-engineering-kicker', 'Engineering hierarchy');
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

    var formula = document.createElement('div');
    formula.className = 'static-formula-boundary';
    addText(formula, 'code', '', 'sigma = F/A');
    addText(formula, 'span', '', content.formula);
    panel.appendChild(formula);

    var grid = document.createElement('div');
    grid.className = 'static-engineering-grid';
    addCard(grid, 'concept', 'Concept', content.concept);
    addCard(grid, 'piping', 'Piping', content.piping);
    addCard(grid, 'b313', 'B31.3 map', content.b313);
    addCard(grid, 'sources', 'Sources', content.sources);
    panel.appendChild(grid);
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
    var next = 'Material response is shown first; pipe-wall interpretation and B31.3 category routing are made explicit below so F/A is not mistaken for a full pipe-stress check.';
    if (paragraph && paragraph.textContent !== next) paragraph.textContent = next;

    if (!existing) titleRow.insertAdjacentElement('afterend', buildPanel());
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
