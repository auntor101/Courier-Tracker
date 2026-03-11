interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

const colorMap: Record<string, string> = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-emerald-600",
  purple: "from-violet-500 to-violet-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-rose-500 to-rose-600",
  amber: "from-amber-500 to-amber-600",
  slate: "from-slate-600 to-slate-700",
  indigo: "from-indigo-500 to-indigo-600",
};

export default function StatCard({ label, value, color = "blue" }: StatCardProps) {
  const gradient = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-4 text-white shadow-sm`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80 mt-0.5">{label}</p>
    </div>
  );
}
