/* Learning Center fallback renderer
   Stable owner rules:
   - Static tab is owned by static-learning-center-crisp.js to avoid render races.
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

function renderFallbackLearning() {
  const layer = document.getElementById('fallback-learning-panel');
  const title = document.getElementById('fallback-learning-title');
  const heading = document.getElementById('fallback-learning-heading');
  const subtitle = document.getElementById('fallback-learning-subtitle');
  const grid = document.getElementById('fallback-learning-grid');
  if (!layer || !title || !heading || !subtitle || !grid) return;

  const active = activeTabLabel();

  // Static has a dedicated crisp renderer. The old fallback renderer used to
  // overwrite its cards during React root mutations, which caused visible flicker.
  if (active === 'Static' && window.STATIC_CRISP_LEARNING_ENABLED) return;

  if (document.querySelector('.learning-center-panel')) {
    layer.hidden = true;
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

  layer.hidden = false;
  layer.removeAttribute('data-crisp-static');
  title.textContent = data.label;
  heading.textContent = data.label;
  subtitle.textContent = data.subtitle;
  grid.className = 'fallback-helper-grid';
  grid.removeAttribute('data-crisp-version');
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
