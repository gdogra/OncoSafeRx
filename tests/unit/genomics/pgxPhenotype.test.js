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
    // Treat common no-function heterozygous as Intermediate in MVP
    expect(res).toEqual(expect.arrayContaining([{ gene: 'DPYD', phenotype: 'Intermediate metabolizer' }]));
  });

  test('CYP2D6 *1xN duplication -> UM', () => {
    const obs = [{ code: { text: 'CYP2D6' }, valueString: 'CYP2D6 *1/*1xN' }];
    const res = mapObservationsToPhenotypes(obs);
    expect(res).toEqual(expect.arrayContaining([{ gene: 'CYP2D6', phenotype: 'Ultra-rapid metabolizer' }]));
  });

  test('CYP2C19 *17/*17 -> UM', () => {
    const obs = [{ code: { text: 'CYP2C19' }, valueString: 'CYP2C19 *17/*17' }];
    const res = mapObservationsToPhenotypes(obs);
    expect(res).toEqual(expect.arrayContaining([{ gene: 'CYP2C19', phenotype: 'Ultra-rapid metabolizer' }]));
  });
});
