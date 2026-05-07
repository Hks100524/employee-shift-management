const SectionCard = ({ title, description, action, children }) => (
  <section className="rounded-[28px] border border-slate-200 bg-white/90 p-4 sm:p-6 shadow-sm">
    <div className="flex flex-col gap-2 sm:gap-3 border-b border-slate-100 pb-3 sm:pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
{action ? <div className="shrink-0">{action}</div> : null}
    </div>
    <div className="pt-3 sm:pt-4">{children}</div>
  </section>
);

export default SectionCard;
