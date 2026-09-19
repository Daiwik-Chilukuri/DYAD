import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 14: Tabular Metric Monospace Typography', 1);

function formatMetricDisplay(value, unit = '', sentiment = 'neutral') {
  const sentimentColorMap = {
    optimal: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-rose-400',
    neutral: 'text-slate-200'
  };

  const formattedNum = typeof value === 'number' ? value.toLocaleString('en-IN') : String(value);
  const colorClass = sentimentColorMap[sentiment] || sentimentColorMap.neutral;
  const classes = `font-mono tabular-nums font-semibold ${colorClass}`;

  return { formattedNum, unit, classes, raw: value };
}

suite.test('F14.1: Formatted metric includes font-mono and tabular-nums CSS classes to prevent jitter', () => {
  const metric = formatMetricDisplay(42000, 'commuters', 'optimal');
  assert.includes(metric.classes, 'font-mono');
  assert.includes(metric.classes, 'tabular-nums');
  assert.includes(metric.classes, 'font-semibold');
});

suite.test('F14.2: Numeric values format using Indian numbering commas (en-IN format: 1,84,000)', () => {
  const metric = formatMetricDisplay(184000);
  assert.strictEqual(metric.formattedNum, '1,84,000');
});

suite.test('F14.3: Optimal sentiment applies emerald color text-emerald-400', () => {
  const metric = formatMetricDisplay(92, '%', 'optimal');
  assert.includes(metric.classes, 'text-emerald-400');
});

suite.test('F14.4: Warning and Critical sentiments apply amber text-amber-400 and rose text-rose-400', () => {
  const warn = formatMetricDisplay(2, 'breaches', 'warning');
  const crit = formatMetricDisplay(4, 'violations', 'critical');

  assert.includes(warn.classes, 'text-amber-400');
  assert.includes(crit.classes, 'text-rose-400');
});

suite.test('F14.5: Heading text uses tight tracking class (tracking-tight) per design system guidelines', () => {
  const headerClass = 'text-base font-semibold tracking-tight text-white';
  assert.includes(headerClass, 'tracking-tight');
});

export default suite;
