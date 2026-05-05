import NodeCache from "node-cache";

// StdTTL: 1 hour | checkperiod: 300s (reduces GC overhead vs 120s)
const productCache = new NodeCache({ stdTTL: 3600, checkperiod: 300, useClones: false });

export const getCache = (key) => {
  return productCache.get(key);
};

export const setCache = (key, value, ttl) => {
  // Allow per-entry TTL override (e.g. page 1 can have shorter TTL)
  if (ttl !== undefined) {
    return productCache.set(key, value, ttl);
  }
  return productCache.set(key, value);
};

export const deleteCache = (key) => {
  return productCache.del(key);
};

export const clearProductCache = () => {
  const keys = productCache.keys();
  const productKeys = keys.filter(
    (k) => k.startsWith("products_") || k.startsWith("product_")
  );
  productCache.del(productKeys);
  console.log(
    `🧹 Cache Cleared: Removed ${productKeys.length} product-related keys.`
  );
};

export const getCacheStats = () => {
  return {
    keys: productCache.keys().length,
    stats: productCache.getStats(),
  };
};

export default productCache;
