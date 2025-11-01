import aiTreatmentPredictionService from '../src/services/aiTreatmentPredictionService.js';

describe('AI Treatment Prediction Service', () => {
  test('predictOptimalTreatment returns biomarker predictions without collision', async () => {
    const patientData = {
      age: 55,
      sex: 'female',
      cancerType: 'breast',
      cancerStage: 'II',
      performanceStatus: 1,
      biomarkers: { her2: 'positive', pdl1: 30 }
    };

    const availableTreatments = [
      { regimen: 'Trastuzumab + Pertuzumab + Docetaxel', type: 'combination' }
    ];

    const result = await aiTreatmentPredictionService.predictOptimalTreatment(
      patientData,
      availableTreatments
    );

    expect(result).toBeDefined();
    expect(result.predictions).toBeDefined();
    expect(Array.isArray(result.predictions.biomarkerResponse)).toBe(true);
    expect(result.predictions.biomarkerResponse.length).toBeGreaterThan(0);
    // ensure renamed method is used by checking default return path
    expect(result.predictions.biomarkerResponse[0].predictedResponse).toBe('responsive');
  });
});

