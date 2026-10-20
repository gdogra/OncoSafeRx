/**
 * Experimental modules.
 *
 * These routes return simulated, canned, or unvalidated output (or have no
 * real data behind them), have no frontend callers and no tests. They are NOT
 * part of the product and are not loaded by default.
 *
 * To mount them (local development / demos only):
 *   ENABLE_EXPERIMENTAL_ROUTES=true
 * They can never mount in production unless ALLOW_SIMULATED_FEATURES=true is
 * also set, and every response is stamped as simulated (middleware/simulatedFeature.js).
 *
 * To promote a module to the product: give it real data and tests, then move
 * its import and app.use() back into src/index.js.
 */
import { simulatedFeature, isSimulatedAllowed } from '../middleware/simulatedFeature.js';

export const EXPERIMENTAL_ROUTES = [
  ['/api/ai-prediction', 'AI prediction', () => import('../routes/aiPredictionRoutes.js')],
  ['/api/advanced-ai', 'Advanced AI insights', () => import('../routes/advancedAIRoutes.js')],
  ['/api/voice-documentation', 'Voice Documentation', () => import('../routes/voiceDocumentationRoutes.js')],
  ['/api/medical-llm', 'Medical Llm', () => import('../routes/medicalLLMRoutes.js')],
  ['/api/clinical-chatbot', 'Clinical Chatbot', () => import('../routes/clinicalChatbotRoutes.js')],
  ['/api/drug-visualization', 'Drug mechanism visualization', () => import('../routes/drugVisualizationRoutes.js')],
  ['/api/digital-twin', 'Digital Twin', () => import('../routes/digitalTwinRoutes.js')],
  ['/api/treatment/simulation', 'Treatment Simulation', () => import('../routes/treatmentSimulationRoutes.js')],
  ['/api/precision-oncology', 'Precision Oncology', () => import('../routes/precisionOncologyRoutes.js')],
  ['/api/liquid-biopsy', 'Liquid Biopsy', () => import('../routes/liquidBiopsyRoutes.js')],
  ['/api/biomarker-monitoring', 'Biomarker Monitoring', () => import('../routes/realTimeBiomarkerRoutes.js')],
  ['/api/multi-omics', 'Multi Omics', () => import('../routes/multiOmicsRoutes.js')],
  ['/api/clinical-decision', 'Clinical Decision', () => import('../routes/clinicalDecisionRoutes.js')],
  ['/api/patient-simulation', 'Patient Simulation', () => import('../routes/patientSimulationRoutes.js')],
  ['/api/continuous-learning', 'Continuous Learning', () => import('../routes/continuousLearningRoutes.js')],
  ['/api/researcher-features', 'Researcher Features', () => import('../routes/researcherFeaturesRoutes.js')],
  ['/api/research', 'Research', () => import('../routes/researchRoutes.js')],
  ['/api/data-architecture', 'Data Architecture', () => import('../routes/dataArchitectureRoutes.js')],
  ['/api/advanced-workflow', 'Advanced Workflow', () => import('../routes/advancedWorkflowRoutes.js')],
  ['/api/multi-platform', 'Multi Platform', () => import('../routes/multiPlatformRoutes.js')],
];

export function experimentalEnabled(env = process.env) {
  return String(env.ENABLE_EXPERIMENTAL_ROUTES || '').toLowerCase() === 'true' && isSimulatedAllowed(env);
}

export async function mountExperimentalRoutes(app, env = process.env) {
  if (!experimentalEnabled(env)) {
    console.log(`Experimental routes not mounted (${EXPERIMENTAL_ROUTES.length} modules; set ENABLE_EXPERIMENTAL_ROUTES=true in dev to load)`);
    return [];
  }
  const mounted = [];
  for (const [path, name, load] of EXPERIMENTAL_ROUTES) {
    const mod = await load();
    app.use(path, simulatedFeature(name), mod.default);
    mounted.push(path);
  }
  console.warn(`WARNING: ${mounted.length} experimental (simulated-data) route modules mounted`);
  return mounted;
}
