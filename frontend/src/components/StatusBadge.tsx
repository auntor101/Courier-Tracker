const STATUS_CONFIG: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  booked:                { dot: "bg-amber-400",               bg: "bg-amber-50",  text: "text-amber-700",  label: "Booked"          },
  received_at_branch:    { dot: "bg-sky-400",                 bg: "bg-sky-50",    text: "text-sky-700",    label: "At Branch"       },
  in_transit:            { dot: "bg-violet-500 animate-pulse", bg: "bg-violet-50", text: "text-violet-700", label: "In Transit"      },
  at_destination_branch: { dot: "bg-indigo-400",              bg: "bg-indigo-50", text: "text-indigo-700", label: "At Destination"  },
  out_for_delivery:      { dot: "bg-orange-400 animate-pulse", bg: "bg-orange-50", text: "text-orange-700", label: "Out for Delivery"},
  delivered:             { dot: "bg-emerald-400",             bg: "bg-emerald-50",text: "text-emerald-700",label: "Delivered"       },
  returned:              { dot: "bg-rose-400",                bg: "bg-rose-50",   text: "text-rose-700",   label: "Returned"        },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { dot: "bg-slate-400", bg: "bg-slate-50", text: "text-slate-600", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
