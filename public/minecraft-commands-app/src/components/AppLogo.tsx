import React, { memo } from 'react';

interface AppLogoProps {
  className?: string;
  glowColor?: string;
  type?: 'terminal' | 'wiki' | 'lab' | 'leaderboard';
}

const AppLogo = memo(({ className = "w-12 h-12", glowColor = "rgba(0, 229, 255, 0.3)", type = 'terminal' }: AppLogoProps) => {
  const [imgError, setImgError] = React.useState(false);

  // Interior color based on section
  const interiorColor = type === 'wiki' ? '#A855F7' : 
                        type === 'leaderboard' ? '#EAB308' : 
                        '#00E5FF';

  return (
    <div className={`${className} relative group transition-all duration-300 hover:scale-110 active:scale-95`}>
      {!imgError ? (
        <img 
          src="/logo.png" 
          alt="Commands for Minecraft"
          className="w-full h-full object-contain rounded-xl"
          style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl" style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}>
          {/* Main Background & Border */}
          <rect x="4" y="4" width="92" height="92" rx="12" fill="#111827" stroke="#4B5563" strokeWidth="2" />
          <rect x="6" y="6" width="88" height="88" rx="10" fill="#3B82F6" opacity="0.3" />
          
          {/* Minecraft Landscape Hint */}
          <path d="M6 60 L94 60 L94 94 L6 94 Z" fill="#166534" />
          
          {/* Minecraft Block */}
          <g transform="translate(50, 45) scale(0.8)">
             <path d="M-30 0 L0 15 L30 0 L30 -30 L0 -45 L-30 -30 Z" fill="#3A2414" />
             <path d="M-30 -30 L0 -15 L30 -30 L0 -45 Z" fill="#4DA33A" />
             <path d="M-30 -30 L0 -15 L0 15 L-30 0 Z" fill="#583B23" />
             <path d="M0 -15 L30 -30 L30 0 L0 15 Z" fill="#2E1609" />
             <path d="M-30 -30 L-20 -25 L-20 -20 L-10 -15 L0 -15 L10 -15 L20 -20 L20 -25 L30 -30 L30 -25 L20 -20 L10 -15 L0 -10 L-10 -15 L-20 -20 L-30 -25 Z" fill="#3D8B2D" />
          </g>

          <g transform="translate(45, 60) rotate(-45)">
             <rect x="-2" y="-15" width="4" height="30" fill="#4B311A" />
             <path d="M-12 -15 H12 L0 -5 Z" fill="#9CA3AF" stroke="#1F2937" strokeWidth="1" />
          </g>

          <rect x="18" y="24" width="64" height="20" fill="#000" rx="2" stroke={interiorColor} strokeWidth="1" />
          <text x="50" y="38" textAnchor="middle" fill="#FFF" fontSize="6" fontFamily="monospace" fontWeight="bold">
            <tspan fill={interiorColor}>&gt;_</tspan> /COMMANDS
          </text>

          <rect x="12" y="72" width="76" height="18" fill="rgba(0,0,0,0.8)" rx="4" />
          <text x="50" y="81" textAnchor="middle" fill="#FFF" fontSize="5" fontWeight="bold" fontFamily="monospace">STATION_ONLINE</text>
          <text x="50" y="87" textAnchor="middle" fill="#FFF" fontSize="5" fontWeight="bold" fontFamily="monospace">v{document.querySelector('meta[name="version"]')?.getAttribute('content') || '2.1'}</text>
        </svg>
      )}
    </div>
  );
});

export default AppLogo;
