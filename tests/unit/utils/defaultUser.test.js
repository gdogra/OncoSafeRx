import { isDefaultUserAllowed, attachDefaultUserIfAllowed } from '../../../src/utils/defaultUser.js';

describe('default user fallback', () => {
  test.each(['production', 'staging', '', undefined])('denied when NODE_ENV=%p', (v) => {
    expect(isDefaultUserAllowed({ NODE_ENV: v })).toBe(false);
  });

  test.each(['development', 'test'])('allowed when NODE_ENV=%s', (v) => {
    expect(isDefaultUserAllowed({ NODE_ENV: v })).toBe(true);
  });

  test('ALLOW_DEFAULT_USER cannot override production', () => {
    expect(isDefaultUserAllowed({ NODE_ENV: 'production', ALLOW_DEFAULT_USER: 'true' })).toBe(false);
  });

  test('does not attach in production and never replaces a real user', () => {
    const anon = { headers: { 'x-osrx-guest': '1' } };
    expect(attachDefaultUserIfAllowed(anon, { NODE_ENV: 'production' })).toBe(false);
    expect(anon.user).toBeUndefined();
    const real = { user: { id: 'u1' } };
    expect(attachDefaultUserIfAllowed(real, { NODE_ENV: 'development' })).toBe(false);
    expect(real.user.id).toBe('u1');
  });
});
