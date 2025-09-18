import axios from 'axios';
import { cache } from '../config/database.js';
import { Drug } from '../models/Drug.js';

const RXNORM_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

export class RxNormService {
  constructor() {
    this.isOnline = true;
    this.lastConnectivityCheck = null;
    this.connectivityCheckInterval = 5 * 60 * 1000; // 5 minutes
  }

  // Check if RxNorm API is accessible
  async checkConnectivity() {
    const now = Date.now();
    if (this.lastConnectivityCheck && (now - this.lastConnectivityCheck) < this.connectivityCheckInterval) {
      return this.isOnline;
    }

    try {
      const response = await axios.get(`${RXNORM_BASE_URL}/version`, { timeout: 5000 });
      this.isOnline = response.status === 200;
      this.lastConnectivityCheck = now;
      console.log(`RxNorm API connectivity: ${this.isOnline ? 'online' : 'offline'}`);
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      this.lastConnectivityCheck = now;
      console.warn('RxNorm API appears to be offline:', error.message);
      return false;
    }
  }
  
  // Search for drugs by name
  async searchDrugs(searchTerm) {
    const cacheKey = `rxnorm_search_${searchTerm.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Check connectivity before making request
    const isOnline = await this.checkConnectivity();
    if (!isOnline) {
      console.warn('RxNorm API offline, returning empty results');
      return [];
    }

    try {
      const response = await axios.get(
        `${RXNORM_BASE_URL}/drugs.json?name=${encodeURIComponent(searchTerm)}`,
        { timeout: 10000 }
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
      if (error.response?.status === 404) {
        // No results found
        console.log(`No drugs found for search term: ${searchTerm}`);
        cache.set(cacheKey, []);
        return [];
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        console.warn(`RxNorm search timeout for: ${searchTerm}`);
        return [];
      } else {
        console.error('RxNorm search error:', error.message);
        return [];
      }
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
        `${RXNORM_BASE_URL}/rxcui/${rxcui}/properties.json`,
        { timeout: 10000 }
      );

      // Get related concepts (ingredients, brand names, etc.)
      const relatedResponse = await axios.get(
        `${RXNORM_BASE_URL}/rxcui/${rxcui}/related.json?tty=IN+BN+SCD+GPCK`,
        { timeout: 10000 }
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
      if (error.response?.status === 404) {
        console.log(`No drug details found for RXCUI ${rxcui}`);
        return null;
      } else if (error.code === 'ECONNABORTED') {
        console.warn(`RxNorm details timeout for RXCUI ${rxcui}`);
        return null;
      } else {
        console.error('RxNorm details error:', error.message);
        return null;
      }
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
      // Handle common RxNorm API responses
      if (error.response?.status === 404) {
        // 404 typically means no interactions found, not an error
        console.log(`No interactions found for RXCUI ${rxcui}`);
        cache.set(cacheKey, []);
        return [];
      } else if (error.response?.status === 503) {
        // Service temporarily unavailable
        console.warn(`RxNorm service temporarily unavailable for ${rxcui}`);
        return [];
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        // Network connectivity issues
        console.warn(`Network issue accessing RxNorm for ${rxcui}: ${error.message}`);
        return [];
      } else {
        console.error('RxNorm interactions error:', error.message);
        return []; // Return empty array instead of throwing
      }
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