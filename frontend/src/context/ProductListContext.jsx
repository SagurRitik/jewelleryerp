/**
 * ProductListContext
 * ==================
 * Global product state that PERSISTS across page navigation.
 *
 * Architecture:
 * - Module-level Map cache  → survives React re-renders & route changes
 * - Cache keyed by (filterKey + pageNumber) with 5-min client-side TTL
 * - On mount: if products already in state & cache valid → NO re-fetch
 * - Filter change          → clears state, fetches page 1 fresh
 * - Infinite scroll        → appends page N to existing list
 * - Product CRUD           → invalidateCache() busts everything
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import API from "../api/productApi";

const ProductListContext = createContext();

/* ─── Module-level cache (lives for the lifetime of the tab) ─── */
const PAGE_CACHE = new Map();     // key: `${filterKey}_p${page}` → { products, totalPages, ts }
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function buildFilterKey(filters) {
  // Deterministic — always same key regardless of insertion order
  return JSON.stringify({
    search: filters.search || "",
    category: filters.category || "",
    metalType: filters.metalType || "",
    targetAudience: filters.targetAudience || "",
    inStockOnly: !!filters.inStockOnly,
  });
}

function buildPageCacheKey(filters, page) {
  return `${buildFilterKey(filters)}_p${page}`;
}

function isCacheValid(entry) {
  return entry && Date.now() - entry.ts < CLIENT_CACHE_TTL;
}

/* ─────────────────────────────────────────────────────────────── */

