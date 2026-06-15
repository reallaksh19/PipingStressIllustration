(() => {
  const LABELS = {
    pressure: 'Pr',
    bending: 'M',
    torsion: 'τt',
    combined: 'Σ',
  };

  const FULL = {
    pressure: 'Pressure',
    bending: 'Bending',
    torsion: 'Torsion',
    combined: 'Combined',
  };

  function activeLabel() {
    const label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
    return label && label.textContent ? label.textContent.trim() : '';
  }

  function normaliseKey(value) {
    const text = String(value || '').trim().toLowerCase();
    if (text === 'pr' || text === 'pressure') return 'pressure';
    if (text === 'm' || text === 'bend' || text === 'bending') return 'bending';
    if (text === 'τt' || text === 'taut' || text === 'torsion') return 'torsion';
    if (text === 'σ' || text === '∑' || text === 'Σ' || text === 'sum' || text === 'combined') return 'combined';
    return text;
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function patchPipeComponentButtons() {
    if (activeLabel() !== 'Pipe Stress') return;

    document.querySelectorAll('aside .block').forEach((block) => {
      const title = block.querySelector('.bt span:first-child');
      if (!title || String(title.textContent || '').trim() !== 'Pipe component view') return;

      const tag = block.querySelector('.bt span:nth-child(2)');
      if (tag) {
        const key = normaliseKey(tag.textContent);
        if (LABELS[key]) setText(tag, LABELS[key]);
      }

      block.querySelectorAll('.seg button').forEach((button) => {
        const storedKey = button.getAttribute('data-pipe-stress-view-key');
        const key = storedKey || normaliseKey(button.textContent);
        if (!LABELS[key]) return;
        if (!storedKey) button.setAttribute('data-pipe-stress-view-key', key);
        button.setAttribute('title', FULL[key]);
        button.setAttribute('aria-label', FULL[key]);
        setText(button, LABELS[key]);
      });
    });
  }

  let raf = 0;
  function schedule() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      patchPipeComponentButtons();
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      patchPipeComponentButtons();
      if (document.querySelector('aside .block') || attempts > 40) clearInterval(timer);
    }, 100);

    document.addEventListener('click', (event) => {
      if (event.target && event.target.closest && event.target.closest('.lesson-tabs, aside')) schedule();
    }, true);

    const root = document.getElementById('root');
    if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  });
})();
