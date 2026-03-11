import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { Branch, DashboardStats, PaginatedParcels, User } from "../types";

const nextStatus: Record<string, string> = {
  booked: "received_at_branch",
  received_at_branch: "in_transit",
  in_transit: "at_destination_branch",
  at_destination_branch: "out_for_delivery",
};

export default function StaffDashboard() {
  const [parcels, setParcels] = useState<PaginatedParcels | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [riders, setRiders] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/parcels?${params}`);
      setParcels(data);
    } catch {
      setError("Could not load parcels. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    load();
    api.get("/dashboard/stats").then(({ data }) => setStats(data)).catch(() => {});
  };

  useEffect(() => {
    refresh();
    api.get("/branches").then(({ data }) => setBranches(data)).catch(() => {});
    api.get("/users?role=rider").then(({ data }) => setRiders(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => load(), 300);
    return () => clearTimeout(debounceTimer);
  }, [search, statusFilter]);

  const advance = async (id: number, status: string) => {
    const next = nextStatus[status];
    if (!next) return;
    try {
      await api.patch(`/parcels/${id}/status`, { status: next });
      refresh();
    } catch (e: unknown) {
      const apiError = e as { response?: { data?: { detail?: string } } };
      setError(apiError.response?.data?.detail || "Failed to update parcel status");
    }
  };

  const assign = async (parcelId: number, riderId: number) => {
    try {
      await api.patch(`/parcels/${parcelId}/assign`, { rider_id: riderId });
      load();
    } catch (e: unknown) {
      const apiError = e as { response?: { data?: { detail?: string } } };
      setError(apiError.response?.data?.detail || "Failed to assign rider to parcel");
    }
  };

  const transfer = async (parcelId: number, branchId: number) => {
    try {
      await api.patch(`/parcels/${parcelId}/transfer`, { branch_id: branchId });
      refresh();
    } catch (e: unknown) {
      const apiError = e as { response?: { data?: { detail?: string } } };
      setError(apiError.response?.data?.detail || "Failed to transfer parcel to branch");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-5">Branch Operations</h1>

      {error && <div className="bg-rose-50 text-rose-700 text-sm px-4 py-2.5 rounded-lg mb-4">{error}</div>}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={stats.total_parcels} color="slate" />
          <StatCard label="Booked" value={stats.booked} color="amber" />
          <StatCard label="In Transit" value={stats.in_transit} color="purple" />
          <StatCard label="Delivered" value={stats.delivered} color="green" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="received_at_branch">At Branch</option>
          <option value="in_transit">In Transit</option>
          <option value="at_destination_branch">At Destination</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Tracking</th>
                <th className="px-4 py-3 text-left">Recipient</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">District</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Rider</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels?.items.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{p.tracking_code}</td>
                  <td className="px-4 py-3">
                    <p>{p.recipient_name}</p>
                    <p className="text-xs text-slate-400 md:hidden">{p.recipient_district}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{p.recipient_district}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {p.assigned_rider_id ? (
                      <span className="text-xs">{riders.find((rider) => rider.id === p.assigned_rider_id)?.full_name || "Unassigned"}</span>
                    ) : (
                      <select className="border border-slate-300 rounded px-2 py-1 text-xs" defaultValue="" onChange={(e) => { if (e.target.value) assign(p.id, Number(e.target.value)); }}>
                        <option value="">Assign rider</option>
                        {riders.map((rider) => <option key={rider.id} value={rider.id}>{rider.full_name}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {nextStatus[p.status] && (
                        <button onClick={() => advance(p.id, p.status)} className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                          Advance
                        </button>
                      )}
                      {(p.status === "received_at_branch" || p.status === "in_transit") && (
                        <select className="border border-slate-300 rounded px-2 py-1 text-xs" defaultValue="" onChange={(e) => { if (e.target.value) transfer(p.id, Number(e.target.value)); }}>
                          <option value="">Transfer</option>
                          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {parcels && parcels.items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No parcels found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
