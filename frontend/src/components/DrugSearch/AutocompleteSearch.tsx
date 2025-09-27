import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ChevronDown,
  X,
  Pill,
  Target,
  Zap,
  Activity,
  Heart,
  Users,
  AlertTriangle,
  CheckCircle,
  Star,
  Clock,
  Loader2
} from 'lucide-react';

interface AutocompleteOption {
  id: string;
  label: string;
  value: string;
  type: 'drug' | 'indication' | 'mechanism' | 'biomarker' | 'class' | 'symptom' | 'gene';
  category: string;
  description?: string;
  aliases?: string[];
  frequency?: number;
  fdaApproved?: boolean;
  isOncology?: boolean;
  targetGenes?: string[];
  relatedTerms?: string[];
}

interface AutocompleteSearchProps {
  placeholder?: string;
  onSelect: (option: AutocompleteOption) => void;
  onInputChange?: (value: string) => void;
  value?: string;
  maxResults?: number;
  showCategories?: boolean;
  allowMultiple?: boolean;
  selectedOptions?: AutocompleteOption[];
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  onOfflineChange?: (offline: boolean) => void;
}

// Comprehensive drug and medical terms database
const COMPREHENSIVE_OPTIONS: AutocompleteOption[] = [
  // Popular Cancer Drugs
  {
    id: 'pembrolizumab',
    label: 'Pembrolizumab (Keytruda)',
    value: 'pembrolizumab',
    type: 'drug',
    category: 'PD-1 Inhibitor',
    description: 'Immune checkpoint inhibitor for various cancers',
    aliases: ['keytruda', 'mk-3475'],
    frequency: 95,
    fdaApproved: true,
    isOncology: true,
    targetGenes: ['PD1', 'PDL1'],
    relatedTerms: ['immunotherapy', 'checkpoint inhibitor', 'PD-1']
  },
  {
    id: 'nivolumab',
    label: 'Nivolumab (Opdivo)',
    value: 'nivolumab',
    type: 'drug',
    category: 'PD-1 Inhibitor',
    description: 'Anti-PD-1 monoclonal antibody',
    aliases: ['opdivo', 'bms-936558'],
    frequency: 88,
    fdaApproved: true,
    isOncology: true,
    targetGenes: ['PD1'],
    relatedTerms: ['immunotherapy', 'melanoma', 'lung cancer']
  },
  {
    id: 'trastuzumab',
    label: 'Trastuzumab (Herceptin)',
    value: 'trastuzumab',
    type: 'drug',
    category: 'HER2 Inhibitor',
    description: 'Monoclonal antibody targeting HER2',
    aliases: ['herceptin'],
    frequency: 92,
    fdaApproved: true,
    isOncology: true,
    targetGenes: ['HER2', 'ERBB2'],
    relatedTerms: ['breast cancer', 'HER2 positive', 'targeted therapy']
  },
  {
    id: 'imatinib',
    label: 'Imatinib (Gleevec)',
    value: 'imatinib',
    type: 'drug',
    category: 'Tyrosine Kinase Inhibitor',
    description: 'BCR-ABL tyrosine kinase inhibitor',
    aliases: ['gleevec', 'sti571'],
    frequency: 85,
    fdaApproved: true,
    isOncology: true,
    targetGenes: ['BCR-ABL', 'KIT', 'PDGFR'],
    relatedTerms: ['CML', 'leukemia', 'GIST']
  },
  {
    id: 'osimertinib',
    label: 'Osimertinib (Tagrisso)',
    value: 'osimertinib',
    type: 'drug',
    category: 'EGFR Inhibitor',
    description: 'Third-generation EGFR inhibitor',
    aliases: ['tagrisso', 'azd9291'],
    frequency: 82,
    fdaApproved: true,
    isOncology: true,
    targetGenes: ['EGFR', 'T790M'],
    relatedTerms: ['NSCLC', 'lung cancer', 'EGFR mutation']
  },
  {
    id: 'bevacizumab',
    label: 'Bevacizumab (Avastin)',
    value: 'bevacizumab',
    type: 'drug',
    category: 'VEGF Inhibitor',
    description: 'Anti-VEGF monoclonal antibody',
    aliases: ['avastin'],
    frequency: 89,
    fdaApproved: true,
    isOncology: true,
    targetGenes: ['VEGF'],
    relatedTerms: ['angiogenesis', 'colorectal cancer', 'anti-angiogenic']
  },
  {
    id: 'rituximab',
    label: 'Rituximab (Rituxan)',
    value: 'rituximab',
    type: 'drug',
    category: 'CD20 Inhibitor',
    description: 'Anti-CD20 monoclonal antibody',
    aliases: ['rituxan', 'mabthera'],
    frequency: 87,
    fdaApproved: true,
    isOncology: true,
    targetGenes: ['CD20'],
    relatedTerms: ['lymphoma', 'B-cell', 'hematologic malignancy']
  },
  {
    id: 'paclitaxel',
    label: 'Paclitaxel (Taxol)',
    value: 'paclitaxel',
    type: 'drug',
    category: 'Taxane',
    description: 'Microtubule stabilizing agent',
    aliases: ['taxol'],
    frequency: 91,
    fdaApproved: true,
    isOncology: true,
    relatedTerms: ['chemotherapy', 'breast cancer', 'ovarian cancer']
  },
  {
    id: 'doxorubicin',
    label: 'Doxorubicin (Adriamycin)',
    value: 'doxorubicin',
    type: 'drug',
    category: 'Anthracycline',
    description: 'DNA intercalating agent',
    aliases: ['adriamycin'],
    frequency: 86,
    fdaApproved: true,
    isOncology: true,
    relatedTerms: ['chemotherapy', 'cardiotoxicity', 'sarcoma']
  },
  {
    id: 'carboplatin',
    label: 'Carboplatin',
    value: 'carboplatin',
    type: 'drug',
    category: 'Platinum Compound',
    description: 'DNA crosslinking agent',
    frequency: 84,
    fdaApproved: true,
    isOncology: true,
    relatedTerms: ['chemotherapy', 'ovarian cancer', 'lung cancer']
  },

  // Common/OTC Drugs
  {
    id: 'aspirin',
    label: 'Aspirin (Acetylsalicylic Acid)',
    value: 'aspirin',
    type: 'drug',
    category: 'NSAID',
    description: 'Anti-inflammatory, pain reliever, blood thinner',
    aliases: ['acetylsalicylic acid', 'ASA', 'asa', 'asp'],
    frequency: 99,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['pain relief', 'inflammation', 'heart disease', 'blood thinner', 'stroke prevention']
  },
  {
    id: 'acetaminophen',
    label: 'Acetaminophen (Tylenol)',
    value: 'acetaminophen',
    type: 'drug',
    category: 'Analgesic',
    description: 'Pain reliever and fever reducer',
    aliases: ['tylenol', 'paracetamol', 'acet'],
    frequency: 98,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['pain relief', 'fever', 'headache']
  },
  {
    id: 'ibuprofen',
    label: 'Ibuprofen (Advil, Motrin)',
    value: 'ibuprofen',
    type: 'drug',
    category: 'NSAID',
    description: 'Anti-inflammatory pain reliever',
    aliases: ['advil', 'motrin', 'ibu'],
    frequency: 97,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['pain relief', 'inflammation', 'fever', 'arthritis']
  },
  {
    id: 'naproxen',
    label: 'Naproxen (Aleve)',
    value: 'naproxen',
    type: 'drug',
    category: 'NSAID',
    description: 'Long-acting anti-inflammatory',
    aliases: ['aleve', 'naprosyn'],
    frequency: 85,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['pain relief', 'inflammation', 'arthritis']
  },
  {
    id: 'diphenhydramine',
    label: 'Diphenhydramine (Benadryl)',
    value: 'diphenhydramine',
    type: 'drug',
    category: 'Antihistamine',
    description: 'Allergy relief and sleep aid',
    aliases: ['benadryl', 'dph'],
    frequency: 82,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['allergy', 'sleep', 'antihistamine', 'itching']
  },
  {
    id: 'loratadine',
    label: 'Loratadine (Claritin)',
    value: 'loratadine',
    type: 'drug',
    category: 'Antihistamine',
    description: 'Non-drowsy allergy medication',
    aliases: ['claritin'],
    frequency: 78,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['allergy', 'antihistamine', 'non-drowsy']
  },
  {
    id: 'cetirizine',
    label: 'Cetirizine (Zyrtec)',
    value: 'cetirizine',
    type: 'drug',
    category: 'Antihistamine',
    description: 'Allergy and hives treatment',
    aliases: ['zyrtec'],
    frequency: 76,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['allergy', 'hives', 'antihistamine']
  },
  {
    id: 'omeprazole',
    label: 'Omeprazole (Prilosec)',
    value: 'omeprazole',
    type: 'drug',
    category: 'PPI',
    description: 'Proton pump inhibitor for acid reflux',
    aliases: ['prilosec', 'ppi'],
    frequency: 89,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['acid reflux', 'heartburn', 'GERD', 'stomach acid']
  },
  {
    id: 'ranitidine',
    label: 'Ranitidine (Zantac)',
    value: 'ranitidine',
    type: 'drug',
    category: 'H2 Blocker',
    description: 'Histamine H2 receptor antagonist',
    aliases: ['zantac'],
    frequency: 75,
    fdaApproved: false,
    isOncology: false,
    relatedTerms: ['acid reflux', 'heartburn', 'H2 blocker']
  },
  {
    id: 'simvastatin',
    label: 'Simvastatin (Zocor)',
    value: 'simvastatin',
    type: 'drug',
    category: 'Statin',
    description: 'Cholesterol-lowering medication',
    aliases: ['zocor'],
    frequency: 88,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['cholesterol', 'statin', 'heart disease', 'lipids']
  },

  // Psychology & Mental Health Drugs
  {
    id: 'sertraline',
    label: 'Sertraline (Zoloft)',
    value: 'sertraline',
    type: 'drug',
    category: 'Antidepressant',
    description: 'SSRI for depression and anxiety',
    aliases: ['zoloft', 'lustral'],
    frequency: 95,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['depression', 'anxiety', 'SSRI', 'mental health']
  },
  {
    id: 'fluoxetine',
    label: 'Fluoxetine (Prozac)',
    value: 'fluoxetine',
    type: 'drug',
    category: 'Antidepressant',
    description: 'SSRI for depression and OCD',
    aliases: ['prozac'],
    frequency: 93,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['depression', 'OCD', 'SSRI', 'mental health']
  },
  {
    id: 'escitalopram',
    label: 'Escitalopram (Lexapro)',
    value: 'escitalopram',
    type: 'drug',
    category: 'Antidepressant',
    description: 'SSRI for depression and anxiety disorders',
    aliases: ['lexapro', 'cipralex'],
    frequency: 91,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['depression', 'anxiety', 'SSRI', 'panic disorder']
  },
  {
    id: 'alprazolam',
    label: 'Alprazolam (Xanax)',
    value: 'alprazolam',
    type: 'drug',
    category: 'Benzodiazepine',
    description: 'Short-acting benzodiazepine for anxiety',
    aliases: ['xanax'],
    frequency: 89,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['anxiety', 'panic disorder', 'benzodiazepine']
  },
  {
    id: 'lorazepam',
    label: 'Lorazepam (Ativan)',
    value: 'lorazepam',
    type: 'drug',
    category: 'Benzodiazepine',
    description: 'Benzodiazepine for anxiety and seizures',
    aliases: ['ativan'],
    frequency: 87,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['anxiety', 'seizures', 'benzodiazepine']
  },
  {
    id: 'risperidone',
    label: 'Risperidone (Risperdal)',
    value: 'risperidone',
    type: 'drug',
    category: 'Antipsychotic',
    description: 'Atypical antipsychotic',
    aliases: ['risperdal'],
    frequency: 83,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['schizophrenia', 'bipolar', 'antipsychotic']
  },
  {
    id: 'quetiapine',
    label: 'Quetiapine (Seroquel)',
    value: 'quetiapine',
    type: 'drug',
    category: 'Antipsychotic',
    description: 'Atypical antipsychotic for bipolar and schizophrenia',
    aliases: ['seroquel'],
    frequency: 85,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['bipolar disorder', 'schizophrenia', 'antipsychotic']
  },
  {
    id: 'bupropion',
    label: 'Bupropion (Wellbutrin)',
    value: 'bupropion',
    type: 'drug',
    category: 'Antidepressant',
    description: 'Atypical antidepressant and smoking cessation aid',
    aliases: ['wellbutrin', 'zyban'],
    frequency: 88,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['depression', 'smoking cessation', 'NDRI']
  },

  // Neurology Drugs
  {
    id: 'levodopa',
    label: 'Levodopa/Carbidopa (Sinemet)',
    value: 'levodopa',
    type: 'drug',
    category: 'Neurological',
    description: 'Dopamine precursor for Parkinson\'s disease',
    aliases: ['sinemet', 'l-dopa'],
    frequency: 90,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['parkinsons', 'dopamine', 'movement disorder']
  },
  {
    id: 'gabapentin',
    label: 'Gabapentin (Neurontin)',
    value: 'gabapentin',
    type: 'drug',
    category: 'Anticonvulsant',
    description: 'Anticonvulsant for neuropathic pain and seizures',
    aliases: ['neurontin'],
    frequency: 92,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['neuropathic pain', 'seizures', 'epilepsy']
  },
  {
    id: 'pregabalin',
    label: 'Pregabalin (Lyrica)',
    value: 'pregabalin',
    type: 'drug',
    category: 'Anticonvulsant',
    description: 'Anticonvulsant for neuropathic pain and fibromyalgia',
    aliases: ['lyrica'],
    frequency: 89,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['neuropathic pain', 'fibromyalgia', 'seizures']
  },
  {
    id: 'phenytoin',
    label: 'Phenytoin (Dilantin)',
    value: 'phenytoin',
    type: 'drug',
    category: 'Anticonvulsant',
    description: 'Classic anticonvulsant for epilepsy',
    aliases: ['dilantin'],
    frequency: 85,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['epilepsy', 'seizures', 'anticonvulsant']
  },
  {
    id: 'valproic_acid',
    label: 'Valproic Acid (Depakote)',
    value: 'valproic acid',
    type: 'drug',
    category: 'Anticonvulsant',
    description: 'Anticonvulsant and mood stabilizer',
    aliases: ['depakote', 'divalproex'],
    frequency: 87,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['epilepsy', 'bipolar disorder', 'migraine prevention']
  },
  {
    id: 'donepezil',
    label: 'Donepezil (Aricept)',
    value: 'donepezil',
    type: 'drug',
    category: 'Cholinesterase Inhibitor',
    description: 'Cholinesterase inhibitor for Alzheimer\'s disease',
    aliases: ['aricept'],
    frequency: 88,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['alzheimers', 'dementia', 'cognitive impairment']
  },

  // Pain Relief Drugs
  {
    id: 'morphine',
    label: 'Morphine',
    value: 'morphine',
    type: 'drug',
    category: 'Opioid',
    description: 'Strong opioid for severe pain',
    aliases: ['ms contin', 'kadian'],
    frequency: 90,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['severe pain', 'opioid', 'cancer pain']
  },
  {
    id: 'oxycodone',
    label: 'Oxycodone (OxyContin)',
    value: 'oxycodone',
    type: 'drug',
    category: 'Opioid',
    description: 'Opioid for moderate to severe pain',
    aliases: ['oxycontin', 'percocet', 'roxicodone'],
    frequency: 89,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['moderate pain', 'severe pain', 'opioid']
  },
  {
    id: 'hydrocodone',
    label: 'Hydrocodone (Vicodin)',
    value: 'hydrocodone',
    type: 'drug',
    category: 'Opioid',
    description: 'Opioid for moderate pain',
    aliases: ['vicodin', 'norco', 'lortab'],
    frequency: 88,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['moderate pain', 'opioid', 'dental pain']
  },
  {
    id: 'fentanyl',
    label: 'Fentanyl',
    value: 'fentanyl',
    type: 'drug',
    category: 'Opioid',
    description: 'Potent opioid for severe pain',
    aliases: ['duragesic', 'actiq'],
    frequency: 85,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['severe pain', 'cancer pain', 'breakthrough pain']
  },
  {
    id: 'tramadol',
    label: 'Tramadol (Ultram)',
    value: 'tramadol',
    type: 'drug',
    category: 'Opioid',
    description: 'Mild opioid for moderate pain',
    aliases: ['ultram', 'conzip'],
    frequency: 87,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['moderate pain', 'chronic pain', 'weak opioid']
  },
  {
    id: 'celecoxib',
    label: 'Celecoxib (Celebrex)',
    value: 'celecoxib',
    type: 'drug',
    category: 'COX-2 Inhibitor',
    description: 'Selective COX-2 inhibitor for pain and inflammation',
    aliases: ['celebrex'],
    frequency: 86,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['arthritis', 'inflammation', 'COX-2', 'joint pain']
  },
  {
    id: 'diclofenac',
    label: 'Diclofenac (Voltaren)',
    value: 'diclofenac',
    type: 'drug',
    category: 'NSAID',
    description: 'NSAID for pain and inflammation',
    aliases: ['voltaren', 'cataflam'],
    frequency: 84,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['arthritis', 'inflammation', 'topical pain relief']
  },

  // Additional Depression/Anxiety Drugs
  {
    id: 'venlafaxine',
    label: 'Venlafaxine (Effexor)',
    value: 'venlafaxine',
    type: 'drug',
    category: 'SNRI',
    description: 'SNRI for depression and anxiety',
    aliases: ['effexor'],
    frequency: 86,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['depression', 'anxiety', 'SNRI']
  },
  {
    id: 'duloxetine',
    label: 'Duloxetine (Cymbalta)',
    value: 'duloxetine',
    type: 'drug',
    category: 'SNRI',
    description: 'SNRI for depression and neuropathic pain',
    aliases: ['cymbalta'],
    frequency: 85,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['depression', 'neuropathic pain', 'fibromyalgia']
  },
  {
    id: 'citalopram',
    label: 'Citalopram (Celexa)',
    value: 'citalopram',
    type: 'drug',
    category: 'Antidepressant',
    description: 'SSRI for depression',
    aliases: ['celexa'],
    frequency: 83,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['depression', 'SSRI']
  },
  {
    id: 'paroxetine',
    label: 'Paroxetine (Paxil)',
    value: 'paroxetine',
    type: 'drug',
    category: 'Antidepressant',
    description: 'SSRI for depression and anxiety',
    aliases: ['paxil'],
    frequency: 82,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['depression', 'anxiety', 'SSRI']
  },
  {
    id: 'lithium',
    label: 'Lithium',
    value: 'lithium',
    type: 'drug',
    category: 'Mood Stabilizer',
    description: 'Mood stabilizer for bipolar disorder',
    aliases: ['lithobid', 'eskalith'],
    frequency: 81,
    fdaApproved: true,
    isOncology: false,
    relatedTerms: ['bipolar disorder', 'mood stabilizer', 'mania']
  },

  // Cancer Indications
  {
    id: 'breast_cancer',
    label: 'Breast Cancer',
    value: 'breast cancer',
    type: 'indication',
    category: 'Solid Tumor',
    description: 'Most common cancer in women',
    frequency: 95,
    relatedTerms: ['HER2', 'ER', 'PR', 'triple negative', 'ductal carcinoma']
  },
  {
    id: 'lung_cancer',
    label: 'Lung Cancer',
    value: 'lung cancer',
    type: 'indication',
    category: 'Solid Tumor',
    description: 'Leading cause of cancer death',
    frequency: 93,
    relatedTerms: ['NSCLC', 'SCLC', 'EGFR', 'ALK', 'smoking']
  },
  {
    id: 'colorectal_cancer',
    label: 'Colorectal Cancer',
    value: 'colorectal cancer',
    type: 'indication',
    category: 'Solid Tumor',
    description: 'Cancer of colon or rectum',
    frequency: 88,
    relatedTerms: ['KRAS', 'BRAF', 'MSI', 'CRC', 'adenocarcinoma']
  },
  {
    id: 'melanoma',
    label: 'Melanoma',
    value: 'melanoma',
    type: 'indication',
    category: 'Skin Cancer',
    description: 'Aggressive skin cancer',
    frequency: 86,
    relatedTerms: ['BRAF', 'MEK', 'immunotherapy', 'metastatic']
  },
  {
    id: 'leukemia',
    label: 'Leukemia',
    value: 'leukemia',
    type: 'indication',
    category: 'Hematologic Malignancy',
    description: 'Blood cancer affecting white blood cells',
    frequency: 84,
    relatedTerms: ['AML', 'CML', 'ALL', 'CLL', 'bone marrow']
  },
  {
    id: 'lymphoma',
    label: 'Lymphoma',
    value: 'lymphoma',
    type: 'indication',
    category: 'Hematologic Malignancy',
    description: 'Cancer of lymphatic system',
    frequency: 82,
    relatedTerms: ['Hodgkin', 'non-Hodgkin', 'B-cell', 'T-cell']
  },
  {
    id: 'prostate_cancer',
    label: 'Prostate Cancer',
    value: 'prostate cancer',
    type: 'indication',
    category: 'Solid Tumor',
    description: 'Most common cancer in men',
    frequency: 89,
    relatedTerms: ['PSA', 'androgen', 'hormone therapy', 'Gleason score']
  },
  {
    id: 'ovarian_cancer',
    label: 'Ovarian Cancer',
    value: 'ovarian cancer',
    type: 'indication',
    category: 'Solid Tumor',
    description: 'Gynecologic malignancy',
    frequency: 78,
    relatedTerms: ['BRCA', 'PARP', 'CA-125', 'serous carcinoma']
  },
  {
    id: 'pancreatic_cancer',
    label: 'Pancreatic Cancer',
    value: 'pancreatic cancer',
    type: 'indication',
    category: 'Solid Tumor',
    description: 'Aggressive digestive system cancer',
    frequency: 75,
    relatedTerms: ['KRAS', 'BRCA2', 'gemcitabine', 'poor prognosis']
  },
  {
    id: 'renal_cell_carcinoma',
    label: 'Renal Cell Carcinoma',
    value: 'renal cell carcinoma',
    type: 'indication',
    category: 'Solid Tumor',
    description: 'Most common kidney cancer',
    frequency: 73,
    relatedTerms: ['VHL', 'clear cell', 'sunitinib', 'immunotherapy']
  },

  // Mechanisms of Action
  {
    id: 'checkpoint_inhibitor',
    label: 'Checkpoint Inhibitor',
    value: 'checkpoint inhibitor',
    type: 'mechanism',
    category: 'Immunotherapy',
    description: 'Blocks immune checkpoint proteins',
    frequency: 92,
    relatedTerms: ['PD-1', 'PD-L1', 'CTLA-4', 'immunotherapy']
  },
  {
    id: 'tyrosine_kinase_inhibitor',
    label: 'Tyrosine Kinase Inhibitor',
    value: 'tyrosine kinase inhibitor',
    type: 'mechanism',
    category: 'Targeted Therapy',
    description: 'Inhibits tyrosine kinase enzymes',
    frequency: 90,
    relatedTerms: ['EGFR', 'BCR-ABL', 'VEGFR', 'targeted therapy']
  },
  {
    id: 'monoclonal_antibody',
    label: 'Monoclonal Antibody',
    value: 'monoclonal antibody',
    type: 'mechanism',
    category: 'Targeted Therapy',
    description: 'Engineered antibodies targeting specific antigens',
    frequency: 88,
    relatedTerms: ['mAb', 'targeted therapy', 'binding', 'specificity']
  },
  {
    id: 'alkylating_agent',
    label: 'Alkylating Agent',
    value: 'alkylating agent',
    type: 'mechanism',
    category: 'Chemotherapy',
    description: 'Forms covalent bonds with DNA',
    frequency: 85,
    relatedTerms: ['DNA damage', 'cyclophosphamide', 'cisplatin']
  },
  {
    id: 'antimetabolite',
    label: 'Antimetabolite',
    value: 'antimetabolite',
    type: 'mechanism',
    category: 'Chemotherapy',
    description: 'Interferes with DNA/RNA synthesis',
    frequency: 83,
    relatedTerms: ['folate antagonist', 'purine analog', 'pyrimidine analog']
  },
  {
    id: 'topoisomerase_inhibitor',
    label: 'Topoisomerase Inhibitor',
    value: 'topoisomerase inhibitor',
    type: 'mechanism',
    category: 'Chemotherapy',
    description: 'Prevents DNA unwinding',
    frequency: 81,
    relatedTerms: ['topotecan', 'irinotecan', 'etoposide']
  },
  {
    id: 'proteasome_inhibitor',
    label: 'Proteasome Inhibitor',
    value: 'proteasome inhibitor',
    type: 'mechanism',
    category: 'Targeted Therapy',
    description: 'Blocks protein degradation pathway',
    frequency: 76,
    relatedTerms: ['bortezomib', 'carfilzomib', 'protein degradation']
  },
  {
    id: 'angiogenesis_inhibitor',
    label: 'Angiogenesis Inhibitor',
    value: 'angiogenesis inhibitor',
    type: 'mechanism',
    category: 'Targeted Therapy',
    description: 'Prevents blood vessel formation',
    frequency: 79,
    relatedTerms: ['VEGF', 'bevacizumab', 'anti-angiogenic']
  },

  // Biomarkers
  {
    id: 'her2_positive',
    label: 'HER2 Positive',
    value: 'HER2 positive',
    type: 'biomarker',
    category: 'Protein Expression',
    description: 'Overexpression of HER2 protein',
    frequency: 94,
    relatedTerms: ['breast cancer', 'trastuzumab', 'pertuzumab']
  },
  {
    id: 'er_pr_positive',
    label: 'ER/PR Positive',
    value: 'ER/PR positive',
    type: 'biomarker',
    category: 'Hormone Receptor',
    description: 'Estrogen/Progesterone receptor positive',
    frequency: 92,
    relatedTerms: ['breast cancer', 'hormone therapy', 'tamoxifen']
  },
  {
    id: 'triple_negative',
    label: 'Triple Negative',
    value: 'triple negative',
    type: 'biomarker',
    category: 'Receptor Status',
    description: 'ER-, PR-, HER2- breast cancer',
    frequency: 87,
    relatedTerms: ['breast cancer', 'chemotherapy', 'BRCA']
  },
  {
    id: 'egfr_mutation',
    label: 'EGFR Mutation',
    value: 'EGFR mutation',
    type: 'biomarker',
    category: 'Genetic Mutation',
    description: 'Epidermal growth factor receptor mutations',
    frequency: 89,
    relatedTerms: ['lung cancer', 'osimertinib', 'erlotinib']
  },
  {
    id: 'kras_mutation',
    label: 'KRAS Mutation',
    value: 'KRAS mutation',
    type: 'biomarker',
    category: 'Genetic Mutation',
    description: 'Kirsten rat sarcoma viral oncogene mutations',
    frequency: 85,
    relatedTerms: ['colorectal cancer', 'lung cancer', 'pancreatic cancer']
  },
  {
    id: 'brca_mutation',
    label: 'BRCA Mutation',
    value: 'BRCA mutation',
    type: 'biomarker',
    category: 'Genetic Mutation',
    description: 'BRCA1/2 tumor suppressor gene mutations',
    frequency: 88,
    relatedTerms: ['breast cancer', 'ovarian cancer', 'PARP inhibitor']
  },
  {
    id: 'pd_l1_positive',
    label: 'PD-L1 Positive',
    value: 'PD-L1 positive',
    type: 'biomarker',
    category: 'Protein Expression',
    description: 'Programmed death-ligand 1 expression',
    frequency: 86,
    relatedTerms: ['immunotherapy', 'pembrolizumab', 'checkpoint inhibitor']
  },
  {
    id: 'msi_high',
    label: 'MSI-High',
    value: 'MSI-high',
    type: 'biomarker',
    category: 'Molecular Feature',
    description: 'Microsatellite instability high',
    frequency: 83,
    relatedTerms: ['colorectal cancer', 'immunotherapy', 'mismatch repair']
  },
  {
    id: 'tmb_high',
    label: 'TMB-High',
    value: 'TMB-high',
    type: 'biomarker',
    category: 'Molecular Feature',
    description: 'Tumor mutational burden high',
    frequency: 81,
    relatedTerms: ['immunotherapy', 'checkpoint inhibitor', 'mutation load']
  },

  // Gene Targets
  {
    id: 'braf',
    label: 'BRAF',
    value: 'BRAF',
    type: 'gene',
    category: 'Oncogene',
    description: 'Proto-oncogene B-Raf',
    frequency: 84,
    relatedTerms: ['melanoma', 'colorectal cancer', 'dabrafenib']
  },
  {
    id: 'alk',
    label: 'ALK',
    value: 'ALK',
    type: 'gene',
    category: 'Fusion Gene',
    description: 'Anaplastic lymphoma kinase',
    frequency: 78,
    relatedTerms: ['lung cancer', 'crizotinib', 'alectinib']
  },
  {
    id: 'ros1',
    label: 'ROS1',
    value: 'ROS1',
    type: 'gene',
    category: 'Fusion Gene',
    description: 'ROS proto-oncogene 1',
    frequency: 72,
    relatedTerms: ['lung cancer', 'crizotinib', 'entrectinib']
  },
  {
    id: 'ntrk',
    label: 'NTRK',
    value: 'NTRK',
    type: 'gene',
    category: 'Fusion Gene',
    description: 'Neurotrophic tyrosine receptor kinase',
    frequency: 68,
    relatedTerms: ['solid tumors', 'larotrectinib', 'entrectinib']
  },
  {
    id: 'ret',
    label: 'RET',
    value: 'RET',
    type: 'gene',
    category: 'Fusion Gene',
    description: 'Rearranged during transfection',
    frequency: 70,
    relatedTerms: ['lung cancer', 'thyroid cancer', 'selpercatinib']
  }
];

