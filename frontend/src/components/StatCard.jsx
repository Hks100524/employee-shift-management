const StatCard = ({ label, value, caption, accent = "teal" }) => {
  const tone =
    accent === "amber"
      ? "from-amber-100 to-white text-amber-700"
      : accent === "rose"
        ? "from-rose-100 to-white text-rose-700"
        : "from-teal-100 to-white text-teal-700";

  return (
    <div className={`rounded-[26px] border border-white/70 bg-gradient-to-br ${tone} p-4 sm:p-5 shadow-sm`}>
      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{caption}</p>
    </div>
  );
};

export default StatCard;

