import axios from 'axios';
import { cache } from '../config/database.js';
import { Drug } from '../models/Drug.js';

const RXNORM_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export class RxNormService {
  
  // Search for drugs by name
  async searchDrugs(searchTerm) {
    const cacheKey = `rxnorm_search_${searchTerm.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${RXNORM_BASE_URL}/drugs.json?name=${encodeURIComponent(searchTerm)}`
      );

      const results = response.data.drugGroup?.conceptGroup?.map(group => 
        group.conceptProperties?.map(concept => ({
          rxcui: concept.rxcui,
          name: concept.name,
          synonym: concept.synonym,
          tty: concept.tty // Term type
        }))
      ).flat().filter(Boolean) || [];

      cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('RxNorm search error:', error.message);
      throw new Error('Failed to search RxNorm database');
    }
  }

  // Get detailed drug information by RXCUI
  async getDrugDetails(rxcui) {
    const cacheKey = `rxnorm_details_${rxcui}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Get basic properties
      const propsResponse = await axios.get(
        `${RXNORM_BASE_URL}/rxcui/${rxcui}/properties.json`
      );

      // Get related concepts (ingredients, brand names, etc.)
      const relatedResponse = await axios.get(
        `${RXNORM_BASE_URL}/rxcui/${rxcui}/related.json?tty=IN+BN+SCD+GPCK`
      );

      const properties = propsResponse.data?.properties;
      const related = relatedResponse.data?.relatedGroup;

      if (!properties) {
        return null;
      }

      // Extract ingredients and brand names
      const ingredients = this.extractConcepts(related, 'IN'); // Ingredients
      const brandNames = this.extractConcepts(related, 'BN'); // Brand names

      const drug = new Drug({
        rxcui: properties.rxcui,
        name: properties.name,
        genericName: properties.name, // Will refine this logic
        brandNames: brandNames,
        activeIngredients: ingredients,
        lastUpdated: new Date()
      });

      cache.set(cacheKey, drug);
      return drug;
    } catch (error) {
      console.error('RxNorm details error:', error.message);
      throw new Error('Failed to get drug details from RxNorm');
    }
  }

  // Get drug interactions from RxNorm
  async getDrugInteractions(rxcui) {
    const cacheKey = `rxnorm_interactions_${rxcui}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${RXNORM_BASE_URL}/interaction/interaction.json?rxcui=${rxcui}`
      );

      const interactions = response.data.interactionTypeGroup?.map(group =>
        group.interactionType?.map(type =>
          type.interactionPair?.map(pair => ({
            drug1: {
              rxcui: pair.interactionConcept[0].minConceptItem.rxcui,
              name: pair.interactionConcept[0].minConceptItem.name
            },
            drug2: {
              rxcui: pair.interactionConcept[1].minConceptItem.rxcui,
              name: pair.interactionConcept[1].minConceptItem.name
            },
            severity: pair.severity,
            description: pair.description,
            source: group.sourceName
          }))
        ).flat()
      ).flat().filter(Boolean) || [];

      cache.set(cacheKey, interactions);
      return interactions;
    } catch (error) {
      console.error('RxNorm interactions error:', error.message);
      throw new Error('Failed to get interactions from RxNorm');
    }
  }

  // Helper method to extract specific concept types
  extractConcepts(relatedGroup, termType) {
    if (!relatedGroup || !Array.isArray(relatedGroup)) return [];
    
    const group = relatedGroup.find(g => g && g.tty === termType);
    if (!group || !group.conceptGroup) return [];
    
    return group.conceptGroup
      .map(cg => cg.conceptProperties?.map(cp => cp.name))
      .flat()
      .filter(Boolean) || [];
  }

  // Validate RXCUI format
  isValidRxcui(rxcui) {
    return /^\d+$/.test(rxcui);
  }
}