/* Learning Center fallback renderer
   Stable owner rules:
   - This file owns the visible Learning Center for all tabs.
   - Static and Fatigue use flat engineering key-point cards, not expandable helper cards.
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

const KEY_POINT_SETS = {
  Static: {
    label: 'Tab 1 · Static Engineering Key Points',
    subtitle: 'Behavior only: identify load source and B31.3 route before acceptance judgment.',
    route: 'compact key points',
    version: 'static-single-owner-v6',
    attrs: { 'data-crisp-static': 'true', 'data-static-owner': 'fallback-single-owner' },
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
  },
  Fatigue: {
    label: 'Tab 2 · Fatigue Engineering Key Points',
    subtitle: 'Screening only: classify the cyclic source, count cycles, find the local detail, then route to B31.3/owner fatigue criteria.',
    route: 'fatigue key points',
    version: 'fatigue-single-owner-v1',
    attrs: { 'data-crisp-fatigue': 'true', 'data-fatigue-owner': 'fallback-single-owner' },
    cards: [
      {
        cls: 'formula',
        title: 'Boundary',
        route: 'Δσ + N + detail',
        points: [
          'Fatigue is driven by repeated stress range Δσ and cycle count N, not one maximum static stress.',
          'The displayed S-N line is a conceptual screening boundary, not a project design curve.',
          'Weld/notch active mode lowers the teaching boundary to show detail sensitivity.'
        ]
      },
      {
        cls: 'concept',
        title: 'Mechanism',
        route: 'initiation → growth',
        points: [
          'Cracks usually initiate at stress raisers: weld toes, notches, surface defects, pits, or sharp transitions.',
          'Stable crack growth can occur below yield under many cycles.',
          'Once a real crack exists, assessment normally moves toward inspection data, ΔK, crack size, and toughness.'
        ]
      },
      {
        cls: 'piping',
        title: 'Piping',
        route: 'source + hotspot',
        points: [
          'Cycle sources include thermal startup/shutdown, pressure pulsation, vibration, slugging, relief events, and repeated support movement.',
          'High-risk details include small-bore branches, socket welds, drains/vents, clamps, shoes, trunnions, and branch welds.',
          'A global line stress can look acceptable while a local weld/detail is the fatigue limit state.'
        ]
      },
      {
        cls: 'b313',
        title: 'B31.3 map',
        route: 'route before curve',
        points: [
          'Thermal cycling → displacement stress range / flexibility route, mainly 302.3.5 and 319 family.',
          'Vibration, pulsation, and severe cyclic service need owner/project fatigue criteria, not only the expansion range equation.',
          'Detail realism may require SIF/flexibility basis such as B31J or project-approved legacy Appendix D treatment.'
        ]
      },
      {
        cls: 'sources',
        title: 'Sources',
        route: 'authority hierarchy',
        points: [
          'Final authority: licensed ASME B31.3 edition, owner severe-cyclic rules, and project specifications.',
          'Background: S-N fatigue references, welded-joint fatigue references, fracture-mechanics references.',
          'Practical checks: vibration screening, small-bore connection guidance, vendor/software fatigue notes; verify before use.'
        ]
      }
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

function applyPanelChrome(layer, title, heading, subtitle, routeEl, data) {
  layer.hidden = false;
  title.textContent = data.label;
  heading.textContent = data.label;
  subtitle.textContent = data.subtitle;
  if (routeEl) routeEl.textContent = data.route || 'compact key points';
}

function renderKeyPointSet(label, layer, title, heading, subtitle, grid) {
  const keyPointSet = KEY_POINT_SETS[label];
  if (!keyPointSet) return false;

  const routeEl = layer.querySelector('.fallback-route');
  applyPanelChrome(layer, title, heading, subtitle, routeEl, keyPointSet);

  layer.removeAttribute('data-crisp-static');
  layer.removeAttribute('data-static-owner');
  layer.removeAttribute('data-crisp-fatigue');
  layer.removeAttribute('data-fatigue-owner');
  Object.entries(keyPointSet.attrs || {}).forEach(([name, value]) => layer.setAttribute(name, value));

  const openLabel = layer.querySelector('.open-label');
  if (openLabel) openLabel.textContent = '▼ Open key points';
  const closeLabel = layer.querySelector('.close-label');
  if (closeLabel) closeLabel.textContent = '▲ Collapse panel';

  const fingerprint = `${keyPointSet.version}|${keyPointSet.cards.length}`;
  const versionAttr = `data-${label.toLowerCase()}-version`;
  const alreadyStable = grid.getAttribute(versionAttr) === fingerprint &&
    grid.querySelectorAll('.fallback-keycard').length === keyPointSet.cards.length &&
    !grid.querySelector('.fallback-helper');
  if (alreadyStable) return true;

  grid.className = 'fallback-helper-grid fallback-keypoint-grid';
  grid.removeAttribute('data-fallback-version');
  grid.removeAttribute('data-crisp-version');
  grid.removeAttribute('data-static-version');
  grid.removeAttribute('data-fatigue-version');
  grid.setAttribute(versionAttr, fingerprint);
  grid.innerHTML = keyPointSet.cards.map(card => {
    return `<section class="fallback-keycard ${escapeLearningText(card.cls)}">
      <div class="fallback-keycard-title"><b>${escapeLearningText(card.title)}</b><span>${escapeLearningText(card.route)}</span></div>
      <ul>${card.points.map(point => `<li>${escapeLearningText(point)}</li>`).join('')}</ul>
    </section>`;
  }).join('');
  return true;
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

  if (renderKeyPointSet(active, layer, title, heading, subtitle, grid)) return;

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
  layer.removeAttribute('data-crisp-fatigue');
  layer.removeAttribute('data-fatigue-owner');
  grid.className = 'fallback-helper-grid';
  grid.removeAttribute('data-crisp-version');
  grid.removeAttribute('data-static-version');
  grid.removeAttribute('data-fatigue-version');
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
