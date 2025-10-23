/**
 * DDI Mining Test Script
 * 
 * Comprehensive testing script for the DDI mining system
 * Tests all components and provides validation reports
 */

import DDIMiningOrchestrator from '../services/ddiMiningOrchestrator.js';
import ClinicalTrialsDDIExtractor from '../services/ddiExtractionService.js';
import RegulatoryLabelExtractor from '../services/regulatoryLabelExtractor.js';
import PublicationDDIExtractor from '../services/publicationDDIExtractor.js';
import EvidenceNormalizationService from '../services/evidenceNormalizationService.js';
import { DrugInteractionEvidence } from '../models/DrugInteractionEvidence.js';

class DDIMiningTestSuite {
  constructor() {
    this.orchestrator = new DDIMiningOrchestrator();
    this.clinicalTrialsExtractor = new ClinicalTrialsDDIExtractor();
    this.regulatoryExtractor = new RegulatoryLabelExtractor();
    this.publicationExtractor = new PublicationDDIExtractor();
    this.normalizationService = new EvidenceNormalizationService();
    
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: null
    };
    
    // Test drugs with known interactions
    this.testDrugs = [
      'doxorubicin',
      'cisplatin', 
      'methotrexate',
      'warfarin',
      'ketoconazole'
    ];
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting DDI Mining Test Suite...\n');
    
