import React from 'react';

interface AgroShieldLogoProps {
  variant?: 'full' | 'compact' | 'mark' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const AgroShieldLogo: React.FC<AgroShieldLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: { icon: 'h-7 w-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'h-9 w-9', text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 'h-12 w-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'h-16 w-16', text: 'text-3xl', sub: 'text-sm' },
  };

  const { icon, text, sub } = sizeMap[size];

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/logo.svg"
          alt="AgroShield Crest"
          className={`${icon} object-contain transition-transform duration-200 hover:scale-105`}
          loading="eager"
        />
      </div>
    );
  }

  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src="/logo.svg"
          alt="AgroShield Logo"
          className={`${icon} object-contain filter drop-shadow-xs`}
          loading="eager"
        />
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1">
          <span className={`font-extrabold tracking-tight ${text} ${isWhite ? 'text-white' : 'text-slate-900'}`}>
            Agro<span className="text-emerald-600">Shield</span>
          </span>
        </div>
        {showSubtitle && variant !== 'compact' && (
          <span
            className={`font-semibold tracking-wider uppercase ${sub} ${
              isWhite ? 'text-emerald-200' : 'text-slate-500'
            }`}
          >
            Watershed Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
