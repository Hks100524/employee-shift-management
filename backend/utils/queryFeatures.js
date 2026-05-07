// ======================= PAGINATION =======================
const getPagination = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 10;

  // 🔒 Safety limits
  page = page < 1 ? 1 : page;
  limit = limit < 1 ? 10 : limit;
  limit = limit > 100 ? 100 : limit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// ======================= META =======================
const buildPaginationMeta = ({ total, page, limit }) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

// ======================= SEARCH =======================
const buildSearchFilter = (search, fields = []) => {
  if (!search || !fields.length) return {};

  const safeSearch = String(search).trim();
  if (!safeSearch) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: safeSearch, $options: "i" },
    })),
  };
};

// ======================= SORT =======================
const buildSort = (query, defaultSort = { createdAt: -1 }) => {
  if (!query.sort_by) return defaultSort;

  const order = query.order === "asc" ? 1 : -1;

  return {
    [query.sort_by]: order,
  };
};

// ======================= FILTER CLEAN =======================
const cleanFilters = (filters) => {
  const cleaned = {};

  Object.keys(filters).forEach((key) => {
    if (
      filters[key] !== undefined &&
      filters[key] !== null &&
      filters[key] !== ""
    ) {
      cleaned[key] = filters[key];
    }
  });

  return cleaned;
};

module.exports = {
  getPagination,
  buildPaginationMeta,
  buildSearchFilter,
  buildSort,
  cleanFilters,
};

