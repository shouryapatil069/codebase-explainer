import React, { useMemo } from 'react';

interface DottedBackgroundProps {
  dotColor?: string;
  backgroundColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  enableVignette?: boolean;
  vignetteColor?: string;
  enableInnerGlow?: boolean;
  innerGlowColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DottedBackground: React.FC<DottedBackgroundProps> = ({
  dotColor = '#215769',
  backgroundColor = 'transparent',
  dotSize = 2,
  dotSpacing = 10,
  enableVignette = true,
  vignetteColor = 'rgb(0,0,0)',
  enableInnerGlow = true,
  innerGlowColor = 'rgb(0,0,0)',
  className = '',
  style = {},
}) => {
  const ids = useMemo(() => {
    const baseId = `dotted-bg-${Math.random().toString(36).substr(2, 9)}`;
    return { pattern: `${baseId}-pattern`, vignette: `${baseId}-vignette`, innerGlow: `${baseId}-inner-glow` };
  }, []);

  return (
    <div className={`w-full h-full absolute inset-0 -z-10 ${className}`} style={style}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id={ids.pattern} width={dotSpacing} height={dotSpacing} patternUnits="userSpaceOnUse">
            <circle cx={dotSpacing / 2} cy={dotSpacing / 2} r={dotSize} fill={dotColor} />
          </pattern>
          {enableVignette && (
            <radialGradient id={ids.vignette} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="40%" stopColor={vignetteColor} stopOpacity="0" />
              <stop offset="100%" stopColor={vignetteColor} stopOpacity="1" />
            </radialGradient>
          )}
          {enableInnerGlow && (
            <radialGradient id={ids.innerGlow} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="50%" stopColor={innerGlowColor} stopOpacity="0.7" />
              <stop offset="100%" stopColor={innerGlowColor} stopOpacity="0" />
            </radialGradient>
          )}
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill={backgroundColor} stroke="none" />
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${ids.pattern})`} stroke="none" />
        {enableVignette && <rect x="0" y="0" width="100%" height="100%" fill={`url(#${ids.vignette})`} stroke="none" />}
        {enableInnerGlow && <circle cx="50%" cy="50%" r="25%" fill={`url(#${ids.innerGlow})`} stroke="none" />}
      </svg>
    </div>
  );
};

export { DottedBackground }
