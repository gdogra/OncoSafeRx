import React from 'react';

function scorePassword(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  const letters: Record<string, number> = {};
  for (let i = 0; i < pw.length; i++) {
    letters[pw[i]] = (letters[pw[i]] || 0) + 1;
    score += 5.0 / letters[pw[i]];
  }
  const variations = {
    digits: /\d/.test(pw),
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    nonWords: /[^\w]/.test(pw),
  };
  let variationCount = 0;
  Object.values(variations).forEach(v => variationCount += v ? 1 : 0);
  score += (variationCount - 1) * 10;
  return Math.max(0, Math.min(100, Math.floor(score)));
}

export const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const score = scorePassword(password);
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const label = score >= 80 ? 'Strong' : score >= 60 ? 'Good' : score >= 40 ? 'Weak' : 'Very weak';
  return (
    <div className="mt-1">
      <div className="w-full h-2 bg-gray-200 rounded">
        <div className={`h-2 ${color} rounded`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
    </div>
  );
};

export default PasswordStrength;

