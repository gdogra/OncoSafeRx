import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Atom, Zap, Target, Eye, RotateCcw, Download, Settings, Play, Pause, Info, Layers, Grid3X3, MousePointer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts';

interface Molecule {
  id: string;
  name: string;
  formula: string;
  smiles: string;
  inchi: string;
  molWeight: number;
  drugbank_id?: string;
  uniprot_id?: string;
  pdb_id?: string;
  atoms: Atom3D[];
  bonds: Bond3D[];
  properties: {
    logP: number;
    hbd: number; // hydrogen bond donors
    hba: number; // hydrogen bond acceptors
    tpsa: number; // topological polar surface area
    rotatable_bonds: number;
    druglike: boolean;
  };
}

interface Atom3D {
  id: string;
  element: string;
  x: number;
  y: number;
  z: number;
  charge: number;
  hybridization: string;
  aromaticity: boolean;
  color: string;
  radius: number;
}

interface Bond3D {
  id: string;
  atom1: string;
  atom2: string;
  order: 1 | 2 | 3;
  aromaticity: boolean;
  length: number;
  angle?: number;
}

interface Protein {
  id: string;
  name: string;
  uniprot_id: string;
  pdb_id: string;
  chains: ProteinChain[];
  binding_sites: BindingSite[];
  secondary_structure: SecondaryStructure[];
  surface: {
    vertices: number[][];
    faces: number[][];
    electrostatic: number[];
    hydrophobicity: number[];
  };
}

interface ProteinChain {
  id: string;
  sequence: string;
  residues: Residue[];
}

interface Residue {
  id: string;
  name: string;
  position: number;
  x: number;
  y: number;
  z: number;
  secondary_structure: 'helix' | 'sheet' | 'coil';
  atoms: Atom3D[];
}

interface BindingSite {
  id: string;
  name: string;
  residues: string[];
  center: [number, number, number];
  volume: number;
  surface_area: number;
  druggability_score: number;
  pharmacophore: Pharmacophore[];
}

interface Pharmacophore {
  id: string;
  type: 'hydrophobic' | 'hbd' | 'hba' | 'aromatic' | 'positive' | 'negative';
  position: [number, number, number];
  radius: number;
  tolerance: number;
}

interface SecondaryStructure {
  type: 'helix' | 'sheet' | 'coil';
  start: number;
  end: number;
  chain: string;
}

interface DrugTargetInteraction {
  drug: string;
  target: string;
  binding_site: string;
  binding_affinity: number; // pKd or pIC50
  interaction_type: 'covalent' | 'non-covalent' | 'allosteric';
  interactions: MolecularInteraction[];
  binding_pose: {
    drug_conformation: Molecule;
    rmsd: number;
    score: number;
    energy: number;
  };
  pharmacokinetics: {
    absorption: number;
    distribution: number;
    metabolism: number;
    excretion: number;
  };
}

interface MolecularInteraction {
  id: string;
  type: 'hydrogen_bond' | 'hydrophobic' | 'pi_pi' | 'salt_bridge' | 'van_der_waals' | 'disulfide';
  drug_atom: string;
  protein_residue: string;
  protein_atom: string;
  distance: number;
  angle?: number;
  strength: number;
}

interface VisualizationSettings {
  rendering: {
    style: 'ball_stick' | 'spacefill' | 'wireframe' | 'cartoon' | 'surface';
    colorScheme: 'element' | 'residue' | 'chain' | 'bfactor' | 'hydrophobicity' | 'electrostatic';
    showHydrogens: boolean;
    showWater: boolean;
    transparency: number;
  };
  interactions: {
    showHydrogenBonds: boolean;
    showHydrophobic: boolean;
    showElectrostatic: boolean;
    showPiPi: boolean;
    interactionDistance: number;
  };
  surface: {
    showMolecularSurface: boolean;
    showElectrostaticPotential: boolean;
    showHydrophobicity: boolean;
    surfaceTransparency: number;
  };
  animation: {
    autoRotate: boolean;
    rotationSpeed: number;
    trajectory: boolean;
    dynamicsEnabled: boolean;
  };
}

