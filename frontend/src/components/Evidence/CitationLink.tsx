import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Props {
  pmid?: string;
  source?: string;
  className?: string;
}

/**
 * Renders a clickable PMID link to PubMed, or a source label.
 * Used throughout the app to provide evidence citations.
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

function sourceToUrl(source: string): string | null {
  const s = source.toLowerCase();
  if (s.includes('cpic')) return 'https://cpicpgx.org/guidelines/';
  if (s.includes('fda')) return 'https://www.fda.gov/drugs/science-and-research/table-pharmacogenomic-biomarkers-drug-labeling';
  if (s.includes('nccn')) return 'https://www.nccn.org/guidelines/';
  if (s.includes('dpwg')) return 'https://www.pharmgkb.org/page/dpwg';
  if (s.includes('pharmgkb')) return 'https://www.pharmgkb.org/';
  return null;
}

/**
 * Renders a list of citations (PMIDs + sources).
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
