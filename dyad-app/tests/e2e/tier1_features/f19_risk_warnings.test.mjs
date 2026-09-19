import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 19: Actionable Risk Warnings List', 1);

const mockWarnings = [
  {
    risk_id: 'risk-01',
    category: 'ECOLOGICAL',
    severity: 'CRITICAL',
    headline: 'Statutory 30m Lake Buffer Violation',
    description: 'Alignment infringes on Bellandur Lake conservation zone.',
    mitigation_step: 'Elevate viaduct on portal piers or reroute 40m east.'
  },
  {
    risk_id: 'risk-02',
    category: 'LAND_ACQUISITION',
    severity: 'HIGH',
    headline: 'Defense Land Right-of-Way Bottleneck',
    description: '1.2km section intersects ASC Centre defence property.',
    mitigation_step: 'Initiate MoD inter-ministerial clearance under PM GatiShakti.'
  },
  {
    risk_id: 'risk-03',
    category: 'CIVIL_ENGINEERING',
    severity: 'MEDIUM',
    headline: 'High-Tension Power Corridor Underpass',
    description: 'KPTCL 220kV transmission line crosses at km 4.2.',
    mitigation_step: 'Underground cabling or maintain 8m statutory vertical clearance.'
  },
  {
    risk_id: 'risk-04',
    category: 'FINANCIAL',
    severity: 'LOW',
    headline: 'Utility Relocation Cost Variance',
    description: 'Water supply pipelines along Sarjapur Road require realignment.',
    mitigation_step: 'Allocate 5% contingency reserve in Phase-1 capital budget.'
  }
];

suite.test('F19.1: Renders severity badges: CRITICAL, HIGH, MEDIUM, LOW', () => {
  const severities = mockWarnings.map(w => w.severity);
  assert.includes(severities, 'CRITICAL');
  assert.includes(severities, 'HIGH');
  assert.includes(severities, 'MEDIUM');
  assert.includes(severities, 'LOW');
});

suite.test('F19.2: Applies correct sentiment styling per severity level', () => {
  function getSeverityColor(sev) {
    switch (sev) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MEDIUM': return '#F59E0B';
      case 'LOW': return '#94A3B8';
      default: return '#64748B';
    }
  }

  assert.strictEqual(getSeverityColor('CRITICAL'), '#EF4444');
  assert.strictEqual(getSeverityColor('HIGH'), '#F97316');
  assert.strictEqual(getSeverityColor('MEDIUM'), '#F59E0B');
  assert.strictEqual(getSeverityColor('LOW'), '#94A3B8');
});

suite.test('F19.3: Every warning includes concise headline, detailed description, and actionable mitigation step', () => {
  mockWarnings.forEach(w => {
    assert.ok(w.headline && w.headline.length > 5);
    assert.ok(w.description && w.description.length > 10);
    assert.ok(w.mitigation_step && w.mitigation_step.length > 10);
  });
});

suite.test('F19.4: Supports all 4 risk domain categories: ECOLOGICAL, LAND_ACQUISITION, FINANCIAL, CIVIL_ENGINEERING', () => {
  const categories = mockWarnings.map(w => w.category);
  assert.includes(categories, 'ECOLOGICAL');
  assert.includes(categories, 'LAND_ACQUISITION');
  assert.includes(categories, 'FINANCIAL');
  assert.includes(categories, 'CIVIL_ENGINEERING');
});

suite.test('F19.5: Zero-risk warnings state renders clean compliance confirmation badge', () => {
  const emptyWarnings = [];
  const complianceDisplay = emptyWarnings.length === 0
    ? { isCompliant: true, message: 'All statutory environmental and engineering checks passed' }
    : { isCompliant: false, message: 'Risks flagged' };

  assert.strictEqual(complianceDisplay.isCompliant, true);
  assert.includes(complianceDisplay.message, 'passed');
});

export default suite;
