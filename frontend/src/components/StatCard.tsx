interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

const textColors: Record<string, string> = {
  blue:   "text-blue-600",
  green:  "text-emerald-600",
  purple: "text-violet-600",
  orange: "text-orange-500",
  red:    "text-rose-600",
  amber:  "text-amber-500",
  slate:  "text-slate-700",
  indigo: "text-indigo-600",
};

export default function StatCard({ label, value, color = "indigo" }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200 animate-slide-up">
      <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color] ?? textColors.indigo}`}>{value}</p>
    </div>
  );
}
