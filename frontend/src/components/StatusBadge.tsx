const STATUS_BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  booked: { bg: "bg-amber-50", text: "text-amber-700", label: "Booked" },
  received_at_branch: { bg: "bg-sky-50", text: "text-sky-700", label: "At Branch" },
  in_transit: { bg: "bg-violet-50", text: "text-violet-700", label: "In Transit" },
  at_destination_branch: { bg: "bg-indigo-50", text: "text-indigo-700", label: "At Destination" },
  out_for_delivery: { bg: "bg-orange-50", text: "text-orange-700", label: "Out for Delivery" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Delivered" },
  returned: { bg: "bg-rose-50", text: "text-rose-700", label: "Returned" },
};

export default function StatusBadge({ status }: { status: string }) {
  const badgeStyle = STATUS_BADGE_STYLES[status] || { bg: "bg-slate-50", text: "text-slate-700", label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyle.bg} ${badgeStyle.text}`}>
      {badgeStyle.label}
    </span>
  );
}
