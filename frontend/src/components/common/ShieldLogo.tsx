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
        <img
          src="/favicon.png"
          alt="Shield Funding"
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-sm"
          loading="eager"
        />
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
