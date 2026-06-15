/* Learning Center fallback renderer
   Stable owner rules:
   - This file owns the visible Learning Center for all tabs.
   - Static uses flat engineering key-point cards, not expandable helper cards, to avoid repeated Concept/Piping/B31.3 blocks.
   - Other tabs use ENRICHED_LEARNING when available, with a small fallback set below.
*/
const FALLBACK_LEARNING = {
  Static: {
    label: 'Tab 1 · Static Engineering Key Points',
    subtitle: 'Behavior only: classify the piping load source and B31.3 route before any acceptance judgment.',
    helpers: [
      ['Formula boundary', 'direct axial only', 'σ = F/A is useful for direct axial stress only.', 'Real pipe checks also need pressure design, bending M/Z, SIFs, supports, nozzles, and displacement range.', 'Do not read visible yield or necking as B31.3 acceptance.', 'Licensed ASME B31.3 and project specifications govern final checks.']
    ]
  }
};

const STATIC_KEY_POINTS = {
  label: 'Tab 1 · Static Engineering Key Points',
  subtitle: 'Behavior only: identify load source and B31.3 route before acceptance judgment.',
  route: 'compact key points',
  cards: [
    {
      cls: 'formula',
      title: 'Formula boundary',
      route: 'direct axial only',
      points: [
        'σ = F/A explains direct axial stress only.',
        'Pipe checks also need pressure design, bending M/Z, SIFs, supports, nozzles, and displacement range.',
        'Do not read visible yield or necking as B31.3 acceptance.'
      ]
    },
    {
      cls: 'concept',
      title: 'Concept',
      route: 'material behavior',
      points: [
        'Elastic strain recovers; yield creates permanent strain.',
        'Ductile metal may plastically deform and neck before rupture.',
        'Brittle fracture may occur with little visible deformation.'
      ]
    },
    {
      cls: 'piping',
      title: 'Piping',
      route: 'load path first',
      points: [
        'Static sources include weight, contents, pressure, support reactions, steady nozzle loads, and held displacements.',
        'Hotspots are bends, tees, branches, reducers, welded attachments, supports, restraints, and nozzles.',
        'Separate pressure containment from sustained bending, occasional events, and displacement stress range.'
      ]
    },
    {
      cls: 'b313',
      title: 'B31.3 map',
      route: 'route before equation',
      points: [
        'Pressure → 304; sustained force/weight → 302.3.5; occasional event → 302.3.6.',
        'Thermal, settlement, and equipment movement → 319 flexibility / displacement-stress-range logic.',
        'Supports/materials/allowables → 321, 323, Appendix A; verify licensed edition and owner criteria.'
      ]
    },
    {
      cls: 'sources',
      title: 'Sources',
      route: 'authority hierarchy',
      points: [
        'Final authority: licensed ASME B31.3 project edition and project specifications.',
        'Background only: strength-of-materials and practical pipe-stress references.',
        'Interpretation aids such as Little P.Eng, WhatIsPiping, and vendor notes must be verified before project use.'
      ]
    }
  ]
};

