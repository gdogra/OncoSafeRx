import { suggestAlternatives } from '../../../src/engine/alternatives.js';

describe('Alternatives Engine', () => {
  test('clopidogrel + omeprazole suggests pantoprazole', () => {
    const details = [
      { rxcui: '42463', name: 'Clopidogrel' },
      { rxcui: '1811631', name: 'Omeprazole' }
    ];
    const res = suggestAlternatives(details);
    expect(res.some(r => /pantoprazole/i.test(r.alternative?.name))).toBe(true);
  });

  test('tamoxifen + paroxetine suggests venlafaxine', () => {
    const details = [
      { rxcui: '123', name: 'Tamoxifen' },
      { rxcui: '456', name: 'Paroxetine' }
    ];
    const res = suggestAlternatives(details);
    expect(res.some(r => /venlafaxine/i.test(r.alternative?.name))).toBe(true);
  });

  test('codeine + fluoxetine suggests morphine', () => {
    const details = [
      { rxcui: '2670', name: 'Codeine' },
      { rxcui: '4477', name: 'Fluoxetine' }
    ];
    const res = suggestAlternatives(details);
    expect(res.some(r => /morphine/i.test(r.alternative?.name))).toBe(true);
  });
});

