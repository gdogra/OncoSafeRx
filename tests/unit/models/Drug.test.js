import { Drug } from '../../../src/models/Drug.js';

describe('Drug Model', () => {
  describe('constructor', () => {
    it('should create a Drug instance with required fields', () => {
      const drugData = {
        rxcui: '161',
        name: 'Aspirin',
        genericName: 'aspirin',
        brandNames: ['Bayer', 'Bufferin'],
        activeIngredients: ['aspirin'],
        lastUpdated: new Date()
      };

      const drug = new Drug(drugData);

      expect(drug.rxcui).toBe('161');
      expect(drug.name).toBe('Aspirin');
      expect(drug.genericName).toBe('aspirin');
      expect(drug.brandNames).toEqual(['Bayer', 'Bufferin']);
      expect(drug.activeIngredients).toEqual(['aspirin']);
      expect(drug.lastUpdated).toBeInstanceOf(Date);
    });

    it('should set default values for optional fields', () => {
      const drugData = {
        rxcui: '161',
        name: 'Aspirin',
        genericName: 'aspirin'
      };

      const drug = new Drug(drugData);

      expect(drug.brandNames).toEqual([]);
      expect(drug.contraindications).toEqual([]);
      expect(drug.warnings).toEqual([]);
      expect(drug.adverseReactions).toEqual([]);
      expect(drug.metabolism).toEqual({});
    });

    it('should set lastUpdated to current date if not provided', () => {
      const beforeCreation = new Date();
      const drug = new Drug({
        rxcui: '161',
        name: 'Aspirin',
        genericName: 'aspirin'
      });
      const afterCreation = new Date();

      expect(drug.lastUpdated).toBeInstanceOf(Date);
      expect(drug.lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(drug.lastUpdated.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('isValid', () => {
    it('should return true for valid drug', () => {
      const drug = new Drug({
        rxcui: '161',
        name: 'Aspirin',
        genericName: 'aspirin'
      });

      expect(drug.isValid()).toBe(true);
    });

    it('should return false when rxcui is missing', () => {
      const drug = new Drug({
        name: 'Aspirin',
        genericName: 'aspirin'
      });

      expect(drug.isValid()).toBe(false);
    });

    it('should return false when name is missing', () => {
      const drug = new Drug({
        rxcui: '161',
        genericName: 'aspirin'
      });

      expect(drug.isValid()).toBe(false);
    });

    it('should return false when genericName is missing', () => {
      const drug = new Drug({
        rxcui: '161',
        name: 'Aspirin'
      });

      expect(drug.isValid()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return a plain object with all properties', () => {
      const drugData = {
        rxcui: '161',
        name: 'Aspirin',
        genericName: 'aspirin',
        brandNames: ['Bayer'],
        activeIngredients: ['aspirin'],
        dosageForms: ['tablet'],
        strengths: ['81mg', '325mg'],
        therapeuticClass: 'NSAID',
        indication: 'Pain relief',
        contraindications: ['Allergy to aspirin'],
        warnings: ['GI bleeding risk'],
        adverseReactions: ['Stomach upset'],
        dosing: { adult: '325mg every 4 hours' },
        metabolism: { cyp: 'CYP2C9' }
      };

      const drug = new Drug(drugData);
      const json = drug.toJSON();

      expect(json).toEqual(expect.objectContaining({
        rxcui: '161',
        name: 'Aspirin',
        genericName: 'aspirin',
        brandNames: ['Bayer'],
        activeIngredients: ['aspirin'],
        dosageForms: ['tablet'],
        strengths: ['81mg', '325mg'],
        therapeuticClass: 'NSAID',
        indication: 'Pain relief',
        contraindications: ['Allergy to aspirin'],
        warnings: ['GI bleeding risk'],
        adverseReactions: ['Stomach upset'],
        dosing: { adult: '325mg every 4 hours' },
        metabolism: { cyp: 'CYP2C9' }
      }));

      expect(json.lastUpdated).toBeInstanceOf(Date);
    });
  });
});