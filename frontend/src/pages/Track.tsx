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
      const { data: p } = await api.get(`/parcels/track/${code}`);
      setParcel(p);
      const { data: t } = await api.get(`/parcels/track/${code}/timeline`);
      setTimeline(t);
    } catch {
      setError("Parcel not found. Check your tracking code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="gradient-primary text-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Link to="/" className="text-blue-200 text-sm hover:text-white transition-colors mb-4 inline-block">&larr; Home</Link>
          <h1 className="text-3xl font-bold mb-2">Track Your Parcel</h1>
          <p className="text-blue-100 mb-8">Enter your tracking code to see delivery status</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <input
              type="text"
              required
              placeholder="e.g. CT-YYMMDD-0001"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-lg px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-blue-700 font-medium px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              Track
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-6">
        {loading && <Loader />}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <p className="text-rose-600">{error}</p>
          </div>
        )}
        {parcel && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-mono text-sm text-slate-500">{parcel.tracking_code}</p>
                <p className="font-semibold mt-0.5">{parcel.recipient_name}</p>
              </div>
              <StatusBadge status={parcel.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 text-sm">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Phone</p>
                <p className="mt-0.5">{parcel.recipient_phone}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">District</p>
                <p className="mt-0.5">{parcel.recipient_district}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Payment</p>
                <p className="mt-0.5 capitalize">{parcel.payment_type}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Weight</p>
                <p className="mt-0.5">{parcel.weight_kg} kg</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide">Price</p>
                <p className="mt-0.5 font-medium">&#2547;{parcel.price}</p>
              </div>
              {parcel.payment_type === "cod" && (
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">COD</p>
                  <p className="mt-0.5 font-medium">&#2547;{parcel.cod_amount}</p>
                </div>
              )}
            </div>

            <div className="border-t p-5">
              <h2 className="font-semibold text-sm mb-4">Tracking History</h2>
              <div className="space-y-0">
                {timeline.map((entry, entryIndex) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 ${entryIndex === timeline.length - 1 ? "bg-blue-600" : "bg-slate-300"}`} />
                      {entryIndex < timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200" />}
                    </div>
                    <div className="pb-5 min-w-0">
                      <StatusBadge status={entry.status} />
                      {entry.note && <p className="text-slate-600 text-sm mt-1">{entry.note}</p>}
                      <p className="text-slate-400 text-xs mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
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
