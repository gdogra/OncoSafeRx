import React from 'react';

type TourStep = {
  title: string;
  body: React.ReactNode;
  ctaLabel?: string;
  onCta?: () => void;
};

type Props = {
  open: boolean;
  steps: TourStep[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
};

const FeatureTour: React.FC<Props> = ({ open, steps, index, onClose, onNext, onPrev }) => {
  if (!open || steps.length === 0) return null;
  const step = steps[Math.max(0, Math.min(index, steps.length - 1))];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Feature Tour</div>
              <div className="text-lg font-semibold text-gray-900">{step.title}</div>
            </div>
            <button onClick={onClose} className="text-xs border rounded px-2 py-1">Close</button>
          </div>
          <div className="p-4">
            <div className="text-sm text-gray-800 space-y-3">{step.body}</div>
          </div>
          <div className="p-3 border-t flex items-center justify-between">
            <div className="text-xs text-gray-500">Step {index + 1} of {steps.length}</div>
            <div className="flex items-center gap-2">
              <button onClick={onPrev} disabled={isFirst} className={`px-2 py-1 text-xs border rounded ${isFirst ? 'opacity-50 cursor-not-allowed' : ''}`}>Back</button>
              {step.onCta && step.ctaLabel && (
                <button onClick={step.onCta} className="px-2 py-1 text-xs border rounded bg-gray-50 hover:bg-gray-100">{step.ctaLabel}</button>
              )}
              <button onClick={onNext} className={`px-2 py-1 text-xs rounded text-white ${isLast ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{isLast ? 'Done' : 'Next'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTour;

