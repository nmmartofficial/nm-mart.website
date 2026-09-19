import { Link, useLocation } from "react-router-dom";
import { Home, Tag, Package, User, Grid2X2 } from "lucide-react";

export default function BottomNavigation() {
  const { pathname, search } = useLocation();

  const items = [
    { label: "Home", to: "/", Icon: Home },
    { label: "Categories", to: "/categories", Icon: Grid2X2 },
    { label: "Offers", to: "/shop?offers=25", Icon: Tag },
    { label: "Orders", to: "/orders", Icon: Package },
    { label: "Account", to: "/profile", Icon: User },
  ];

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    if (to.includes("sort=discount-desc")) return search.includes("sort=discount-desc");
    if (to === "/categories") return pathname === "/categories";
    return pathname === to;
  };

  return (
    <nav className="fixed left-0 right-0 bottom-0 z-50 w-full max-w-[100vw] overflow-x-hidden md:hidden border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="grid w-full max-w-[100vw] grid-cols-5">
        {items.map(({ label, to, Icon, badge }) => {
          const active = isActive(to);
          return (
            <Link
              key={label}
              to={to}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? "text-blue-700" : "text-slate-500"
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
  );
}
