import axios from 'axios';

class ClinicalTrialsService {
  constructor() {
    this.baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 30; // 30 minutes
  }

  /**
   * Search clinical trials by condition and optional filters
   */
  async searchTrials({
    condition,
    intervention,
    age,
    gender,
    recruitmentStatus = 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING',
    phase,
    studyType = 'INTERVENTIONAL',
    location,
    pageSize = 100,
    pageToken,
    maxResults = null,
    includeExpanded = false
  }) {
    try {
      const cacheKey = JSON.stringify(arguments[0]);
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Handle expanded statuses for comprehensive search
      const statusList = includeExpanded 
        ? ['RECRUITING', 'NOT_YET_RECRUITING', 'ACTIVE_NOT_RECRUITING', 'ENROLLING_BY_INVITATION']
        : recruitmentStatus.split(',').map(s => s.trim());
      
      // Handle mixed study types
      const finalStudyType = studyType === 'INTERVENTIONAL,OBSERVATIONAL' ? undefined : studyType;

      const baseParams = {
        'query.cond': condition,
        'query.intr': intervention,
        'query.locn': location,
        'pageSize': Math.min(maxResults || pageSize, 100), // ClinicalTrials.gov max is 100
        'format': 'json'
      };

      // Only add studyType if it's a single type (API doesn't support comma-separated)
      if (finalStudyType) {
        baseParams['filter.studyType'] = finalStudyType;
      }

      if (phase) {
        baseParams['filter.phase'] = phase;
      }

      if (pageToken) {
        baseParams['pageToken'] = pageToken;
      }

      let allStudies = [];
      const studyTypesToSearch = studyType === 'INTERVENTIONAL,OBSERVATIONAL' 
        ? ['INTERVENTIONAL', 'OBSERVATIONAL'] 
        : [finalStudyType || 'INTERVENTIONAL'];

      // Make API calls for each combination of status and study type
      for (const status of statusList) {
        for (const type of studyTypesToSearch) {
          const params = {
            ...baseParams,
            'filter.overallStatus': status,
            'filter.studyType': type
          };

          // Remove undefined/null values
          Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === null) {
              delete params[key];
            }
          });

          try {
            console.log(`Fetching ${type} studies with ${status} status:`, params);
            const response = await axios.get(this.baseUrl, {
              params,
              timeout: 15000,
              headers: {
                'User-Agent': 'OncoSafeRx/1.0 Clinical Decision Support System'
              }
            });
            
            if (response.data?.studies) {
              console.log(`Found ${response.data.studies.length} ${type} studies with ${status} status`);
              allStudies.push(...response.data.studies);
            }
          } catch (err) {
            console.warn(`Failed to fetch ${type} studies with ${status} status:`, err.message);
            console.warn('Error details:', err.response?.data || err.response || err);
          }
        }
      }
      
      // Deduplicate studies by nctId
      const uniqueStudies = [];
      const seenIds = new Set();
      for (const study of allStudies) {
        const nctId = study.protocolSection?.identificationModule?.nctId;
        if (nctId && !seenIds.has(nctId)) {
          seenIds.add(nctId);
          uniqueStudies.push(study);
        }
      }
      
      // Create combined response structure
      const combinedResponse = {
        studies: uniqueStudies,
        totalCount: uniqueStudies.length,
        nextPageToken: null
      };
      
      var processedData = this.processTrialsResponse(combinedResponse, { age, gender, condition, intervention });
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });

      return processedData;

    } catch (error) {
      console.error('Error fetching clinical trials:', error.message);
      console.error('Error details:', error.response?.data || error.response || error);
      
      // Return fallback data structure
      return {
        studies: [],
        totalCount: 0,
        nextPageToken: null,
        error: 'Unable to fetch clinical trials data. Please try again later.',
        fallback: true
      };
    }
  }

  /**
   * Get specific trial details by NCT ID
   */
  async getTrialDetails(nctId) {
    try {
      const cacheKey = `details_${nctId}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const response = await axios.get(`${this.baseUrl}/${nctId}`, {
        params: { format: 'json' },
        timeout: 10000,
        headers: {
          'User-Agent': 'OncoSafeRx/1.0 Clinical Decision Support System'
        }
      });

      const processedData = this.processTrialDetails(response.data);
      
      this.cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });

      return processedData;

    } catch (error) {
      console.error(`Error fetching trial details for ${nctId}:`, error.message);
      throw new Error(`Unable to fetch details for trial ${nctId}`);
    }
  }

  /**
   * Process the API response and calculate eligibility scores
   */
  processTrialsResponse(apiData, patientCriteria) {
    if (!apiData?.studies) {
      return { studies: [], totalCount: 0, nextPageToken: null };
    }

    const processedStudies = apiData.studies.map(study => {
      const protocolSection = study.protocolSection || {};
      const identification = protocolSection.identificationModule || {};
      const statusModule = protocolSection.statusModule || {};
      const designModule = protocolSection.designModule || {};
      const eligibilityModule = protocolSection.eligibilityModule || {};
      const contactsModule = protocolSection.contactsLocationsModule || {};
      const descriptionModule = protocolSection.descriptionModule || {};

      // Calculate eligibility score based on patient criteria
      const eligibilityScore = this.calculateEligibilityScore(study, patientCriteria);
      
      return {
        nctId: identification.nctId || 'N/A',
        title: identification.briefTitle || 'No title available',
        phase: designModule.phases?.[0] || 'Not specified',
        status: statusModule.overallStatus || 'Unknown',
        condition: protocolSection.conditionsModule?.conditions?.[0] || 'Not specified',
        intervention: protocolSection.armsInterventionsModule?.interventions?.[0]?.name || 'Not specified',
        sponsor: protocolSection.sponsorCollaboratorsModule?.leadSponsor?.name || 'Not specified',
        locations: contactsModule.locations?.slice(0, 3).map(loc => 
          `${loc.facility || 'Unknown'}, ${loc.city || ''} ${loc.state || ''}`
        ) || [],
        eligibilityScore,
        matchScore: eligibilityScore, // Alias for compatibility
        estimatedEnrollment: designModule.enrollmentInfo?.count || 0,
        ageRange: eligibilityModule.minimumAge && eligibilityModule.maximumAge ? 
          `${eligibilityModule.minimumAge} - ${eligibilityModule.maximumAge}` : 'Not specified',
        gender: eligibilityModule.sex || 'All',
        inclusionCriteria: eligibilityModule.eligibilityCriteria?.split('\n').filter(c => 
          c.toLowerCase().includes('inclusion')).slice(0, 5) || [],
        exclusionCriteria: eligibilityModule.eligibilityCriteria?.split('\n').filter(c => 
          c.toLowerCase().includes('exclusion')).slice(0, 5) || [],
        description: descriptionModule.briefSummary || 'No description available',
        detailedDescription: descriptionModule.detailedDescription || '',
        lastUpdated: statusModule.lastUpdatePostDate || statusModule.studyFirstPostDate || 'Unknown',
        url: `https://clinicaltrials.gov/study/${identification.nctId}`,
        isEligible: eligibilityScore >= 70,
        confidenceLevel: eligibilityScore >= 90 ? 'high' : eligibilityScore >= 70 ? 'medium' : 'low'
      };
    });

    // Sort by eligibility score (highest first)
    processedStudies.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

    return {
      studies: processedStudies,
      totalCount: apiData.totalCount || processedStudies.length,
      nextPageToken: apiData.nextPageToken || null,
      searchCriteria: patientCriteria,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Process detailed trial information
   */
  processTrialDetails(apiData) {
    const study = apiData.protocolSection || {};
    const identification = study.identificationModule || {};
    const statusModule = study.statusModule || {};
    const designModule = study.designModule || {};
    const eligibilityModule = study.eligibilityModule || {};
    const contactsModule = study.contactsLocationsModule || {};
    const armsModule = study.armsInterventionsModule || {};
    const outcomesModule = study.outcomesModule || {};

    return {
      nctId: identification.nctId,
      title: identification.briefTitle,
      officialTitle: identification.officialTitle,
      phase: designModule.phases?.[0],
      status: statusModule.overallStatus,
      studyType: designModule.studyType,
      interventionModel: designModule.designInfo?.interventionModel,
      masking: designModule.designInfo?.maskingInfo?.masking,
      allocation: designModule.designInfo?.allocation,
      primaryPurpose: designModule.designInfo?.primaryPurpose,
      arms: armsModule.armGroups?.map(arm => ({
        label: arm.armGroupLabel,
        type: arm.armGroupType,
        description: arm.armGroupDescription,
        interventions: arm.interventionNames || []
      })) || [],
      interventions: armsModule.interventions?.map(intervention => ({
        type: intervention.type,
        name: intervention.name,
        description: intervention.description,
        otherNames: intervention.otherNames || []
      })) || [],
      eligibility: {
        criteria: eligibilityModule.eligibilityCriteria,
        healthyVolunteers: eligibilityModule.healthyVolunteers,
        sex: eligibilityModule.sex,
        minimumAge: eligibilityModule.minimumAge,
        maximumAge: eligibilityModule.maximumAge,
        stdAges: eligibilityModule.stdAges || []
      },
      contacts: {
        central: contactsModule.centralContacts || [],
        overall: contactsModule.overallOfficials || []
      },
      locations: contactsModule.locations?.map(location => ({
        facility: location.facility,
        city: location.city,
        state: location.state,
        country: location.country,
        zip: location.zip,
        geoPoint: location.geoPoint,
        status: location.status,
        contacts: location.contacts || []
      })) || [],
      outcomes: {
        primary: outcomesModule.primaryOutcomes || [],
        secondary: outcomesModule.secondaryOutcomes || []
      },
      dates: {
        firstPosted: statusModule.studyFirstPostDate,
        lastUpdated: statusModule.lastUpdatePostDate,
        startDate: statusModule.startDateStruct,
        completionDate: statusModule.completionDateStruct
      }
    };
  }

  /**
   * Calculate eligibility score based on patient criteria
   */
  calculateEligibilityScore(study, patientCriteria) {
    let score = 50; // Base score
    
    const protocolSection = study.protocolSection || {};
    const eligibilityModule = protocolSection.eligibilityModule || {};
    const conditionsModule = protocolSection.conditionsModule || {};
    const interventionsModule = protocolSection.armsInterventionsModule || {};

    // Condition match (30 points)
    if (patientCriteria.condition) {
      const studyConditions = conditionsModule.conditions || [];
      const conditionMatch = studyConditions.some(condition => 
        condition.toLowerCase().includes(patientCriteria.condition.toLowerCase()) ||
        patientCriteria.condition.toLowerCase().includes(condition.toLowerCase())
      );
      if (conditionMatch) score += 30;
    }

    // Age criteria (20 points)
    if (patientCriteria.age && eligibilityModule.minimumAge && eligibilityModule.maximumAge) {
      const minAge = parseInt(eligibilityModule.minimumAge) || 0;
      const maxAge = parseInt(eligibilityModule.maximumAge) || 120;
      if (patientCriteria.age >= minAge && patientCriteria.age <= maxAge) {
        score += 20;
      }
    }

    // Gender criteria (10 points)
    if (patientCriteria.gender && eligibilityModule.sex) {
      if (eligibilityModule.sex === 'ALL' || 
          eligibilityModule.sex.toLowerCase() === patientCriteria.gender.toLowerCase()) {
        score += 10;
      }
    }

    // Intervention match (20 points)
    if (patientCriteria.intervention) {
      const studyInterventions = interventionsModule.interventions || [];
      const interventionMatch = studyInterventions.some(intervention => 
        intervention.name?.toLowerCase().includes(patientCriteria.intervention.toLowerCase()) ||
        patientCriteria.intervention.toLowerCase().includes(intervention.name?.toLowerCase() || '')
      );
      if (interventionMatch) score += 20;
    }

    // Status bonus (recruiting studies get preference)
    const statusModule = protocolSection.statusModule || {};
    if (statusModule.overallStatus === 'RECRUITING') {
      score += 10;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Search trials for specific drug or intervention
   */
  async searchTrialsByDrug(drugName, patientProfile = {}) {
    return this.searchTrials({
      intervention: drugName,
      condition: patientProfile.condition,
      age: patientProfile.age,
      gender: patientProfile.gender,
      recruitmentStatus: 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION',
      pageSize: 100,
      includeExpanded: true
    });
  }

  /**
   * Search trials by genomic profile
   */
  async searchTrialsByGenomicProfile(genomicData, patientProfile = {}) {
    const mutations = genomicData.mutations || [];
    const biomarkers = genomicData.biomarkers || [];
    
    // Create search terms from genomic data
    const searchTerms = [
      ...mutations.map(m => m.gene || m.variant),
      ...biomarkers.map(b => b.name || b.gene),
      genomicData.tumorType,
      'precision medicine',
      'biomarker',
      'genomic'
    ].filter(Boolean).join(' OR ');

    return this.searchTrials({
      condition: patientProfile.condition || genomicData.tumorType,
      intervention: searchTerms,
      age: patientProfile.age,
      gender: patientProfile.gender,
      recruitmentStatus: 'RECRUITING,NOT_YET_RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION',
      pageSize: 100,
      studyType: 'INTERVENTIONAL,OBSERVATIONAL',
      includeExpanded: true
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new ClinicalTrialsService();