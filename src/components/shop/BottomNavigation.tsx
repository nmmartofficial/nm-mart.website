import { Link, useLocation } from "react-router-dom";
import { Home, Tag, Package, MoreHorizontal, Grid2X2 } from "lucide-react";
import { useState } from "react";
import MoreDrawer from "@/components/shop/MoreDrawer";

export default function BottomNavigation() {
  const { pathname, search } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = [
    { label: "Home", to: "/", Icon: Home },
    { label: "Categories", to: "/categories", Icon: Grid2X2 },
    { label: "Offers", to: "/shop?offers=25", Icon: Tag },
    { label: "Orders", to: "/orders", Icon: Package },
    { label: "More", to: "", Icon: MoreHorizontal },
  ];

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    if (to.includes("sort=discount-desc")) return search.includes("sort=discount-desc");
    if (to === "/shop?offers=25") return pathname === "/shop" && search.includes("offers=25");
    if (to === "/categories") return pathname === "/categories";
    return pathname === to;
  };

  return (
    <>
      <nav className="fixed left-0 right-0 bottom-0 z-50 w-full max-w-[100vw] overflow-x-hidden border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid w-full max-w-[100vw] grid-cols-5">
          {items.map(({ label, to, Icon, badge }) => {
            const active = label === "More" ? moreOpen || pathname === "/profile" : isActive(to);

            if (label === "More") {
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-all duration-200 ${
                    active ? "bg-slate-100 text-slate-900" : "text-slate-500 active:bg-slate-100"
                  }`}
                  aria-expanded={moreOpen}
                  aria-controls="more-drawer"
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-[9px] font-bold tracking-tight ${active ? "font-black" : ""}`}>{label}</span>
                </button>
              );
            }

            return (
              <Link
                key={label}
                to={to}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition-all duration-200 ${
                  active ? "bg-slate-100 text-slate-900" : "text-slate-500 active:bg-slate-100"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  {badge && (
                    <span className="absolute -right-3 -top-1 rounded-full bg-red-600 px-1 py-0.5 text-[7px] font-black text-white">
                      {badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-bold tracking-tight ${active ? "font-black" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
