import { experimentalEnabled, EXPERIMENTAL_ROUTES } from '../../../src/experimental/mountExperimental.js';

describe('experimental routes', () => {
  test('off by default', () => {
    expect(experimentalEnabled({ NODE_ENV: 'development' })).toBe(false);
  });
  test('flag works outside production', () => {
    expect(experimentalEnabled({ NODE_ENV: 'development', ENABLE_EXPERIMENTAL_ROUTES: 'true' })).toBe(true);
  });
  test('flag alone never mounts them in production', () => {
    expect(experimentalEnabled({ NODE_ENV: 'production', ENABLE_EXPERIMENTAL_ROUTES: 'true' })).toBe(false);
  });
  test('registry is well formed', () => {
    for (const [p, name, load] of EXPERIMENTAL_ROUTES) {
      expect(p).toMatch(/^\/api\//);
      expect(name).toBeTruthy();
      expect(typeof load).toBe('function');
    }
  });
});
