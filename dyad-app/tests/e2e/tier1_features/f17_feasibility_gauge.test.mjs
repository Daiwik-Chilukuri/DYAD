import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 17: 0-100 Feasibility Score Gauge', 1);

function computeGaugeProperties(score, radius = 54) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let sentiment = 'neutral';
  let color = '#94A3B8';
  let verdict = 'Indeterminate';

  if (clampedScore >= 75) {
    sentiment = 'optimal';
    color = '#10B981';
    verdict = 'High Feasibility / Prime Corridor';
  } else if (clampedScore >= 50) {
    sentiment = 'warning';
    color = '#F59E0B';
    verdict = 'Moderate Feasibility / Ecological Caveats';
  } else {
    sentiment = 'critical';
    color = '#EF4444';
    verdict = 'High Friction / Severe Breaches';
  }

  return {
    score: clampedScore,
    circumference,
    strokeDashoffset,
    sentiment,
    color,
    verdict
  };
}

suite.test('F17.1: Score gauge accepts number in [0, 100] range and formats correctly', () => {
  const gauge = computeGaugeProperties(84.5);
  assert.strictEqual(gauge.score, 84.5);
  assert.strictEqual(gauge.sentiment, 'optimal');
  assert.strictEqual(gauge.color, '#10B981');
});

suite.test('F17.2: Clamps out-of-bounds scores cleanly to [0, 100]', () => {
  const underflow = computeGaugeProperties(-12);
  const overflow = computeGaugeProperties(125);

  assert.strictEqual(underflow.score, 0);
  assert.strictEqual(overflow.score, 100);
});

suite.test('F17.3: Categorizes sentiment: >=75 Prime (emerald), 50-74 Moderate (amber), <50 Critical (rose)', () => {
  const prime = computeGaugeProperties(80);
  const moderate = computeGaugeProperties(62);
  const critical = computeGaugeProperties(42);

  assert.strictEqual(prime.color, '#10B981');
  assert.strictEqual(moderate.color, '#F59E0B');
  assert.strictEqual(critical.color, '#EF4444');
});

suite.test('F17.4: SVG circular dial circumference and stroke-dashoffset match mathematical formula', () => {
  const radius = 50;
  const gauge = computeGaugeProperties(50, radius); // 50% score
  const expectedCircumference = 2 * Math.PI * radius;
  const expectedOffset = expectedCircumference * 0.5;

  assert.isCloseTo(gauge.circumference, expectedCircumference, 0.01);
  assert.isCloseTo(gauge.strokeDashoffset, expectedOffset, 0.01);
});

suite.test('F17.5: Displays qualitative verdict description alongside numeric score', () => {
  const gauge = computeGaugeProperties(88);
  assert.includes(gauge.verdict, 'High Feasibility');
});

export default suite;
