import { jest } from '@jest/globals';
import { simulatedFeature, isSimulatedAllowed } from '../../../src/middleware/simulatedFeature.js';

const mockRes = () => {
  const res = { headers: {}, statusCode: 200 };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};

describe('simulatedFeature', () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; });

  test('blocks in production by default', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_SIMULATED_FEATURES;
    const res = mockRes(); const next = jest.fn();
    simulatedFeature('X')({}, res, next);
    expect(res.statusCode).toBe(503);
    expect(next).not.toHaveBeenCalled();
  });

  test('explicit opt-in allows production demo deploys', () => {
    expect(isSimulatedAllowed({ NODE_ENV: 'production', ALLOW_SIMULATED_FEATURES: 'true' })).toBe(true);
  });

  test('outside production passes through and stamps responses', () => {
    process.env.NODE_ENV = 'development';
    const res = mockRes(); const next = jest.fn();
    simulatedFeature('X')({}, res, next);
    expect(next).toHaveBeenCalled();
    res.json({ score: 1 });
    expect(res.body._simulated).toMatch(/SIMULATED/);
    expect(res.headers['X-OncoSafeRx-Simulated']).toBe('true');
  });
});
