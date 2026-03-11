import { FormEvent, useEffect, useState } from "react";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import api from "../services/api";
import { Branch, DashboardStats, PaginatedParcels, User } from "../types";

const ADMIN_PARCEL_FETCH_LIMIT = 50;

export default function AdminDashboard() {
  const [tab, setTab] = useState<"overview" | "parcels" | "users" | "branches">("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [parcels, setParcels] = useState<PaginatedParcels | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [userForm, setUserForm] = useState({ email: "", password: "", full_name: "", role: "staff", branch_id: "" });
  const [branchForm, setBranchForm] = useState({ name: "", district: "", address: "", phone: "" });

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats").then(({ data }) => setStats(data)),
      api.get("/users").then(({ data }) => setUsers(data)),
      api.get("/branches").then(({ data }) => setBranches(data)),
      api.get(`/parcels?per_page=${ADMIN_PARCEL_FETCH_LIMIT}`).then(({ data }) => setParcels(data)),
    ]).finally(() => setLoading(false));
  }, []);

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/users", { ...userForm, branch_id: userForm.branch_id ? Number(userForm.branch_id) : null });
    setShowUserForm(false);
    setUserForm({ email: "", password: "", full_name: "", role: "staff", branch_id: "" });
    api.get("/users").then(({ data }) => setUsers(data));
  };

  const createBranch = async (e: FormEvent) => {
    e.preventDefault();
    await api.post("/branches", branchForm);
    setShowBranchForm(false);
    setBranchForm({ name: "", district: "", address: "", phone: "" });
    api.get("/branches").then(({ data }) => setBranches(data));
  };

  if (loading) return <Loader />;

  const tabs = ["overview", "parcels", "users", "branches"] as const;
  const inputClassName = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-5">Admin Dashboard</h1>

      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className={`px-4 py-2.5 text-sm capitalize whitespace-nowrap transition-colors ${
              tab === tabName
                ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Parcels" value={stats.total_parcels} color="slate" />
          <StatCard label="Booked Today" value={stats.today_bookings} color="blue" />
          <StatCard label="In Transit" value={stats.in_transit} color="purple" />
          <StatCard label="Out for Delivery" value={stats.out_for_delivery} color="orange" />
          <StatCard label="Delivered" value={stats.delivered} color="green" />
          <StatCard label="Returned" value={stats.returned} color="red" />
          <StatCard label="COD Pending" value={stats.cod_pending} color="amber" />
          <StatCard label="Booked" value={stats.booked} color="indigo" />
        </div>
      )}

      {tab === "parcels" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Tracking</th>
                  <th className="px-4 py-3 text-left">Recipient</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">From</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">To</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Payment</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Price</th>
                </tr>
              </thead>
              <tbody>
                {parcels?.items.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{p.tracking_code}</td>
                    <td className="px-4 py-3">{p.recipient_name}</td>
                    <td className="px-4 py-3 text-xs hidden md:table-cell">{branches.find((b) => b.id === p.origin_branch_id)?.name}</td>
                    <td className="px-4 py-3 text-xs hidden md:table-cell">{branches.find((b) => b.id === p.destination_branch_id)?.name}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 capitalize text-xs hidden sm:table-cell">{p.payment_type}</td>
                    <td className="px-4 py-3 text-xs hidden sm:table-cell">&#2547;{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div>
          <button
            onClick={() => setShowUserForm(!showUserForm)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mb-4"
          >
            {showUserForm ? "Cancel" : "Add User"}
          </button>
          {showUserForm && (
            <form onSubmit={createUser} className="bg-white rounded-xl border shadow-sm p-5 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label><input required className={inputClassName} value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" required className={inputClassName} value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Password</label><input type="password" required minLength={6} className={inputClassName} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select className={inputClassName} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                    <option value="admin">Admin</option><option value="staff">Staff</option><option value="rider">Rider</option><option value="customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                  <select className={inputClassName} value={userForm.branch_id} onChange={(e) => setUserForm({ ...userForm, branch_id: e.target.value })}>
                    <option value="">None</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Create User</button>
            </form>
          )}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left hidden sm:table-cell">Email</th><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left hidden md:table-cell">Branch</th><th className="px-4 py-3 text-left">Active</th>
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.full_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3"><span className="capitalize text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">{u.role}</span></td>
                      <td className="px-4 py-3 text-xs hidden md:table-cell">{branches.find((b) => b.id === u.branch_id)?.name || "—"}</td>
                      <td className="px-4 py-3"><span className={`w-2 h-2 rounded-full inline-block ${u.is_active ? "bg-emerald-500" : "bg-slate-300"}`} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "branches" && (
        <div>
          <button
            onClick={() => setShowBranchForm(!showBranchForm)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mb-4"
          >
            {showBranchForm ? "Cancel" : "Add Branch"}
          </button>
          {showBranchForm && (
            <form onSubmit={createBranch} className="bg-white rounded-xl border shadow-sm p-5 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label><input required className={inputClassName} value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">District</label><input required className={inputClassName} value={branchForm.district} onChange={(e) => setBranchForm({ ...branchForm, district: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><input required className={inputClassName} value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input required className={inputClassName} value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} /></div>
              </div>
              <button type="submit" className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Create Branch</button>
            </form>
          )}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">District</th><th className="px-4 py-3 text-left hidden sm:table-cell">Address</th><th className="px-4 py-3 text-left hidden sm:table-cell">Phone</th>
                </tr></thead>
                <tbody>
                  {branches.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{b.name}</td>
                      <td className="px-4 py-3">{b.district}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">{b.address}</td>
                      <td className="px-4 py-3 text-xs hidden sm:table-cell">{b.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
