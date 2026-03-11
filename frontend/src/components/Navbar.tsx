import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {user && (
          <button onClick={onMenuToggle} className="lg:hidden p-1 rounded hover:bg-slate-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {!user && (
          <Link to="/" className="text-lg font-bold text-slate-900">
            CourierTracker
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        {!user && (
          <>
            <Link to="/track" className="text-slate-600 hover:text-blue-600 transition-colors">
              Track Parcel
            </Link>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
