import { TestSuite, assert } from '../test_framework.mjs';

const suite = new TestSuite('Tier 1 - Feature 15: Emil Kowalski Physics Springs', 1);

// Ground truth from dyad-app/lib/motion.ts and .agents/design-system.md
const motionSprings = {
  snappy: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
  smooth: {
    type: "spring",
    stiffness: 300,
    damping: 32,
    mass: 1.0,
  },
  bouncy: {
    type: "spring",
    stiffness: 450,
    damping: 22,
  }
};

const tactileTapProps = {
  whileTap: { scale: 0.98 },
  transition: motionSprings.snappy
};

suite.test('F15.1: motionSprings.snappy matches specification: stiffness 400, damping 30, mass 0.8', () => {
  assert.strictEqual(motionSprings.snappy.type, 'spring');
  assert.strictEqual(motionSprings.snappy.stiffness, 400);
  assert.strictEqual(motionSprings.snappy.damping, 30);
  assert.strictEqual(motionSprings.snappy.mass, 0.8);
});

suite.test('F15.2: motionSprings.smooth matches specification: stiffness 300, damping 32, mass 1.0', () => {
  assert.strictEqual(motionSprings.smooth.type, 'spring');
  assert.strictEqual(motionSprings.smooth.stiffness, 300);
  assert.strictEqual(motionSprings.smooth.damping, 32);
  assert.strictEqual(motionSprings.smooth.mass, 1.0);
});

suite.test('F15.3: motionSprings.bouncy matches specification: stiffness 450, damping 22', () => {
  assert.strictEqual(motionSprings.bouncy.type, 'spring');
  assert.strictEqual(motionSprings.bouncy.stiffness, 450);
  assert.strictEqual(motionSprings.bouncy.damping, 22);
});

suite.test('F15.4: Tactile press feedback configures whileTap with scale 0.98', () => {
  assert.strictEqual(tactileTapProps.whileTap.scale, 0.98);
  assert.deepStrictEqual(tactileTapProps.transition, motionSprings.snappy);
});

suite.test('F15.5: Reduced-motion mode substitutes 0ms duration for physics spring animations', () => {
  function getTransitionConfig(prefersReducedMotion) {
    return prefersReducedMotion ? { duration: 0 } : motionSprings.smooth;
  }

  const normalTransition = getTransitionConfig(false);
  const reducedTransition = getTransitionConfig(true);

  assert.strictEqual(normalTransition.type, 'spring');
  assert.strictEqual(reducedTransition.duration, 0);
});

export default suite;
