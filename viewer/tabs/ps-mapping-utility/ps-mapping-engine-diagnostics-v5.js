import {
  DEFAULT_OPTIONS as V4_DEFAULT_OPTIONS,
  DEFAULT_SUPPORT_KEYWORD_RULES_TEXT,
  normalizePsMappingOptions as normalizeV4Options,
  runPsMappingResolver as runV4PsMappingResolver,
  rowsToCsv,
} from './ps-mapping-engine-diagnostics-v4.js?v=20260611-robust-gap-1';

export { DEFAULT_SUPPORT_KEYWORD_RULES_TEXT, rowsToCsv };

export const DEFAULT_OPTIONS = {
  ...V4_DEFAULT_OPTIONS,
  useBuiltInSupportKeywordLogic: true,
  supportKeywordRulesText: DEFAULT_SUPPORT_KEYWORD_RULES_TEXT,
  supportKeywordSourceOfTruth: 'SUPPORT_KEYWORD_RULES',
  table1DMasterKeywordMode: 'LEGACY_OPTIONAL',
};

export function normalizePsMappingOptions(options = {}) {
  const normalized = normalizeV4Options({
    ...options,
    useBuiltInSupportKeywordLogic: true,
    supportKeywordRulesText: options.supportKeywordRulesText || DEFAULT_SUPPORT_KEYWORD_RULES_TEXT,
  });

  return {
    ...normalized,
    useBuiltInSupportKeywordLogic: true,
    supportKeywordRulesText: normalized.supportKeywordRulesText || DEFAULT_SUPPORT_KEYWORD_RULES_TEXT,
    supportKeywordSourceOfTruth: 'SUPPORT_KEYWORD_RULES',
    table1DMasterKeywordMode: 'LEGACY_OPTIONAL',
  };
}

export function runPsMappingResolver(input = {}) {
  const options = normalizePsMappingOptions(input.options || {});
  const result = runV4PsMappingResolver({ ...input, options });
  return {
    ...result,
    approxConfig: {
      ...(result?.approxConfig || {}),
      supportKeywordSourceOfTruth: 'Support Keyword Rules: Pattern → Canonical',
      table1DMasterKeywordMode: 'Legacy/optional; not required for support keyword resolution.',
    },
  };
}
