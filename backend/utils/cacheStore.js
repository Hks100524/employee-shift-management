const DEFAULT_TTL_MS = 30000;
const store = new Map();

const getCachedPayload = (key) => {
  const cachedEntry = store.get(key);

  if (!cachedEntry) {
    return null;
  }

  if (cachedEntry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }

  return cachedEntry.payload;
};

const setCachedPayload = (key, payload, ttlMs = DEFAULT_TTL_MS) => {
  store.set(key, {
    payload,
    expiresAt: Date.now() + ttlMs,
  });

  return payload;
};

const buildRequestCacheKey = (namespace, req) =>
  [
    namespace,
    String(req.user?._id || "guest"),
    req.user?.role || "guest",
    req.originalUrl,
  ].join("::");

const invalidateCacheNamespace = (namespace) => {
  const prefix = `${namespace}::`;

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
};

module.exports = {
  buildRequestCacheKey,
  getCachedPayload,
  invalidateCacheNamespace,
  setCachedPayload,
};
