import { schemas, validate, isValidRxcui, isValidGene, sanitizeString } from '../../../src/utils/validation.js';

describe('Validation Utils', () => {
  describe('schemas', () => {
    describe('drugSearch', () => {
      it('should validate valid search query', () => {
        const { error, value } = schemas.drugSearch.validate({ q: 'aspirin' });
        expect(error).toBeUndefined();
        expect(value.q).toBe('aspirin');
      });

      it('should reject query shorter than 2 characters', () => {
        const { error } = schemas.drugSearch.validate({ q: 'a' });
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('at least 2 characters');
      });

      it('should reject missing query', () => {
        const { error } = schemas.drugSearch.validate({});
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('required');
      });

      it('should reject query longer than 100 characters', () => {
        const longQuery = 'a'.repeat(101);
        const { error } = schemas.drugSearch.validate({ q: longQuery });
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('cannot exceed 100 characters');
      });
    });

    describe('rxcui', () => {
      it('should validate valid RXCUI', () => {
        const { error, value } = schemas.rxcui.validate({ rxcui: '161' });
        expect(error).toBeUndefined();
        expect(value.rxcui).toBe('161');
      });

      it('should reject RXCUI with non-numeric characters', () => {
        const { error } = schemas.rxcui.validate({ rxcui: '161a' });
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('contain only numbers');
      });

      it('should reject missing RXCUI', () => {
        const { error } = schemas.rxcui.validate({});
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('required');
      });
    });

    describe('interactionCheck', () => {
      it('should validate valid drugs array', () => {
        const { error, value } = schemas.interactionCheck.validate({
          drugs: ['161', '42463', '1191']
        });
        expect(error).toBeUndefined();
        expect(value.drugs).toEqual(['161', '42463', '1191']);
      });

      it('should reject array with less than 2 drugs', () => {
        const { error } = schemas.interactionCheck.validate({ drugs: ['161'] });
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('At least 2 drugs');
      });

      it('should reject array with more than 10 drugs', () => {
        const drugs = Array.from({ length: 11 }, (_, i) => `${i + 1}`);
        const { error } = schemas.interactionCheck.validate({ drugs });
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Maximum 10 drugs');
      });

      it('should reject drugs with invalid RXCUI format', () => {
        const { error } = schemas.interactionCheck.validate({
          drugs: ['161', 'invalid', '1191']
        });
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('valid RXCUI');
      });
    });

    describe('genomicsProfile', () => {
      it('should validate valid genes and drugs', () => {
        const { error, value } = schemas.genomicsProfile.validate({
          genes: ['CYP2D6', 'CYP2C19'],
          drugs: ['161', '42463']
        });
        expect(error).toBeUndefined();
        expect(value.genes).toEqual(['CYP2D6', 'CYP2C19']);
        expect(value.drugs).toEqual(['161', '42463']);
      });

      it('should reject invalid gene format', () => {
        const { error } = schemas.genomicsProfile.validate({
          genes: ['cyp2d6'], // lowercase
          drugs: ['161']
        });
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('uppercase letters');
      });

      it('should reject too many genes', () => {
        const genes = Array.from({ length: 21 }, (_, i) => `GENE${i}`);
        const { error } = schemas.genomicsProfile.validate({
          genes,
          drugs: ['161']
        });
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Maximum 20 genes');
      });
    });
  });

  describe('helper functions', () => {
    describe('isValidRxcui', () => {
      it('should return true for valid RXCUI', () => {
        expect(isValidRxcui('161')).toBe(true);
        expect(isValidRxcui('123456')).toBe(true);
      });

      it('should return false for invalid RXCUI', () => {
        expect(isValidRxcui('161a')).toBe(false);
        expect(isValidRxcui('abc')).toBe(false);
        expect(isValidRxcui('')).toBe(false);
        expect(isValidRxcui('12.34')).toBe(false);
      });
    });

    describe('isValidGene', () => {
      it('should return true for valid gene names', () => {
        expect(isValidGene('CYP2D6')).toBe(true);
        expect(isValidGene('TPMT')).toBe(true);
        expect(isValidGene('UGT1A1')).toBe(true);
        expect(isValidGene('CYP2C19_STAR2')).toBe(true);
      });

      it('should return false for invalid gene names', () => {
        expect(isValidGene('cyp2d6')).toBe(false); // lowercase
        expect(isValidGene('CYP2D6-1')).toBe(false); // hyphen
        expect(isValidGene('CYP2D6.1')).toBe(false); // dot
        expect(isValidGene('')).toBe(false);
      });
    });

    describe('sanitizeString', () => {
      it('should trim whitespace', () => {
        expect(sanitizeString('  hello  ')).toBe('hello');
      });

      it('should remove angle brackets', () => {
        expect(sanitizeString('hello<script>world')).toBe('helloscriptworld');
        expect(sanitizeString('test>value')).toBe('testvalue');
      });

      it('should handle non-string input', () => {
        expect(sanitizeString(123)).toBe(123);
        expect(sanitizeString(null)).toBe(null);
        expect(sanitizeString(undefined)).toBe(undefined);
      });
    });
  });
});