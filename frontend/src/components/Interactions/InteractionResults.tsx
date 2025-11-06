import React from 'react';
import { InteractionCheckResult, DrugInteraction } from '../../types';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import { AlertTriangle, Info, Database, Globe, MapPinned } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { inferBiomarkerForDrug } from '../../utils/biomarkers';
import Tooltip from '../UI/Tooltip';
import { useAuth } from '../../context/AuthContext';
import { useSelection } from '../../context/SelectionContext';

interface InteractionResultsProps {
  results: InteractionCheckResult;
}

const InteractionResults: React.FC<InteractionResultsProps> = ({ results }) => {
  const { state: authState } = useAuth();
  const selection = useSelection();
  const role = authState?.user?.role;
  const isPatientLike = role === 'patient' || role === 'caregiver';
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'major':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'minor':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'major':
        return 'border-l-red-500 bg-red-50';
      case 'moderate':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'minor':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getEvidenceColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-700';
    
    switch (level.toUpperCase()) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B':
        return 'bg-blue-100 text-blue-800';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const navigate = useNavigate();

  // Map selected drugs that have origin brand/region for quick lookup
  const selectedBrandMeta = React.useMemo(() => {
    const map: Record<string, { brand?: string; region?: string }> = {};
    try {
      for (const d of selection.selectedDrugs) {
        const keyR = (d.rxcui || '').trim();
        const keyN = (d.name || '').trim().toLowerCase();
        const brand = (d as any).originBrand;
        const region = (d as any).originRegion;
        if (brand || region) {
          if (keyR) map[`rxcui:${keyR}`] = { brand, region };
          if (keyN) map[`name:${keyN}`] = { brand, region };
        }
      }
    } catch {}
    return map;
  }, [selection.selectedDrugs]);

  const findBrandLabel = (name?: string, rxcui?: string) => {
    const keyR = rxcui ? selectedBrandMeta[`rxcui:${rxcui}`] : undefined;
    const keyN = name ? selectedBrandMeta[`name:${name.trim().toLowerCase()}`] : undefined;
    const meta = keyR || keyN;
    if (!meta) return null;
    if (meta.brand) return `${meta.brand}${meta.region ? ` (${meta.region})` : ''}`;
    if (meta.region) return `(${meta.region})`;
    return null;
  };

  const renderInteractionCard = (interaction: DrugInteraction, source: 'stored' | 'external', index: number) => (
    <Card 
      key={`${interaction.drug1_rxcui || 'unknown'}-${interaction.drug2_rxcui || 'unknown'}-${source}-${index}`}
      className={`border-l-4 ${getSeverityColor(interaction.severity)}`}
      padding="md"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getSeverityIcon(interaction.severity)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {interaction.severity} Interaction
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {source === 'stored' ? (
                  <Database className="w-4 h-4 text-gray-400" />
                ) : (
                  <Globe className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-500">
                  {source === 'stored' ? 'Database' : 'External Source'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {interaction.evidence_level && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEvidenceColor(interaction.evidence_level)}`}>
                Evidence Level {interaction.evidence_level}
              </span>
            )}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              interaction.severity === 'major' 
                ? 'bg-red-100 text-red-800'
                : interaction.severity === 'moderate'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {interaction.riskLevel || interaction.severity.toUpperCase()}
            </span>
            <Tooltip
              content={isPatientLike
                ? 'These results summarize potential interactions from trusted medical sources. Not all interactions are shown. Always consult your care team.'
                : 'Severity reflects clinical impact; Evidence Level indicates strength of evidence; Sources show curated vs. external origins.'}
            >
              <button
                type="button"
                aria-label="About these results"
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Info className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Drug Pair */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <p className="font-medium text-gray-900">
                {interaction.drug1?.name || `Drug ${interaction.drug1_rxcui}`}
              </p>
              <p className="text-sm text-gray-500">RXCUI: {interaction.drug1_rxcui}</p>
              {findBrandLabel(interaction.drug1?.name, interaction.drug1_rxcui) && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 mt-1">
                  {findBrandLabel(interaction.drug1?.name, interaction.drug1_rxcui)}
                </span>
              )}
            </div>
            <div className="text-2xl text-gray-400">×</div>
            <div className="text-center">
              <p className="font-medium text-gray-900">
                {interaction.drug2?.name || `Drug ${interaction.drug2_rxcui}`}
              </p>
              <p className="text-sm text-gray-500">RXCUI: {interaction.drug2_rxcui}</p>
              {findBrandLabel(interaction.drug2?.name, interaction.drug2_rxcui) && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 mt-1">
                  {findBrandLabel(interaction.drug2?.name, interaction.drug2_rxcui)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interaction Details */}
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Effect</h4>
            <p className="text-gray-700">{interaction.effect}</p>
          </div>
          
          {interaction.mechanism && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Mechanism</h4>
              <p className="text-gray-700">{interaction.mechanism}</p>
            </div>
          )}
          
          {interaction.management && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Management</h4>
              <p className="text-gray-700">{interaction.management}</p>
            </div>
          )}
          
          {interaction.sources && interaction.sources.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sources</h4>
              <div className="flex flex-wrap gap-2">
                {interaction.sources.map((source, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Trials link */}
          <div>
            <button
              type="button"
              onClick={() => {
                const name1 = interaction.drug1?.name;
                const name2 = interaction.drug2?.name;
                const m = inferBiomarkerForDrug(name1 || '') || inferBiomarkerForDrug(name2 || '');
                if (m) navigate(`/trials?biomarker=${encodeURIComponent(m)}`);
                else navigate('/trials');
              }}
              className="inline-flex items-center px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              <MapPinned className="w-3 h-3 mr-1" /> Find Trials
            </button>
          </div>
        </div>
      </div>
    </Card>
  );

  const allInteractions = [
    ...results.interactions.stored.map(i => ({ ...i, source: 'stored' as const })),
    ...results.interactions.external.map(i => ({ ...i, source: 'external' as const }))
  ];

  // Group by severity
  const groupedInteractions = allInteractions.reduce((groups, interaction) => {
    const severity = interaction.severity;
    if (!groups[severity]) {
      groups[severity] = [];
    }
    groups[severity].push(interaction);
    return groups;
  }, {} as Record<string, Array<DrugInteraction & { source: 'stored' | 'external' }>>);

  const severityOrder = ['major', 'moderate', 'minor', 'unknown'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Interaction Analysis</h2>
        
        {allInteractions.length === 0 ? (
          <Alert type="success" title="No Interactions Found">
            No known interactions were detected between the selected medications.
          </Alert>
        ) : (
          <div className="space-y-6">
            {severityOrder.map(severity => {
              const interactions = groupedInteractions[severity];
              if (!interactions || interactions.length === 0) return null;
              
              return (
                <div key={severity}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize flex items-center space-x-2">
                    {getSeverityIcon(severity)}
                    <span>{severity} Interactions ({interactions.length})</span>
                  </h3>
                  <div className="space-y-4">
                    {interactions.map((interaction, index) => 
                      renderInteractionCard(interaction, interaction.source, index)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <Alert type="warning" title="Important Disclaimer">
        This interaction checker is for informational purposes only and should not replace professional medical advice. 
        Always consult with a healthcare provider before making any changes to your medication regimen.
      </Alert>
    </div>
  );
};

export default InteractionResults;
