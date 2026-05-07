const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-2.5 sm:gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {pagination.page} of {pagination.totalPages} with {pagination.total} records
      </p>
      <div className="flex gap-1.5 sm:gap-2">
        <button
className="secondary-button !px-2.5 !py-1.5 sm:!px-3 sm:!py-2"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(pagination.page - 1)}
          type="button"
        >
          Previous
        </button>
        <button
className="secondary-button !px-2.5 !py-1.5 sm:!px-3 sm:!py-2"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
