import { Link } from "react-router-dom";

const announcementConfig = {
  englishTitle: "NM MART WEBSITE UPDATE IN PROGRESS",
  englishBody: "We are currently improving our website to give you a better and smoother shopping experience.",
  englishFooter: "Thank you for your patience and support.",
  hindiBody: "हम आपको और बेहतर और आसान Shopping Experience देने के लिए वेबसाइट को अपडेट कर रहे हैं।",
  hindiFooter: "आपके सहयोग और धैर्य के लिए धन्यवाद।",
  storeName: "NM MART",
  tagline: "SHOP MORE, SAVE MORE",
  address: "Naya Nagar, Dhata Road, Manjhanpur, Kaushambi",
  website: "NMmart.in",
  websiteUrl: "/",
  phone: "+91 8282827240",
  phoneHref: "tel:+918282827240",
};

export default function SiteUpdateBanner() {
  return (
    <div className="relative z-[60] w-full border-b border-[#f0e3d4] bg-[linear-gradient(180deg,#fffaf3_0%,#fffdf9_100%)] text-slate-800 shadow-[0_12px_28px_-26px_rgba(15,23,42,0.4)]">
      <div className="mx-auto max-w-[1500px] px-2.5 py-2 sm:px-3 sm:py-2.5 lg:px-6">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9.5px] font-black uppercase tracking-[0.14em] text-[#1f2937] sm:text-[10.5px] lg:text-[11px]">
            <span aria-hidden="true">🚧</span>
            <span>{announcementConfig.englishTitle}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-0.5 text-center text-[9.5px] leading-[1.45] text-slate-700 sm:text-[10.5px]">
            <p className="max-w-[1200px]">{announcementConfig.englishBody}</p>
            <p className="max-w-[1200px]">{announcementConfig.hindiBody}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[9.5px] font-semibold text-slate-700 sm:text-[10px]">
            <span className="font-black uppercase tracking-[0.1em] text-slate-900">{announcementConfig.storeName}</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="font-black uppercase tracking-[0.08em] text-slate-900">{announcementConfig.tagline}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[9.5px] text-slate-700 sm:text-[10px]">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">📍</span>
              <span>{announcementConfig.address}</span>
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <Link to={announcementConfig.websiteUrl} className="inline-flex items-center gap-1 font-semibold text-slate-800 underline-offset-2 hover:underline">
              <span aria-hidden="true">🌐</span>
              <span>{announcementConfig.website}</span>
            </Link>
            <span className="hidden sm:inline text-slate-400">|</span>
            <a href={announcementConfig.phoneHref} className="inline-flex items-center gap-1 font-semibold text-slate-800 underline-offset-2 hover:underline">
              <span aria-hidden="true">📞</span>
              <span>{announcementConfig.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
