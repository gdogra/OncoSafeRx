import React, { useState, useMemo } from 'react';
import { ChevronDown, Phone } from 'lucide-react';

// Popular country codes for medical professionals
const COUNTRIES = [
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'IL', name: 'Israel', dial: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
];

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = "Enter phone number"
}) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to US
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Parse existing value to extract country code and number
  const { displayNumber } = useMemo(() => {
    if (!value) return { displayNumber: '' };
    
    // Find matching country code
    const matchingCountry = COUNTRIES.find(country => 
      value.startsWith(country.dial)
    );
    
    if (matchingCountry && matchingCountry.code !== selectedCountry.code) {
      setSelectedCountry(matchingCountry);
    }
    
    const displayNumber = matchingCountry 
      ? value.slice(matchingCountry.dial.length)
      : value;
    
    return { displayNumber };
  }, [value, selectedCountry.code]);

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return COUNTRIES;
    return COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dial.includes(searchTerm)
    );
  }, [searchTerm]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value.replace(/[^\d]/g, ''); // Only digits
    const fullNumber = selectedCountry.dial + number;
    onChange(fullNumber);
  };

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchTerm('');
    // Update the full number with new country code
    const number = displayNumber.replace(/[^\d]/g, '');
    onChange(country.dial + number);
  };

  const formatDisplayNumber = (number: string) => {
    // Basic formatting - you could add more sophisticated formatting per country
    const digits = number.replace(/[^\d]/g, '');
    if (selectedCountry.code === 'US' || selectedCountry.code === 'CA') {
      // Format as (XXX) XXX-XXXX
      if (digits.length >= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      } else if (digits.length >= 3) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      }
    }
    return digits;
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <div className="flex">
          {/* Country Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
              className={`flex items-center space-x-2 px-3 py-2 border border-r-0 rounded-l-md bg-gray-50 hover:bg-gray-100 transition-colors ${
                error ? 'border-red-300' : 'border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium text-gray-700">{selectedCountry.dial}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Country Dropdown */}
            {isOpen && (
              <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center space-x-3"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium text-gray-900">{country.dial}</span>
                      <span className="text-sm text-gray-600">{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <div className="flex-1 relative">
            <input
              type="tel"
              value={formatDisplayNumber(displayNumber)}
              onChange={handleNumberChange}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className={`block w-full border rounded-r-md px-3 py-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Close dropdown when clicking outside */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        Complete international number: {value || `${selectedCountry.dial}...`}
      </p>
    </div>
  );
};

export default PhoneInput;