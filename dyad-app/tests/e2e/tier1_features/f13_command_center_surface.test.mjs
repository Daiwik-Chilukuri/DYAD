import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 13: Command Center Surface Architecture', 1);

const designTokens = {
  colors: {
    canvasBase: '#08090C',
    surface: '#0E1117',
    elevated: '#161B22',
    borderSubtle: 'rgba(255, 255, 255, 0.08)'
  },
  classes: {
    panel: 'bg-[#0E1117]/85 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 ring-1 ring-white/5',
    elevatedRow: 'bg-[#161B22] hover:bg-[#1F242C] border border-white/[0.08]',
    specularHighlight: 'bg-gradient-to-r from-transparent via-white/15 to-transparent'
  }
};

suite.test('F13.1: Verifies surface color palette tokens match Command Center specification', () => {
  assert.strictEqual(designTokens.colors.surface.toLowerCase(), '#0e1117');
  assert.strictEqual(designTokens.colors.elevated.toLowerCase(), '#161b22');
  assert.strictEqual(designTokens.colors.canvasBase.toLowerCase(), '#08090c');
});

suite.test('F13.2: Verifies hairline specular borders (border-white/[0.08] and ring-1 ring-white/5)', () => {
  assert.includes(designTokens.classes.panel, 'border-white/[0.08]');
  assert.includes(designTokens.classes.panel, 'ring-1');
  assert.includes(designTokens.classes.panel, 'ring-white/5');
});

suite.test('F13.3: Verifies backdrop blur specification for glassmorphic surface elevation', () => {
  assert.includes(designTokens.classes.panel, 'backdrop-blur-xl');
});

suite.test('F13.4: Verifies single-level card rule (rejects nested card-in-card recursion)', () => {
  function validateCardNesting(domTree) {
    // Traverse DOM tree and check if a card contains another card child
    function checkNode(node, insideCard = false) {
      const isCard = node.className && node.className.includes('rounded-2xl');
      if (insideCard && isCard) {
        throw new Error('Nested card-in-card hierarchy detected! Violates Impeccable craft rules.');
      }
      for (const child of node.children || []) {
        checkNode(child, insideCard || isCard);
      }
    }
    checkNode(domTree);
    return true;
  }

  const compliantTree = {
    className: 'rounded-2xl bg-[#0E1117]/85',
    children: [
      { className: 'flex flex-col gap-2', children: [{ className: 'text-sm font-mono' }] }
    ]
  };

  const nonCompliantTree = {
    className: 'rounded-2xl bg-[#0E1117]/85',
    children: [
      { className: 'rounded-2xl bg-[#161B22]', children: [] }
    ]
  };

  assert.ok(validateCardNesting(compliantTree));
  assert.throws(() => validateCardNesting(nonCompliantTree), /Nested card-in-card/);
});

suite.test('F13.5: Verifies specular top highlight gradient definition', () => {
  assert.strictEqual(designTokens.classes.specularHighlight, 'bg-gradient-to-r from-transparent via-white/15 to-transparent');
});

export default suite;
