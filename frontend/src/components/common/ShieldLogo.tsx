interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'full' | 'icon' | 'badge';
}

export default function ShieldLogo({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = true,
  variant = 'full',
}: Props) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const titleSizes = {
    sm: 'text-sm tracking-tight',
    md: 'text-base tracking-tight',
    lg: 'text-lg tracking-tight',
    xl: 'text-xl tracking-tight',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Shield Funding Crest from shieldfunding.com */}
      <div className={`relative flex items-center justify-center flex-shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 706 845"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="sf_crest_silver" gradientUnits="userSpaceOnUse" x1="0" y1="421" x2="705" y2="421">
              <stop offset="0%" stopColor="#585757" />
              <stop offset="50%" stopColor="#A8ABA9" />
              <stop offset="100%" stopColor="#D2D5D4" />
            </linearGradient>
            <radialGradient id="sf_crest_blue1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#349CCA" />
              <stop offset="100%" stopColor="#225D8A" />
            </radialGradient>
            <radialGradient id="sf_crest_blue2" cx="60%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#54BFEC" />
              <stop offset="100%" stopColor="#32739F" />
            </radialGradient>
          </defs>
          <g>
            {/* Outer Rim: Polished Silver Gradient */}
            <path
              fill="url(#sf_crest_silver)"
              d="M352.44 843.05l-54.75 -39.08c-186.44,-132.9 -297.69,-348.72 -297.69,-577.33 0,-2.53 0,-4.98 0,-7.52l2.32 -78.01 77.12 -12.42c78.09,-12.57 153.67,-43.54 218.25,-89.58l54.75 -39.12 54.76 39.1c64.78,46.06 140.17,77.04 218.25,89.59l77.12 12.42 2.32 78.11c0,2.43 0,4.9 0,7.42 0,228.63 -111.25,444.47 -297.5,577.33l-54.95 39.08zm0 -785.31l-27.57 19.65c-70.37,50.23 -152.7,84 -237.92,97.71l-38.75 6.22 -1.16 39.24c0,2.06 0,4.03 0,6.07 0,213.45 103.73,414.97 277.83,539.03l27.57 19.65 27.57 -19.65c174.1,-124.07 277.83,-325.57 277.83,-539.03 0,-2.05 0,-4.01 0,-6.04l-1.16 -39.26 -38.75 -6.25c-85.22,-13.69 -167.35,-47.49 -237.92,-97.73l-27.57 -19.63z"
            />
            {/* Crisp Pure White Inner Bevel */}
            <path
              fill="#FEFEFE"
              d="M324.87 765.67l27.57 19.65 27.57 -19.65c174.1,-124.07 277.83,-325.57 277.83,-539.03 0,-2.05 0,-4.01 0,-6.04l-1.16 -39.26 -38.75 -6.25c-85.22,-13.69 -167.35,-47.49 -237.92,-97.73l-27.57 -19.63 -27.57 19.65c-70.37,50.23 -152.7,84 -237.92,97.71l-38.75 6.22 -1.16 39.24c0,2.06 0,4.03 0,6.07 0,213.45 103.73,414.97 277.83,539.03z"
            />
            {/* Left Deep Cyan/Blue Facet */}
            <path
              fill="url(#sf_crest_blue1)"
              d="M352.44 727.02c-156.17,-111.35 -257.97,-293.97 -257.97,-500.38 0,-1.56 0,-3.09 0,-4.67 65.94,-10.59 128.41,-31.66 185.48,-61.43 25.26,-13.15 49.36,-28.07 72.49,-44.5 75.19,53.56 162.92,90.64 257.97,105.92 0,1.58 0,3.1 0,4.67 0,-1.56 0,-3.09 0,-4.67 -95.06,-15.29 -182.78,-52.36 -257.97,-105.92 -23.14,16.43 -47.23,31.35 -72.49,44.5 -4.43,30.48 -6.55,61.68 -6.55,93.39 0,157.65 55.91,302.18 149.03,414.91 -21.79,21.09 -45.31,40.51 -69.99,58.17z"
            />
            {/* Right Highlight Cyan/Blue Facet */}
            <path
              fill="url(#sf_crest_blue2)"
              d="M422.43 668.85c-93.12,-112.73 -149.03,-257.26 -149.03,-414.91 0,-31.71 2.12,-62.91 6.55,-93.39 25.26,-13.15 49.36,-28.07 72.49,-44.5 75.19,53.56 162.92,90.64 257.97,105.92 0,1.58 0,3.1 0,4.67 0,173.68 -72.11,330.52 -187.99,442.21z"
            />
          </g>
        </svg>
      </div>

      {/* Official Brand Typography matching shieldfunding.com */}
      {showText && variant !== 'icon' && (
        <div className="flex flex-col leading-none min-w-0">
          <div className="flex items-center gap-1.5 font-sans">
            <span className={`font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 ${titleSizes[size]}`}>
              SHIELD
            </span>
            <span className={`font-extrabold uppercase tracking-wider text-[#2B7A9D] dark:text-[#38bdf8] ${titleSizes[size]}`}>
              FUNDING
            </span>
          </div>
          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`font-semibold tracking-wider uppercase text-emerald-500 dark:text-emerald-400 ${subtitleSizes[size]}`}>
                AI Assistant
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
