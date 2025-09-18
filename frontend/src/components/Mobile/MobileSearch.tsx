import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, Camera, Filter } from 'lucide-react';

interface MobileSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onFilter?: () => void;
  showVoiceSearch?: boolean;
  showCamera?: boolean;
  showFilter?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const MobileSearch: React.FC<MobileSearchProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  onSubmit,
  onFilter,
  showVoiceSearch = false,
  showCamera = false,
  showFilter = false,
  autoFocus = false,
  className = ""
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      if (onSubmit) {
        onSubmit(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleCameraSearch = () => {
    // In a real implementation, this would open camera for OCR
    // For now, we'll just show an alert
    alert('Camera search feature coming soon!');
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          flex items-center bg-white rounded-2xl border-2 transition-all duration-200
          ${isFocused 
            ? 'border-primary-500 shadow-lg shadow-primary-100' 
            : 'border-gray-200 shadow-sm'
          }
        `}>
          {/* Search Icon */}
          <div className="pl-4 pr-2">
            <Search className={`w-5 h-5 transition-colors ${
              isFocused ? 'text-primary-600' : 'text-gray-400'
            }`} />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 py-3 text-base text-gray-900 placeholder-gray-500 bg-transparent border-0 focus:outline-none focus:ring-0"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 pr-2">
            {/* Clear Button */}
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice Search */}
            {showVoiceSearch && (
              <button
                type="button"
                onClick={handleVoiceSearch}
                disabled={isListening}
                className={`p-2 rounded-full transition-colors ${
                  isListening 
                    ? 'text-red-600 bg-red-100 animate-pulse' 
                    : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            {/* Camera Search */}
            {showCamera && (
              <button
                type="button"
                onClick={handleCameraSearch}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Button (Outside input) */}
        {showFilter && (
          <button
            type="button"
            onClick={onFilter}
            className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Voice Search Status */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
          <p className="text-xs text-red-600 mt-1">Speak clearly into your device</p>
        </div>
      )}

      {/* Search Suggestions/History */}
      {isFocused && !value && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-3 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h4>
            <div className="space-y-1">
              {['aspirin', 'warfarin', 'doxorubicin'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    onChange(term);
                    if (onSubmit) onSubmit(term);
                  }}
                  className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded"
                >
                  <Search className="w-3 h-3 text-gray-400" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="p-2 text-xs text-center bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                Check Interactions
              </button>
              <button
                type="button"
                className="p-2 text-xs text-center bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
              >
                Find Trials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSearch;