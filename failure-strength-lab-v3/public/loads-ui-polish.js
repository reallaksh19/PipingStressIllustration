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

  function compactSvgText() {
    if (activeLabel() !== 'Loads') return;
    var firstPanel = document.querySelector('main .pipe-grid .panel:nth-child(1)');
    if (!firstPanel) return;

    Array.prototype.forEach.call(firstPanel.querySelectorAll('svg text'), function (node) {
      var value = text(node);
      if (!value) return;

      if (value.indexOf('load slider =') === 0 || value.indexOf('ΔT slider =') === 0) {
        node.setAttribute('data-loads-low-priority', 'true');
      }
      if (value.indexOf('Applicability:') >= 0) {
        node.setAttribute('data-loads-low-priority', 'true');
      }
      if (value.indexOf('GUIDED:') === 0) {
        setText(node, 'GUIDED: lateral control; axial movement depends on load case');
      }
      if (value.indexOf('ARRESTED:') === 0) {
        setText(node, 'ARRESTED: rigid stop/anchor creates reaction path');
      }
      if (value.indexOf('UNRESTRAINED:') === 0) {
        setText(node, 'UNRESTRAINED: displacement is largest; reaction path is limited');
      }
      if (value.indexOf('left anchored lateral event') === 0) {
        node.setAttribute('data-loads-low-priority', 'true');
      }
      if (value.length > 82) {
        node.setAttribute('data-loads-long-label', 'true');
      }
    });
  }

  function renamePanelFour() {
    if (activeLabel() !== 'Loads') return;
    var ph = document.querySelector('main .pipe-grid .panel:nth-child(4) .ph');
    if (!ph) return;
    var spans = ph.querySelectorAll('span');
    if (spans[0]) setText(spans[0], 'Panel 4 · route boundary');
    if (spans[1]) setText(spans[1], 'classify first');
  }

  function render() {
    var mode = activeLabel() === 'Loads' ? 'loads' : (activeLabel() || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (mode && document.body.getAttribute('data-fs-mode') !== mode) {
      document.body.setAttribute('data-fs-mode', mode);
    }
    renamePanelFour();
    compactSvgText();
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
      new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
    }
  });
})();
