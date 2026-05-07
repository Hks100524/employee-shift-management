const toneClasses = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

const AlertMessage = ({ children, tone = "info" }) => {
  if (!children) {
    return null;
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone] || toneClasses.info}`}>
      {children}
    </div>
  );
};

export default AlertMessage;
