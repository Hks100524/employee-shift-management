const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-600">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h1>
{description ? <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-2 sm:gap-3">{actions}</div> : null}
  </div>
);

export default PageHeader;
