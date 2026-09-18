import React from 'react';
import churchLogoImg from '../assets/images/church_logo_1789720893121.jpg';
import { CHURCH_NAME, CHURCH_TAGLINE } from '../lib/constants';

interface ChurchLogoProps {
  variant?: 'icon' | 'full' | 'image' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * DNA Double Helix vector mark faithfully representing The NewBrook emblem
 */
export const ChurchHelixSvg: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-full h-full',
  color = 'currentColor'
}) => {
  return (
    <svg
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="The NewBrook emblem"
    >
      {/* Outer upper ribbon curve */}
      <path
        d="M 28 64 C 28 32, 68 24, 96 48 C 124 72, 140 112, 168 112 C 196 112, 212 72, 240 48 C 268 24, 308 32, 308 64"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Outer lower ribbon curve */}
      <path
        d="M 28 96 C 28 128, 68 136, 96 112 C 124 88, 140 48, 168 48 C 196 48, 212 88, 240 112 C 268 136, 308 128, 308 96"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner complementary wave ribbons forming the thick dual contour */}
      <path
        d="M 38 72 C 38 48, 70 42, 94 62 C 118 82, 142 120, 168 120 C 194 120, 218 82, 242 62 C 266 42, 298 48, 298 72"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />

      {/* Left segment vertical structure / ladder rung */}
      <rect x="42" y="44" width="8" height="72" rx="3" fill={color} />
      <path
        d="M 50 56 H 70 C 78 56, 82 62, 82 70 C 82 78, 78 84, 70 84 H 50"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="62" y="56" width="8" height="48" rx="2" fill={color} />

      {/* Center segment vertical structure / ladder rung */}
      <rect x="150" y="54" width="8" height="52" rx="3" fill={color} />
      <path
        d="M 158 64 H 174 C 182 64, 186 70, 186 80 C 186 90, 182 96, 174 96 H 158"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="178" y="54" width="8" height="52" rx="3" fill={color} />

      {/* Right segment vertical structure / ladder rung */}
      <rect x="250" y="44" width="8" height="72" rx="3" fill={color} />
      <path
        d="M 258 56 H 278 C 286 56, 290 62, 290 70 C 290 78, 286 84, 278 84 H 258"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="270" y="56" width="8" height="48" rx="2" fill={color} />
    </svg>
  );
};

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  variant = 'compact',
  size = 'md',
  className = '',
  theme = 'light'
}) => {
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const taglineColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  if (variant === 'image') {
    const imgHeights = {
      sm: 'h-8',
      md: 'h-12',
      lg: 'h-16',
      xl: 'h-24'
    };

    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={churchLogoImg}
          alt={`${CHURCH_NAME} Logo`}
          referrerPolicy="no-referrer"
          className={`${imgHeights[size]} w-auto object-contain rounded-lg`}
        />
      </div>
    );
  }

  if (variant === 'icon') {
    const iconSizes = {
      sm: 'w-7 h-5',
      md: 'w-10 h-7',
      lg: 'w-14 h-9',
      xl: 'w-20 h-12'
    };

    return (
      <div className={`flex items-center justify-center ${iconSizes[size]} ${className}`}>
        <ChurchHelixSvg color="currentColor" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-8 flex items-center justify-center text-slate-900 shrink-0">
          <ChurchHelixSvg color="currentColor" />
        </div>
        <div className="leading-tight">
          <div className={`font-bold tracking-tight text-sm sm:text-base ${textColor}`}>
            {CHURCH_NAME}
          </div>
          <div className={`text-[10px] tracking-tight italic font-medium -mt-0.5 ${taglineColor}`}>
            {CHURCH_TAGLINE}
          </div>
        </div>
      </div>
    );
  }

  // Full variant with centered mark, brand name, and tagline
  const containerPaddings = {
    sm: 'space-y-1.5',
    md: 'space-y-2',
    lg: 'space-y-3',
    xl: 'space-y-4'
  };

  const markHeights = {
    sm: 'h-8 w-24',
    md: 'h-12 w-36',
    lg: 'h-16 w-48',
    xl: 'h-20 w-60'
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const tagSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center text-center ${containerPaddings[size]} ${className}`}>
      <div className={`${markHeights[size]} flex items-center justify-center text-slate-900`}>
        <ChurchHelixSvg color="currentColor" />
      </div>
      <div>
        <h1 className={`font-bold tracking-tight ${titleSizes[size]} ${textColor} leading-tight`}>
          {CHURCH_NAME}
        </h1>
        <p className={`font-medium italic tracking-tight ${tagSizes[size]} ${taglineColor} mt-0.5`}>
          {CHURCH_TAGLINE}
        </p>
      </div>
    </div>
  );
};
