import { Link, useLocation } from "react-router-dom";
import { Home, Tag, Package, User, Menu } from "lucide-react";

export default function BottomNavigation() {
  const { pathname, search } = useLocation();

  const items = [
    { label: "Home", to: "/", Icon: Home },
    { label: "My Profile", to: "/profile", Icon: User },
    { label: "My Offers", to: "/shop?sort=discount-desc", Icon: Tag, badge: "NEW" },
    { label: "My Orders", to: "/orders", Icon: Package },
    { label: "More", to: "/profile", Icon: Menu },
  ];

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    if (to.includes("sort=discount-desc")) return search.includes("sort=discount-desc");
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
              className={`flex flex-col items-center justify-center min-h-[60px] gap-0.5 transition-colors ${
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
