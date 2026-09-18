const tickerItems = [
  "🚧 NM MART WEBSITE UPDATE IN PROGRESS",
  "हम आपको बेहतर और आसान Shopping Experience देने के लिए वेबसाइट को अपडेट कर रहे हैं।",
  "📍 Naya Nagar, Dhata Road, Manjhanpur, Kaushambi",
  "🌐 NMmart.in",
  "📞 +91 8282827240",
  "NM MART",
  "SHOP MORE, SAVE MORE",
];

const tickerContent = [...tickerItems, ...tickerItems];

export default function AnnouncementTicker() {
  return (
    <div className="relative z-[60] w-full border-b border-[#f1e2d2] bg-[#171717] text-white shadow-[0_8px_18px_-14px_rgba(0,0,0,0.45)]">
      <div className="announcement-ticker h-[34px] overflow-hidden sm:h-[38px]">
        <div className="announcement-track flex h-full w-max min-w-max items-center whitespace-nowrap">
          {tickerContent.map((item, index) => (
            <div key={`${item}-${index}`} className="flex shrink-0 items-center gap-2.5 px-1 sm:gap-3">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] sm:text-[10.5px]">
                {item}
              </span>
              {index < tickerContent.length - 1 && (
                <span className="text-[11px] font-bold text-[#ffb067] sm:text-[12px]" aria-hidden="true">
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
