import { installPsMappingUtilityTile as installBasePsMappingUtilityTile } from './ps-mapping-utility-tab-header-map-ui.js?v=20260611-psmap-header-map-1';

const STYLE_ID = 'psmap-rules-preview-style';

function esc(value) {
  return String(value ?? '').replace(/[&<>\"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function installStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = '.psmap-rules-note,.psmap-near-sandbox{border:1px solid rgba(96,165,250,.35);background:rgba(30,64,175,.14);border-radius:12px;padding:10px;margin:10px 0;color:#dbeafe;font-size:12px}.psmap-rules-note strong,.psmap-near-sandbox strong{color:#bbf7d0}.psmap-near-grid{display:grid;grid-template-columns:repeat(2,minmax(160px,1fr));gap:8px;margin:8px 0}.psmap-near-grid label{display:grid;gap:4px}.psmap-near-grid input{background:#020617;color:#e5e7eb;border:1px solid rgba(148,163,184,.34);border-radius:8px;padding:6px}.psmap-near-pill{display:inline-block;border-radius:999px;padding:2px 8px;margin-right:6px;font-weight:800}.psmap-near-ok{background:rgba(34,197,94,.18);color:#bbf7d0}.psmap-near-warn{background:rgba(251,191,36,.18);color:#fde68a}.psmap-near-bad{background:rgba(248,113,113,.16);color:#fecaca}.psmap-legacy-badge{display:inline-block;margin-left:6px;border:1px solid rgba(251,191,36,.45);border-radius:999px;padding:2px 7px;color:#fde68a;font-size:11px}';
  document.head.appendChild(style);
}

function editDistance(a, b) {
  const x = String(a || '');
  const y = String(b || '');
  const dp = Array.from({ length: x.length + 1 }, () => Array(y.length + 1).fill(0));
  for (let i = 0; i <= x.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= y.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= x.length; i += 1) {
    for (let j = 1; j <= y.length; j += 1) {
      const cost = x[i - 1] === y[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[x.length][y.length];
}

function lineFamily(value) {
  const source = String(value || '').toUpperCase().replace(/^\//, '').replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, '').replace(/([A-Z])-+(\d)/g, '$1$2');
  const match = source.match(/\b([A-Z]{1,3}\d{4,})\b/);
  return match ? match[1] : source.replace(/[^A-Z0-9]/g, '');
}

function setupNumber(name, fallback) {
  const input = document.querySelector(`[data-psmap-setup="${name}"]`);
  const value = Number(input?.value ?? fallback);
  return Number.isFinite(value) ? value : fallback;
}

function updateNearPreview(host) {
  const model = lineFamily(host.querySelector('[data-near-model]')?.value || '');
  const ref = lineFamily(host.querySelector('[data-near-ref]')?.value || '');
  const maxDistance = setupNumber('nearLineMaxEditDistance', 1);
  const minStem = setupNumber('nearLineMinStemLength', 6);
  const distance = model && ref ? editDistance(model, ref) : null;
  const minLen = Math.min(model.length, ref.length);
  let label = 'Enter both values';
  let cls = 'psmap-near-bad';
  let action = 'No diagnostic.';
  if (model && ref && model === ref) {
    label = 'LINE_FAMILY exact';
    cls = 'psmap-near-ok';
    action = 'Normal exact/family match. This is not approximate.';
  } else if (distance != null && minLen >= minStem && distance <= maxDistance) {
    label = 'LINE_FAMILY_NEAR_MISMATCH';
    cls = 'psmap-near-warn';
    action = 'Review-only near diagnostic. Do not auto-correct.';
  } else if (distance != null) {
    label = 'LINE_CONFLICT';
    cls = 'psmap-near-bad';
    action = 'Outside near-match threshold.';
  }
  const result = host.querySelector('[data-near-result]');
  if (result) result.innerHTML = `<span class="psmap-near-pill ${cls}">${esc(label)}</span><div>Table-2: <code>${esc(model || '-')}</code> | Table-1: <code>${esc(ref || '-')}</code></div><div>Edit distance: <code>${distance == null ? '-' : esc(distance)}</code>; Max: <code>${esc(maxDistance)}</code>; Min stem: <code>${esc(minStem)}</code>; Actual min: <code>${esc(minLen || 0)}</code></div><div>${esc(action)}</div>`;
}

function ensureSupportRulesNotice() {
  const panel = document.querySelector('[data-psmap-panel="config"]');
  if (!panel) return;
  const builtin = panel.querySelector('[data-psmap-setup="useBuiltInSupportKeywordLogic"]');
  if (builtin) {
    builtin.checked = true;
    builtin.disabled = true;
    const label = builtin.closest('label') || builtin.parentElement;
    if (label && !label.querySelector('.psmap-legacy-badge')) label.insertAdjacentHTML('beforeend', '<span class="psmap-legacy-badge">legacy; rules always active</span>');
  }
  const rules = panel.querySelector('[data-psmap-setup="supportKeywordRulesText"]');
  if (rules && !panel.querySelector('[data-support-rules-source-note]')) {
    const note = document.createElement('div');
    note.className = 'psmap-rules-note';
    note.setAttribute('data-support-rules-source-note', '1');
    note.innerHTML = '<strong>Support Keyword Rules are now the source of truth.</strong><br>Table-1D Master Keyword Searcher is legacy/optional for support classification. Edit Pattern → Canonical rows here; the same rules are applied to Table-1C ISONOTE and Table-2 DTXR.';
    rules.parentNode?.insertBefore(note, rules);
  }
}

function ensureNearSandbox() {
  const panel = document.querySelector('[data-psmap-panel="config"]');
  if (!panel || panel.querySelector('[data-psmap-near-sandbox]')) return;
  const host = document.createElement('section');
  host.className = 'psmap-near-sandbox';
  host.setAttribute('data-psmap-near-sandbox', '1');
  host.innerHTML = '<strong>Near Line No. sandbox</strong><div>Preview how Near max edit distance and Near min stem length classify line-family typos.</div><div class="psmap-near-grid"><label>Table-2 pipe/line<input data-near-model value="P88102014"></label><label>Table-1 line<input data-near-ref value="P8810204"></label></div><div data-near-result></div>';
  panel.querySelector('.psmap-card-body')?.appendChild(host) || panel.appendChild(host);
  host.addEventListener('input', () => updateNearPreview(host));
  updateNearPreview(host);
}

function markTable1DLegacy() {
  for (const node of document.querySelectorAll('button,[role="tab"],h3,h4,summary,label')) {
    if (!/Table-1D|Master Keyword Searcher/i.test(node.textContent || '')) continue;
    if (node.querySelector('.psmap-legacy-badge')) continue;
    node.insertAdjacentHTML('beforeend', '<span class="psmap-legacy-badge">legacy / optional</span>');
    node.title = 'Support classification now uses Support Keyword Rules: Pattern → Canonical.';
  }
}

function installPatch() {
  installStyle();
  const patch = () => {
    ensureSupportRulesNotice();
    ensureNearSandbox();
    markTable1DLegacy();
    const sandbox = document.querySelector('[data-psmap-near-sandbox]');
    if (sandbox) updateNearPreview(sandbox);
  };
  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; patch(); });
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  document.addEventListener('input', schedule, true);
  document.addEventListener('change', schedule, true);
  schedule();
  return () => {
    observer.disconnect();
    document.removeEventListener('input', schedule, true);
    document.removeEventListener('change', schedule, true);
  };
}

export function installPsMappingUtilityTile(container, ctx = {}) {
  const destroyBase = installBasePsMappingUtilityTile(container, ctx);
  const destroyPatch = installPatch();
  return () => {
    try { destroyPatch?.(); } catch {}
    try { destroyBase?.(); } catch {}
  };
}