export function ProductListProvider({ children }) {
  /* ── Data state ── */
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const scrollPositionRef = useRef(0);
  const setScrollPosition = useCallback((val) => {
    scrollPositionRef.current = val;
  }, []);
  const getScrollPosition = useCallback(() => scrollPositionRef.current, []);

  /* ── UI state ── */
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  /* ── Filters ── */
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    metalType: "",
    targetAudience: "",
    inStockOnly: false,
  });

  /* ── Refs ── */
  const abortRef = useRef(null);
  const filtersRef = useRef(filters);       // always current filters in async callbacks
  const initializedRef = useRef(false);         // has first load ever been called?
  const productsLenRef = useRef(0);             // tracks products.length without causing re-renders

  /* ════════════════════════════════════════════════════════════
   * CORE FETCH  (internal)
   * append=false → replace products (page 1 or filter change)
   * append=true  → push to end (infinite scroll)
   * ════════════════════════════════════════════════════════════ */
  const fetchPage = useCallback(async (pageNum, currentFilters, append = false) => {
    const pageKey = buildPageCacheKey(currentFilters, pageNum);
    const cached = PAGE_CACHE.get(pageKey);

    /* ── HIT: serve from client-side cache ── */
    if (isCacheValid(cached)) {
      console.log(`📦 Client cache hit → ${pageKey}`);
      if (append) {
        setProducts(prev => [...prev, ...cached.products]);
      } else {
        setProducts(cached.products);
        setTotalPages(cached.totalPages);
      }
      setPage(pageNum);
      return;
    }

    /* ── MISS: cancel previous in-flight request ── */
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");

      const params = {
        page: pageNum,
        limit: 20,
        search: currentFilters.search || undefined,
        jewelleryCategory: currentFilters.category || undefined,
        inStock: currentFilters.inStockOnly || undefined,
        metalType: currentFilters.metalType || undefined,
        targetAudience: currentFilters.targetAudience || undefined,
      };

      const res = await API.get("/", { params, signal: controller.signal });
      const data = res?.data;

      /* normalise response shape */
      let productsArray = [];
      if (Array.isArray(data)) productsArray = data;
      else if (Array.isArray(data?.products)) productsArray = data.products;
      else if (Array.isArray(data?.data)) productsArray = data.data;

      const tp =
        data?.pagination?.totalPages ||
        data?.data?.pagination?.totalPages ||
        1;

      /* store in module-level cache */
      PAGE_CACHE.set(pageKey, { products: productsArray, totalPages: tp, ts: Date.now() });

      if (append) {
        setProducts(prev => {
          const next = [...prev, ...productsArray];
          productsLenRef.current = next.length;
          return next;
        });
      } else {
        productsLenRef.current = productsArray.length;
        setProducts(productsArray);
        setTotalPages(tp);
      }
      setPage(pageNum);

    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      console.error("❌ Product fetch error:", err);
      setError("Failed to load inventory. Please retry.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  /* ════════════════════════════════════════════════════════════
   * PUBLIC API
   * ════════════════════════════════════════════════════════════ */

  /**
   * initLoad — called by ProductList on every mount.
   * If we already have products and filters haven't changed → skip fetch (instant).
   * If products array is empty OR never loaded → fetch page 1.
   */
  const initLoad = useCallback(() => {
    // Use ref to avoid stale closure without triggering re-creation
    if (initializedRef.current && productsLenRef.current > 0) {
      const pageKey = buildPageCacheKey(filtersRef.current, 1);
      if (isCacheValid(PAGE_CACHE.get(pageKey))) {
        console.log("✅ Products in context — skipping re-fetch");
        return;
      }
    }
    initializedRef.current = true;
    fetchPage(1, filtersRef.current, false);
    // fetchPage is stable (no deps), so initLoad is created only ONCE
  }, [fetchPage]);

  /**
   * applyFilters — change search, category, metalType or inStockOnly.
   * Clears current product list and fetches page 1 for the new filters.
   */
  const applyFilters = useCallback((newFilters) => {
    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();

    setFilters(newFilters);
    filtersRef.current = newFilters;
    setPage(1);
    productsLenRef.current = 0;  // reset so initLoad won't skip on next mount
    setProducts([]);             // clear list so the loader shows immediately
    setTotalPages(1);
    setScrollPosition(0);        // reset scroll so restored position is 0
    setError("");

    fetchPage(1, newFilters, false);
  }, [fetchPage]);

  /**
   * loadMore — append next page (infinite scroll sentinel callback).
   */
  const loadMore = useCallback(() => {
    const currentPage = page; // capture to avoid stale closure
    if (currentPage >= totalPages) return;
    if (loading || loadingMore) return;

    fetchPage(currentPage + 1, filtersRef.current, true);
  }, [page, totalPages, loading, loadingMore, fetchPage]);

  /**
   * refresh — force re-fetch page 1 (after product create/update/delete).
   * Invalidates client cache for all pages under current filters.
   */
  const refresh = useCallback(() => {
    const filterKey = buildFilterKey(filtersRef.current);
    for (const key of PAGE_CACHE.keys()) {
      if (key.startsWith(filterKey)) PAGE_CACHE.delete(key);
    }
    setProducts([]);
    fetchPage(1, filtersRef.current, false);
  }, [fetchPage]);

  /**
   * clearFilters — resets all filters to default and refetches page 1.
   */
  const clearFilters = useCallback(() => {
    const defaultFilters = {
      search: "",
      category: "",
      metalType: "",
      targetAudience: "",
      inStockOnly: false,
    };

    // reset UI and Ref
    setFilters(defaultFilters);
    filtersRef.current = defaultFilters;

    setPage(1);
    productsLenRef.current = 0;
    setProducts([]);
    setTotalPages(1);
    setScrollPosition(0);
    setError("");

    fetchPage(1, defaultFilters, false);
  }, [fetchPage]);

  /**
   * invalidateCache — call after any product mutation (add/edit/delete).
   * Wipes the entire client cache so stale data can't be served.
   */
  const invalidateCache = useCallback(() => {
    PAGE_CACHE.clear();
  }, []);

  /* ════════════════════════════════════════════════════════════ */

  return (
    <ProductListContext.Provider
      value={{
        /* data */
        products,
        page,
        totalPages,
        scrollPosition: scrollPositionRef.current,
        getScrollPosition,
        setScrollPosition,

        /* ui */
        loading,
        loadingMore,
        error,

        /* filters */
        filters,

        /* actions */
        initLoad,
        applyFilters,
        loadMore,
        refresh,
        clearFilters,
        invalidateCache,
      }}
    >
      {children}
    </ProductListContext.Provider>
  );
}

export function useProductList() {
  const context = useContext(ProductListContext);
  if (!context) {
    throw new Error("useProductList must be used within <ProductListProvider>");
  }
  return context;
}