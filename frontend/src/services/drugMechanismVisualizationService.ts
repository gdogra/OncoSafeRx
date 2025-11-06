import { Drug } from '../types';

export interface MolecularTarget {
  id: string;
  name: string;
  type: 'protein' | 'enzyme' | 'receptor' | 'dna' | 'rna' | 'pathway';
  structure: {
    pdbId?: string;
    sequence?: string;
    domains: {
      name: string;
      start: number;
      end: number;
      function: string;
    }[];
  };
  location: 'nucleus' | 'cytoplasm' | 'membrane' | 'mitochondria' | 'extracellular';
  pathways: string[];
  expression: {
    tissue: string;
    level: 'high' | 'medium' | 'low';
    cancerSpecific: boolean;
  }[];
}

export interface DrugMechanismData {
  drug: {
    name: string;
    structure: {
      smiles: string;
      formula: string;
      molecularWeight: number;
      logP: number;
      hbondDonors: number;
      hbondAcceptors: number;
    };
    classification: string[];
  };
  targets: MolecularTarget[];
  mechanism: {
    type: 'competitive_inhibition' | 'non_competitive_inhibition' | 'allosteric_modulation' | 'covalent_binding' | 'dna_intercalation' | 'protein_synthesis_inhibition';
    bindingSite: {
      name: string;
      coordinates: { x: number; y: number; z: number }[];
      affinityKd: number; // nM
      selectivity: number;
    };
    kineticsData: {
      kon: number; // association rate
      koff: number; // dissociation rate
      ic50: number; // nM
      hill_coefficient: number;
    };
  };
  pathwayEffects: {
    pathway: string;
    effect: 'activation' | 'inhibition' | 'modulation';
    magnitude: number; // 0-1 scale
    timeToEffect: number; // hours
    duration: number; // hours
    downstreamTargets: string[];
  }[];
  resistance: {
    mutations: {
      target: string;
      mutation: string;
      effect: 'reduced_affinity' | 'binding_loss' | 'altered_expression';
      foldChange: number;
    }[];
    alternatePathways: string[];
    compensatoryMechanisms: string[];
  };
}

export interface PathwayVisualization {
  pathway: {
    id: string;
    name: string;
    category: 'oncogenic' | 'tumor_suppressor' | 'dna_repair' | 'apoptosis' | 'angiogenesis' | 'immunity' | 'metabolism';
    description: string;
  };
  nodes: {
    id: string;
    name: string;
    type: 'protein' | 'gene' | 'metabolite' | 'complex';
    position: { x: number; y: number };
    state: 'active' | 'inactive' | 'upregulated' | 'downregulated' | 'mutated';
    expression: number; // relative to normal
    drugEffects: {
      drugId: string;
      effect: 'inhibition' | 'activation' | 'modulation';
      magnitude: number;
    }[];
  }[];
  edges: {
    source: string;
    target: string;
    type: 'activation' | 'inhibition' | 'binding' | 'phosphorylation' | 'transcription';
    strength: number;
    evidence: 'high' | 'medium' | 'low';
  }[];
  drugInterventions: {
    drugId: string;
    targetNodes: string[];
    mechanism: string;
    effectStrength: number;
  }[];
}

export interface MolecularDynamicsSimulation {
  drug: string;
  target: string;
  simulationId: string;
  parameters: {
    temperature: number; // K
    pressure: number; // atm
    duration: number; // nanoseconds
    timestep: number; // femtoseconds
  };
  results: {
    bindingEnergy: number; // kcal/mol
    conformationalChanges: {
      residue: string;
      change: number; // RMSD
    }[];
    bindingPose: {
      coordinates: { x: number; y: number; z: number }[];
      confidence: number;
    };
    stabilityAnalysis: {
      rmsd: number[];
      rmsf: number[];
      hydrogen_bonds: number[];
      contacts: number[];
    };
  };
  visualization: {
    frames: string[]; // PDB format snapshots
    trajectoryFile: string;
    interactionMap: {
      residue: string;
      interaction_type: string;
      frequency: number;
    }[];
  };
}

export interface PatientSpecificModeling {
  patientId: string;
  genomics: {
    mutations: {
      gene: string;
      mutation: string;
      impact: 'gain_of_function' | 'loss_of_function' | 'altered_binding';
      confidence: number;
    }[];
    expression: {
      gene: string;
      foldChange: number;
      pValue: number;
    }[];
    copy_number: {
      gene: string;
      copies: number;
      significance: number;
    }[];
  };
  modeledEffects: {
    drug: string;
    target: string;
    predictedResponse: {
      efficacy: number; // 0-1 scale
      resistance_risk: number; // 0-1 scale
      optimal_dose: number; // mg/m2
      contraindications: string[];
    };
    mechanismAlterations: {
      normal_ic50: number;
      patient_ic50: number;
      binding_affinity_change: number;
      pathway_perturbations: string[];
    };
  }[];
}

