
import { useState, useRef } from "react";
import axios from "axios";
import { useProductList } from "../../context/ProductListContext";

const API = "/api/products";

/* ───────────────────────── TEMPLATE DATA ───────────────────────── */
const TEMPLATE_HEADERS = [
  "sku", "title", "description", "jewelleryCategory", "productType",
  "metalType", "metalPurity", "metalColor", "netWeight", "grossWeight",
  "fineGold", "stock", "hsnCode", "huid", "targetAudience", "image"
];

const TEMPLATE_SAMPLE = [
  "RNG-001", "Diamond Solitaire Ring", "Beautiful solitaire ring", "Ring", "Engagement",
  "Gold", "18KT", "Yellow", "3.5", "4.2",
  "3.15", "1", "7113", "", "WOMEN", "ring001.jpg"
];

const FIELD_GUIDE = [
  { field: "sku", required: true, description: "Unique product code (e.g. RNG-001)" },
  { field: "title", required: true, description: "Product name" },
  { field: "jewelleryCategory", required: true, description: "Ring, Necklace, Earring, Bracelet, Pendant, Bangle, etc." },
  { field: "metalType", required: true, description: "Gold, Silver, Platinum, etc." },
  { field: "metalPurity", required: true, description: "18KT, 22KT, 925, etc." },
  { field: "netWeight", required: true, description: "Metal weight in grams (number)" },
  { field: "grossWeight", required: true, description: "Total product weight in grams (number)" },
  { field: "description", required: false, description: "Optional product description" },
  { field: "productType", required: false, description: "E.g. Engagement, Wedding, Casual" },
  { field: "metalColor", required: false, description: "Yellow, White, Rose" },
  { field: "fineGold", required: false, description: "Fine gold content (number)" },
  { field: "stock", required: false, description: "Stock quantity (default: 0)" },
  { field: "hsnCode", required: false, description: "HSN code (default: 7113)" },
  { field: "huid", required: false, description: "Hallmarking Unique ID" },
  { field: "targetAudience", required: false, description: "MEN, WOMEN, UNISEX, KIDS (default: UNISEX)" },
  { field: "image", required: false, description: "Filename in the ZIP (e.g. ring001.jpg)" },
];

