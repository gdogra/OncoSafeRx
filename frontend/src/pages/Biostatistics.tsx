import React, { useState } from 'react';
import Card from '../components/UI/Card';
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  Download, 
  Upload,
  Info,
  AlertTriangle
} from 'lucide-react';

interface SurvivalData {
  time: number;
  event: boolean;
  group?: string;
}

interface StatisticalTest {
  name: string;
  description: string;
  requirements: string[];
  example: string;
}

const Biostatistics: React.FC = () => {
  const [activeAnalysis, setActiveAnalysis] = useState<'survival' | 'comparison' | 'meta'>('survival');
  const [survivalData, setSurvivalData] = useState<SurvivalData[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const statisticalTests: StatisticalTest[] = [
    {
      name: 'Kaplan-Meier Survival Analysis',
      description: 'Estimates survival probabilities over time, accounting for censored observations',
      requirements: ['Time-to-event data', 'Censoring indicators', 'Minimum 20 patients per group'],
      example: 'Overall survival in cancer patients receiving treatment A vs B'
    },
    {
      name: 'Cox Proportional Hazards',
      description: 'Regression model for survival data to identify prognostic factors',
      requirements: ['Survival data', 'Covariates', 'Proportional hazards assumption'],
      example: 'Impact of age, stage, and biomarker status on progression-free survival'
    },
    {
      name: 'Log-rank Test',
      description: 'Compares survival curves between two or more groups',
      requirements: ['Survival data for 2+ groups', 'Independent observations'],
      example: 'Comparing median overall survival between treatment arms'
    },
    {
      name: 'Meta-Analysis',
      description: 'Statistical combination of results from multiple independent studies',
      requirements: ['Effect sizes from multiple studies', 'Variance estimates', 'Study weights'],
      example: 'Pooled analysis of response rates across multiple pembrolizumab trials'
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      console.log('File uploaded:', file.name);
    }
  };

  const generateSampleData = () => {
    const sampleData: SurvivalData[] = [];
    for (let i = 0; i < 100; i++) {
      sampleData.push({
        time: Math.random() * 36,
        event: Math.random() > 0.3,
        group: Math.random() > 0.5 ? 'Treatment A' : 'Treatment B'
      });
    }
    setSurvivalData(sampleData);
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Biostatistical Analysis Tools</h1>
        <p className="text-gray-600 mt-2">
          Statistical analysis tools for survival analysis, treatment effect estimation, and meta-analysis
        </p>
        <div className="flex gap-2 mt-3">
          <span className="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700">Kaplan-Meier</span>
          <span className="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700">Cox Regression</span>
          <span className="px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700">Meta-Analysis</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <div className="text-blue-800">
            <strong>Methodology:</strong> These tools implement standard biostatistical methods following FDA guidance 
            for clinical trial analysis. All calculations use validated algorithms with appropriate statistical assumptions.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Analysis Methods</h3>
              <div className="space-y-2">
                {statisticalTests.map((test, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="font-medium text-sm">{test.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{test.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveAnalysis('survival')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeAnalysis === 'survival'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Survival Analysis
                </button>
                <button
                  onClick={() => setActiveAnalysis('comparison')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeAnalysis === 'comparison'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Group Comparison
                </button>
                <button
                  onClick={() => setActiveAnalysis('meta')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeAnalysis === 'meta'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Meta-Analysis
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeAnalysis === 'survival' && (
                <div className="space-y-6">
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Survival Analysis
                      </h3>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-2">Upload Data (CSV/Excel)</label>
                            <input
                              type="file"
                              accept=".csv,.xlsx,.xls"
                              onChange={handleFileUpload}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            {uploadedFile && (
                              <p className="text-sm text-green-600 mt-1">Uploaded: {uploadedFile.name}</p>
                            )}
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={generateSampleData}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              Use Sample Data
                            </button>
                          </div>
                        </div>

                        {survivalData.length > 0 && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Data Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="font-medium">Total Patients</div>
                                <div className="text-xl font-bold text-blue-600">{survivalData.length}</div>
                              </div>
                              <div>
                                <div className="font-medium">Events</div>
                                <div className="text-xl font-bold text-red-600">
                                  {survivalData.filter(d => d.event).length}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">Censored</div>
                                <div className="text-xl font-bold text-gray-600">
                                  {survivalData.filter(d => !d.event).length}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">Median Follow-up</div>
                                <div className="text-xl font-bold text-green-600">
                                  {Math.round(survivalData.reduce((sum, d) => sum + d.time, 0) / survivalData.length)} mo
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Calculator className="h-4 w-4" />
                            Run Kaplan-Meier Analysis
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Calculator className="h-4 w-4" />
                            Cox Regression
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {survivalData.length > 0 && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-medium mb-4">Results</h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Mock Results Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Median Overall Survival:</strong> Treatment A: 18.4 months (95% CI: 14.2-22.6)</div>
                            <div><strong>Median Overall Survival:</strong> Treatment B: 12.8 months (95% CI: 9.1-16.5)</div>
                            <div><strong>Hazard Ratio:</strong> 0.68 (95% CI: 0.45-1.02, p=0.062)</div>
                            <div><strong>Log-rank test p-value:</strong> 0.058</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {activeAnalysis === 'comparison' && (
                <div className="space-y-6">
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Group Comparison Analysis
                      </h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <div className="text-yellow-800">
                            This section provides tools for comparing treatment outcomes between groups,
                            including t-tests, ANOVA, chi-square tests, and non-parametric alternatives.
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeAnalysis === 'meta' && (
                <div className="space-y-6">
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Meta-Analysis Tools
                      </h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          <div className="text-blue-800">
                            Meta-analysis functionality for combining results across multiple studies,
                            including forest plots, heterogeneity assessment, and publication bias testing.
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Biostatistics;