

import { useEffect, useState } from "react";
import { getOrders } from "../api/orderApi";
import OrderTable from "../components/OrderTable";
import { Link, useSearchParams } from "react-router-dom";
import {
  Package,
  Clock,
  Truck,
  Check,
  ClipboardList,
  X,
} from "lucide-react";
import BackButton from "../components/BackButton";

/* ================= INLINE DEBOUNCE ================= */
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get("search") || "";

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    processing: 0,
    ready: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  const [isSuccess, setIsSuccess] = useState(false);

  const [search, setSearch] = useState(searchParamVal);
  const debouncedSearch = useDebounce(search);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Synchronize state with URL params
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const fetchOrders = () => {
    setLoading(true);
    getOrders({
      page,
      limit: 10,
      search: debouncedSearch,
      status,
    })
      .then((res) => {
        setOrders(res.data.orders || []);
        setPagination(res.data.pagination || {});
        setStats(res.data.stats || {
          total: 0,
          placed: 0,
          processing: 0,
          ready: 0,
          delivered: 0,
          cancelled: 0,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, debouncedSearch, status]);

  const totalPages = pagination.totalPages || 1;

  return (
    <div className="
      min-h-screen
      bg-gradient-to-br
      from-[#FBF9F6]
      via-[#F6F3F1]
      to-[#FDFBF9]
      
    ">
      <BackButton />
      <div className="max-w-7xl mx-auto px-6">

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-serif text-[#5A374F]">
              Order Management
            </h1>
            <p className="text-sm text-gray-500">
              Track and manage all customer orders
            </p>
          </div>

          {/* <Link
            to="/orders/new"
            className="px-6 py-2.5 rounded-xl bg-[#5A374F] text-white hover:bg-[#4a2e41]"
          >
            Create Manual Order
          </Link> */}

          <Link
            to="/orders/new"
            className="
    group relative inline-flex items-center justify-center gap-2

    w-full sm:w-auto   /* ✅ full width on mobile */
    
    px-5 py-3 sm:px-6 sm:py-2.5 md:px-7 md:py-3
    rounded-xl

    text-sm font-medium tracking-tight
    text-white

    bg-[#6B3151]

    shadow-[0_6px_18px_rgba(107,49,81,0.35)]

    transition-all duration-300 ease-out

    hover:bg-[#5A374F]
    hover:shadow-[0_10px_28px_rgba(107,49,81,0.45)]
    hover:-translate-y-[1px]

    active:scale-[0.96]
    active:shadow-[0_4px_12px_rgba(107,49,81,0.3)]

    overflow-hidden
  "
          >
            {/* ✨ shimmer effect */}
            <span className="
    pointer-events-none absolute inset-0
    bg-gradient-to-r from-transparent via-white/20 to-transparent
    translate-x-[-120%]
    group-hover:translate-x-[120%]
    transition-transform duration-700
  " />

            {/* 🔥 subtle inner glow on tap (mobile friendly) */}
            <span className="
    pointer-events-none absolute inset-0 rounded-xl
    opacity-0 group-active:opacity-100
    bg-white/10 transition
  " />

            {/* 🔤 text */}
            <span className="relative z-10 whitespace-nowrap">
              Create Manual Order
            </span>

            {/* ➡️ icon */}
            <svg
              className="
      w-4 h-4 relative z-10

      transition-all duration-300
      group-hover:translate-x-1

      group-active:scale-110
    "
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 7l5 5-5 5" />
            </svg>
          </Link>


        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-10">
          <Stat title="Total Orders" value={stats.total} icon={Package} />
          <Stat title="Placed" value={stats.placed} icon={ClipboardList} color="purple" />
          <Stat title="In Process" value={stats.processing} icon={Clock} color="amber" />
          <Stat title="Ready" value={stats.ready} icon={Truck} color="blue" />
          <Stat title="Delivered" value={stats.delivered} icon={Check} color="green" />
          <Stat title="Cancelled" value={stats.cancelled} icon={X} color="rose" />
        </div>
        {/* ===== FILTER BAR ===== */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-xl bg-white/60 backdrop-blur">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
              setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                if (e.target.value) next.set("search", e.target.value);
                else next.delete("search");
                return next;
              }, { replace: true });
            }}
            placeholder="Search order / customer / mobile"
            className="border px-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#6B2E4A]/20 focus:border-[#6B2E4A]"
          />

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B2E4A]/20 focus:border-[#6B2E4A]"
          >
            <option value="">All Status</option>
            <option value="Placed">Placed</option>
            {/* 👇 FIXED: Changed "Processing" to "In-Process" to match Database */}
            <option value="In-Process">In Process</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* ===== ORDER CARDS ===== */}
        {loading ? (
          <div className="p-10 text-gray-400 animate-pulse">
            Loading orders…
          </div>
        ) : (
          <OrderTable orders={orders} onRefresh={fetchOrders} />
        )}

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 rounded border disabled:opacity-40"
              >
                ◀
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 rounded border disabled:opacity-40"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
function Stat({ title, value, icon: Icon, color }) {
  const themes = {
    purple: "from-purple-100 via-purple-50 to-white text-purple-700",
    amber: "from-amber-100 via-amber-50 to-white text-amber-700",
    blue: "from-blue-100 via-blue-50 to-white text-blue-700",
    green: "from-emerald-100 via-emerald-50 to-white text-emerald-700",
    rose: "from-rose-100 via-rose-50 to-white text-rose-700",
    default: "from-gray-100 via-white to-white text-gray-700",
  };

  return (
    <div className={`
      bg-gradient-to-br ${themes[color] || themes.default}
      rounded-3xl p-6 shadow-md
      hover:-translate-y-1 hover:shadow-xl transition
    `}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}