const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  placeholder = "Search drugs, indications, mechanisms...",
  onSelect,
  onInputChange,
  value = "",
  maxResults = 10,
  showCategories = true,
  allowMultiple = false,
  selectedOptions = [],
  disabled = false,
  loading = false,
  className = "",
  onOfflineChange
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [serverOptions, setServerOptions] = useState<AutocompleteOption[]>([]);
  const [serverOffline, setServerOffline] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('oncosaferx_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Fetch server suggestions when typing (debounced minimal)
  useEffect(() => {
    let abort = false;
    if (inputValue.trim().length < 2) { setServerOptions([]); setServerOffline(false); return; }
    const t = setTimeout(async () => {
      try {
        const resp = await fetch(`https://oncosaferx.onrender.com/api/drugs/search?q=${encodeURIComponent(inputValue)}`);
        if (!resp.ok) throw new Error('suggestions failed');
        const data = await resp.json();
        const opts: AutocompleteOption[] = (data.results || []).slice(0, maxResults).map((s: any) => ({
          id: s.id || s.rxcui || s.name,
          label: s.name,
          value: s.name,
          type: 'drug',
          category: 'Drug'
        }));
        if (!abort) {
          setServerOptions(opts);
          // Check if we're offline based on RxNorm data availability
          const isOffline = !data.sources?.rxnorm || data.sources.rxnorm === 0;
          setServerOffline(isOffline);
          onOfflineChange?.(isOffline);
        }
      } catch {
        if (!abort) { setServerOptions([]); }
      }
    }, 250);
    return () => { abort = true; clearTimeout(t); };
  }, [inputValue, maxResults, onOfflineChange]);

  // Filter options based on input (combine server + local)
  useEffect(() => {
    if (!inputValue.trim()) {
      // Show recent searches and popular options when empty
      const popular = COMPREHENSIVE_OPTIONS
        .filter(opt => opt.type === 'drug' && opt.frequency && opt.frequency > 80)
        .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
        .slice(0, maxResults);
      setFilteredOptions(popular);
      return;
    }

    const searchTerm = inputValue.toLowerCase().trim();
    
    // Enhanced fuzzy matching function
    const fuzzyMatch = (text: string, search: string): { matches: boolean; score: number } => {
      text = text.toLowerCase();
      search = search.toLowerCase();
      
      // Exact match - highest score
      if (text === search) return { matches: true, score: 100 };
      
      // Starts with - very high score
      if (text.startsWith(search)) return { matches: true, score: 90 };
      
      // Contains - high score
      if (text.includes(search)) return { matches: true, score: 80 };
      
      // Fuzzy matching for partial typing (e.g., "a-s-p" for "aspirin")
      if (search.includes('-') || search.includes(' ') || search.includes('.')) {
        const cleanSearch = search.replace(/[-\s.]/g, '');
        if (text.includes(cleanSearch)) return { matches: true, score: 70 };
      }
      
      // Acronym matching (e.g., "asp" for "aspirin")
      if (search.length >= 2) {
        const words = text.split(/[\s-()]/);
        const acronym = words.map(word => word.charAt(0)).join('');
        if (acronym.includes(search)) return { matches: true, score: 60 };
        
        // Check if search is prefix of first letters
        let charIndex = 0;
        for (const char of search) {
          const foundIndex = text.indexOf(char, charIndex);
          if (foundIndex === -1) break;
          charIndex = foundIndex + 1;
          if (charIndex >= text.length) break;
        }
        if (charIndex > 0 && search.length >= 3) {
          return { matches: true, score: 50 };
        }
      }
      
      // Levenshtein-inspired partial matching
      if (search.length >= 3) {
        let matches = 0;
        let lastIndex = -1;
        for (const char of search) {
          const index = text.indexOf(char, lastIndex + 1);
          if (index > lastIndex) {
            matches++;
            lastIndex = index;
          }
        }
        if (matches / search.length >= 0.7) {
          return { matches: true, score: 40 };
        }
      }
      
      return { matches: false, score: 0 };
    };

    const matches = COMPREHENSIVE_OPTIONS.filter(option => {
      // Only show drugs, not indications/cancer types
      if (option.type !== 'drug') return false;
      
      // Check main label with fuzzy matching
      const labelMatch = fuzzyMatch(option.label, searchTerm);
      if (labelMatch.matches) return true;
      
      // Check value
      const valueMatch = fuzzyMatch(option.value, searchTerm);
      if (valueMatch.matches) return true;
      
      // Check aliases with fuzzy matching
      if (option.aliases?.some(alias => fuzzyMatch(alias, searchTerm).matches)) return true;
      
      // Check related terms
      if (option.relatedTerms?.some(term => fuzzyMatch(term, searchTerm).matches)) return true;
      
      // Check description
      if (option.description && fuzzyMatch(option.description, searchTerm).matches) return true;
      
      // Check category
      if (fuzzyMatch(option.category, searchTerm).matches) return true;
      
      return false;
    }).map(option => {
      // Calculate relevance score for sorting
      const labelMatch = fuzzyMatch(option.label, searchTerm);
      const valueMatch = fuzzyMatch(option.value, searchTerm);
      const aliasMatch = option.aliases ? Math.max(...option.aliases.map(alias => fuzzyMatch(alias, searchTerm).score)) : 0;
      const score = Math.max(labelMatch.score, valueMatch.score, aliasMatch);
      
      return { ...option, relevanceScore: score };
    });

    // Sort by relevance using fuzzy match scores
    const sorted = matches.sort((a: any, b: any) => {
      // Sort by relevance score first
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      
      // For equal relevance scores, prefer FDA approved drugs
      if (a.type === 'drug' && b.type === 'drug') {
        if (a.fdaApproved && !b.fdaApproved) return -1;
        if (!a.fdaApproved && b.fdaApproved) return 1;
      }
      
      // Then sort by frequency
      return (b.frequency || 0) - (a.frequency || 0);
    });

    // Prefer server options when available; fallback to local sorted
    const combined = serverOptions.length > 0 ? serverOptions.slice(0, maxResults) : sorted.slice(0, maxResults);
    setFilteredOptions(combined);
    setHighlightedIndex(-1);
  }, [inputValue, maxResults, serverOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    if (allowMultiple) {
      if (!selectedOptions.find(opt => opt.id === option.id)) {
        onSelect(option);
      }
    } else {
      setInputValue(option.label);
      onSelect(option);
    }
    
    // Save to recent searches
    const updated = [option.value, ...recentSearches.filter(s => s !== option.value)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('oncosaferx_recent_searches', JSON.stringify(updated));
    
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const getOptionIcon = (type: string) => {
    switch (type) {
      case 'drug': return <Pill className="h-4 w-4 text-blue-500" />;
      case 'indication': return <Target className="h-4 w-4 text-red-500" />;
      case 'mechanism': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'biomarker': return <Activity className="h-4 w-4 text-green-500" />;
      case 'gene': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'class': return <Users className="h-4 w-4 text-orange-500" />;
      default: return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  const removeSelectedOption = (optionId: string) => {
    // This would be handled by parent component
    console.log('Remove option:', optionId);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Options (for multiple selection) */}
      {allowMultiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map(option => (
            <div
              key={option.id}
              className="flex items-center space-x-1 px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm"
            >
              {getOptionIcon(option.type)}
              <span>{option.label}</span>
              <button
                onClick={() => removeSelectedOption(option.id)}
                className="text-violet-600 hover:text-violet-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={`w-full pl-10 pr-10 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
        />
        
        {loading && (
          <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-5 w-5 text-violet-600 animate-spin" />
        )}
        
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Header */}
          {inputValue.trim() === '' && (
            <div className="px-4 py-2 bg-gray-50 border-b text-sm text-gray-600">
              {recentSearches.length > 0 ? 'Recent searches & Popular options' : 'Popular options'}
            </div>
          )}
          
          {filteredOptions.length > 0 ? (
            <ul ref={listRef} className="max-h-80 overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <li key={option.id}>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleOptionSelect(option);
                    }}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 ${
                      index === highlightedIndex ? 'bg-violet-50 border-l-4 border-violet-500' : ''
                    }`}
                  >
                    {getOptionIcon(option.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {option.label}
                        </span>
                        {option.fdaApproved && (
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        )}
                        {option.isOncology && (
                          <Target className="h-3 w-3 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      {showCategories && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 capitalize">
                            {option.type} • {option.category}
                          </span>
                          {option.frequency && option.frequency > 85 && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600">Popular</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {option.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {option.description}
                        </p>
                      )}
                    </div>
                    
                    {option.type === 'drug' && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-500">
                          {option.fdaApproved ? 'FDA Approved' : 'Investigational'}
                        </div>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No matches found</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
          
          {/* Footer */}
          {filteredOptions.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 text-center">
              Showing {filteredOptions.length} result{filteredOptions.length !== 1 ? 's' : ''} 
              {inputValue.trim() && ` for "${inputValue}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;
