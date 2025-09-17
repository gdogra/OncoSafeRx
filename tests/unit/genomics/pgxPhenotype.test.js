import { mapObservationsToPhenotypes } from '../../../src/engine/pgxPhenotype.js';

describe('PGx phenotype mapping', () => {
  test('CYP2D6 *4/*4 -> Poor', () => {
    const obs = [{ code: { text: 'CYP2D6 genotype' }, valueString: 'CYP2D6 *4/*4' }];
    const res = mapObservationsToPhenotypes(obs);
    expect(res).toEqual(expect.arrayContaining([{ gene: 'CYP2D6', phenotype: 'Poor metabolizer' }]));
  });

  test('CYP2C19 *1/*2 -> Intermediate', () => {
    const obs = [{ code: { text: 'CYP2C19' }, valueString: 'CYP2C19 *1/*2' }];
    const res = mapObservationsToPhenotypes(obs);
    expect(res).toEqual(expect.arrayContaining([{ gene: 'CYP2C19', phenotype: 'Intermediate metabolizer' }]));
  });

  test('UGT1A1 *28/*28 -> Poor', () => {
    const obs = [{ code: { text: 'UGT1A1 genotype' }, valueString: 'UGT1A1 *28/*28' }];
    const res = mapObservationsToPhenotypes(obs);
    expect(res).toEqual(expect.arrayContaining([{ gene: 'UGT1A1', phenotype: 'Poor metabolizer' }]));
  });

  test('DPYD *2A -> Poor', () => {
    const obs = [{ code: { text: 'DPYD' }, valueString: 'DPYD *2A heterozygous' }];
    const res = mapObservationsToPhenotypes(obs);
    expect(res).toEqual(expect.arrayContaining([{ gene: 'DPYD', phenotype: 'Poor metabolizer' }]));
  });
});

