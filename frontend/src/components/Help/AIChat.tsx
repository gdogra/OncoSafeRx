import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AI Chat placeholder — the previous implementation used Math.random
 * for generating fake clinical responses. Replaced with an honest
 * "coming soon" message until a real medical LLM is integrated.
 */
export default function AIChat({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Clinical Assistant</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          The AI clinical chat feature requires integration with a validated medical language model.
          For drug interactions and treatment guidance, use the <strong>Interaction Checker</strong> or
          <strong> Precision Medicine</strong> tools.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
