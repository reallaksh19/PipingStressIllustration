(function () {
  function activeLabel() {
    var label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
    return label && label.textContent ? label.textContent.trim() : '';
  }

  function text(node) {
    return node && node.textContent ? node.textContent.trim() : '';
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

  function setMode() {
    if (activeLabel() === 'Expansion') {
      document.body.setAttribute('data-fs-mode', 'expansion');
    }
  }

  function compactExpansionCopy() {
    if (activeLabel() !== 'Expansion') return;

    var titleCopy = document.querySelector('main .title-row p');
    setText(titleCopy, 'Movement first; stress/reaction only after restraint. Keep pressure, sustained, and flexibility routes separate.');

    var panels = document.querySelectorAll('main .analysis-grid .panel');
    setPanelTitle(panels[0], 'Panel 1 · expansion visual', 'movement / reaction');
    setPanelTitle(panels[1], 'Panel 2 · equations', 'ΔL / εL,p');
    setPanelTitle(panels[2], 'Panel 3 · route readout', 'B31.3 context');

    Array.prototype.forEach.call(document.querySelectorAll('main .analysis-grid .panel:nth-child(1) svg text'), function (node) {
      var value = text(node);
      if (!value) return;

      if (value.indexOf('Straight-pipe pressure elongation') === 0 || value.indexOf('Bend straightening belongs') === 0) {
        node.setAttribute('data-expansion-low-priority', 'true');
      }
      if (value === 'pressure strain cue') {
        setText(node, 'pressure axial');
      }
      if (value === 'cold / installed position') {
        setText(node, 'cold position');
      }
      if (value === 'free growth: movement first, stress only if restrained') {
        setText(node, 'free growth: movement first');
      }
      if (value.indexOf('Thermal movement routes through') === 0) {
        setText(node, 'Movement route: flexibility / displacement range.');
      }
      if (value.indexOf('Unrestrained straight pipe') === 0) {
        setText(node, 'Unrestrained pipe — free expansion');
      }
      if (value.indexOf('Restrained straight pipe') === 0) {
        setText(node, 'Restrained pipe — reaction cue');
      }
    });
  }

  function render() {
    setMode();
    compactExpansionCopy();
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
      if (document.querySelector('main .analysis-grid') || attempts > 40) clearInterval(timer);
    }, 100);

    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('.lesson-tabs, aside')) schedule();
    }, true);

    var root = document.getElementById('root');
    if (root) {
      new MutationObserver(schedule).observe(root, { childList: true, subtree: true, characterData: true });
    }
  });
})();
