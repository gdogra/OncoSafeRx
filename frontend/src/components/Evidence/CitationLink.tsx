import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Props {
  pmid?: string;
  source?: string;
  className?: string;
}

/**
 * Renders a clickable PMID link to PubMed, or a source label.
 */
export default function CitationLink({ pmid, source, className = '' }: Props) {
  if (pmid) {
    return (
      <a
        href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline text-xs ${className}`}
        title={`PubMed: ${pmid}`}
      >
        PMID:{pmid}
        <ExternalLink className="h-2.5 w-2.5" />
      </a>
    );
  }

  if (source) {
    const url = sourceToUrl(source);
    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline text-xs ${className}`}
        >
          {source}
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      );
    }
    return <span className={`text-xs text-gray-500 ${className}`}>{source}</span>;
  }

  return null;
}

/**
 * Maps a source name (CPIC, FDA, NCCN, etc.) to its canonical URL.
 * Returns null when we have no reliable URL for that source.
 */
export function sourceToUrl(source: string): string | null {
  const s = source.toLowerCase();
  if (s.includes('cpic')) return 'https://cpicpgx.org/guidelines/';
  if (s.includes('dailymed')) return 'https://dailymed.nlm.nih.gov/dailymed/';
  if (s.includes('faers') || s.includes('openfda')) return 'https://open.fda.gov/data/faers/';
  if (s.includes('fda')) return 'https://www.fda.gov/drugs/science-and-research/table-pharmacogenomic-biomarkers-drug-labeling';
  if (s.includes('nccn')) return 'https://www.nccn.org/guidelines/';
  if (s.includes('dpwg')) return 'https://www.pharmgkb.org/page/dpwg';
  if (s.includes('pharmgkb')) return 'https://www.pharmgkb.org/';
  if (s.includes('oncokb')) return 'https://www.oncokb.org/';
  if (s.includes('civic')) return 'https://civicdb.org/';
  if (s.includes('clinvar')) return 'https://www.ncbi.nlm.nih.gov/clinvar/';
  if (s.includes('cosmic')) return 'https://cancer.sanger.ac.uk/cosmic';
  if (s.includes('clinicaltrials')) return 'https://clinicaltrials.gov/';
  if (s.includes('asco')) return 'https://www.asco.org/practice-policy/clinical-guidelines';
  if (s.includes('rxnorm')) return 'https://www.nlm.nih.gov/research/umls/rxnorm/';
  if (s.includes('nci')) return 'https://www.cancer.gov/';
  return null;
}

/**
 * A source rendered as a chip (background, padding) rather than a bare link.
 * Use inside lists of provenance markers attached to a clinical assertion.
 */
export function SourceChip({ source, className = '' }: { source: string; className?: string }) {
  const url = sourceToUrl(source);
  const base = 'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium';
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors ${className}`}
        title={`Open ${source} in a new tab`}
      >
        {source}
        <ExternalLink className="h-2.5 w-2.5" />
      </a>
    );
  }
  return (
    <span
      className={`${base} bg-gray-100 text-gray-700 dark:text-gray-300 ${className}`}
      title="No external link configured for this source"
    >
      {source}
    </span>
  );
}

/**
 * A horizontal list of source chips. Renders nothing if list is empty/undefined.
 */
export function SourceChips({ sources, className = '' }: { sources?: string[]; className?: string }) {
  const list = (sources || []).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {list.map((s, i) => (
        <SourceChip key={`${s}-${i}`} source={s} />
      ))}
    </div>
  );
}

const EVIDENCE_DESCRIPTIONS: Record<string, string> = {
  A: 'Level A — Strong: high-quality evidence with consistent results from well-designed studies (e.g., randomized controlled trials, large meta-analyses).',
  B: 'Level B — Moderate: evidence from less rigorous studies or limited randomized data; recommendation is supported but with reservations.',
  C: 'Level C — Weak: low-quality or limited evidence; based on expert opinion, case reports, or small observational studies.',
  D: 'Level D — Very weak / absent: little to no published evidence; recommendation is provisional.',
};

const EVIDENCE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border border-green-200',
  B: 'bg-blue-100 text-blue-800 border border-blue-200',
  C: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  D: 'bg-gray-100 text-gray-700 border border-gray-200',
};

/**
 * Evidence-level badge with a built-in tooltip explaining what A/B/C/D mean.
 * Accepts upper- or lower-case input; unknown levels render as a neutral chip.
 */
export function EvidenceLevelBadge({
  level,
  className = '',
}: {
  level?: string | null;
  className?: string;
}) {
  if (!level) return null;
  const norm = String(level).trim().toUpperCase().charAt(0);
  const desc = EVIDENCE_DESCRIPTIONS[norm] || `Evidence level "${level}". See the cited source for full grading.`;
  const color = EVIDENCE_COLORS[norm] || 'bg-gray-100 text-gray-700 border border-gray-200';
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-help ${color} ${className}`}
      title={desc}
      aria-label={desc}
    >
      Level {String(level).toUpperCase()}
    </span>
  );
}

/**
 * Renders a list of citations (PMIDs + sources) preceded by an "Evidence:" label.
 */
export function CitationList({ pmids, sources }: { pmids?: string[]; sources?: string[] }) {
  if ((!pmids || pmids.length === 0) && (!sources || sources.length === 0)) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      <span className="text-xs text-gray-400">Evidence:</span>
      {pmids?.filter(Boolean).map(pmid => (
        <CitationLink key={pmid} pmid={pmid} />
      ))}
      {sources?.map(source => (
        <CitationLink key={source} source={source} />
      ))}
    </div>
  );
}
