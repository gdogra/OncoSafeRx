import React from 'react';

type Props = {
  drugName: string;
  targets: string[];
  enzymes: string[];
  selectedTarget?: string | null;
  selectedEnzyme?: string | null;
  onSelectTarget?: (name: string) => void;
  onSelectEnzyme?: (name: string) => void;
  className?: string;
};

// Lightweight static pathway diagram: targets on the left, enzymes on the right, with connecting edges.
// Highlights selected node with thicker stroke and glow.
const PathwayDiagram: React.FC<Props> = ({
  drugName,
  targets,
  enzymes,
  selectedTarget,
  selectedEnzyme,
  onSelectTarget,
  onSelectEnzyme,
  className = ''
}) => {
  const width = 640;
  const height = Math.max(280, Math.max(targets.length, enzymes.length) * 60 + 40);
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const colLeftX = margin.left + 120;
  const colRightX = width - margin.right - 120;
  const stepLeft = (height - margin.top - margin.bottom) / Math.max(1, targets.length);
  const stepRight = (height - margin.top - margin.bottom) / Math.max(1, enzymes.length);

  const leftNodes = targets.map((t, i) => ({ name: t, x: colLeftX, y: margin.top + stepLeft * (i + 0.5) }));
  const rightNodes = enzymes.map((e, i) => ({ name: e, x: colRightX, y: margin.top + stepRight * (i + 0.5) }));

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.0" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Title */}
        <text x={width / 2} y={16} textAnchor="middle" className="fill-gray-700 text-[12px]">
          {drugName || 'Drug'} mechanism and metabolism overview
        </text>

        {/* Edges connecting all targets to all enzymes */}
        <g>
          {leftNodes.map(ln => (
            rightNodes.map(rn => {
              const isEmph = (selectedTarget && ln.name === selectedTarget) || (selectedEnzyme && rn.name === selectedEnzyme);
              const id = `${ln.name}->${rn.name}`;
              return (
                <g key={id}>
                  <defs>
                    <marker id={`arrow-${id}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0 0, 6 3, 0 6" fill={isEmph ? '#60a5fa' : '#e5e7eb'} />
                    </marker>
                  </defs>
                  <line
                    x1={ln.x + 30}
                    y1={ln.y}
                    x2={rn.x - 30}
                    y2={rn.y}
                    stroke={isEmph ? '#93c5fd' : '#e5e7eb'}
                    strokeWidth={isEmph ? 2 : 1}
                    strokeDasharray={isEmph ? '6 3' : '3 3'}
                    opacity={isEmph ? 0.95 : 0.7}
                    markerEnd={`url(#arrow-${id})`}
                  >
                    {isEmph && (
                      <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.2s" repeatCount="indefinite" />
                    )}
                  </line>
                </g>
              );
            })
          ))}
        </g>

        {/* Left column (targets) */}
        <g>
          <text x={colLeftX} y={margin.top - 4} textAnchor="middle" className="fill-gray-600 text-[11px]">
            Molecular Targets
          </text>
          {leftNodes.map((n) => {
            const selected = selectedTarget === n.name;
            return (
              <g key={n.name} transform={`translate(${n.x}, ${n.y})`} className="cursor-pointer" onClick={() => onSelectTarget && onSelectTarget(n.name)}>
                <circle r={18} fill="#dbeafe" stroke={selected ? '#2563eb' : '#60a5fa'} strokeWidth={selected ? 3 : 1.5} filter={selected ? 'url(#glow)' : undefined} />
                <text x={0} y={4} textAnchor="middle" className="fill-[#1e3a8a] text-[10px] font-medium">
                  {n.name.length > 8 ? n.name.slice(0, 7) + '…' : n.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Right column (enzymes) */}
        <g>
          <text x={colRightX} y={margin.top - 4} textAnchor="middle" className="fill-gray-600 text-[11px]">
            Metabolizing Enzymes
          </text>
          {rightNodes.map((n) => {
            const selected = selectedEnzyme === n.name;
            return (
              <g key={n.name} transform={`translate(${n.x}, ${n.y})`} className="cursor-pointer" onClick={() => onSelectEnzyme && onSelectEnzyme(n.name)}>
                <rect x={-18} y={-18} width={36} height={36} rx={8} fill="#d1fae5" stroke={selected ? '#059669' : '#34d399'} strokeWidth={selected ? 3 : 1.5} filter={selected ? 'url(#glow)' : undefined} />
                <text x={0} y={4} textAnchor="middle" className="fill-[#065f46] text-[10px] font-medium">
                  {n.name.length > 8 ? n.name.slice(0, 7) + '…' : n.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default PathwayDiagram;
