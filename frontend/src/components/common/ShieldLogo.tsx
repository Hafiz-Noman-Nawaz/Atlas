
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
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Shield Funding Crest SVG */}
      <div className={`relative flex items-center justify-center flex-shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
          {/* Shield Outer Body */}
          <path
            d="M24 4L7 10V22C7 32.5 14.2 42.2 24 45C33.8 42.2 41 32.5 41 22V10L24 4Z"
            fill="#023047"
          />
          {/* Shield Inner Gradient Layer */}
          <path
            d="M24 6.5L9.5 11.5V22C9.5 31 15.6 39.5 24 42C32.4 39.5 38.5 31 38.5 22V11.5L24 6.5Z"
            fill="url(#shield_grad)"
          />
          {/* Emerald Checkmark & Growth Arrow */}
          <path
            d="M17 23.5L22 28.5L31 17.5"
            stroke="#1BD582"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Star Trust Element */}
          <path
            d="M24 10.5L25.2 13.8L28.8 14L26 16.3L27 19.8L24 18L21 19.8L22 16.3L19.2 14L22.8 13.8L24 10.5Z"
            fill="#06C18C"
            opacity="0.9"
          />
          <defs>
            <linearGradient id="shield_grad" x1="24" y1="6.5" x2="24" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0B1E2E" />
              <stop offset="1" stopColor="#023047" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && variant !== 'icon' && (
        <div className="flex flex-col leading-tight min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight text-[#023047] dark:text-white ${titleSizes[size]}`}>
              SHIELD
            </span>
            <span className={`font-semibold tracking-tight text-[#137499] dark:text-[#38bdf8] ${titleSizes[size]}`}>
              FUNDING
            </span>
          </div>
          {showSubtitle && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`font-semibold tracking-wider uppercase text-[#06C18C] dark:text-[#1BD582] ${subtitleSizes[size]}`}>
                AI Assistant
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1BD582] animate-pulse" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
