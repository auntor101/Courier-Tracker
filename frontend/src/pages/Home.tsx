import { Link, Navigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../hooks/useAuth";

const roleHome: Record<string, string> = {
  admin: "/admin",
  staff: "/staff",
  rider: "/rider",
  customer: "/customer",
};

const features = [
  {
    icon: "📦",
    title: "Book Parcels",
    desc: "Create shipments instantly with auto-generated tracking codes.",
  },
  {
    icon: "🗺️",
    title: "Live Tracking",
    desc: "Follow every step of your parcel's journey in real time.",
  },
  {
    icon: "🏢",
    title: "Branch Network",
    desc: "Seamless transfers across multiple hub branches.",
  },
  {
    icon: "🏍️",
    title: "Rider Delivery",
    desc: "Assigned riders confirm deliveries and collect COD on the spot.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (user) return <Navigate to={roleHome[user.role] || "/track"} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">
          Courier<span className="text-slate-800">Tracker</span>
        </span>
        <div className="flex gap-3">
          <Link
            to="/track"
            className="text-sm text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Track
          </Link>
          <Link
            to="/login"
            className="text-sm text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
          Live tracking enabled
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight max-w-2xl mb-5">
          Parcels, tracked{" "}
          <span className="text-indigo-600">end&#8209;to&#8209;end</span>
        </h1>

        <p className="text-lg text-slate-500 max-w-xl mb-10">
          Book, track, and deliver shipments across branches — with full
          timeline history and role-based dashboards for your whole team.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5"
          >
            Start for free
          </Link>
          <Link
            to="/track"
            className="bg-white text-slate-700 border border-slate-200 px-7 py-3 rounded-xl font-semibold hover:border-indigo-300 hover:text-indigo-600 transition-all hover:-translate-y-0.5"
          >
            Track a parcel →
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-6 pb-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
            <p className="text-sm text-slate-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 pb-6">
        © {new Date().getFullYear()} CourierTracker
      </footer>
    </div>
  );
}
