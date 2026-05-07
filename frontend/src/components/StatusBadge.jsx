import { titleCase } from "../utils/format.js";

const badgeStyles = {
  active: "bg-teal-50 text-teal-700",
  inactive: "bg-slate-100 text-slate-600",
  assigned: "bg-sky-50 text-sky-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-rose-50 text-rose-700",
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  present: "bg-emerald-50 text-emerald-700",
  partial: "bg-amber-50 text-amber-700",
  admin: "bg-slate-900 text-white",
  manager: "bg-teal-600 text-white",
  employee: "bg-slate-200 text-slate-700",
};

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[value] || "bg-slate-100 text-slate-700"}`}
  >
    {titleCase(value)}
  </span>
);

export default StatusBadge;
