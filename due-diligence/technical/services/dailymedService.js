import axios from 'axios';
import xml2js from 'xml2js';
import { cache } from '../config/database.js';

const DAILYMED_BASE_URL = 'https://dailymed.nlm.nih.gov/dailymed';

export class DailyMedService {

  // Search for drug labels
  async searchLabels(drugName) {
    const cacheKey = `dailymed_search_${drugName.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${DAILYMED_BASE_URL}/services/v2/spls.json`,
        {
          params: {
            drug_name: drugName,
            page_size: 20
          }
        }
      );

      const results = response.data.data?.map(item => ({
        setId: item.setid,
        title: item.title,
        brandName: item.openfda?.brand_name?.[0],
        genericName: item.openfda?.generic_name?.[0],
        manufacturerName: item.openfda?.manufacturer_name?.[0],
        applicationNumber: item.openfda?.application_number?.[0],
        productNdc: item.openfda?.product_ndc,
        lastUpdated: item.published_date,
        url: `${DAILYMED_BASE_URL}/drugInfo.cfm?setid=${item.setid}`
      })) || [];

      cache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('DailyMed search error:', error.message);
      throw new Error('Failed to search DailyMed database');
    }
  }

  // Get detailed label information
  async getLabelDetails(setId) {
    const cacheKey = `dailymed_label_${setId}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Get the structured product label (SPL) XML
      const response = await axios.get(
        `${DAILYMED_BASE_URL}/services/v2/spls/${setId}.xml`
      );

      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(response.data);
      
      const document = result.document;
      const labelData = this.extractLabelData(document);
      
      cache.set(cacheKey, labelData);
      return labelData;
    } catch (error) {
      console.error('DailyMed label details error:', error.message);
      throw new Error('Failed to get label details from DailyMed');
    }
  }

  // Extract structured data from SPL XML
  extractLabelData(document) {
    const component = document.component?.structuredBody?.component;
    if (!component) return null;

    const sections = Array.isArray(component) ? component : [component];
    const labelData = {
      setId: document.setId?.$?.root,
      title: document.title,
      sections: {}
    };

    sections.forEach(section => {
      const sectionComponent = section.section;
      if (sectionComponent?.code?.$?.code) {
        const sectionCode = sectionComponent.code.$.code;
        const sectionTitle = sectionComponent.title;
        const sectionText = this.extractSectionText(sectionComponent.text);
        
        labelData.sections[sectionCode] = {
          title: sectionTitle,
          content: sectionText,
          code: sectionCode
        };
      }
    });

    return labelData;
  }

  // Extract clean text from section XML
  extractSectionText(textElement) {
    if (!textElement) return '';
    
    if (typeof textElement === 'string') {
      return textElement.trim();
    }
    
    // Handle complex XML structures
    if (textElement.paragraph) {
      const paragraphs = Array.isArray(textElement.paragraph) 
        ? textElement.paragraph 
        : [textElement.paragraph];
      
      return paragraphs.map(p => {
        if (typeof p === 'string') return p;
        if (p._) return p._;
        return '';
      }).join('\n\n').trim();
    }
    
    return '';
  }

  // Get drug contraindications
  async getContraindications(setId) {
    const labelData = await this.getLabelDetails(setId);
    
    // Section codes for contraindications and warnings
    const contraindicationSections = ['34070-3', '43685-7']; // CONTRAINDICATIONS, WARNINGS
    const contraindications = [];
    
    contraindicationSections.forEach(code => {
      if (labelData.sections[code]) {
        contraindications.push({
          section: labelData.sections[code].title,
          content: labelData.sections[code].content
        });
      }
    });
    
    return contraindications;
  }

  // Get adverse reactions
  async getAdverseReactions(setId) {
    const labelData = await this.getLabelDetails(setId);
    
    // Section code for adverse reactions
    const adverseReactionCode = '34084-4'; // ADVERSE REACTIONS
    
    if (labelData.sections[adverseReactionCode]) {
      return {
        section: labelData.sections[adverseReactionCode].title,
        content: labelData.sections[adverseReactionCode].content
      };
    }
    
    return null;
  }

  // Get dosage and administration
  async getDosageInfo(setId) {
    const labelData = await this.getLabelDetails(setId);
    
    // Section code for dosage and administration
    const dosageCode = '34068-7'; // DOSAGE & ADMINISTRATION
    
    if (labelData.sections[dosageCode]) {
      return {
        section: labelData.sections[dosageCode].title,
        content: labelData.sections[dosageCode].content
      };
    }
    
    return null;
  }
}