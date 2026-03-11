import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { Parcel, TimelineEntry } from "../types";

export default function Track() {
  const [code, setCode] = useState("");
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setParcel(null);
    setTimeline([]);
    setLoading(true);
    try {
      const { data: p } = await api.get(`/parcels/track/${code.trim()}`);
      setParcel(p);
      const { data: t } = await api.get(`/parcels/track/${code.trim()}/timeline`);
      setTimeline(t);
    } catch {
      setError("No parcel found for that tracking code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="gradient-primary text-white py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-indigo-200 text-sm hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Track your parcel</h1>
          <p className="text-indigo-200 mb-10 text-sm">Enter your tracking code to see the latest status and history.</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-xl px-4 py-3 text-slate-900 text-sm bg-white focus:ring-2 focus:ring-indigo-300 outline-none shadow-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              Track
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {loading && <Loader />}

        {error && (
          <div className="bg-white rounded-2xl border border-rose-100 p-8 text-center animate-fade-in shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-slate-700 font-medium">{error}</p>
            <p className="text-slate-400 text-sm mt-1">Check the code and try again.</p>
          </div>
        )}

        {parcel && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-slide-up">
            {/* Parcel header */}
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-slate-400 mb-0.5">{parcel.tracking_code}</p>
                <p className="font-semibold text-slate-900 text-lg">{parcel.recipient_name}</p>
                <p className="text-sm text-slate-500 mt-0.5">{parcel.recipient_address}</p>
              </div>
              <StatusBadge status={parcel.status} />
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-slate-100">
              {[
                { label: "Phone",   value: parcel.recipient_phone },
                { label: "District", value: parcel.recipient_district },
                { label: "Payment", value: parcel.payment_type === "cod" ? "Cash on Delivery" : "Prepaid" },
                { label: "Weight",  value: `${parcel.weight_kg} kg` },
                { label: "Price",   value: `৳${parcel.price}` },
                ...(parcel.payment_type === "cod" ? [{ label: "COD Amount", value: `৳${parcel.cod_amount}` }] : []),
              ].map((item) => (
                <div key={item.label} className="bg-white px-5 py-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-sm font-medium text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="px-6 py-5">
              <h2 className="font-semibold text-slate-800 mb-5">Tracking History</h2>
              <div className="space-y-0">
                {timeline.map((entry, idx) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${idx === timeline.length - 1 ? "bg-indigo-600" : "bg-slate-200"}`} />
                      {idx < timeline.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                    </div>
                    <div className="pb-5 min-w-0">
                      <StatusBadge status={entry.status} />
                      {entry.note && <p className="text-slate-600 text-sm mt-1.5">{entry.note}</p>}
                      <p className="text-slate-400 text-xs mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
