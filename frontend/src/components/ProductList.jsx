
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { useCart } from "../context/CartContext";
import { useProductList } from "../context/ProductListContext";
import {
  Search, Moon, Sun, Check, ShoppingBag, PackageX,
  Heart, BarChart2, Eye, SlidersHorizontal, Package
} from "lucide-react";
import MetalRateCards from "./MetalRateCards";
import { getImageUrl } from "../utils/getImageUrl";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useRates } from "../context/RatesContext";
import { updateRate } from "../api/ratesApi";
import { toast } from "sonner";
import { Percent, ToggleLeft, ToggleRight } from "lucide-react";



/* ================= SUB-COMPONENTS ================= */

/**
 * Auto-sliding image carousel for product cards
 * Optimized: Only animates when component is memoized and images change
 */
const ProductImageSlider = memo(({ images, title, sku }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 opacity-20">
        <ShoppingBag size={32} strokeWidth={1} />
        <span className="text-[10px] uppercase font-bold">No Preview</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={getImageUrl(img)}
          alt={`${title} - ${idx + 1}`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-in-out ${idx === currentIndex ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-95 rotate-1"
            }`}
        />
      ))}
    </div>
  );
});

/**
 * Memoized Individual Product Card to prevent re-renders on scroll
 */
const ProductCard = memo(({ p, isDark, theme, navigate, addProduct, setShowToast }) => {
  if (!p?._id) return null;

  return (
    <div
      className={`
        group relative flex flex-col overflow-hidden border
        transition-all duration-300 ease-out hover:shadow-xl hover:border-[#C19A2A]/30
        ${isDark ? "bg-[#171717] border-gray-800" : "bg-white border-gray-200"}
        after:absolute after:inset-0 after:-translate-x-[120%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:transition-transform after:duration-1000 hover:after:translate-x-[120%]
      `}
    >
      {/* IMAGE SECTION */}
      <div className={`relative aspect-square p-4 flex items-center justify-center overflow-hidden will-change-transform ${theme.cardTop}`}>

        {/* SKU Badge */}
        {p?.sku && (
          <div className="absolute top-2 left-2 z-10">
            <span className={`text-[10px] font-medium px-2 py-0.5 border shadow-sm uppercase ${isDark ? "bg-black text-gray-300 border-gray-700" : "bg-white text-[#5A374F] border-gray-200"}`}>
              {p.sku}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button type="button" className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${isDark ? "bg-[#262626] border border-gray-700 text-gray-400 hover:text-[#C19A2A]" : "bg-white border border-gray-200 text-gray-500 hover:text-[#C19A2A] hover:border-[#C19A2A]"}`}>
            <Heart size={14} strokeWidth={2} />
          </button>
          <button type="button" className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${isDark ? "bg-[#262626] border border-gray-700 text-gray-400 hover:text-[#C19A2A]" : "bg-white border border-gray-200 text-gray-500 hover:text-[#C19A2A] hover:border-[#C19A2A]"}`}>
            <BarChart2 size={14} strokeWidth={2} />
          </button>
          {p?.sku && (
            <button type="button" onClick={() => navigate(`/product/${p.sku}`)} className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${isDark ? "bg-[#262626] border border-gray-700 text-gray-400 hover:text-[#C19A2A]" : "bg-white border border-gray-200 text-gray-500 hover:text-[#C19A2A] hover:border-[#C19A2A]"}`}>
              <Eye size={14} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Image */}
        <Link to={`/product/${p?.sku || ""}`} className="relative w-full h-full flex items-center justify-center">
          <ProductImageSlider
            images={p?.images}
            title={p?.title}
            sku={p?.sku}
          />
        </Link>
      </div>

      {/* DETAILS SECTION */}
      <div className={`p-4 pb-14 flex flex-col items-center text-center flex-1 border-t transition-all duration-200 ease-out group-hover:-translate-y-2 ${theme.cardBottom} ${isDark ? "border-gray-800" : "border-gray-200"}`}>
        {p?.sku && (
          <Link to={`/product/${p.sku}`} className="w-full">
            <h3 className={`text-[13px] font-medium leading-snug line-clamp-1 mb-1 transition-colors ${isDark ? "text-zinc-200 hover:text-[#C19A2A]" : "text-zinc-800 hover:text-[#C19A2A]"}`}>
              {p?.title || "Untitled Product"}
            </h3>
          </Link>
        )}
        <div className="text-[11px] leading-relaxed mb-2 line-clamp-1 italic text-zinc-500">
          {p?.description || "Premium Collection"}
        </div>
        <div className="mt-2">
          {p?.pricing ? (
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-gray-400">EST. Price</span>
              <span className="text-sm font-semibold text-[#C19A2A]">
                ₹{Number(p.pricing.payable ?? p.pricing.grandTotal ?? 0).toLocaleString("en-IN")}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Calculating...</span>
          )}
        </div>

        {/* Add to Cart */}
        <div className="absolute bottom-0 left-0 w-full p-3 translate-y-0 opacity-100">
          <button
            type="button"
            disabled={Number(p?.stock || 0) <= 0}
            onClick={(e) => {
              e.preventDefault();
              try {
                if (!p?._id) return;
                addProduct(p._id, 1);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
              } catch (err) {
                console.error("Cart error:", err);
              }
            }}
            className={`w-full py-2 text-[11px] font-semibold rounded-sm transition-all shadow-sm ${Number(p?.stock || 0) > 0 ? "bg-[#C19A2A] text-white hover:bg-[#A38222]" : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70 pointer-events-none"}`}
          >
            {Number(p?.stock || 0) > 0 ? "Add To Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
});

/**
 * Single background image for the Metal Rates section
 */
const BackgroundSlider = () => {
  return (
    <div className="absolute inset-0 -z-10">
      <img src="/bg.png" alt="Background" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />
    </div>
  );
};

export default function ProductList() {

  /* ================= CONTEXT (persistent across navigation) ================= */
  const {
    products,
    loading,
    loadingMore,
    error,
    filters,
    page,
    totalPages,
    getScrollPosition,
    initLoad,
    applyFilters,
    loadMore,
    setScrollPosition,
    refresh,
    invalidateCache,
  } = useProductList();

  /* ================= LOCAL UI STATE ================= */
  const { addProduct, fetchCartSummary } = useCart();
  const { rawRates, refreshRates } = useRates();
  const [isUpdatingDiscount, setIsUpdatingDiscount] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanToast, setScanToast] = useState(false);

  /* Local filter inputs (controlled) */
  const [search, setSearch] = useState(filters.search || "");
  const [category, setCategory] = useState(filters.category || "");
  const [metalType, setMetalType] = useState(filters.metalType || "");
  const [targetAudience, setTargetAudience] = useState(filters.targetAudience || "");
  const [inStockOnly, setInStockOnly] = useState(filters.inStockOnly || false);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const scannerRef = useRef(null);
  const sentinelRef = useRef(null);   // IntersectionObserver target
  const scrollRef = useRef(null);   // scroll container — to restore position
  const isLoadingMoreRef = useRef(false);
  const isSearchActiveRef = useRef(false); // 🔥 track if the redirect should happen

  /* ================= INIT (only on first mount / when context is empty) ================= */
  useEffect(() => {
    initLoad();
    searchRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= DEBOUNCED SEARCH → applyFilters ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = search.trim();
      if (trimmed !== filters.search) {
        isSearchActiveRef.current = true; // ✅ Mark as active search for auto-redirect
        applyFilters({ ...filters, search: trimmed });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* keep local inputs in sync when filters reset externally */
  useEffect(() => {
    setSearch(filters.search || "");
    setCategory(filters.category || "");
    setMetalType(filters.metalType || "");
    setTargetAudience(filters.targetAudience || "");
    setInStockOnly(filters.inStockOnly || false);
  }, [filters]);

  /* ================= FILTER CHANGES ================= */
  const handleCategoryChange = useCallback((val) => {
    setCategory(val);
    applyFilters({ ...filters, category: val });
  }, [filters, applyFilters]);

  const handleMetalTypeChange = useCallback((val) => {
    setMetalType(val);
    applyFilters({ ...filters, metalType: val });
  }, [filters, applyFilters]);

  const handleInStockToggle = useCallback(() => {
    const next = !inStockOnly;
    setInStockOnly(next);
    applyFilters({ ...filters, inStockOnly: next });
  }, [inStockOnly, filters, applyFilters]);

  const handleTargetAudienceChange = useCallback((val) => {
    setTargetAudience(val);
    applyFilters({ ...filters, targetAudience: val });
  }, [filters, applyFilters]);

  const toggleGlobalDiscount = async () => {
    if (!rawRates?._id) {
      toast.error("No active rate configuration found");
      return;
    }
    try {
      setIsUpdatingDiscount(true);
      const newValue = !rawRates.discountEnabled;
      await updateRate(rawRates._id, { discountEnabled: newValue });
      await refreshRates();
      invalidateCache();
      refresh();
      await fetchCartSummary();
      toast.success(`Discounts ${newValue ? "Enabled" : "Disabled"} Successfully`);
    } catch (err) {
      console.error("Failed to toggle discount:", err);
      toast.error("Failed to update discount status");
    } finally {
      setIsUpdatingDiscount(false);
    }
  };

  /* ================= AUTO-NAVIGATE ON SINGLE SKU MATCH ================= */
  useEffect(() => {
    if (
      filters.search &&
      products.length === 1 &&
      products[0]?.sku?.toLowerCase() === filters.search.toLowerCase() &&
      isSearchActiveRef.current // ✅ Only if user just type/scanned
    ) {
      isSearchActiveRef.current = false; // consume it
      navigate(`/product/${products[0].sku}`);
    }
  }, [products, filters.search, navigate]);

  /* ================= SCROLL PERSISTENCE (Restore & Save) ================= */
  const scrollTimeoutRef = useRef(null);

  // 1. RESTORE scroll after products are rendered
  useEffect(() => {
    const sp = getScrollPosition();
    if (products.length > 0 && scrollRef.current && sp > 0) {
      // Wait a tiny bit for the grid to finish rendering its children
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: sp,
            behavior: "instant"
          });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]); // Only trigger when products change, use ref for position value

  // 2. SAVE scroll position (Throttled for performance)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) return;
      scrollTimeoutRef.current = setTimeout(() => {
        if (el) setScrollPosition(el.scrollTop);
        scrollTimeoutRef.current = null;
      }, 500); // Throttle to every 500ms (safe now as it doesn't cause re-renders)
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      // Final save on unmount
      if (el) setScrollPosition(el.scrollTop);
    };
  }, [setScrollPosition]);

  /* ================= INFINITE SCROLL — IntersectionObserver ================= */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          !loading &&
          !loadingMore &&
          !isLoadingMoreRef.current &&
          page < totalPages
        ) {
          isLoadingMoreRef.current = true;
          loadMore();
          // reset flag after a short delay to prevent double-fire
          setTimeout(() => { isLoadingMoreRef.current = false; }, 600);
        }
      },
      {
        root: scrollRef.current,   // observe inside the scrollable div
        rootMargin: "200px",       // start loading 200px before sentinel appears
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages, loadMore]);

  /* ================= QR / BARCODE SCANNER ================= */
  const handleCloseScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.warn("Scanner cleanup error:", err);
    } finally {
      setShowScanner(false);
    }
  };

  useEffect(() => {
    if (!showScanner) return;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) { alert("No camera found"); return; }

        let cameraId = devices[0].id;
        const backCamera = devices.find(d =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("environment")
        );
        if (backCamera) cameraId = backCamera.id;

        await scanner.start(
          cameraId,
          {
            fps: 20,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
            ],
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          },
          (decodedText) => {
            let value = decodedText;
            if (decodedText.includes("BEGIN:VCARD")) {
              const phoneMatch = decodedText.match(/TEL:(.*)/);
              const emailMatch = decodedText.match(/EMAIL:(.*)/);
              value = phoneMatch?.[1] || emailMatch?.[1] || decodedText;
            }
            if (decodedText.startsWith("http")) {
              try {
                const url = new URL(decodedText);
                value = url.pathname.split("/").pop();
              } catch { console.warn("Invalid URL barcode"); }
            }
            value = value.trim();
            setSearch(value);
            isSearchActiveRef.current = true; // ✅ Trigger auto-redirect for scan
            applyFilters({ ...filters, search: value });
            setScanToast(true);
            setTimeout(() => setScanToast(false), 2000);
            handleCloseScanner();
          },
          () => { }
        );
      } catch (err) {
        console.error("Scanner start error:", err);
      }
    };

    startScanner();
    return () => { handleCloseScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner]);

  /* ================= HELPERS ================= */
  const theme = {
    bg: isDark ? "bg-[#0a0a0a]" : "bg-[#f8f9fa]",
    text: isDark ? "text-[#e5e5e5]" : "text-[#1a1a1a]",
    subText: isDark ? "text-[#a3a3a3]" : "text-[#6b7280]",
    border: isDark ? "border-[#262626]" : "border-[#e5e7eb]",
    inputBg: isDark ? "bg-[#171717]" : "bg-white",
    headerBg: isDark ? "bg-[#0a0a0a]/90" : "bg-[#f8f9fa]/90",
    cardTop: isDark ? "bg-[#171717]" : "bg-white",
    cardBottom: isDark ? "bg-[#1f1f1f]" : "bg-[#F5F5F5]",
  };

  /* ================= ERROR VIEW ================= */
  if (error) {
    return (
      <div className={`h-full flex flex-col items-center justify-center ${theme.bg}`}>
        <div className="text-red-500 mb-4 bg-red-100 p-4 rounded-full">
          <PackageX size={32} />
        </div>
        <p className={`${theme.text} font-medium mb-4`}>{error}</p>
        <button
          onClick={() => applyFilters(filters)}
          className="px-6 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className={`flex flex-col h-full w-full font-sans transition-colors duration-500 ease-in-out ${theme.bg} ${theme.text}`}>

      {/* ── TOAST ── */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-[#1C1917] border border-[#C19A2A] text-white px-6 py-3 rounded-sm shadow-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#C19A2A] animate-pulse" />
            <p className="text-xs font-bold tracking-widest uppercase">Added to Cart</p>
          </div>
        </div>
      )}

      {scanToast && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-sm shadow-xl flex items-center gap-3">
            <Check size={16} />
            <p className="text-xs font-bold tracking-widest uppercase">Scan Successful</p>
          </div>
        </div>
      )}

      {/* ── STICKY HEADER ── */}
      <div className={`sticky top-0 z-30 border-b backdrop-blur-xl ${theme.headerBg} ${theme.border}`}>

        {/* Live Rates Bar */}
        <div className="relative border-b border-white/10 overflow-hidden">
          <BackgroundSlider />
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2 flex items-center">
            <div className="flex items-center gap-2 mr-4 border-r pr-4 border-white/20 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Market</span>
            </div>
            <div className="overflow-x-auto scrollbar-hide flex-1 py-2">
              <MetalRateCards />
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4 bg-[#F5F5F5]">
          <div className="flex items-center justify-between gap-4">

            <div className={`flex-1 flex flex-col md:flex-row items-stretch md:items-center rounded-xl md:rounded-full border shadow-sm overflow-hidden transition-all focus-within:ring-2 focus-within:ring-[#C19A2A]/30 focus-within:border-[#C19A2A] ${theme.inputBg} ${theme.border}`}>

              {/* Search input */}
              <div className="flex items-center flex-1 px-4 py-3 md:py-2">
                <Search size={16} className={`${theme.subText} mr-3`} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search SKU or Product Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = e.target.value.trim();
                      setSearch(val);
                      isSearchActiveRef.current = true; // ✅ Trigger auto-redirect for manual enter
                      applyFilters({ ...filters, search: val });
                    }
                  }}
                  className={`w-full bg-transparent border-none outline-none text-sm font-medium placeholder:font-normal ${theme.text}`}
                />

                {/* Scanner Button */}
                <button
                  onClick={() => setShowScanner(true)}
                  title="Scan Barcode"
                  className="group relative flex items-center justify-center w-10 h-10 md:w-auto md:px-4 md:py-2 bg-[#5A374F] text-white rounded-lg transition-all hover:bg-[#4a2d41] active:scale-95 overflow-hidden shadow-md"
                >
                  <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:animate-scan group-hover:opacity-100" />
                  <div className="relative z-10 flex items-center gap-2 h-full">
                    <svg viewBox="0 0 24 24" className="w-5 h-9 fill-none stroke-current stroke-[2px]" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                      <path d="M8 8v8M12 8v8M16 8v8" className="opacity-60" />
                    </svg>
                  </div>
                </button>
              </div>

              <div className={`hidden md:block w-px h-6 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />

              {/* Metal type */}
              <div className={`relative px-4 py-3 md:py-2 flex items-center border-t md:border-t-0 ${isDark ? "border-gray-800 bg-[#1f1f1f] hover:bg-[#262626]" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"} transition-colors cursor-pointer`}>
                <SlidersHorizontal size={14} className={`${theme.subText} mr-2`} />
                <select
                  value={metalType}
                  onChange={(e) => handleMetalTypeChange(e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm font-medium cursor-pointer appearance-none pr-4 ${theme.text}`}
                >
                  <option value="">All Metals</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              <div className={`hidden md:block w-px h-6 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />

              {/* Category */}
              <div className={`relative px-4 py-3 md:py-2 flex items-center border-t md:border-t-0 ${isDark ? "border-gray-800 bg-[#1f1f1f] hover:bg-[#262626]" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"} transition-colors cursor-pointer`}>
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm font-medium cursor-pointer appearance-none pr-4 ${theme.text}`}
                >
                  <option value="">All Categories</option>
                  <option value="Ring">Rings</option>
                  <option value="Necklace">Necklaces</option>
                  <option value="Bangle">Bangles</option>
                  <option value="Bracelet">Bracelets</option>
                  <option value="Earring">Earrings</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={`hidden md:block w-px h-6 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />

              {/* Target Audience */}
              <div className={`relative px-4 py-3 md:py-2 flex items-center border-t md:border-t-0 ${isDark ? "border-gray-800 bg-[#1f1f1f] hover:bg-[#262626]" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"} transition-colors cursor-pointer`}>
                <select
                  value={targetAudience}
                  onChange={(e) => handleTargetAudienceChange(e.target.value)}
                  className={`bg-transparent border-none outline-none text-sm font-medium cursor-pointer appearance-none pr-4 ${theme.text}`}
                >
                  <option value="">Audience</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="UNISEX">Unisex</option>
                  <option value="KIDS">Kids</option>
                </select>
              </div>

              <div className={`hidden md:block w-px h-6 ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />

              {/* In-Stock toggle */}
              <button
                onClick={handleInStockToggle}
                className={`flex items-center justify-center gap-2 px-6 py-3 md:py-2 text-sm font-semibold transition-all border-t md:border-t-0 ${inStockOnly
                  ? "bg-[#5A374F] text-white hover:bg-[#6B3151]"
                  : `${isDark ? "border-gray-800 hover:bg-[#262626]" : "border-gray-100 hover:bg-gray-50"} ${theme.subText}`
                  }`}
              >
                {inStockOnly ? <Check size={16} /> : <Package size={16} />}
                {inStockOnly ? "In Stock Only" : "All Inventory"}
              </button>
            </div>

            {/* Global Discount Toggle */}
            <button
              onClick={toggleGlobalDiscount}
              disabled={isUpdatingDiscount}
              className={`
                flex items-center gap-2.5 px-4 h-11 rounded-full border shadow-sm transition-all overflow-hidden relative group
                ${rawRates?.discountEnabled
                  ? "bg-[#5A374F] text-white border-[#5A374F]"
                  : `${isDark ? "bg-[#171717] border-gray-800" : "bg-white border-gray-200"} text-gray-500`
                }
                ${isUpdatingDiscount ? "opacity-50 cursor-wait" : "active:scale-95"}
              `}
              title={rawRates?.discountEnabled ? "Disable global discounts" : "Enable global discounts"}
            >
              <div className={`p-1 rounded-md ${rawRates?.discountEnabled ? "bg-white/20" : "bg-gray-100"}`}>
                <Percent size={14} className={isUpdatingDiscount ? "animate-spin" : ""} />
              </div>

              <div className="flex flex-col items-start leading-[1] text-left">
                <span className="text-[9px] font-bold uppercase tracking-tighter opacity-70">Discounts</span>
                <span className="text-[11px] font-bold">{rawRates?.discountEnabled ? "ACTIVE" : "OFF"}</span>
              </div>

              {rawRates?.discountEnabled ? (
                <ToggleRight size={20} className="text-white/90" />
              ) : (
                <ToggleLeft size={20} className="text-gray-400" />
              )}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex-shrink-0 w-11 h-11 rounded-full border shadow-sm flex items-center justify-center transition-all ${theme.inputBg} ${theme.border} hover:scale-105`}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── SCANNER MODAL ── */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
          <div className="text-white mb-4 text-sm">Align barcode inside box</div>
          <div className="bg-white p-3 rounded-lg shadow-xl">
            <div id="reader" className="w-[300px] h-[300px]" />
          </div>
          <button
            onClick={handleCloseScanner}
            className="mt-4 px-6 py-2 bg-[#5A374F] text-white rounded"
          >
            Close Scanner
          </button>
        </div>
      )}

      {/* ── INITIAL LOADER (page 1, no products yet) ── */}
      {loading && products.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <Loader text="Accessing Vault..." />
        </div>
      )}

      {/* ── PRODUCT GRID + SENTINEL ── */}
      {(!loading || products.length > 0) && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
        >
          {Array.isArray(products) && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 pb-6 items-start w-full">
                {products.map((p) => (
                  <ProductCard
                    key={p._id}
                    p={p}
                    isDark={isDark}
                    theme={theme}
                    navigate={navigate}
                    addProduct={addProduct}
                    setShowToast={setShowToast}
                  />
                ))}
              </div>

              {/* ── SENTINEL for IntersectionObserver ── */}
              {page < totalPages && (
                <div ref={sentinelRef} className="h-16 flex items-center justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <svg className="animate-spin h-5 w-5 text-[#C19A2A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-xs font-medium uppercase tracking-widest">Loading more...</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── End of catalog indicator ── */}
              {page >= totalPages && products.length > 0 && (
                <div className="py-10 flex flex-col items-center gap-2 opacity-40">
                  <div className={`w-8 h-px ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                  <p className="text-[11px] uppercase tracking-widest font-medium text-gray-400">
                    All {products.length} items loaded
                  </p>
                  <p>
                    Powered by SagurIT
                  </p>
                  <div className={`w-8 h-px ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-60">
                <div className={`${isDark ? "bg-white/5" : "bg-gray-100"} p-6 rounded-full mb-4`}>
                  <Search size={40} strokeWidth={1} />
                </div>
                <h3 className="text-lg font-serif mb-1">No Masterpieces Found</h3>
                <p className="text-sm">Try adjusting your filters or search term.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