function escapeLearningText(value) {
  return String(value || '').replace(/[&<>'"]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[ch]));
}

function activeTabLabel() {
  const label = document.querySelector('.lesson-tabs .tab.active .tabLabel');
  return label ? label.textContent.trim() : 'Static';
}

function learningDataFor(label) {
  try {
    if (typeof ENRICHED_LEARNING !== 'undefined' && ENRICHED_LEARNING[label]) return ENRICHED_LEARNING[label];
  } catch (e) {}
  return FALLBACK_LEARNING[label];
}

function applyPanelChrome(layer, title, heading, subtitle, routeEl, data) {
  layer.hidden = false;
  title.textContent = data.label;
  heading.textContent = data.label;
  subtitle.textContent = data.subtitle;
  if (routeEl) routeEl.textContent = data.route || 'compact key points';
}

function renderStaticKeyPoints(layer, title, heading, subtitle, grid) {
  const routeEl = layer.querySelector('.fallback-route');
  applyPanelChrome(layer, title, heading, subtitle, routeEl, STATIC_KEY_POINTS);

  layer.setAttribute('data-crisp-static', 'true');
  layer.setAttribute('data-static-owner', 'fallback-single-owner');

  const openLabel = layer.querySelector('.open-label');
  if (openLabel) openLabel.textContent = '▼ Open key points';
  const closeLabel = layer.querySelector('.close-label');
  if (closeLabel) closeLabel.textContent = '▲ Collapse panel';

  const fingerprint = 'static-single-owner-v5|' + STATIC_KEY_POINTS.cards.length;
  const alreadyStable = grid.getAttribute('data-static-version') === fingerprint &&
    grid.querySelectorAll('.fallback-keycard').length === STATIC_KEY_POINTS.cards.length &&
    !grid.querySelector('.fallback-helper');
  if (alreadyStable) return;

  grid.className = 'fallback-helper-grid fallback-keypoint-grid';
  grid.removeAttribute('data-fallback-version');
  grid.removeAttribute('data-crisp-version');
  grid.setAttribute('data-static-version', fingerprint);
  grid.innerHTML = STATIC_KEY_POINTS.cards.map(card => {
    return `<section class="fallback-keycard ${escapeLearningText(card.cls)}">
      <div class="fallback-keycard-title"><b>${escapeLearningText(card.title)}</b><span>${escapeLearningText(card.route)}</span></div>
      <ul>${card.points.map(point => `<li>${escapeLearningText(point)}</li>`).join('')}</ul>
    </section>`;
  }).join('');
}

function renderFallbackLearning() {
  const layer = document.getElementById('fallback-learning-panel');
  const title = document.getElementById('fallback-learning-title');
  const heading = document.getElementById('fallback-learning-heading');
  const subtitle = document.getElementById('fallback-learning-subtitle');
  const grid = document.getElementById('fallback-learning-grid');
  if (!layer || !title || !heading || !subtitle || !grid) return;

  if (document.querySelector('.learning-center-panel')) {
    layer.hidden = true;
    return;
  }

  const active = activeTabLabel();

  if (active === 'Static') {
    renderStaticKeyPoints(layer, title, heading, subtitle, grid);
    return;
  }

  const data = learningDataFor(active);
  if (!data) {
    layer.hidden = true;
    return;
  }

  const fingerprint = active + '|' + data.label + '|' + data.subtitle + '|' + data.helpers.length;
  if (grid.getAttribute('data-fallback-version') === fingerprint && grid.querySelector('.fallback-helper')) {
    layer.hidden = false;
    return;
  }

  applyPanelChrome(layer, title, heading, subtitle, layer.querySelector('.fallback-route'), {
    label: data.label,
    subtitle: data.subtitle,
    route: 'compact key points'
  });
  layer.removeAttribute('data-crisp-static');
  layer.removeAttribute('data-static-owner');
  grid.className = 'fallback-helper-grid';
  grid.removeAttribute('data-crisp-version');
  grid.removeAttribute('data-static-version');
  grid.setAttribute('data-fallback-version', fingerprint);
  grid.innerHTML = data.helpers.map((helper, index) => {
    const [hTitle, route, concept, piping, b313, sources] = helper.map(escapeLearningText);
    return `<details class="fallback-helper" ${index === 0 || hTitle.includes('B31.3') ? 'open' : ''}>
      <summary><span>${hTitle}</span><span class="fallback-helper-route"><span>${route}</span><span class="show-label">▼ Show</span><span class="hide-label">▲ Hide</span></span></summary>
      <div class="fallback-helper-body">
        <div class="fallback-cell"><b style="color:#52f0df">Concept</b><span>${concept}</span></div>
        <div class="fallback-cell"><b style="color:#55b8ff">Piping</b><span>${piping}</span></div>
        <div class="fallback-cell"><b style="color:#ffd75b">B31.3 map</b><span>${b313}</span></div>
        ${sources ? `<div class="fallback-cell"><b style="color:#b884ff">Sources</b><span>${sources}</span></div>` : ''}
      </div>
    </details>`;
  }).join('');
}

let fallbackRenderScheduled = false;
function scheduleFallbackLearningRender() {
  if (fallbackRenderScheduled) return;
  fallbackRenderScheduled = true;
  requestAnimationFrame(() => {
    fallbackRenderScheduled = false;
    renderFallbackLearning();
  });
}

window.renderFallbackLearning = renderFallbackLearning;
window.scheduleFallbackLearningRender = scheduleFallbackLearningRender;

window.addEventListener('DOMContentLoaded', () => {
  scheduleFallbackLearningRender();
  document.addEventListener('click', event => {
    if (event.target.closest('.lesson-tabs .tab')) {
      scheduleFallbackLearningRender();
      setTimeout(scheduleFallbackLearningRender, 120);
    }
  });
  const root = document.getElementById('root');
  if (root) new MutationObserver(scheduleFallbackLearningRender).observe(root, { childList: true, subtree: true });
});