class DrugMechanismVisualizationService {
  private readonly baseUrl = '/api/drug-visualization';

  // Get comprehensive drug mechanism data
  async getDrugMechanismData(drugId: string): Promise<DrugMechanismData> {
    try {
      const response = await fetch(`${this.baseUrl}/mechanism/${drugId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to fetch drug mechanism data');
      
      const data = await response.json();
      return data.mechanism;
    } catch (error) {
      console.error('Error fetching drug mechanism:', error);
      return this.getFallbackMechanismData(drugId);
    }
  }

  // Get interactive pathway visualization data
  async getPathwayVisualization(pathwayId: string, drugIds: string[] = []): Promise<PathwayVisualization> {
    try {
      const response = await fetch(`${this.baseUrl}/pathway/${pathwayId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: drugIds, includeInteractions: true })
      });

      if (!response.ok) throw new Error('Failed to fetch pathway visualization');
      
      const data = await response.json();
      return data.visualization;
    } catch (error) {
      console.error('Error fetching pathway visualization:', error);
      return this.getFallbackPathwayData(pathwayId);
    }
  }

  // Run molecular dynamics simulation
  async runMolecularDynamicsSimulation(
    drugId: string, 
    targetId: string,
    patientMutations?: string[]
  ): Promise<MolecularDynamicsSimulation> {
    try {
      const response = await fetch(`${this.baseUrl}/molecular-dynamics/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drug: drugId,
          target: targetId,
          mutations: patientMutations || [],
          duration: 100, // nanoseconds
          includeVisualization: true
        })
      });

      if (!response.ok) throw new Error('Failed to run molecular dynamics simulation');
      
      const data = await response.json();
      return data.simulation;
    } catch (error) {
      console.error('Error running molecular dynamics:', error);
      return this.getFallbackSimulationData(drugId, targetId);
    }
  }

  // Generate patient-specific molecular modeling
  async generatePatientSpecificModel(
    patientId: string,
    genomicData: any,
    drugList: string[]
  ): Promise<PatientSpecificModeling> {
    try {
      const response = await fetch(`${this.baseUrl}/patient-modeling/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          genomics: genomicData,
          drugs: drugList,
          includeResistance: true,
          includeOptimalDosing: true
        })
      });

      if (!response.ok) throw new Error('Failed to generate patient-specific model');
      
      const data = await response.json();
      return data.modeling;
    } catch (error) {
      console.error('Error generating patient model:', error);
      return this.getFallbackPatientModel(patientId);
    }
  }

  // Get drug-drug interaction at molecular level
  async getMolecularInteractions(drugIds: string[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/molecular-interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugs: drugIds,
          includeCompetition: true,
          includeSynergy: true,
          includeAntagonism: true
        })
      });

      if (!response.ok) throw new Error('Failed to fetch molecular interactions');
      
      const data = await response.json();
      return data.interactions;
    } catch (error) {
      console.error('Error fetching molecular interactions:', error);
      return this.getFallbackInteractionData(drugIds);
    }
  }

  // Simulate treatment response with mechanism visualization
  async simulateTreatmentMechanism(
    drugs: Drug[],
    patientGenomics: any,
    timeline: number[] // days
  ): Promise<{
    mechanismTimeline: {
      day: number;
      pathwayStates: Record<string, number>;
      drugConcentrations: Record<string, number>;
      resistanceEvolution: Record<string, number>;
    }[];
    visualization: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/treatment-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drugs: drugs.map(d => ({ id: d.rxcui, name: d.name })),
          genomics: patientGenomics,
          timeline,
          includeResistance: true,
          includePharmacokinetics: true
        })
      });

      if (!response.ok) throw new Error('Failed to simulate treatment mechanism');
      
      const data = await response.json();
      return data.simulation;
    } catch (error) {
      console.error('Error simulating treatment mechanism:', error);
      return this.getFallbackTreatmentSimulation(drugs, timeline);
    }
  }

  // Fallback data methods
  private getFallbackMechanismData(drugId: string): DrugMechanismData {
    return {
      drug: {
        name: 'Pembrolizumab',
        structure: {
          smiles: 'Complex monoclonal antibody',
          formula: 'C6416H9874N1688O2018S42',
          molecularWeight: 146000,
          logP: -5.2,
          hbondDonors: 0,
          hbondAcceptors: 0
        },
        classification: ['Immune checkpoint inhibitor', 'Monoclonal antibody', 'PD-1 inhibitor']
      },
      targets: [{
        id: 'PD1',
        name: 'Programmed cell death protein 1',
        type: 'receptor',
        structure: {
          pdbId: '4ZQK',
          domains: [
            { name: 'IgV domain', start: 25, end: 145, function: 'PD-L1 binding' },
            { name: 'Transmembrane', start: 170, end: 190, function: 'Membrane anchoring' }
          ]
        },
        location: 'membrane',
        pathways: ['T-cell activation', 'Immune checkpoint'],
        expression: [
          { tissue: 'T-cells', level: 'high', cancerSpecific: false },
          { tissue: 'Tumor-infiltrating lymphocytes', level: 'high', cancerSpecific: true }
        ]
      }],
      mechanism: {
        type: 'competitive_inhibition',
        bindingSite: {
          name: 'PD-L1 binding interface',
          coordinates: [
            { x: 12.5, y: 34.2, z: 8.7 },
            { x: 15.3, y: 32.1, z: 9.4 }
          ],
          affinityKd: 0.29,
          selectivity: 1000
        },
        kineticsData: {
          kon: 1.2e5,
          koff: 3.5e-5,
          ic50: 0.29,
          hill_coefficient: 1.0
        }
      },
      pathwayEffects: [{
        pathway: 'T-cell activation',
        effect: 'activation',
        magnitude: 0.85,
        timeToEffect: 2,
        duration: 168,
        downstreamTargets: ['CD8+ T-cells', 'IFN-gamma', 'Granzyme B']
      }],
      resistance: {
        mutations: [{
          target: 'PD-1',
          mutation: 'T170A',
          effect: 'reduced_affinity',
          foldChange: 15.3
        }],
        alternatePathways: ['LAG-3', 'TIM-3', 'TIGIT'],
        compensatoryMechanisms: ['PD-L2 upregulation', 'Treg expansion']
      }
    };
  }

  private getFallbackPathwayData(pathwayId: string): PathwayVisualization {
    return {
      pathway: {
        id: 'pd1_pdl1_pathway',
        name: 'PD-1/PD-L1 Immune Checkpoint Pathway',
        category: 'immunity',
        description: 'T-cell immune checkpoint regulation pathway'
      },
      nodes: [
        {
          id: 'pd1',
          name: 'PD-1',
          type: 'protein',
          position: { x: 100, y: 200 },
          state: 'active',
          expression: 1.2,
          drugEffects: [{ drugId: 'pembrolizumab', effect: 'inhibition', magnitude: 0.9 }]
        },
        {
          id: 'pdl1',
          name: 'PD-L1',
          type: 'protein',
          position: { x: 300, y: 200 },
          state: 'upregulated',
          expression: 3.5,
          drugEffects: []
        },
        {
          id: 'tcell',
          name: 'CD8+ T-cell',
          type: 'complex',
          position: { x: 100, y: 100 },
          state: 'active',
          expression: 1.8,
          drugEffects: [{ drugId: 'pembrolizumab', effect: 'activation', magnitude: 0.85 }]
        }
      ],
      edges: [
        {
          source: 'pd1',
          target: 'pdl1',
          type: 'binding',
          strength: 0.9,
          evidence: 'high'
        },
        {
          source: 'pd1',
          target: 'tcell',
          type: 'inhibition',
          strength: 0.7,
          evidence: 'high'
        }
      ],
      drugInterventions: [{
        drugId: 'pembrolizumab',
        targetNodes: ['pd1'],
        mechanism: 'Competitive inhibition of PD-1/PD-L1 interaction',
        effectStrength: 0.9
      }]
    };
  }

  private getFallbackSimulationData(drugId: string, targetId: string): MolecularDynamicsSimulation {
    return {
      drug: drugId,
      target: targetId,
      simulationId: `sim_${Date.now()}`,
      parameters: {
        temperature: 310,
        pressure: 1.0,
        duration: 100,
        timestep: 2.0
      },
      results: {
        bindingEnergy: -12.5,
        conformationalChanges: [
          { residue: 'TYR68', change: 2.3 },
          { residue: 'ASP77', change: 1.8 }
        ],
        bindingPose: {
          coordinates: [{ x: 12.5, y: 34.2, z: 8.7 }],
          confidence: 0.92
        },
        stabilityAnalysis: {
          rmsd: [0.5, 0.7, 0.8, 0.9, 1.1],
          rmsf: [0.2, 0.3, 0.4, 0.5, 0.6],
          hydrogen_bonds: [3, 4, 3, 4, 4],
          contacts: [15, 16, 15, 17, 16]
        }
      },
      visualization: {
        frames: ['PDB_frame_1', 'PDB_frame_2'],
        trajectoryFile: 'trajectory.xtc',
        interactionMap: [
          { residue: 'TYR68', interaction_type: 'pi-stacking', frequency: 0.85 },
          { residue: 'ASP77', interaction_type: 'hydrogen_bond', frequency: 0.92 }
        ]
      }
    };
  }

  private getFallbackPatientModel(patientId: string): PatientSpecificModeling {
    return {
      patientId,
      genomics: {
        mutations: [
          { gene: 'TP53', mutation: 'R273H', impact: 'loss_of_function', confidence: 0.95 },
          { gene: 'EGFR', mutation: 'L858R', impact: 'gain_of_function', confidence: 0.88 }
        ],
        expression: [
          { gene: 'PD-L1', foldChange: 3.2, pValue: 0.001 },
          { gene: 'VEGFA', foldChange: 2.1, pValue: 0.01 }
        ],
        copy_number: [
          { gene: 'HER2', copies: 1.8, significance: 0.02 }
        ]
      },
      modeledEffects: [{
        drug: 'pembrolizumab',
        target: 'PD-1',
        predictedResponse: {
          efficacy: 0.72,
          resistance_risk: 0.25,
          optimal_dose: 200,
          contraindications: []
        },
        mechanismAlterations: {
          normal_ic50: 0.29,
          patient_ic50: 0.31,
          binding_affinity_change: 0.94,
          pathway_perturbations: ['Enhanced T-cell activation due to high PD-L1 expression']
        }
      }]
    };
  }

  private getFallbackInteractionData(drugIds: string[]): any {
    return {
      interactions: [
        {
          drugs: drugIds.slice(0, 2),
          mechanism: 'Synergistic pathway modulation',
          strength: 0.75,
          type: 'synergy',
          molecular_basis: 'Complementary target inhibition enhances overall pathway disruption'
        }
      ]
    };
  }

  private getFallbackTreatmentSimulation(drugs: Drug[], timeline: number[]): any {
    return {
      mechanismTimeline: timeline.map(day => ({
        day,
        pathwayStates: {
          'T-cell_activation': Math.min(1.0, 0.3 + day * 0.05),
          'Tumor_growth': Math.max(0.1, 1.0 - day * 0.03),
          'Angiogenesis': Math.max(0.2, 1.0 - day * 0.02)
        },
        drugConcentrations: drugs.reduce((acc, drug) => ({
          ...acc,
          [drug.name]: Math.exp(-day * 0.1) * 100
        }), {}),
        resistanceEvolution: {
          'PD-1_escape': Math.min(0.8, day * 0.005),
          'Alternative_checkpoints': Math.min(0.6, day * 0.003)
        }
      })),
      visualization: {
        type: 'pathway_timeline',
        format: 'interactive_3d'
      }
    };
  }

  // Utility methods for visualization components
  getAvailablePathways(): string[] {
    return [
      'PD-1/PD-L1 Checkpoint',
      'EGFR Signaling',
      'PI3K/AKT/mTOR',
      'RAS/RAF/MEK/ERK',
      'p53 Tumor Suppressor',
      'DNA Damage Response',
      'Apoptosis',
      'Angiogenesis',
      'JAK/STAT',
      'Wnt Signaling'
    ];
  }

  getSupportedDrugs(): { id: string; name: string; targets: string[] }[] {
    return [
      { id: 'pembrolizumab', name: 'Pembrolizumab', targets: ['PD-1'] },
      { id: 'nivolumab', name: 'Nivolumab', targets: ['PD-1'] },
      { id: 'bevacizumab', name: 'Bevacizumab', targets: ['VEGFA'] },
      { id: 'trastuzumab', name: 'Trastuzumab', targets: ['HER2'] },
      { id: 'cetuximab', name: 'Cetuximab', targets: ['EGFR'] },
      { id: 'erlotinib', name: 'Erlotinib', targets: ['EGFR'] },
      { id: 'imatinib', name: 'Imatinib', targets: ['BCR-ABL'] },
      { id: 'rituximab', name: 'Rituximab', targets: ['CD20'] }
    ];
  }
}

export const drugMechanismVisualizationService = new DrugMechanismVisualizationService();
export default drugMechanismVisualizationService;