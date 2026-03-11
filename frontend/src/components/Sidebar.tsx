import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type NavItem = { label: string; path: string; icon: string };

const navByRole: Record<string, NavItem[]> = {
  admin:    [{ label: "Dashboard",  path: "/admin",    icon: "package" }],
  staff:    [{ label: "Operations", path: "/staff",    icon: "ops"     }],
  rider:    [{ label: "Deliveries", path: "/rider",    icon: "truck"   }],
  customer: [{ label: "My Parcels", path: "/customer", icon: "package" }],
};

const iconPaths: Record<string, string> = {
  package: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  ops:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  truck:   "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
  search:  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[name] ?? iconPaths.package} />
    </svg>
  );
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;
  const items = navByRole[user.role] ?? [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-14 px-4 flex items-center border-b border-slate-800 shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition-colors flex items-center justify-center shrink-0">
              <NavIcon name="package" />
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">CourierTracker</span>
          </Link>
        </div>

        {/* Role label */}
        <div className="px-4 pt-5 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            {user.role} panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/track"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === "/track"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <NavIcon name="search" />
            Track Parcel
          </Link>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 px-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-700 text-white text-xs font-bold flex items-center justify-center shrink-0 select-none">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate leading-tight">{user.full_name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
            </div>
          </div>
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full text-left text-sm text-blue-200 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
