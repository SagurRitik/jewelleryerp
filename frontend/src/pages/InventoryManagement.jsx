import { useEffect, useMemo, useState, useRef } from "react";
import API from "../api";
import { Boxes, ChevronLeft, ChevronRight, Gem, Loader2, Search, Sparkles, Trash2, Weight } from "lucide-react";
import { toast } from "sonner";

const formatNumber = (value, digits = 2) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export default function InventoryManagement() {
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedAudience, setSelectedAudience] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payload, setPayload] = useState({
    summary: {
      totalProducts: 0,
      totalUnits: 0,
      totalMetalWeight: 0,
      totalGrossWeight: 0,
      totalFineGold: 0,
      totalDiamondWeight: 0,
      totalDiamondPieces: 0,
      totalStoneWeight: 0,
      totalStonePieces: 0,
      metals: [],
      metalGroups: [],
      categories: [],
      diamonds: [],
      stones: [],
    },
    products: [],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products/inventory/summary", {
        params: {
          search: query || undefined,
          targetAudience: selectedAudience !== "ALL" ? selectedAudience : undefined,
        },
      });
      setPayload(res.data);
    } catch (error) {
      console.error("Inventory summary load failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [query, selectedAudience]);

  const handleDeleteProduct = async (id, sku) => {
    if (!confirm(`Are you sure you want to delete product ${sku}? This action cannot be undone.`)) {
      return;
    }

    try {
      toast.loading("Deleting product...", { id: "delete-product" });
      await API.delete(`/products/${id}`);
      toast.success("Product deleted successfully", { id: "delete-product" });
      loadInventory(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error(error.response?.data?.message || "Failed to delete product", { id: "delete-product" });
    }
  };

  const { summary, products } = payload;
  const categoryOptions = useMemo(() => summary.categories || [], [summary.categories]);
  const pageSize = 20;

  useEffect(() => {
    if (
      selectedCategory !== "ALL" &&
      !categoryOptions.some((item) => item.category === selectedCategory)
    ) {
      setSelectedCategory("ALL");
    }
  }, [categoryOptions, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedAudience, query]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "ALL") return products;
    return products.filter(
      (product) => (product.jewelleryCategory || "Uncategorized") === selectedCategory
    );
  }, [products, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [currentPage, rowsPerPage, filteredProducts]);


  const selectedCategorySummary = useMemo(() => {
    if (selectedCategory === "ALL") {
      return {
        label: "All Products",
        productCount: summary.totalProducts || 0,
        unitCount: summary.totalUnits || 0,
      };
    }

    const matched = categoryOptions.find((item) => item.category === selectedCategory);
    return {
      label: selectedCategory,
      productCount: matched?.productCount || 0,
      unitCount: matched?.unitCount || 0,
    };
  }, [categoryOptions, selectedCategory, summary.totalProducts, summary.totalUnits]);

  const topProducts = useMemo(
    () => [...products].sort((a, b) => b.stock - a.stock).slice(0, 5),
    [products]
  );

  const productsByCategory = useMemo(() => {
    const grouped = [];
    let lastCategory = null;

    paginatedProducts.forEach((product) => {
      const category = product.jewelleryCategory || "Uncategorized";

      if (category !== lastCategory) {
        grouped.push({
          type: "header",
          id: `header-${category}`,
          category,
        });
        lastCategory = category;
      }

      grouped.push({
        type: "product",
        id: product._id,
        product,
      });
    });

    return grouped;
  }, [paginatedProducts]);

  return (
    <div className="min-h-screen bg-[#fcfaf8] text-[#2f2430]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-[#eadfdf] bg-gradient-to-br from-[#5a374f] via-[#714760] to-[#8c5f5f] p-6 text-white shadow-[0_20px_80px_rgba(90,55,79,0.18)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                Inventory Management
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Product stock, metal, diamond and stone summary
              </h1>
              <p className="mt-3 text-sm text-white/80 sm:text-base">
                See how many products you have in stock and the total material
                inside all inventory units.
              </p>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur">
              <label className="flex items-center gap-3 px-3 py-2">
                <Search size={18} className="text-white/70" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by title, SKU, category or metal"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none"
                />
              </label>
            </div>

            <div className="w-full max-w-[200px] rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur">
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ALL" className="text-black">All Audience</option>
                <option value="MEN" className="text-black">Men</option>
                <option value="WOMEN" className="text-black">Women</option>
                <option value="UNISEX" className="text-black">Unisex</option>
                <option value="KIDS" className="text-black">Kids</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<Boxes size={18} />}
            title="Products / Units"
            value={`${summary.totalProducts} / ${summary.totalUnits}`}
            helper="Distinct products and total stock units"
          />
          <SummaryCard
            icon={<Weight size={18} />}
            title="Metal Weight"
            value={`${formatNumber(summary.totalMetalWeight)} g`}
            helper={`Fine ${formatNumber(summary.totalFineGold)} g`}
          />
          <SummaryCard
            icon={<Sparkles size={18} />}
            title="Diamond"
            value={`${formatNumber(summary.totalDiamondWeight)} ct`}
            helper={`${summary.totalDiamondPieces} pieces`}
          />
          <SummaryCard
            icon={<Gem size={18} />}
            title="Stone"
            value={`${formatNumber(summary.totalStoneWeight)} ct`}
            helper={`${summary.totalStonePieces} pieces`}
          />
        </div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-3 rounded-3xl border border-[#ece3df] bg-white p-10 text-[#6b4a5b] shadow-sm">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-semibold tracking-wide">
              Loading inventory summary...
            </span>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <section className="rounded-[30px] border border-[#ece3df] bg-white/95 p-5 shadow-[0_18px_40px_rgba(79,50,69,0.08)] sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a7a84]">
                    Inventory Details
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-[#4e3245]">
                    Product-wise inventory
                  </h2>
                  <p className="mt-2 text-sm text-[#8c6f75]">
                    {selectedCategory === "ALL"
                      ? "Showing all products"
                      : `Showing ${selectedCategory} products`}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f7eef1] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b5a67]">
                      {selectedCategorySummary.label}
                    </span>
                    <span className="rounded-full border border-[#eadbdd] px-3 py-1 text-xs font-medium text-[#8c6f75]">
                      {selectedCategorySummary.productCount} products
                    </span>
                    <span className="rounded-full border border-[#eadbdd] px-3 py-1 text-xs font-medium text-[#8c6f75]">
                      {selectedCategorySummary.unitCount} units
                    </span>
                    <span className="rounded-full border border-[#eadbdd] px-3 py-1 text-xs font-medium text-[#8c6f75]">
                      Page {currentPage} of {totalPages || 1}
                    </span>
                  </div>
                </div>
                <div className="rounded-[22px] border border-[#efdee2] bg-gradient-to-br from-[#fff8fb] to-[#f7eef1] px-4 py-3 text-right shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#9a7a84]">
                    Fine Metal
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#4e3245]">
                    {formatNumber(summary.totalFineGold)} g
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(132px,1fr))]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("ALL")}
                    className={`min-h-[78px] w-full min-w-0 rounded-[22px] border px-4 py-3 text-left transition-all ${selectedCategory === "ALL"
                      ? "border-[#7d5867] bg-gradient-to-br from-[#f8edf1] to-[#f2e2e8] shadow-sm"
                      : "border-[#ecdfe1] bg-[#fcf8f6] hover:border-[#dcc9ce] hover:bg-[#fffaf8]"
                      }`}
                  >
                    <p className="truncate font-semibold text-[#4e3245]">All Products</p>
                    <p className="mt-1 text-xs leading-5 text-[#8c6f75]">
                      {summary.totalProducts} products | {summary.totalUnits} units
                    </p>
                  </button>

                  {categoryOptions.map((item) => (
                    <button
                      key={item.category}
                      type="button"
                      onClick={() => setSelectedCategory(item.category)}
                      className={`min-h-[78px] w-full min-w-0 rounded-[22px] border px-4 py-3 text-left transition-all ${selectedCategory === item.category
                        ? "border-[#7d5867] bg-gradient-to-br from-[#f8edf1] to-[#f2e2e8] shadow-sm"
                        : "border-[#ecdfe1] bg-[#fcf8f6] hover:border-[#dcc9ce] hover:bg-[#fffaf8]"
                        }`}
                    >
                      <p className="truncate font-semibold text-[#4e3245]">{item.category}</p>
                      <p className="mt-1 text-xs leading-5 text-[#8c6f75]">
                        {item.productCount} products | {item.unitCount} units
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-[24px] border border-[#f0e4e3] bg-[#fffdfc] p-3">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9a7a84]">
                      <th className="px-4 pb-2">Product</th>
                      <th className="px-4 pb-2">Stock</th>
                      <th className="px-4 pb-2">Metal</th>
                      <th className="px-4 pb-2">Diamond</th>
                      <th className="px-4 pb-2">Stone</th>
                      <th className="px-4 pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="rounded-3xl border border-dashed border-[#e7dada] px-4 py-10 text-center text-sm text-[#8c6f75]"
                        >
                          No products matched this category or search.
                        </td>
                      </tr>
                    ) : (
                      productsByCategory.map((entry) =>
                        entry.type === "header" ? (
                          <tr key={entry.id}>
                            <td colSpan="6" className="px-2 pt-3">
                              <div className="rounded-2xl border border-[#ecdfe1] bg-gradient-to-r from-[#faf1f4] to-[#fff8f6] px-4 py-2.5">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8e6977]">
                                  {entry.category}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr
                            key={entry.id}
                            className="rounded-3xl bg-[#fcf8f6] text-sm text-[#43303f] shadow-[0_10px_22px_rgba(67,48,63,0.05)]"
                          >
                            <td className="rounded-l-3xl px-4 py-4 align-top">
                              <p className="font-semibold text-[#4e3245]">
                                {entry.product.title}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#8c6f75]">
                                <span className="rounded-full bg-white px-2.5 py-1">SKU: {entry.product.sku}</span>
                                <span className="rounded-full bg-white px-2.5 py-1">{entry.product.jewelleryCategory}</span>
                                <span className="rounded-full bg-purple-100 text-purple-700 px-2.5 py-1 font-bold">{entry.product.targetAudience}</span>
                              </div>
                              <p className="mt-2 text-xs text-[#8c6f75]">
                                Gross: {formatNumber(entry.product.totalGrossWeight)} g
                              </p>
                              <p className="mt-2 text-xs text-[#8c6f75]">
                                {entry.product.componentDetails.length > 0
                                  ? entry.product.componentDetails
                                    .slice(0, 3)
                                    .map(
                                      (item) =>
                                        `${item.type}: ${item.totalPieces} pcs / ${formatNumber(item.totalWeight)}`
                                    )
                                    .join(" | ")
                                  : "No stones or diamonds attached"}
                              </p>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span className="inline-flex min-w-[56px] justify-center rounded-full bg-white px-3 py-1.5 font-semibold text-[#4e3245]">
                                {entry.product.stock}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <p className="font-semibold text-[#4e3245]">{entry.product.metalType} {entry.product.metalPurity}</p>
                              <p className="mt-1 text-xs text-[#8c6f75]">
                                {formatNumber(entry.product.totalMetalWeight)} g net
                              </p>
                              <p className="text-xs text-[#8c6f75]">
                                {formatNumber(entry.product.totalFineGold)} g fine
                              </p>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <p className="font-semibold text-[#4e3245]">
                                {entry.product.diamondPieces} pcs
                              </p>
                              <p className="mt-1 text-xs text-[#8c6f75]">
                                {formatNumber(entry.product.diamondWeight)} ct
                              </p>
                              {entry.product.diamondPieces > 0 && (
                                <p className="text-[10px] text-[#9a7a84] italic">
                                  Avg: {formatNumber(entry.product.diamondWeight / entry.product.diamondPieces, 3)} ct/pc
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <p className="font-semibold text-[#4e3245]">
                                {entry.product.stonePieces} pcs
                              </p>
                              <p className="mt-1 text-xs text-[#8c6f75]">
                                {formatNumber(entry.product.stoneWeight)} ct
                              </p>
                              {entry.product.stonePieces > 0 && (
                                <p className="text-[10px] text-[#9a7a84] italic">
                                  Avg: {formatNumber(entry.product.stoneWeight / entry.product.stonePieces, 3)} ct/pc
                                </p>
                              )}
                            </td>
                            <td className="rounded-r-3xl px-4 py-4 align-top text-right">
                              <button
                                onClick={() => handleDeleteProduct(entry.product._id, entry.product.sku)}
                                className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all active:scale-95"
                                title="Delete Product"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length > 0 && (
                <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-[#f0e4e3] pt-6 sm:flex-row">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9a7a84]">
                      Rows:
                    </span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-xl border border-[#eadbdd] bg-white px-3 py-1.5 text-sm font-semibold text-[#4e3245] focus:outline-none focus:ring-2 focus:ring-[#7d5867]/20"
                    >
                      {[10, 20, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs font-medium text-[#8c6f75]">
                      Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
                      {Math.min(currentPage * rowsPerPage, filteredProducts.length)} of{" "}
                      {filteredProducts.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadbdd] bg-white text-[#4e3245] transition-all hover:bg-[#fcf8f6] disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1.5 rounded-2xl bg-[#fcf8f6] p-1.5">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === pageNum
                              ? "bg-[#7d5867] text-white shadow-md"
                              : "text-[#8c6f75] hover:bg-white hover:text-[#4e3245]"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadbdd] bg-white text-[#4e3245] transition-all hover:bg-[#fcf8f6] disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </section>

            <div className="space-y-6">
              <section className="rounded-[26px] border border-[#ece3df] bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a7a84]">
                  Metal Breakdown
                </p>
                <h3 className="mt-2 text-xl font-bold text-[#4e3245]">
                  Gold, Silver, Platinum with purity and fine
                </h3>

                <div className="mt-5 space-y-4">
                  {summary.metalGroups?.length ? (
                    summary.metalGroups.map((group) => (
                      <div
                        key={group.metalType}
                        className="rounded-3xl border border-[#ecdfe1] bg-[#fcf8f6] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-bold text-[#4e3245]">
                              {group.metalType}
                            </p>
                            <p className="mt-1 text-xs text-[#8c6f75]">
                              {group.units} units
                            </p>
                          </div>
                          <div className="text-right text-xs text-[#8c6f75]">
                            <p>Metal: {formatNumber(group.metalWeight)} g</p>
                            <p>Fine: {formatNumber(group.fineGold)} g</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {group.purities.map((item) => (
                            <div
                              key={`${item.metalType}-${item.metalPurity}`}
                              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                            >
                              <div className="pr-4">
                                <p className="font-semibold text-[#4e3245]">
                                  {item.metalPurity}
                                </p>
                                <p className="mt-1 text-xs text-[#8c6f75]">
                                  {item.units} units | Fine {formatNumber(item.fineGold)} g
                                </p>
                              </div>
                              <p className="text-sm font-bold text-[#4e3245]">
                                {formatNumber(item.metalWeight)} g
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl bg-[#fcf8f6] px-4 py-5 text-sm text-[#8c6f75]">
                      No inventory data available.
                    </div>
                  )}
                </div>
              </section>

              <BreakdownCard
                title="Diamond Breakdown"
                subtitle="All diamonds used in inventory"
                rows={summary.diamonds.map((item) => ({
                  label: item.type,
                  value: `${formatNumber(item.weight)} ct`,
                  meta: `${item.pieces} pcs`,
                }))}
              />

              <BreakdownCard
                title="Stone Breakdown"
                subtitle="All non-diamond stones in inventory"
                rows={summary.stones.map((item) => ({
                  label: item.type,
                  value: `${formatNumber(item.weight)} ct`,
                  meta: `${item.pieces} pcs`,
                }))}
              />

              <BreakdownCard
                title="Top Stocked Products"
                subtitle="Highest unit stock in inventory"
                rows={topProducts.map((item) => ({
                  label: item.title,
                  value: `${item.stock} units`,
                  meta: item.sku,
                }))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, helper }) {
  return (
    <div className="rounded-[24px] border border-[#ece3df] bg-gradient-to-br from-white to-[#fff9f7] p-5 shadow-[0_12px_28px_rgba(79,50,69,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a7a84]">
          {title}
        </p>
        <div className="rounded-full border border-[#eadbdd] bg-[#f8f0f3] p-2 text-[#6b4457]">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-[#4e3245]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#8c6f75]">{helper}</p>
    </div>
  );
}

function BreakdownCard({ title, subtitle, rows }) {
  return (
    <section className="rounded-[26px] border border-[#ece3df] bg-gradient-to-br from-white to-[#fffaf8] p-5 shadow-[0_12px_28px_rgba(79,50,69,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9a7a84]">
        {title}
      </p>
      <h3 className="mt-2 text-xl font-bold text-[#4e3245]">{subtitle}</h3>

      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl bg-[#fcf8f6] px-4 py-5 text-sm text-[#8c6f75]">
            No inventory data available.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={`${row.label}-${row.meta}`}
              className="flex items-center justify-between rounded-2xl border border-[#f0e3e2] bg-[#fcf8f6] px-4 py-3"
            >
              <div className="pr-4">
                <p className="font-semibold text-[#4e3245]">{row.label}</p>
                <p className="mt-1 text-xs text-[#8c6f75]">{row.meta}</p>
              </div>
              <p className="text-sm font-bold text-[#4e3245]">{row.value}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
