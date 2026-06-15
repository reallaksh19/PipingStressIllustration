(function () {
  const STATIC_MODE_KEY = 'failureStrengthLab.staticTeachingLayer';
  const DEFAULT_LAYER = 'engineer';

  const copy = {
    title: 'Static tab boundary: material behavior → piping stress route → B31.3 map',
    subtitle: 'This tab teaches material response. It must not be read as a complete pipe-code acceptance check.',
    concept: 'Static loading is slow or steady enough that inertia and cyclic damage are not the controlling teaching effect. Elastic response returns after unloading; yield introduces permanent strain; ductile material may neck before rupture; brittle material may fracture with little warning.',
    piping: 'Real piping stress is not only F/A. Static sources include weight, contents, pressure, support reactions, steady nozzle loads, and held displacements. Critical locations are often bends, tees, branches, reducers, welded attachments, restraints, supports, and nozzles.',
    b313: 'B31.3 routes load effects by category: pressure design, sustained stress, occasional stress, and displacement stress range/flexibility. Do not wait for visible yielding or rupture; verify paragraph wording, equations, allowables, and load combinations against the licensed project edition.',
    sources: 'Licensed ASME B31.3 project edition; strength-of-materials stress–strain references; practical pipe-stress guidance such as Little P.Eng, WhatIsPiping, and software/vendor notes for interpretation only.',
    formula: 'σ = F/A is direct axial stress only. Pipe bending needs section modulus/M/Z logic, pressure containment needs pressure-design wall-thickness logic, and thermal movement needs displacement/flexibility routing.'
  };

  function currentTabLabel() {
    const label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
    return label && label.textContent ? label.textContent.trim() : 'Static';
  }

  function staticLayer() {
    const saved = window.localStorage ? window.localStorage.getItem(STATIC_MODE_KEY) : null;
    return saved || DEFAULT_LAYER;
  }

  function setStaticLayer(layer) {
    if (window.localStorage) window.localStorage.setItem(STATIC_MODE_KEY, layer);
    document.body.dataset.staticLayer = layer;
    document.querySelectorAll('.static-mode-switch button').forEach(button => {
      button.classList.toggle('active', button.dataset.layer === layer);
      button.setAttribute('aria-pressed', String(button.dataset.layer === layer));
    });
  }

  function createPanel() {
    const panel = document.createElement('section');
    panel.className = 'static-engineering-panel';
    panel.setAttribute('aria-label', 'Static loading engineering boundary');
    panel.innerHTML = `
      <div class="static-engineering-head">
        <div>
          <div class="static-engineering-kicker">Engineering hierarchy</div>
          <div class="static-engineering-title">${copy.title}</div>
          <div class="static-engineering-copy">${copy.subtitle}</div>
        </div>
        <div class="static-mode-switch" role="group" aria-label="Static teaching layer">
          <button type="button" data-layer="beginner">Beginner</button>
          <button type="button" data-layer="engineer">Engineer</button>
          <button type="button" data-layer="code">Code map</button>
        </div>
      </div>
      <div class="static-formula-boundary"><code>σ = F/A</code><span>${copy.formula}</span></div>
      <div class="static-engineering-grid">
        <div class="static-engineering-card concept"><b>Concept</b><span>${copy.concept}</span></div>
        <div class="static-engineering-card piping"><b>Piping</b><span>${copy.piping}</span></div>
        <div class="static-engineering-card b313"><b>B31.3 map</b><span>${copy.b313}</span></div>
        <div class="static-engineering-card sources"><b>Sources</b><span>${copy.sources}</span></div>
      </div>`;
    panel.addEventListener('click', event => {
      const button = event.target.closest('.static-mode-switch button');
      if (button && button.dataset.layer) setStaticLayer(button.dataset.layer);
    });
    return panel;
  }

  function patchStaticTitle() {
    const heading = document.querySelector('main .title-row h2');
    const paragraph = document.querySelector('main .title-row p');
    if (!heading || !paragraph || heading.textContent.trim() !== 'Static Loading') return;
    paragraph.textContent = 'Material response is shown first; pipe-wall interpretation and B31.3 category routing are made explicit below so F/A is not mistaken for a full pipe-stress check.';
  }

  function patchFallbackPanelLabels() {
    const route = document.querySelector('.fallback-learning-head .fallback-route');
    if (route) route.textContent = 'right-side panel';

    const openLabel = document.querySelector('.fallback-learning-action .open-label');
    if (openLabel) openLabel.textContent = '▼ Open teaching panel';

    const closeLabel = document.querySelector('.fallback-learning-action .close-label');
    if (closeLabel) closeLabel.textContent = '▲ Collapse panel';
  }

  function render() {
    const active = currentTabLabel();
    document.body.dataset.fsMode = active === 'Static' ? 'static' : active.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    patchFallbackPanelLabels();

    const existing = document.querySelector('.static-engineering-panel');
    if (active !== 'Static') {
      if (existing) existing.remove();
      return;
    }

    document.body.dataset.staticLayer = staticLayer();
    patchStaticTitle();

    const titleRow = document.querySelector('main .title-row');
    if (!titleRow) return;

    const panel = existing || createPanel();
    if (!existing) titleRow.insertAdjacentElement('afterend', panel);
    setStaticLayer(staticLayer());
  }

  window.addEventListener('DOMContentLoaded', () => {
    render();
    document.addEventListener('click', event => {
      if (event.target.closest('.lesson-tabs .tab')) setTimeout(render, 0);
    });
    const root = document.getElementById('root');
    if (root) {
      new MutationObserver(() => window.requestAnimationFrame(render)).observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
    }
  });
})();