/* ───────────────────────── COMPONENT ───────────────────────── */
export default function BulkUploadProducts() {
  const [excel, setExcel] = useState(null);
  const [zip, setZip] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("upload"); // upload | guide
  const excelRef = useRef();
  const zipRef = useRef();
  const { invalidateCache, refresh } = useProductList();

  const handleBulkUpload = async () => {
    if (!excel) {
      setMessage("❌ Please select an Excel (.xlsx) file first.");
      return;
    }

    const fd = new FormData();
    fd.append("excel", excel);
    if (zip) fd.append("images", zip);

    try {
      setLoading(true);
      setMessage("");
      setReport(null);

      const res = await axios.post(`${API}/bulk-upload`, fd);
      setReport(res.data);
      invalidateCache(); // wipe client cache
      refresh();         // immediately re-fetch page 1 from server
      setMessage("🚀 Bulk upload completed!");
    } catch (e) {
      setMessage(e.response?.data?.message || "❌ Bulk upload failed. Check your Excel file.");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    import("xlsx").then((XLSX) => {
      const MAIN_HEADERS = [
        "sku", "title", "description", "jewelleryCategory", "productType",
        "metalType", "metalPurity", "metalColor", "netWeight", "grossWeight",
        "fineGold", "stock", "hsnCode", "huid", "targetAudience", "image",
      ];

      const MAX_COMPONENTS = 6;
      const COMP_FIELDS = [
        { key: "type", label: "Type" }, { key: "role", label: "Role" },
        { key: "shape", label: "Shape" }, { key: "color_clarity", label: "Color/Clarity" },
        { key: "cut", label: "Cut" }, { key: "count", label: "Qty" },
        { key: "weight", label: "Weight" }, { key: "size", label: "Size" }
      ];

      const compHeaders = [];
      for (let i = 1; i <= MAX_COMPONENTS; i++) {
        COMP_FIELDS.forEach(f => compHeaders.push(`comp${i}_${f.key}`));
      }

      const ALL_HEADERS = [...MAIN_HEADERS, ...compHeaders];

      // Sample Row
      const sampleRow = {
        sku: "RNG-001", title: "Diamond Solitaire Ring", description: "Beautiful solitaire ring",
        jewelleryCategory: "Ring", productType: "Engagement", metalType: "Gold", metalPurity: "18KT",
        metalColor: "Yellow", netWeight: 3.5, grossWeight: 4.2, fineGold: 3.15, stock: 1,
        hsnCode: "7113", huid: "", targetAudience: "WOMEN", image: "ring001.jpg",
        comp1_type: "Diamond", comp1_role: "CENTER", comp1_shape: "Round",
        comp1_color_clarity: "D-F / VVS-VK", comp1_cut: "EX", comp1_count: 1,
        comp1_weight: 0.50, comp1_size: "0.5ct",
        comp2_type: "Diamond", comp2_role: "SIDE", comp2_shape: "Round",
        comp2_color_clarity: "G-H / VS", comp2_cut: "VG", comp2_count: 6,
        comp2_weight: 0.18, comp2_size: "3 cents per pcs"
      };

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([sampleRow], { header: ALL_HEADERS });

      // Auto column width
      ws["!cols"] = ALL_HEADERS.map(h => ({ wch: Math.max(h.length, 12) }));

      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, "bulk_upload_template.xlsx");
    });
  };

  const isSuccess = message.startsWith("🚀") || message.startsWith("✅");

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .bulk-upload * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .drop-zone { transition: all 0.2s ease; border: 2px dashed #d1d5db; }
        .drop-zone:hover { border-color: #6B3151; background: #fdf5f8; }
        .drop-zone.has-file { border-color: #059669; background: #f0fdf4; border-style: solid; }
        .tab-btn { transition: all 0.2s ease; border-bottom: 2px solid transparent; }
        .tab-btn.active { border-bottom-color: #6B3151; color: #6B3151; }
        .tab-btn:not(.active) { color: #6b7280; }
        .tab-btn:not(.active):hover { color: #374151; }
        .field-row:nth-child(even) { background: #f9fafb; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease-out; }
        .stat-card:nth-child(1) { border-top: 3px solid #3b82f6; }
        .stat-card:nth-child(2) { border-top: 3px solid #10b981; }
        .stat-card:nth-child(3) { border-top: 3px solid #f59e0b; }
        .stat-card:nth-child(4) { border-top: 3px solid #ef4444; }
      `}</style>

      <div className="bulk-upload">
        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(135deg, #3A332C 0%, #6B3151 100%)" }} className="text-white px-8 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📦</span>
              <h1 className="text-3xl font-bold tracking-tight">Bulk Product Upload</h1>
            </div>
            <p className="text-white/70 text-sm mt-1">
              Upload an Excel spreadsheet to add or update products in bulk. Images via ZIP are optional.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* ── Tabs ── */}
          <div className="flex gap-6 border-b border-gray-200 mb-8">
            {[
              { id: "upload", label: "⬆️  Upload Files" },
              { id: "guide", label: "📋  Format Guide" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn pb-3 text-sm font-600 font-semibold ${activeTab === tab.id ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ══════════════════ UPLOAD TAB ══════════════════ */}
          {activeTab === "upload" && (
            <div className="fade-up space-y-6">
              {/* File Upload Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Excel */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Excel File <span className="text-red-500">*</span></label>
                    <span className="text-xs text-gray-400">Required · .xlsx only</span>
                  </div>
                  <div
                    className={`drop-zone rounded-xl p-6 text-center cursor-pointer ${excel ? "has-file" : ""}`}
                    onClick={() => excelRef.current.click()}
                  >
                    <div className="text-4xl mb-3">{excel ? "✅" : "📊"}</div>
                    {excel ? (
                      <>
                        <p className="font-semibold text-green-700 text-sm">{excel.name}</p>
                        <p className="text-xs text-green-500 mt-1">{(excel.size / 1024).toFixed(1)} KB</p>
                        <button
                          className="mt-3 text-xs text-red-400 hover:text-red-600 underline"
                          onClick={e => { e.stopPropagation(); setExcel(null); excelRef.current.value = ""; }}
                        >Remove</button>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-600 text-sm">Click to upload Excel</p>
                        <p className="text-xs text-gray-400 mt-1">.xlsx format only</p>
                      </>
                    )}
                    <input ref={excelRef} type="file" accept=".xlsx" className="hidden" onChange={e => setExcel(e.target.files[0])} />
                  </div>
                </div>

                {/* ZIP */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Images ZIP</label>
                    <span className="text-xs text-emerald-500 font-medium">Optional · .zip only</span>
                  </div>
                  <div
                    className={`drop-zone rounded-xl p-6 text-center cursor-pointer ${zip ? "has-file" : ""}`}
                    onClick={() => zipRef.current.click()}
                  >
                    <div className="text-4xl mb-3">{zip ? "✅" : "📁"}</div>
                    {zip ? (
                      <>
                        <p className="font-semibold text-green-700 text-sm">{zip.name}</p>
                        <p className="text-xs text-green-500 mt-1">{(zip.size / 1024).toFixed(1)} KB</p>
                        <button
                          className="mt-3 text-xs text-red-400 hover:text-red-600 underline"
                          onClick={e => { e.stopPropagation(); setZip(null); zipRef.current.value = ""; }}
                        >Remove</button>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-600 text-sm">Click to upload images ZIP</p>
                        <p className="text-xs text-gray-400 mt-1">Put images inside the ZIP, reference by filename in Excel</p>
                      </>
                    )}
                    <input ref={zipRef} type="file" accept=".zip" className="hidden" onChange={e => setZip(e.target.files[0])} />
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <span className="text-blue-500 text-lg mt-0.5">ℹ️</span>
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">How it works</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-600 text-xs">
                    <li>Upload your <strong>.xlsx</strong> file with product data (see Format Guide for column names)</li>
                    <li>If products have images, zip them and upload the ZIP — reference by filename in the <code className="bg-blue-100 px-1 rounded">image</code> column</li>
                    <li>Existing SKUs will be <strong>updated</strong>, new SKUs will be <strong>inserted</strong></li>
                    <li>Images ZIP is completely optional — products upload fine without images</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={handleBulkUpload}
                  disabled={loading || !excel}
                  style={{ background: !loading && excel ? "linear-gradient(135deg, #6B3151, #4A2840)" : undefined }}
                  className={`px-8 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all shadow-md ${loading || !excel ? "bg-gray-300 cursor-not-allowed" : "hover:opacity-90 active:scale-95"
                    }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Uploading...
                    </>
                  ) : "🚀  Upload Products"}
                </button>

                <button
                  onClick={downloadTemplate}
                  className="px-6 py-3 rounded-xl text-sm font-semibold border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-all"
                >
                  ⬇️  Download Sample CSV
                </button>
              </div>

              {/* Status Message */}
              {message && (
                <div className={`fade-up rounded-xl p-4 text-sm font-medium ${isSuccess ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"
                  }`}>
                  {message}
                </div>
              )}

              {/* ── Report ── */}
              {report && (
                <div className="fade-up bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800 text-lg">📊 Upload Report</h2>
                    {report.summary?.sheetUsed && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                        Sheet: {report.summary.sheetUsed}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-gray-100">
                    {[
                      { label: "Total Processed", value: report.summary?.totalProcessed ?? 0, color: "#3b82f6" },
                      { label: "Inserted", value: report.summary?.inserted ?? 0, color: "#10b981" },
                      { label: "Updated", value: report.summary?.updated ?? 0, color: "#f59e0b" },
                      { label: "Skipped", value: report.summary?.skipped ?? 0, color: "#ef4444" },
                    ].map((s, i) => (
                      <div key={i} className="stat-card p-5 text-center" style={{ borderTop: `3px solid ${s.color}` }}>
                        <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tables */}
                  <div className="p-6 space-y-6">
                    {/* Inserted */}
                    {report.report?.inserted?.length > 0 && (
                      <ReportTable title="📥 Inserted" color="#10b981" rows={report.report.inserted} columns={["row", "sku"]} />
                    )}
                    {/* Updated */}
                    {report.report?.updated?.length > 0 && (
                      <ReportTable title="🔁 Updated" color="#f59e0b" rows={report.report.updated} columns={["row", "sku"]} />
                    )}
                    {/* Skipped */}
                    {report.report?.skipped?.length > 0 && (
                      <ReportTable title="⚠️ Skipped / Errors" color="#ef4444" rows={report.report.skipped} columns={["row", "sku", "reason"]} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════ FORMAT GUIDE TAB ══════════════════ */}
          {activeTab === "guide" && (
            <div className="fade-up space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Excel Column Reference</h2>
                  <p className="text-xs text-gray-500 mt-1">Column names must match exactly (case-insensitive). Spaces and underscores are ignored.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Column</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Required</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FIELD_GUIDE.map((f, i) => (
                        <tr key={i} className="field-row border-b border-gray-100">
                          <td className="px-5 py-3">
                            <code className="bg-gray-100 text-purple-700 px-2 py-0.5 rounded text-xs font-mono font-bold">{f.field}</code>
                          </td>
                          <td className="px-5 py-3">
                            {f.required ? (
                              <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">Required</span>
                            ) : (
                              <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Optional</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-gray-600 text-xs">{f.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Image Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-bold text-amber-800 mb-2">📸 Image Upload Instructions</h3>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-amber-700">
                  <li>Put all your product images into a folder</li>
                  <li>Compress the folder into a <strong>.zip</strong> file</li>
                  <li>In your Excel, enter the <strong>filename only</strong> in the <code className="bg-amber-100 px-1 rounded">image</code> column (e.g. <code className="bg-amber-100 px-1 rounded">ring001.jpg</code>)</li>
                  <li>The ZIP and Excel files must match — if the file is not found in the ZIP, the product uploads without an image</li>
                  <li>Multiple images per product are not supported in bulk upload — use the product edit page for that</li>
                </ol>
              </div>

              {/* Sample Row */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Sample Row</h2>
                  <p className="text-xs text-gray-500 mt-1">A minimal valid example row for your Excel</p>
                </div>
                <div className="overflow-x-auto p-4">
                  <table className="text-xs border border-gray-200 rounded-lg overflow-hidden w-full">
                    <thead>
                      <tr className="bg-[#6B3151] text-white">
                        {TEMPLATE_HEADERS.map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-50">
                        {TEMPLATE_SAMPLE.map((v, i) => (
                          <td key={i} className="px-3 py-2 border-t border-gray-200 whitespace-nowrap font-mono text-gray-700">{v}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={downloadTemplate}
                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 text-sm font-semibold hover:border-[#6B3151] hover:text-[#6B3151] transition-all"
              >
                ⬇️  Download Sample CSV Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────── Sub-component ───────────────── */
function ReportTable({ title, color, rows, columns }) {
  const colLabels = { row: "Row #", sku: "SKU", reason: "Reason" };
  return (
    <div>
      <h3 className="font-semibold text-sm mb-3" style={{ color }}>{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map(c => (
                <th key={c} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{colLabels[c]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map(c => (
                  <td key={c} className="px-4 py-2.5 text-xs text-gray-700">
                    {c === "sku"
                      ? <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-purple-700">{r[c] || "—"}</code>
                      : r[c] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}