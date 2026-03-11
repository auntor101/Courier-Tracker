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
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
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
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={bookingbookingForm.payment_type} onChange={(e) => setBookingForm({ ...bookingForm, payment_type: e.target.value })}>
                <option value="prepaid">Prepaid</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin Branch</label>
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={bookingForm.origin_branch_id} onChange={(e) => setBookingForm({ ...bookingForm, origin_branch_id: e.target.value })}>
                <option value="">Select origin branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination Branch</label>
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={bookingForm.destination_branch_id} onChange={(e) => setBookingForm({ ...bookingForm, destination_branch_id: e.target.value })}>
                <option value="">Select destination branch</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            {renderFormInput("Weight (kg)", "weight_kg", "number", { step: "0.1", min: "0.1" })}
            {renderFormInput("Price", "price", "number", { step: "1", min: "1" })}
            {bookingForm.payment_type === "cod" && field("COD Amount", "cod_amount", "number", { step: "1", min: "0" })}
            <div className="sm:col-span-2">{renderFormInput("Notes", "notes", "text", { required: false })}</div>
          </div>
          <button type="submit" disabled={submitting} className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {submitting ? "Booking..." : "Submit Booking"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Tracking</th>
                <th className="px-4 py-3 text-left">Recipient</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">District</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {parcels?.items.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{p.tracking_code}</td>
                  <td className="px-4 py-3">{p.recipient_name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{p.recipient_district}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {parcels && parcels.items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">No parcels yet. Book your first parcel above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