    try {
      // Initialize orchestrator
      await this.orchestrator.initialize();
      
      // Run individual component tests
      await this.testDrugInteractionEvidenceModel();
      await this.testClinicalTrialsExtractor();
      await this.testRegulatoryLabelExtractor();
      await this.testPublicationExtractor();
      await this.testEvidenceNormalization();
      await this.testOrchestratorIntegration();
      
      // Generate summary
      this.generateTestSummary();
      
      console.log('\n✅ Test Suite Completed!');
      this.printTestSummary();
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ Test Suite Failed:', error);
      throw error;
    }
  }

  /**
   * Test DrugInteractionEvidence model
   */
  async testDrugInteractionEvidenceModel() {
    console.log('📋 Testing DrugInteractionEvidence Model...');
    
    const testCase = {
      name: 'DrugInteractionEvidence Model',
      startTime: Date.now(),
      subtests: []
    };
    
    try {
      // Test valid evidence creation
      const validEvidence = new DrugInteractionEvidence({
        sourceType: 'clinical_trial',
        sourceId: 'NCT12345',
        drug1: { name: 'doxorubicin', rxcui: '3639' },
        drug2: { name: 'cisplatin', rxcui: '2555' },
        interaction: {
          mechanism: 'additive cardiotoxicity',
          severity: 'major',
          effect: 'increased cardiac toxicity'
        },
        evidence: {
          level: 'high',
          study_type: 'RCT'
        }
      });
      
      testCase.subtests.push({
        name: 'Valid evidence creation',
        status: validEvidence.isValid() ? 'pass' : 'fail',
        details: validEvidence.isValid() ? 'Evidence object created successfully' : 'Failed validation'
      });
      
      // Test evidence scoring
      const score = validEvidence.calculateEvidenceScore();
      testCase.subtests.push({
        name: 'Evidence scoring',
        status: score > 0 && score <= 100 ? 'pass' : 'fail',
        details: `Evidence score: ${score}`
      });
      
      // Test interaction key generation
      const key = validEvidence.getInteractionKey();
      testCase.subtests.push({
        name: 'Interaction key generation',
        status: key && key.includes('__') ? 'pass' : 'fail',
        details: `Generated key: ${key}`
      });
      
      // Test database record conversion
      const dbRecord = validEvidence.toDatabaseRecord();
      testCase.subtests.push({
        name: 'Database record conversion',
        status: dbRecord && dbRecord.drug1_name && dbRecord.drug2_name ? 'pass' : 'fail',
        details: 'Database record format validation'
      });
      
      testCase.status = 'pass';
      
    } catch (error) {
      testCase.status = 'fail';
      testCase.error = error.message;
    }
    
    testCase.endTime = Date.now();
    testCase.duration = testCase.endTime - testCase.startTime;
    this.testResults.tests.push(testCase);
    
    console.log(`  ✅ Model tests completed in ${testCase.duration}ms\n`);
  }

  /**
   * Test Clinical Trials Extractor
   */
  async testClinicalTrialsExtractor() {
    console.log('🏥 Testing Clinical Trials Extractor...');
    
    const testCase = {
      name: 'Clinical Trials Extractor',
      startTime: Date.now(),
      subtests: []
    };
    
    try {
      // Test single drug extraction with limited results
      const testDrug = this.testDrugs[0];
      const evidence = await this.clinicalTrialsExtractor.extractDDIForDrug(testDrug, {
        maxStudies: 5
      });
      
      testCase.subtests.push({
        name: 'Single drug extraction',
        status: Array.isArray(evidence) ? 'pass' : 'fail',
        details: `Extracted ${evidence.length} evidence entries for ${testDrug}`
      });
      
      // Test evidence structure
      if (evidence.length > 0) {
        const sampleEvidence = evidence[0];
        testCase.subtests.push({
          name: 'Evidence structure validation',
          status: sampleEvidence.sourceType === 'clinical_trial' ? 'pass' : 'fail',
          details: `Sample evidence source type: ${sampleEvidence.sourceType}`
        });
      }
      
      // Test trial search functionality
      const searchResults = await this.clinicalTrialsExtractor.searchTrialsForDrug(testDrug, 3);
      testCase.subtests.push({
        name: 'Trial search functionality',
        status: searchResults && searchResults.studies ? 'pass' : 'fail',
        details: `Found ${searchResults.studies?.length || 0} trials`
      });
      
      testCase.status = 'pass';
      
    } catch (error) {
      testCase.status = 'fail';
      testCase.error = error.message;
      console.warn(`  ⚠️ Clinical trials extraction failed: ${error.message}`);
    }
    
    testCase.endTime = Date.now();
    testCase.duration = testCase.endTime - testCase.startTime;
    this.testResults.tests.push(testCase);
    
    console.log(`  ✅ Clinical trials tests completed in ${testCase.duration}ms\n`);
  }

  /**
   * Test Regulatory Label Extractor
   */
  async testRegulatoryLabelExtractor() {
    console.log('📋 Testing Regulatory Label Extractor...');
    
    const testCase = {
      name: 'Regulatory Label Extractor',
      startTime: Date.now(),
      subtests: []
    };
    
    try {
      // Test FDA label extraction
      const testDrug = this.testDrugs[1]; // cisplatin
      const evidence = await this.regulatoryExtractor.extractDDIForDrug(testDrug, {
        maxResults: 3
      });
      
      testCase.subtests.push({
        name: 'FDA label extraction',
        status: Array.isArray(evidence) ? 'pass' : 'fail',
        details: `Extracted ${evidence.length} evidence entries for ${testDrug}`
      });
      
      // Test evidence validation
      if (evidence.length > 0) {
        const sampleEvidence = evidence[0];
        testCase.subtests.push({
          name: 'Regulatory evidence validation',
          status: sampleEvidence.sourceType === 'regulatory_label' ? 'pass' : 'fail',
          details: `Sample evidence source: ${sampleEvidence.sourceType}`
        });
      }
      
      // Test severity determination
      const severityTest = this.regulatoryExtractor.determineSeverity('contraindicated', 'contraindications');
      testCase.subtests.push({
        name: 'Severity determination',
        status: severityTest === 'major' ? 'pass' : 'fail',
        details: `Severity mapping test: ${severityTest}`
      });
      
      testCase.status = 'pass';
      
    } catch (error) {
      testCase.status = 'fail';
      testCase.error = error.message;
      console.warn(`  ⚠️ Regulatory extraction failed: ${error.message}`);
    }
    
    testCase.endTime = Date.now();
    testCase.duration = testCase.endTime - testCase.startTime;
    this.testResults.tests.push(testCase);
    
    console.log(`  ✅ Regulatory label tests completed in ${testCase.duration}ms\n`);
  }

  /**
   * Test Publication Extractor
   */
  async testPublicationExtractor() {
    console.log('📚 Testing Publication Extractor...');
    
    const testCase = {
      name: 'Publication Extractor',
      startTime: Date.now(),
      subtests: []
    };
    
    try {
      // Test PubMed search
      const testDrug = this.testDrugs[2]; // methotrexate
      const pmids = await this.publicationExtractor.searchPubMedForDrug(testDrug, 3, 2);
      
      testCase.subtests.push({
        name: 'PubMed search',
        status: Array.isArray(pmids) ? 'pass' : 'fail',
        details: `Found ${pmids.length} publications for ${testDrug}`
      });
      
      // Test metadata extraction
      if (pmids.length > 0) {
        const metadata = await this.publicationExtractor.getPublicationMetadata(pmids[0]);
        testCase.subtests.push({
          name: 'Publication metadata extraction',
          status: metadata && metadata.title ? 'pass' : 'fail',
          details: metadata ? `Title: ${metadata.title.substring(0, 50)}...` : 'No metadata'
        });
      }
      
      // Test drug mention extraction
      const testText = 'Co-administration of methotrexate and trimethoprim may increase toxicity due to folate antagonism.';
      const drugMentions = await this.publicationExtractor.extractDrugMentions(testText);
      testCase.subtests.push({
        name: 'Drug mention extraction',
        status: drugMentions.length > 0 ? 'pass' : 'fail',
        details: `Extracted drugs: ${drugMentions.join(', ')}`
      });
      
      testCase.status = 'pass';
      
    } catch (error) {
      testCase.status = 'fail';
      testCase.error = error.message;
      console.warn(`  ⚠️ Publication extraction failed: ${error.message}`);
    }
    
    testCase.endTime = Date.now();
    testCase.duration = testCase.endTime - testCase.startTime;
    this.testResults.tests.push(testCase);
    
    console.log(`  ✅ Publication tests completed in ${testCase.duration}ms\n`);
  }

  /**
   * Test Evidence Normalization
   */
  async testEvidenceNormalization() {
    console.log('🔄 Testing Evidence Normalization...');
    
    const testCase = {
      name: 'Evidence Normalization',
      startTime: Date.now(),
      subtests: []
    };
    
    try {
      // Create test evidence with variations
      const testEvidence = [
        new DrugInteractionEvidence({
          sourceType: 'clinical_trial',
          sourceId: 'NCT001',
          drug1: { name: 'methotrexate', rxcui: '6851' },
          drug2: { name: 'trimethoprim', rxcui: '10829' },
          interaction: { mechanism: 'folate antagonism', severity: 'high' },
          evidence: { level: 'medium', study_type: 'observational' }
        }),
        new DrugInteractionEvidence({
          sourceType: 'regulatory_label',
          sourceId: 'FDA123',
          drug1: { name: 'methotrexate', rxcui: '6851' },
          drug2: { name: 'trimethoprim', rxcui: '10829' },
          interaction: { mechanism: 'antifolate synergy', severity: 'major' },
          evidence: { level: 'high', study_type: 'regulatory_review' }
        })
      ];
      
      // Test normalization process
      const normalized = await this.normalizationService.normalizeEvidence(testEvidence);
      
      testCase.subtests.push({
        name: 'Evidence normalization',
        status: normalized.length === 1 ? 'pass' : 'fail', // Should merge duplicates
        details: `Normalized ${testEvidence.length} entries to ${normalized.length}`
      });
      
      // Test severity standardization
      const standardSeverity = this.normalizationService.standardizeSeverity('high');
      testCase.subtests.push({
        name: 'Severity standardization',
        status: standardSeverity === 'major' ? 'pass' : 'fail',
        details: `'high' → '${standardSeverity}'`
      });
      
      // Test enzyme pathway normalization
      const standardEnzyme = this.normalizationService.standardizeEnzymePathways('CYP 3A4, cytochrome P450 2D6');
      testCase.subtests.push({
        name: 'Enzyme pathway standardization',
        status: standardEnzyme.includes('CYP3A4') && standardEnzyme.includes('CYP2D6') ? 'pass' : 'fail',
        details: `Standardized: ${standardEnzyme}`
      });
      
      // Test evidence validation
      const validation = this.normalizationService.validateNormalizedEvidence(normalized);
      testCase.subtests.push({
        name: 'Evidence validation',
        status: validation.valid.length > 0 ? 'pass' : 'fail',
        details: `${validation.valid.length} valid, ${validation.invalid.length} invalid`
      });
      
      testCase.status = 'pass';
      
    } catch (error) {
      testCase.status = 'fail';
      testCase.error = error.message;
    }
    
    testCase.endTime = Date.now();
    testCase.duration = testCase.endTime - testCase.startTime;
    this.testResults.tests.push(testCase);
    
    console.log(`  ✅ Normalization tests completed in ${testCase.duration}ms\n`);
  }

  /**
   * Test Orchestrator Integration
   */
  async testOrchestratorIntegration() {
    console.log('🎯 Testing Orchestrator Integration...');
    
    const testCase = {
      name: 'Orchestrator Integration',
      startTime: Date.now(),
      subtests: []
    };
    
    try {
      // Test single drug mining
      const testDrug = this.testDrugs[0];
      const evidence = await this.orchestrator.mineDDIForSingleDrug(testDrug, {
        enableClinicalTrials: true,
        enableRegulatoryLabels: false, // Disable to speed up test
        enablePublications: false,
        maxClinicalTrialsPerDrug: 3
      });
      
      testCase.subtests.push({
        name: 'Single drug mining',
        status: Array.isArray(evidence) ? 'pass' : 'fail',
        details: `Mined ${evidence.length} evidence entries for ${testDrug}`
      });
      
      // Test configuration validation
      try {
        this.orchestrator.validateConfig();
        testCase.subtests.push({
          name: 'Configuration validation',
          status: 'pass',
          details: 'Configuration is valid'
        });
      } catch (error) {
        testCase.subtests.push({
          name: 'Configuration validation',
          status: 'fail',
          details: error.message
        });
      }
      
      // Test progress tracking
      const progress = this.orchestrator.getProgress();
      testCase.subtests.push({
        name: 'Progress tracking',
        status: progress && typeof progress.phase === 'string' ? 'pass' : 'fail',
        details: `Current phase: ${progress.phase}`
      });
      
      // Test cache statistics
      const cacheStats = this.orchestrator.getCacheStats();
      testCase.subtests.push({
        name: 'Cache statistics',
        status: cacheStats && typeof cacheStats === 'object' ? 'pass' : 'fail',
        details: 'Cache stats available'
      });
      
      testCase.status = 'pass';
      
    } catch (error) {
      testCase.status = 'fail';
      testCase.error = error.message;
    }
    
    testCase.endTime = Date.now();
    testCase.duration = testCase.endTime - testCase.startTime;
    this.testResults.tests.push(testCase);
    
    console.log(`  ✅ Orchestrator tests completed in ${testCase.duration}ms\n`);
  }

  /**
   * Generate test summary
   */
  generateTestSummary() {
    const total = this.testResults.tests.length;
    const passed = this.testResults.tests.filter(test => test.status === 'pass').length;
    const failed = this.testResults.tests.filter(test => test.status === 'fail').length;
    
    const totalSubtests = this.testResults.tests.reduce((sum, test) => 
      sum + (test.subtests?.length || 0), 0
    );
    const passedSubtests = this.testResults.tests.reduce((sum, test) => 
      sum + (test.subtests?.filter(subtest => subtest.status === 'pass').length || 0), 0
    );
    
    const totalDuration = this.testResults.tests.reduce((sum, test) => sum + test.duration, 0);
    
    this.testResults.summary = {
      total,
      passed,
      failed,
      passRate: Math.round((passed / total) * 100),
      totalSubtests,
      passedSubtests,
      subtestPassRate: Math.round((passedSubtests / totalSubtests) * 100),
      totalDuration,
      averageDuration: Math.round(totalDuration / total)
    };
  }

  /**
   * Print test summary
   */
  printTestSummary() {
    const summary = this.testResults.summary;
    
    console.log('\n📊 Test Summary:');
    console.log(`   Tests: ${summary.passed}/${summary.total} passed (${summary.passRate}%)`);
    console.log(`   Subtests: ${summary.passedSubtests}/${summary.totalSubtests} passed (${summary.subtestPassRate}%)`);
    console.log(`   Duration: ${summary.totalDuration}ms (avg: ${summary.averageDuration}ms per test)`);
    
    // Print failed tests
    const failedTests = this.testResults.tests.filter(test => test.status === 'fail');
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
    }
    
    // Print performance insights
    const slowTests = this.testResults.tests.filter(test => test.duration > 5000);
    if (slowTests.length > 0) {
      console.log('\n⏱️  Slow Tests (>5s):');
      slowTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.duration}ms`);
      });
    }
  }

  /**
   * Export test results
   */
  exportResults(format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.testResults, null, 2);
        
      case 'text':
        return this.generateTextReport();
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Generate text report
   */
  generateTextReport() {
    let report = `DDI Mining Test Suite Report\n`;
    report += `Generated: ${this.testResults.timestamp}\n\n`;
    
    report += `Summary:\n`;
    report += `  Tests: ${this.testResults.summary.passed}/${this.testResults.summary.total} passed (${this.testResults.summary.passRate}%)\n`;
    report += `  Duration: ${this.testResults.summary.totalDuration}ms\n\n`;
    
    report += `Test Details:\n`;
    this.testResults.tests.forEach(test => {
      report += `\n${test.name} [${test.status.toUpperCase()}] (${test.duration}ms)\n`;
      if (test.error) {
        report += `  Error: ${test.error}\n`;
      }
      if (test.subtests) {
        test.subtests.forEach(subtest => {
          report += `  - ${subtest.name}: ${subtest.status} - ${subtest.details}\n`;
        });
      }
    });
    
    return report;
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new DDIMiningTestSuite();
  
  testSuite.runAllTests()
    .then(results => {
      console.log('\n💾 Saving test results...');
      
      // Save results to file
      const fs = await import('fs');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `ddi-mining-test-results-${timestamp}.json`;
      
      fs.writeFileSync(filename, testSuite.exportResults('json'));
      console.log(`   Results saved to: ${filename}`);
      
      // Exit with appropriate code
      const success = results.summary.passRate === 100;
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test suite crashed:', error);
      process.exit(1);
    });
}

export default DDIMiningTestSuite;