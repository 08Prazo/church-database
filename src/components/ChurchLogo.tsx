import React, { useState } from 'react';
import { CHURCH_BRANDING } from '../lib/constants';

interface ChurchLogoProps {
  variant?: 'mark' | 'horizontal' | 'vertical' | 'image';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  dark?: boolean;
  subtext?: string;
  photoUrl?: string;
}

/**
 * ChurchLogo renders the official logo of The NewBrook Church:
 * - Symbol: Stylized DNA double-helix intertwined with reinforcement pillars
 * - Title: The NewBrook
 * - Tagline: ...reinforcing your identity
 * - Supports photoUrl (Google Photos link or direct image link) with resilient fallback
 */
export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  dark = false,
  subtext = CHURCH_BRANDING.subtitle,
  photoUrl = CHURCH_BRANDING.photoUrl,
}) => {
  const [photoFailed, setPhotoFailed] = useState(false);

  // Symbol / mark sizes
  const markDimensions = {
    xs: { w: 32, h: 14 },
    sm: { w: 44, h: 18 },
    md: { w: 64, h: 26 },
    lg: { w: 96, h: 38 },
    xl: { w: 140, h: 56 },
  }[size];

  const primaryColor = dark ? '#ffffff' : '#0f172a'; // slate-900 or white
  const secondaryColor = dark ? '#94a3b8' : '#64748b'; // slate-400 or slate-500

  // Precise vector representation of The NewBrook DNA double-helix emblem
  const EmblemSvg = (
    <svg
      viewBox="0 0 320 120"
      width={markDimensions.w}
      height={markDimensions.h}
      className="shrink-0 transition-transform duration-200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="The NewBrook Church Emblem"
    >
      {/* Outer intertwined DNA double helix ribbon */}
      <path
        d="M 50 20
           C 85 20, 95 24, 115 50
           C 135 76, 145 100, 175 100
           C 205 100, 215 76, 235 50
           C 255 24, 265 20, 295 20
           C 310 20, 316 36, 316 60
           C 316 84, 310 100, 295 100
           C 265 100, 255 96, 235 70
           C 215 44, 205 20, 175 20
           C 145 20, 135 44, 115 70
           C 95 96, 85 100, 50 100
           C 35 100, 28 84, 28 60
           C 28 36, 35 20, 50 20 Z"
        stroke={primaryColor}
        strokeWidth="9"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Internal intertwined ribbon crossover lines */}
      <path
        d="M 50 34
           C 78 34, 88 38, 105 60
           C 122 82, 135 88, 175 88
           C 215 88, 228 82, 245 60
           C 262 38, 272 34, 295 34
           C 305 34, 305 48, 305 60
           C 305 72, 305 86, 295 86
           C 272 86, 262 82, 245 60
           C 228 38, 215 32, 175 32
           C 135 32, 122 38, 105 60
           C 88 82, 78 86, 50 86
           C 40 86, 40 72, 40 60
           C 40 48, 40 34, 50 34 Z"
        stroke={primaryColor}
        strokeWidth="7"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Left loop inner reinforcement pillar / bracket structure */}
      <path
        d="M 46 40 H 68 V 80 H 46"
        stroke={primaryColor}
        strokeWidth="7"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <line
        x1="68"
        y1="40"
        x2="68"
        y2="80"
        stroke={primaryColor}
        strokeWidth="7"
      />
      <line
        x1="86"
        y1="42"
        x2="86"
        y2="78"
        stroke={primaryColor}
        strokeWidth="7"
      />

      {/* Center loop vertical pillar structure */}
      <path
        d="M 162 44 V 76"
        stroke={primaryColor}
        strokeWidth="7"
      />
      <path
        d="M 188 44 V 76"
        stroke={primaryColor}
        strokeWidth="7"
      />
      <path
        d="M 162 44 H 188"
        stroke={primaryColor}
        strokeWidth="7"
      />
      <path
        d="M 162 76 H 188"
        stroke={primaryColor}
        strokeWidth="7"
      />

      {/* Right loop inner reinforcement pillar / bracket structure */}
      <line
        x1="234"
        y1="42"
        x2="234"
        y2="78"
        stroke={primaryColor}
        strokeWidth="7"
      />
      <path
        d="M 274 40 H 252 V 80 H 274"
        stroke={primaryColor}
        strokeWidth="7"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <line
        x1="252"
        y1="40"
        x2="252"
        y2="80"
        stroke={primaryColor}
        strokeWidth="7"
      />
    </svg>
  );

  // If variant is 'image', try the photo URL first; on error fallback to clean asset
  if (variant === 'image') {
    const imgSizeClasses = {
      xs: 'h-6 w-auto',
      sm: 'h-8 w-auto',
      md: 'h-12 w-auto',
      lg: 'h-20 w-auto',
      xl: 'h-32 w-auto',
    }[size];

    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src={!photoFailed && photoUrl ? photoUrl : CHURCH_BRANDING.fallbackLogoUrl}
          alt="The NewBrook Church Logo"
          className={`${imgSizeClasses} object-contain rounded-lg`}
          referrerPolicy="no-referrer"
          onError={() => setPhotoFailed(true)}
        />
      </div>
    );
  }

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {EmblemSvg}
      </div>
    );
  }

  if (variant === 'vertical') {
    const textSizes = {
      xs: { title: 'text-xs', sub: 'text-[9px]' },
      sm: { title: 'text-sm', sub: 'text-[10px]' },
      md: { title: 'text-lg', sub: 'text-xs' },
      lg: { title: 'text-2xl', sub: 'text-sm' },
      xl: { title: 'text-3xl', sub: 'text-base' },
    }[size];

    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="mb-2">
          {!photoFailed && photoUrl ? (
            <img
              src={photoUrl}
              alt="The NewBrook Logo"
              className="max-h-16 w-auto object-contain rounded-md"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            EmblemSvg
          )}
        </div>
        <div className="flex flex-col items-center">
          <span
            className={`font-extrabold tracking-tight ${textSizes.title}`}
            style={{ color: primaryColor }}
          >
            {CHURCH_BRANDING.name}
          </span>
          <span
            className={`italic font-medium -mt-0.5 tracking-tight ${textSizes.sub}`}
            style={{ color: secondaryColor }}
          >
            {subtext}
          </span>
        </div>
      </div>
    );
  }

  // Default: 'horizontal'
  const textSizes = {
    xs: { title: 'text-xs', sub: 'text-[9px]' },
    sm: { title: 'text-sm', sub: 'text-[10px]' },
    md: { title: 'text-base', sub: 'text-[11px]' },
    lg: { title: 'text-xl', sub: 'text-xs' },
    xl: { title: 'text-2xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {!photoFailed && photoUrl ? (
        <img
          src={photoUrl}
          alt="The NewBrook Logo"
          className="h-8 w-auto object-contain rounded-md shrink-0"
          referrerPolicy="no-referrer"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        EmblemSvg
      )}
      <div className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-tight ${textSizes.title}`}
          style={{ color: primaryColor }}
        >
          {CHURCH_BRANDING.name}
        </span>
        <span
          className={`italic font-medium text-slate-500 mt-1 ${textSizes.sub}`}
          style={{ color: secondaryColor }}
        >
          {subtext}
        </span>
      </div>
    </div>
  );
};
