export const getApiErrorMessage = (error, fallback = "Something went wrong.") => {
  const response = error?.response?.data;
  if (response) {
    const details = response?.error?.details;
    if (Array.isArray(details)) {
      return details
        .map((item) => {
          if (typeof item === "string") return item;
          return item.field ? `${item.field}: ${item.msg}` : item.msg || String(item);
        })
        .join(" \n");
    }

    if (details && typeof details === "object") {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(" \n");
    }

    return response.message || error?.message || fallback;
  }

  if (error?.request) {
    const url = error?.config?.baseURL || "backend";
    return `Network error: could not reach ${url}. Please ensure the backend is running and CORS is allowed.`;
  }

  return error?.message || fallback;
};

export const createRequestKey = (prefix = "req") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
