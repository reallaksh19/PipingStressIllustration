(() => {
  const LABELS = {
    free: 'Unrestrained',
    guided: 'Guided',
    restrained: 'Arrested',
  };

  const HELP_TEXT = 'Shown for occasional/event loading in the displayed direction only. Guided = side-guide gap/contact after travel. Arrested = rigid stop/strut; real snubbers are rate-sensitive and are not hard stops.';

  function normaliseKey(text) {
    const value = String(text || '').trim().toLowerCase();
    if (value === 'free') return 'free';
    if (value === 'unrestrained') return 'free';
    if (value === 'guided') return 'guided';
    if (value === 'restrained') return 'restrained';
    if (value === 'arrested') return 'restrained';
    return value;
  }

  function patchEventRestraintBlock() {
    document.querySelectorAll('.block').forEach((block) => {
      const title = block.querySelector('.bt span:first-child');
      if (!title) return;
      const titleText = String(title.textContent || '').trim();
      if (titleText !== 'Dynamic restraint' && titleText !== 'Event restraint condition') return;

      title.textContent = 'Event restraint condition';

      const tag = block.querySelector('.bt span:nth-child(2)');
      if (tag) {
        const key = normaliseKey(tag.textContent);
        if (LABELS[key]) tag.textContent = LABELS[key];
      }

      block.querySelectorAll('.seg button').forEach((button) => {
        const key = normaliseKey(button.textContent);
        if (LABELS[key]) button.textContent = LABELS[key];
      });

      const copy = block.querySelector('p.copy');
      if (copy && copy.textContent !== HELP_TEXT) copy.textContent = HELP_TEXT;
    });
  }

  function patchTechnicalBar() {
    const tech = document.querySelector('.tech-text');
    if (!tech || !tech.textContent) return;
    const patched = tech.textContent
      .replace('dynamic restraint free', 'event restraint Unrestrained')
      .replace('dynamic restraint guided', 'event restraint Guided')
      .replace('dynamic restraint restrained', 'event restraint Arrested');
    if (patched !== tech.textContent) tech.textContent = patched;
  }

  function patchLoadsEventUi() {
    patchEventRestraintBlock();
    patchTechnicalBar();
  }

  const root = document.getElementById('root') || document.body;
  const observer = new MutationObserver(() => patchLoadsEventUi());
  observer.observe(root, { childList: true, subtree: true, characterData: true });
  window.addEventListener('load', patchLoadsEventUi);
  setTimeout(patchLoadsEventUi, 0);
  setTimeout(patchLoadsEventUi, 250);
})();
