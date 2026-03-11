import { FormEvent, useEffect, useState } from "react";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { Branch, PaginatedParcels } from "../types";

export default function CustomerDashboard() {
  const [parcels, setParcels] = useState<PaginatedParcels | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    recipient_name: "", recipient_phone: "", recipient_address: "", recipient_district: "",
    origin_branch_id: "", destination_branch_id: "", payment_type: "prepaid",
    weight_kg: "0.5", price: "", cod_amount: "0", notes: "",
  });

  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/parcels");
      setParcels(data);
    } catch {
      setError("Could not load your parcels. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get("/branches").then(({ data }) => setBranches(data)).catch(() => {});
  }, []);

  const handleBook = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/parcels", {
        ...bookingForm,
        origin_branch_id: Number(bookingForm.origin_branch_id),
        destination_branch_id: Number(bookingForm.destination_branch_id),
      });
      setShowForm(false);
      setBookingForm({ recipient_name: "", recipient_phone: "", recipient_address: "", recipient_district: "", origin_branch_id: "", destination_branch_id: "", payment_type: "prepaid", weight_kg: "0.5", price: "", cod_amount: "0", notes: "" });
      load();
    } catch (e: unknown) {
      const apiError = e as { response?: { data?: { detail?: string } } };
      setError(apiError.response?.data?.detail || "Failed to book parcel");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormInput = (label: string, key: keyof typeof bookingForm, type = "text", opts?: { required?: boolean; step?: string; min?: string }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        required={opts?.required !== false}
        step={opts?.step}
        min={opts?.min}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none bg-slate-50 focus:bg-white transition-colors"
        value={bookingForm[key]}
        onChange={(e) => setBookingForm({ ...bookingForm, [key]: e.target.value })}
      />
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">My Parcels</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {showForm ? "Cancel" : "Book New Parcel"}
        </button>
      </div>

      {error && <div className="bg-rose-50 text-rose-700 text-sm px-4 py-2.5 rounded-lg mb-4">{error}</div>}

      {showForm && (
        <form onSubmit={handleBook} className="bg-white rounded-xl border shadow-sm p-5 mb-6">
          <h2 className="font-semibold mb-4">New Booking</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderFormInput("Recipient Name", "recipient_name")}
            {renderFormInput("Recipient Phone", "recipient_phone")}
            <div className="sm:col-span-2">{renderFormInput("Address", "recipient_address")}</div>
            {renderFormInput("District", "recipient_district")}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" value={bookingForm.payment_type} onChange={(e) => setBookingForm({ ...bookingForm, payment_type: e.target.value })}>
                <option value="prepaid">Prepaid</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin Branch</label>
              <select required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" value={bookingForm.origin_branch_id} onChange={(e) => setBookingForm({ ...bookingForm, origin_branch_id: e.target.value })}>
                <option value="">Select origin branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination Branch</label>
              <select required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50" value={bookingForm.destination_branch_id} onChange={(e) => setBookingForm({ ...bookingForm, destination_branch_id: e.target.value })}>
                <option value="">Select destination branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {renderFormInput("Weight (kg)", "weight_kg", "number", { step: "0.1", min: "0.1" })}
            {renderFormInput("Price", "price", "number", { step: "1", min: "1" })}
            {bookingForm.payment_type === "cod" && renderFormInput("COD Amount", "cod_amount", "number", { step: "1", min: "0" })}
            <div className="sm:col-span-2">{renderFormInput("Notes", "notes", "text", { required: false })}</div>
          </div>
          <button type="submit" disabled={submitting} className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {submitting ? "Booking..." : "Submit Booking"}
          </button>
        </form>
      )}

      {parcels && parcels.items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
          No parcels yet. Book your first one above.
        </div>
      ) : (
        <div className="grid gap-3">
          {parcels?.items.map((p, idx) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow animate-slide-up"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-xs text-slate-400">{p.tracking_code}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="font-medium text-slate-900">{p.recipient_name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{p.recipient_address}</p>
                  <p className="text-xs text-slate-400 mt-1">{p.recipient_district} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-900">৳{p.price}</p>
                  {p.payment_type === "cod" && (
                    <p className="text-xs text-slate-400 mt-0.5">COD ৳{p.cod_amount}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
