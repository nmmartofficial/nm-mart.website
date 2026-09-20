const tickerItems = [
  "🔧 NM MART WEBSITE UPDATE",
  " We're cureently improving shopping experience.",
  "Some features may be temporarily unavailable.",
  "Thank you for your patience & support.",
];

const tickerContent = [...tickerItems, ...tickerItems];

export default function AnnouncementTicker() {
  return (
    <div className="relative z-[60] w-full max-w-[100vw] overflow-x-hidden border-b border-slate-200 bg-slate-100 text-slate-900 shadow-[0_8px_18px_-14px_rgba(15,23,42,0.35)]">
      <div className="announcement-ticker h-[34px] w-full overflow-hidden bg-slate-100 sm:h-[38px]">
        <div className="announcement-track flex h-full w-max min-w-max items-center whitespace-nowrap">
          {tickerContent.map((item, index) => (
            <div key={`${item}-${index}`} className="flex shrink-0 items-center gap-2.5 px-1 sm:gap-3">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-700 sm:text-[10.5px]">
                {item}
              </span>
              {index < tickerContent.length - 1 && (
                <span className="text-[11px] font-bold text-primary sm:text-[12px]" aria-hidden="true">
                  •
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