interface DockingResult {
  id: string;
  drug: string;
  target: string;
  pose_rank: number;
  binding_score: number;
  rmsd: number;
  interactions: MolecularInteraction[];
  energy_components: {
    vdw: number;
    electrostatic: number;
    hbond: number;
    desolvation: number;
    total: number;
  };
  druggability: {
    lipinski: boolean;
    ghose: boolean;
    veber: boolean;
    egan: boolean;
    muegge: boolean;
  };
}

const ThreeDMolecularVisualization: React.FC = () => {
  const [selectedDrug, setSelectedDrug] = useState<string>('osimertinib');
  const [selectedTarget, setSelectedTarget] = useState<string>('egfr');
  const [molecules, setMolecules] = useState<Molecule[]>([]);
  const [proteins, setProteins] = useState<Protein[]>([]);
  const [interactions, setInteractions] = useState<DrugTargetInteraction[]>([]);
  const [dockingResults, setDockingResults] = useState<DockingResult[]>([]);
  const [settings, setSettings] = useState<VisualizationSettings>({
    rendering: {
      style: 'ball_stick',
      colorScheme: 'element',
      showHydrogens: false,
      showWater: false,
      transparency: 0
    },
    interactions: {
      showHydrogenBonds: true,
      showHydrophobic: true,
      showElectrostatic: true,
      showPiPi: true,
      interactionDistance: 4.0
    },
    surface: {
      showMolecularSurface: false,
      showElectrostaticPotential: false,
      showHydrophobicity: false,
      surfaceTransparency: 50
    },
    animation: {
      autoRotate: false,
      rotationSpeed: 1,
      trajectory: false,
      dynamicsEnabled: false
    }
  });
  const [viewMode, setViewMode] = useState<'complex' | 'drug' | 'target' | 'interactions'>('complex');
  const [isSimulating, setIsSimulating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateMolecularData = useCallback(() => {
    // Generate sample drug molecules
    const sampleMolecules: Molecule[] = [
      {
        id: 'osimertinib',
        name: 'Osimertinib',
        formula: 'C28H33N7O2',
        smiles: 'CN(C)C(=O)C=C1C(=NC(=NC1=O)NC2=CC(=C(C=C2)OCC3CC3)NC(=O)C=C)N4CCN(CC4)C',
        inchi: 'InChI=1S/C28H33N7O2/c1-5-25(36)30-21-12-11-20(37-17-19-9-10-19)13-22(21)31-28-32-23-14-24(35-4)34(3)26(23)33-27(28)29-6-2/h5,11-14,19H,1,6-10,15-17H2,2-4H3,(H,30,36)(H2,29,31,32,33)',
        molWeight: 499.61,
        drugbank_id: 'DB09330',
        pdb_id: '5D41',
        atoms: [
          { id: 'C1', element: 'C', x: 0.0, y: 0.0, z: 0.0, charge: 0, hybridization: 'sp3', aromaticity: false, color: '#909090', radius: 1.7 },
          { id: 'N1', element: 'N', x: 1.5, y: 0.0, z: 0.0, charge: 0, hybridization: 'sp2', aromaticity: true, color: '#3050F8', radius: 1.55 },
          { id: 'O1', element: 'O', x: 2.5, y: 1.2, z: 0.0, charge: 0, hybridization: 'sp2', aromaticity: false, color: '#FF0D0D', radius: 1.52 },
          { id: 'C2', element: 'C', x: 3.0, y: 0.0, z: 1.0, charge: 0, hybridization: 'sp2', aromaticity: true, color: '#909090', radius: 1.7 },
          { id: 'C3', element: 'C', x: 4.5, y: 0.0, z: 1.0, charge: 0, hybridization: 'sp2', aromaticity: true, color: '#909090', radius: 1.7 }
        ],
        bonds: [
          { id: 'b1', atom1: 'C1', atom2: 'N1', order: 1, aromaticity: false, length: 1.47 },
          { id: 'b2', atom1: 'N1', atom2: 'O1', order: 2, aromaticity: false, length: 1.22 },
          { id: 'b3', atom1: 'N1', atom2: 'C2', order: 1, aromaticity: true, length: 1.34 },
          { id: 'b4', atom1: 'C2', atom2: 'C3', order: 2, aromaticity: true, length: 1.40 }
        ],
        properties: {
          logP: 2.1,
          hbd: 2,
          hba: 6,
          tpsa: 85.6,
          rotatable_bonds: 7,
          druglike: true
        }
      },
      {
        id: 'pembrolizumab',
        name: 'Pembrolizumab',
        formula: 'C6416H9874N1688O1987S42',
        smiles: '[Antibody Structure - Too complex for SMILES notation]',
        inchi: '[Antibody Structure - Too complex for InChI notation]',
        molWeight: 146000,
        drugbank_id: 'DB09037',
        atoms: [], // Simplified for antibody
        bonds: [],
        properties: {
          logP: -2.5,
          hbd: 450,
          hba: 380,
          tpsa: 25000,
          rotatable_bonds: 1200,
          druglike: false
        }
      }
    ];

    // Generate sample protein targets
    const sampleProteins: Protein[] = [
      {
        id: 'egfr',
        name: 'Epidermal Growth Factor Receptor',
        uniprot_id: 'P00533',
        pdb_id: '1M17',
        chains: [
          {
            id: 'A',
            sequence: 'MRPSGTAGAALLALLAALCPASRALEEKKVCQGTSNKLTQLGTFEDHFLSLQRMFNNCEVVLGNLEITYVQRNYDLSFLKTIQEVAGYVLIALNTVERIPLENLQIIRGNMYYENSYALAVLSNYDANKTGLKELPMRNLQEILHGAVRFSNNPALCNVESIQWRDIVSSDFLSNMSMDFQNHLGSCQKCDPSCPNGSCWGAGEENCQKLTKIICAQQCSGRCRGKSPSDCCHNQCAAGCTGPRESDCLVCRKFRDEATCKDTCPPLMLYNPTTYQMDVNPEGKYSFGATCVKKCPRNYVVTDHGSCVRACGADSYEMEEDGVRKCKKCEGPCRKVCNGIGIGEFKDSLSINATNIKHFKNCTSISGDLHILPVAFRGDSFTHTPPLDPQELDILKTVKEITGFLLIQAWPENRTDLHAFENLEIIRGRTKQHGQFSLAVVSLNITSLGLRSLKEISDGDVIISGNKNLCYANTINWKKLFGTSGQKTKIISNRGENSCKATGQVCHALCSPEGCWGPEPRDCVSCRNVSRGRECVDKCNLLEGEPREFVENSECIQCHPECLPQAMNITCTGRGPDNCIQCAHYIDGPHCVKTCPAGVMGENNTLVWKYADAGHVCHLCHPNCTYGCTGPGLEGCPTNGPKIPSIATGMVGALLLLLVVALGIGLFMRRRHIVRKRTLRRLLQERELVEPLTPSGEAPNQALLRILKETEFKKIKVLGSGAFGTVYKGLWIPEGEKVKIPVAIKELREATSPKANKEILDEAYVMASVDNPHVCRLLGICLTSTVQLITQLMPFGCLLDYVREHKDNIGSQYLLNWCVQIAKGMNYLEDRRLVHRDLAARNVLVKTPQHVKITDFGLAKLLGAEEKEYHAEGGKVPIKWMALESILHRIYTHQSDVWSYGVTVWELMTFGSKPYDGIPASEISSILEKGERLPQPPICTIDVYMIMVKCWMIDADSRPKFRELIIEFSKMARDPQRYLVIQGDERMHLPSPTDSNFYRALMDEEDMDDVVDADEYLIPQQGFFSSPSTSRTPLLSSLSATSNNSTVACIDRNGLQSCPIKEDSFLQRYSSDPTGALTEDSIDDTFLPVPEYINQSVPKRPAGSVQNPVYHNQPLNPAPSRDPHYQDPHSTAVGNPEYLNTVQPTCVNSTFDSPAHWAQKGSHQISLDNPDYQQDFFPKEAKPNGIFKGSTAENAEYLRVAPQSSEFIGA',
            residues: [
              { id: 'LEU696', name: 'LEU', position: 696, x: 10.2, y: 15.8, z: 22.1, secondary_structure: 'helix', atoms: [] },
              { id: 'VAL697', name: 'VAL', position: 697, x: 12.1, y: 16.2, z: 25.3, secondary_structure: 'helix', atoms: [] },
              { id: 'GLY700', name: 'GLY', position: 700, x: 15.8, y: 18.9, z: 28.7, secondary_structure: 'coil', atoms: [] }
            ]
          }
        ],
        binding_sites: [
          {
            id: 'atp_site',
            name: 'ATP Binding Site',
            residues: ['LEU718', 'VAL726', 'ALA743', 'LYS745', 'LEU788', 'THR790', 'MET793', 'PHE856', 'CYS797'],
            center: [12.5, 18.2, 25.8],
            volume: 450.2,
            surface_area: 285.7,
            druggability_score: 0.89,
            pharmacophore: [
              { id: 'hbond1', type: 'hba', position: [11.2, 17.8, 24.5], radius: 1.5, tolerance: 0.3 },
              { id: 'hbond2', type: 'hbd', position: [13.8, 19.1, 26.2], radius: 1.5, tolerance: 0.3 },
              { id: 'hydrophobic1', type: 'hydrophobic', position: [14.2, 17.5, 27.1], radius: 2.0, tolerance: 0.5 }
            ]
          }
        ],
        secondary_structure: [
          { type: 'helix', start: 695, end: 720, chain: 'A' },
          { type: 'sheet', start: 730, end: 740, chain: 'A' },
          { type: 'coil', start: 741, end: 750, chain: 'A' }
        ],
        surface: {
          vertices: [[10.0, 15.0, 20.0], [12.0, 16.0, 22.0], [14.0, 18.0, 24.0]],
          faces: [[0, 1, 2]],
          electrostatic: [0.5, -0.3, 0.8],
          hydrophobicity: [0.2, 0.7, 0.1]
        }
      }
    ];

    // Generate drug-target interactions
    const sampleInteractions: DrugTargetInteraction[] = [
      {
        drug: 'osimertinib',
        target: 'egfr',
        binding_site: 'atp_site',
        binding_affinity: 8.5, // pIC50
        interaction_type: 'covalent',
        interactions: [
          {
            id: 'int1',
            type: 'hydrogen_bond',
            drug_atom: 'N1',
            protein_residue: 'MET793',
            protein_atom: 'O',
            distance: 2.8,
            angle: 165,
            strength: 0.85
          },
          {
            id: 'int2',
            type: 'hydrophobic',
            drug_atom: 'C2',
            protein_residue: 'VAL726',
            protein_atom: 'CB',
            distance: 3.6,
            strength: 0.72
          },
          {
            id: 'int3',
            type: 'disulfide',
            drug_atom: 'C3',
            protein_residue: 'CYS797',
            protein_atom: 'SG',
            distance: 1.8,
            strength: 0.95
          }
        ],
        binding_pose: {
          drug_conformation: sampleMolecules[0],
          rmsd: 0.85,
          score: -12.4,
          energy: -45.2
        },
        pharmacokinetics: {
          absorption: 0.87,
          distribution: 0.76,
          metabolism: 0.45,
          excretion: 0.23
        }
      }
    ];

    // Generate docking results
    const sampleDockingResults: DockingResult[] = [
      {
        id: 'dock1',
        drug: 'osimertinib',
        target: 'egfr',
        pose_rank: 1,
        binding_score: -12.4,
        rmsd: 0.85,
        interactions: sampleInteractions[0].interactions,
        energy_components: {
          vdw: -8.2,
          electrostatic: -3.1,
          hbond: -2.8,
          desolvation: 1.7,
          total: -12.4
        },
        druggability: {
          lipinski: true,
          ghose: true,
          veber: true,
          egan: true,
          muegge: true
        }
      },
      {
        id: 'dock2',
        drug: 'osimertinib',
        target: 'egfr',
        pose_rank: 2,
        binding_score: -10.8,
        rmsd: 1.23,
        interactions: [],
        energy_components: {
          vdw: -7.1,
          electrostatic: -2.9,
          hbond: -1.5,
          desolvation: 0.7,
          total: -10.8
        },
        druggability: {
          lipinski: true,
          ghose: true,
          veber: true,
          egan: true,
          muegge: true
        }
      }
    ];

    setMolecules(sampleMolecules);
    setProteins(sampleProteins);
    setInteractions(sampleInteractions);
    setDockingResults(sampleDockingResults);
  }, []);

  const runMolecularDocking = useCallback(async () => {
    setIsSimulating(true);
    
    // Simulate docking computation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update docking results with new poses
    const newResults = dockingResults.map(result => ({
      ...result,
      binding_score: result.binding_score + (Math.random() - 0.5) * 2,
      rmsd: Math.max(0.1, result.rmsd + (Math.random() - 0.5) * 0.5)
    }));
    
    setDockingResults(newResults);
    setIsSimulating(false);
  }, [dockingResults]);

  useEffect(() => {
    generateMolecularData();
  }, [generateMolecularData]);

  // Simulate 3D rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw simple molecular representation
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw protein surface (simplified)
    ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.fillRect(centerX - 150, centerY - 100, 300, 200);

    // Draw binding site
    ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX - 50, centerY, 40, 0, 2 * Math.PI);
    ctx.fill();

    // Draw drug molecule
    if (viewMode === 'complex' || viewMode === 'drug') {
      const drugMolecule = molecules.find(m => m.id === selectedDrug);
      if (drugMolecule) {
        // Draw atoms
        drugMolecule.atoms.forEach((atom, index) => {
          const x = centerX - 50 + (atom.x * 10);
          const y = centerY + (atom.y * 10);
          
          ctx.fillStyle = atom.color;
          ctx.beginPath();
          ctx.arc(x, y, atom.radius * 2, 0, 2 * Math.PI);
          ctx.fill();
          
          // Label atoms
          ctx.fillStyle = '#000';
          ctx.font = '10px Arial';
          ctx.fillText(atom.element, x - 5, y + 3);
        });

        // Draw bonds
        drugMolecule.bonds.forEach(bond => {
          const atom1 = drugMolecule.atoms.find(a => a.id === bond.atom1);
          const atom2 = drugMolecule.atoms.find(a => a.id === bond.atom2);
          
          if (atom1 && atom2) {
            const x1 = centerX - 50 + (atom1.x * 10);
            const y1 = centerY + (atom1.y * 10);
            const x2 = centerX - 50 + (atom2.x * 10);
            const y2 = centerY + (atom2.y * 10);
            
            ctx.strokeStyle = '#333';
            ctx.lineWidth = bond.order;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        });
      }
    }

    // Draw interactions
    if (viewMode === 'complex' || viewMode === 'interactions') {
      const interaction = interactions.find(i => i.drug === selectedDrug && i.target === selectedTarget);
      if (interaction) {
        interaction.interactions.forEach((int, index) => {
          const x = centerX - 30 + (index * 20);
          const y = centerY - 20;
          
          // Draw interaction line
          ctx.strokeStyle = int.type === 'hydrogen_bond' ? '#00FF00' : 
                           int.type === 'hydrophobic' ? '#FFFF00' : 
                           int.type === 'disulfide' ? '#FF0000' : '#888';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 30, y + 30);
          ctx.stroke();
          ctx.setLineDash([]);
          
          // Draw interaction label
          ctx.fillStyle = '#000';
          ctx.font = '8px Arial';
          ctx.fillText(int.type.replace('_', ' '), x, y - 5);
        });
      }
    }

    // Draw title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`${selectedDrug} - ${selectedTarget} Complex`, 10, 25);

  }, [molecules, proteins, interactions, selectedDrug, selectedTarget, viewMode, settings]);

  const currentInteraction = interactions.find(i => i.drug === selectedDrug && i.target === selectedTarget);
  const currentDocking = dockingResults.filter(d => d.drug === selectedDrug && d.target === selectedTarget);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">3D Molecular Visualization</h1>
            <p className="text-purple-100">
              Advanced drug-target interaction analysis with molecular dynamics and binding site visualization
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentInteraction?.binding_affinity.toFixed(1) || 'N/A'}</div>
            <div className="text-sm text-purple-100">Binding Affinity (pIC50)</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Drug Molecule</label>
            <select
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {molecules.map(mol => (
                <option key={mol.id} value={mol.id}>{mol.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Protein</label>
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {proteins.map(protein => (
                <option key={protein.id} value={protein.id}>{protein.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="complex">Drug-Target Complex</option>
              <option value="drug">Drug Only</option>
              <option value="target">Target Only</option>
              <option value="interactions">Interactions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rendering Style</label>
            <select
              value={settings.rendering.style}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                rendering: { ...prev.rendering, style: e.target.value as any }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="ball_stick">Ball & Stick</option>
              <option value="spacefill">Space Filling</option>
              <option value="wireframe">Wireframe</option>
              <option value="cartoon">Cartoon</option>
              <option value="surface">Surface</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={runMolecularDocking}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Docking...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Run Docking
              </>
            )}
          </button>

          <button
            onClick={() => setSettings(prev => ({
              ...prev,
              animation: { ...prev.animation, autoRotate: !prev.animation.autoRotate }
            }))}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              settings.animation.autoRotate 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {settings.animation.autoRotate ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            Auto Rotate
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <RotateCcw className="h-4 w-4" />
            Reset View
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">3D Molecular Structure</h3>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-96 border border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50"
            style={{ minHeight: '400px' }}
          />
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow">
            <div className="text-sm space-y-1">
              <div><strong>View:</strong> {viewMode.replace('_', ' ')}</div>
              <div><strong>Style:</strong> {settings.rendering.style.replace('_', ' ')}</div>
              <div><strong>Interactions:</strong> {currentInteraction?.interactions.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interaction Analysis */}
      {currentInteraction && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Binding Details */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Binding Analysis</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Binding Affinity</div>
                  <div className="text-xl font-bold text-blue-600">
                    {currentInteraction.binding_affinity.toFixed(1)} pIC50
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Interaction Type</div>
                  <div className="text-xl font-bold text-green-600 capitalize">
                    {currentInteraction.interaction_type.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Molecular Interactions</h4>
                <div className="space-y-2">
                  {currentInteraction.interactions.map((interaction) => (
                    <div key={interaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          interaction.type === 'hydrogen_bond' ? 'bg-green-500' :
                          interaction.type === 'hydrophobic' ? 'bg-yellow-500' :
                          interaction.type === 'disulfide' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="text-sm font-medium capitalize">
                          {interaction.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right text-sm">
                        <div>{interaction.protein_residue}</div>
                        <div className="text-gray-600">{interaction.distance.toFixed(1)}Å</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Pharmacokinetics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Absorption:</span>
                    <span className="font-medium">{(currentInteraction.pharmacokinetics.absorption * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distribution:</span>
                    <span className="font-medium">{(currentInteraction.pharmacokinetics.distribution * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Metabolism:</span>
                    <span className="font-medium">{(currentInteraction.pharmacokinetics.metabolism * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Excretion:</span>
                    <span className="font-medium">{(currentInteraction.pharmacokinetics.excretion * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Docking Results */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Docking Results</h3>
            <div className="space-y-3">
              {currentDocking.map((result) => (
                <div key={result.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Pose {result.pose_rank}</div>
                    <div className="text-lg font-bold text-purple-600">
                      {result.binding_score.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>RMSD:</span>
                      <span className="font-medium">{result.rmsd.toFixed(2)}Å</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interactions:</span>
                      <span className="font-medium">{result.interactions.length}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs text-gray-600 mb-1">Energy Components:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex justify-between">
                        <span>vdW:</span>
                        <span>{result.energy_components.vdw.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Electrostatic:</span>
                        <span>{result.energy_components.electrostatic.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>H-bonds:</span>
                        <span>{result.energy_components.hbond.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desolvation:</span>
                        <span>{result.energy_components.desolvation.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-1">
                    {Object.entries(result.druggability).map(([rule, passes]) => (
                      <span
                        key={rule}
                        className={`text-xs px-1 py-0.5 rounded ${
                          passes ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Energy Analysis */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Binding Energy Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={currentDocking.map(d => ({
            pose: `Pose ${d.pose_rank}`,
            vdw: Math.abs(d.energy_components.vdw),
            electrostatic: Math.abs(d.energy_components.electrostatic),
            hbond: Math.abs(d.energy_components.hbond),
            total: Math.abs(d.energy_components.total)
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pose" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="vdw" fill="#8884d8" name="van der Waals" />
            <Bar dataKey="electrostatic" fill="#82ca9d" name="Electrostatic" />
            <Bar dataKey="hbond" fill="#ffc658" name="Hydrogen Bonds" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Molecular Properties */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Molecular Properties</h3>
        {molecules.find(m => m.id === selectedDrug) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Basic Properties</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Molecular Weight:</span>
                  <span className="font-medium">{molecules.find(m => m.id === selectedDrug)?.molWeight.toFixed(1)} Da</span>
                </div>
                <div className="flex justify-between">
                  <span>LogP:</span>
                  <span className="font-medium">{molecules.find(m => m.id === selectedDrug)?.properties.logP}</span>
                </div>
                <div className="flex justify-between">
                  <span>TPSA:</span>
                  <span className="font-medium">{molecules.find(m => m.id === selectedDrug)?.properties.tpsa} Ų</span>
                </div>
                <div className="flex justify-between">
                  <span>Rotatable Bonds:</span>
                  <span className="font-medium">{molecules.find(m => m.id === selectedDrug)?.properties.rotatable_bonds}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Drug-like Properties</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>H-bond Donors:</span>
                  <span className="font-medium">{molecules.find(m => m.id === selectedDrug)?.properties.hbd}</span>
                </div>
                <div className="flex justify-between">
                  <span>H-bond Acceptors:</span>
                  <span className="font-medium">{molecules.find(m => m.id === selectedDrug)?.properties.hba}</span>
                </div>
                <div className="flex justify-between">
                  <span>Drug-like:</span>
                  <span className={`font-medium ${
                    molecules.find(m => m.id === selectedDrug)?.properties.druglike 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {molecules.find(m => m.id === selectedDrug)?.properties.druglike ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Identifiers</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>DrugBank ID:</span>
                  <span className="font-medium">{molecules.find(m => m.id === selectedDrug)?.drugbank_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>PDB ID:</span>
                  <span className="font-medium">{molecules.find(m => m.id === selectedDrug)?.pdb_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Formula:</span>
                  <span className="font-medium font-mono text-xs">{molecules.find(m => m.id === selectedDrug)?.formula}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDMolecularVisualization;