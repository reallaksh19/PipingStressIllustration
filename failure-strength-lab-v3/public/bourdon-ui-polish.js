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
    if (activeLabel() === 'Bourdon') {
      document.body.setAttribute('data-fs-mode', 'bourdon');
    }
  }

  function compactBourdonCopy() {
    if (activeLabel() !== 'Bourdon') return;

    var titleCopy = document.querySelector('main .title-row p');
    setText(titleCopy, 'Pressure drives bend opening; end restraint converts movement into support/nozzle reaction. Do not double-count it as an external force.');

    var panels = document.querySelectorAll('main .pipe-grid .panel');
    setPanelTitle(panels[0], 'Panel 1 · Bourdon visual', 'pressure bend opening');
    setPanelTitle(panels[1], 'Panel 2 · mechanism', 'pressure + curvature');
    setPanelTitle(panels[2], 'Panel 3 · piping relevance', 'support / nozzle');
    setPanelTitle(panels[3], 'Panel 4 · route readout', 'movement / reaction');

    Array.prototype.forEach.call(document.querySelectorAll('main .pipe-grid .panel:nth-child(1) svg text'), function (node) {
      var value = text(node);
      if (!value) return;

      if (value.indexOf('Pressure is the driver.') === 0) {
        setText(node, 'Pressure drives bend opening; restraint creates reaction.');
      }
      if (value.indexOf('dashed = installed') === 0) {
        node.setAttribute('data-bourdon-low-priority', 'true');
      }
      if (value === 'smooth pipe · pressure-derived cue') {
        setText(node, 'pressure-derived cue');
      }
      if (value.indexOf('anchor/nozzle reaction:') === 0) {
        setText(node, value.replace('anchor/nozzle reaction:', 'anchor/nozzle:'));
      }
      if (value.indexOf('guide reaction:') === 0) {
        setText(node, value.replace('guide reaction:', 'guide:'));
      }
      if (value.indexOf('movement only:') === 0) {
        setText(node, value.replace('movement only:', 'movement:'));
      }
    });

    Array.prototype.forEach.call(document.querySelectorAll('main .pipe-grid .panel:nth-child(1) svg g'), function (group) {
      var label = group.getAttribute('aria-label') || '';
      if (label === 'installed zero pressure reference bend') {
        group.setAttribute('data-bourdon-reference', 'true');
      }
      if (text(group).indexOf('Active case') !== -1) {
        var rect = group.querySelector('rect[width="164"]');
        if (rect) rect.setAttribute('width', '176');
      }
    });
  }

  function render() {
    setMode();
    compactBourdonCopy();
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
      if (document.querySelector('main .pipe-grid') || attempts > 40) clearInterval(timer);
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
