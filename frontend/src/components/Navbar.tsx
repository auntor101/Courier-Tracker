import { useAuth } from "../hooks/useAuth";

export default function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex-1" />
      {user && (
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-slate-500 hidden sm:block truncate max-w-[160px]">{user.full_name}</span>
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center select-none shrink-0">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}
