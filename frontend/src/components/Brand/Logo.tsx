import React from 'react';

type Size = 'sm' | 'md' | 'lg';
type Tone = 'light' | 'dark';

type LogoMarkProps = {
  size?: number;
  className?: string;
  monochrome?: boolean;
  title?: string;
};

export const LogoMark: React.FC<LogoMarkProps> = ({
  size = 28,
  className,
  monochrome = false,
  title,
}) => {
  const stroke = monochrome ? 'currentColor' : '#2563eb';
  const accent = monochrome ? 'currentColor' : '#14b8a6';
  const decorative = !title;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={title}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M12 2.5 L20.23 7.25 L20.23 16.75 L12 21.5 L3.77 16.75 L3.77 7.25 Z"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M20.23 7.25 L13 11.5"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="13" cy="11.5" r="2.1" fill={accent} />
    </svg>
  );
};

const SIZES: Record<Size, { mark: number; name: string; tag: string; gap: string }> = {
  sm: { mark: 24, name: 'text-base', tag: 'text-[10px]', gap: 'gap-2' },
  md: { mark: 32, name: 'text-xl', tag: 'text-xs', gap: 'gap-2.5' },
  lg: { mark: 48, name: 'text-2xl', tag: 'text-sm', gap: 'gap-3' },
};

type LogoProps = {
  size?: Size;
  tagline?: boolean;
  wordmark?: boolean;
  tone?: Tone;
  monochrome?: boolean;
  className?: string;
};

export const TAGLINE = 'Precision oncology decision support';

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  tagline = false,
  wordmark = true,
  tone = 'light',
  monochrome = false,
  className = '',
}) => {
  const s = SIZES[size];
  const nameColor =
    tone === 'dark' ? 'text-white' : 'text-gray-900 dark:text-gray-100';
  const tagColor =
    tone === 'dark' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400';
  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark size={s.mark} monochrome={monochrome} title="OncoSafeRx" />
      {wordmark && (
        <span className="flex flex-col leading-tight min-w-0">
          <span className={`${s.name} font-semibold tracking-tight ${nameColor}`}>
            OncoSafeRx
          </span>
          {tagline && (
            <span className={`${s.tag} ${tagColor} truncate`}>{TAGLINE}</span>
          )}
        </span>
      )}
    </span>
  );
};

export default Logo;
