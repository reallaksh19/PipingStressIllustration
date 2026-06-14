(() => {
  const LABELS = {
    free: 'Unrestrained',
    guided: 'Guided',
    restrained: 'Arrested',
  };

  const HELP_TEXT = 'Shown for occasional/event loading in the displayed direction only. Orange arrows are support reactions acting on the pipe; they oppose the event force or blocked movement. Guided = side-guide gap/contact after travel. Arrested = rigid stop/strut; real snubbers are rate-sensitive and are not hard stops.';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function normaliseKey(text) {
    const value = String(text || '').trim().toLowerCase();
    if (value === 'free') return 'free';
    if (value === 'unrestrained') return 'free';
    if (value === 'guided') return 'guided';
    if (value === 'restrained') return 'restrained';
    if (value === 'arrested') return 'restrained';
    return value;
  }

  function setText(node, text) {
    if (node && node.textContent !== text) node.textContent = text;
  }

  function makeSvg(tag, attrs = {}, text) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (text != null) node.textContent = text;
    return node;
  }

  function svgText(svg) {
    return Array.from(svg.querySelectorAll('text')).map((node) => node.textContent || '').join(' | ');
  }

  function eventStateFromSvg(svg) {
    const text = svgText(svg);
    if (!text.includes('event load is lateral')) return null;
    if (text.includes('· Arrested') || text.includes('ARRESTED:')) return 'arrested';
    if (text.includes('· Guided') || text.includes('GUIDED:')) return 'guided';
    if (text.includes('· Unrestrained') || text.includes('UNRESTRAINED:')) return 'unrestrained';
    return 'event';
  }

  function patchEventRestraintBlock() {
    document.querySelectorAll('.block').forEach((block) => {
      const title = block.querySelector('.bt span:first-child');
      if (!title) return;
      const titleText = String(title.textContent || '').trim();
      if (titleText !== 'Dynamic restraint' && titleText !== 'Event restraint condition') return;

      setText(title, 'Event restraint condition');

      const tag = block.querySelector('.bt span:nth-child(2)');
      if (tag) {
        const key = normaliseKey(tag.textContent);
        if (LABELS[key]) setText(tag, LABELS[key]);
      }

      block.querySelectorAll('.seg button').forEach((button) => {
        const storedKey = button.getAttribute('data-loads-restraint-key');
        const key = storedKey || normaliseKey(button.textContent);
        if (!LABELS[key]) return;
        if (!storedKey) button.setAttribute('data-loads-restraint-key', key);
        setText(button, LABELS[key]);
      });

      const copy = block.querySelector('p.copy');
      if (copy) setText(copy, HELP_TEXT);
    });
  }

  function patchTechnicalBar() {
    const tech = document.querySelector('.tech-text');
    if (!tech || !tech.textContent) return;
    const patched = tech.textContent
      .replace('dynamic restraint free', 'event restraint Unrestrained')
      .replace('dynamic restraint guided', 'event restraint Guided')
      .replace('dynamic restraint restrained', 'event restraint Arrested');
    setText(tech, patched);
  }

  function addEventReactionOverlay(svg, state) {
    const old = svg.querySelector('[data-event-reaction-overlay="true"]');
    if (old) old.remove();
    if (!state) return;

    const g = makeSvg('g', { 'data-event-reaction-overlay': 'true', 'pointer-events': 'none' });

    // Left fixed anchor reaction: event force is drawn downward, so the reaction acting on the pipe is upward.
    g.appendChild(makeSvg('path', {
      d: 'M58 286 V218',
      stroke: '#ff9e3a',
      'stroke-width': state === 'unrestrained' ? 6.6 : state === 'guided' ? 5.2 : 4.4,
      'stroke-linecap': 'round',
      'marker-end': 'url(#loadArrowOrange)',
    }));
    g.appendChild(makeSvg('path', {
      d: 'M78 257 C42 244 40 197 82 184',
      stroke: 'rgba(255,158,58,.92)',
      'stroke-width': state === 'unrestrained' ? 5.2 : 4.4,
      fill: 'none',
      'stroke-linecap': 'round',
      'marker-end': 'url(#loadArrowOrange)',
    }));
    g.appendChild(makeSvg('text', {
      x: 98,
      y: 216,
      fill: '#ff9e3a',
      'font-size': 10,
      'font-weight': 900,
    }, 'fixed anchor: V↑ + M'));

    if (state === 'guided') {
      g.appendChild(makeSvg('text', {
        x: 410,
        y: 250,
        fill: '#52f0df',
        'font-size': 10,
        'font-weight': 900,
      }, 'guide reaction ↑ only after gap contact'));
      g.appendChild(makeSvg('text', {
        x: 320,
        y: 326,
        'text-anchor': 'middle',
        fill: 'rgba(216,237,255,.78)',
        'font-size': 10,
        'font-weight': 800,
      }, 'Reaction arrows act on the pipe and oppose the downward event load.'));
    } else if (state === 'arrested') {
      g.appendChild(makeSvg('text', {
        x: 418,
        y: 216,
        fill: '#ff9e3a',
        'font-size': 10,
        'font-weight': 900,
      }, 'rigid stop reaction on pipe ↑'));
      g.appendChild(makeSvg('text', {
        x: 320,
        y: 326,
        'text-anchor': 'middle',
        fill: 'rgba(216,237,255,.78)',
        'font-size': 10,
        'font-weight': 800,
      }, 'Arrested: right stop carries dominant reaction; left fixed anchor still gives V↑ + M.'));
    } else {
      g.appendChild(makeSvg('text', {
        x: 320,
        y: 326,
        'text-anchor': 'middle',
        fill: 'rgba(216,237,255,.78)',
        'font-size': 10,
        'font-weight': 800,
      }, 'Unrestrained right side: fixed left anchor provides upward shear reaction and moment.'));
    }

    svg.appendChild(g);
  }

  function patchEventReactionSvgs() {
    document.querySelectorAll('svg[aria-label="Load type physical visual"]').forEach((svg) => {
      const state = eventStateFromSvg(svg);
      addEventReactionOverlay(svg, state);

      if (!state) return;
      Array.from(svg.querySelectorAll('text')).forEach((text) => {
        if (text.textContent === 'left anchor reaction') {
          setText(text, 'left fixed-anchor reaction on pipe ↑');
        }
        if (text.textContent === 'after gap closure: right guide reaction shares load with left anchor') {
          setText(text, 'after gap closure: right guide reaction ↑ shares load with left anchor');
        }
        if (text.textContent === 'ARRESTED: right rigid stop takes dominant lateral reaction; left anchor still reacts') {
          setText(text, 'ARRESTED: right stop reaction ↑ dominates; left fixed anchor still gives V↑ + M');
        }
      });
    });
  }

  function patchLoadsEventUi() {
    patchEventRestraintBlock();
    patchTechnicalBar();
    patchEventReactionSvgs();
  }

  let queued = false;
  function schedulePatch() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      patchLoadsEventUi();
    });
  }

  const root = document.getElementById('root') || document.body;
  const observer = new MutationObserver(schedulePatch);
  observer.observe(root, { childList: true, subtree: true });
  window.addEventListener('load', patchLoadsEventUi);
  setTimeout(patchLoadsEventUi, 0);
  setTimeout(patchLoadsEventUi, 250);
})();