import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { PaginatedParcels } from "../types";

const DEFAULT_DELIVERY_NOTE = "Delivered to recipient";
const DEFAULT_RETURN_NOTE = "Recipient unavailable";

export default function RiderDashboard() {
  const [parcels, setParcels] = useState<PaginatedParcels | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/parcels");
      setParcels(data);
    } catch {
      setError("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const withErrorHandling = async (apiCall: () => Promise<void>, errorMessage: string) => {
    setError("");
    try {
      await apiCall();
      load();
    } catch (e: unknown) {
      const apiError = e as { response?: { data?: { detail?: string } } };
      setError(apiError.response?.data?.detail || errorMessage);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-5">My Deliveries</h1>

      {error && <div className="bg-rose-50 text-rose-700 text-sm px-4 py-2.5 rounded-lg mb-4">{error}</div>}

      {parcels && parcels.items.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-slate-400">
          No deliveries assigned to you yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {parcels?.items.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-400">{p.tracking_code}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="font-medium">{p.recipient_name}</p>
                  <p className="text-sm text-slate-500">{p.recipient_phone}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{p.recipient_address}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {p.payment_type === "cod" && (
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase">COD</p>
                      <p className={`font-semibold ${p.cod_collected ? "text-emerald-600" : "text-orange-600"}`}>
                        &#2547;{p.cod_amount}
                        <span className="text-xs font-normal ml-1">{p.cod_collected ? "collected" : "pending"}</span>
                      </p>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    {p.status === "out_for_delivery" && (
                      <>
                        <button onClick={() => withErrorHandling(() => api.patch(`/parcels/${p.id}/status`, { status: "delivered", note: DEFAULT_DELIVERY_NOTE }), "Could not mark parcel as delivered")} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">
                          Delivered
                        </button>
                        <button onClick={() => withErrorHandling(() => api.patch(`/parcels/${p.id}/status`, { status: "returned", note: DEFAULT_RETURN_NOTE }), "Could not mark parcel as returned")} className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors">
                          Return
                        </button>
                      </>
                    )}
                    {p.payment_type === "cod" && !p.cod_collected && p.status === "out_for_delivery" && (
                      <button onClick={() => withErrorHandling(() => api.patch(`/parcels/${p.id}/cod`), "Could not collect COD for this parcel")} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors">
                        Collect COD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
