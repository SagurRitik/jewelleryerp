import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { useLocation, useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import { QRCodeCanvas } from "qrcode.react";
import {
  Printer, ChevronLeft, Layout, Settings,
  ArrowUp, ArrowLeft, ZoomIn, Info,
  RotateCw, Move, Type, Eye, RefreshCcw,
  Maximize, FileText, User, List, QrCode, Plus, Trash2, Zap,
  Upload, SlidersHorizontal
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const INITIAL_ELEMENTS = {
  category: { id: "category", name: "Category Name", x: 2, y: 1.5, rotate: 0, scale: 1, visible: true },
  metalPurity: { id: "metalPurity", name: "Metal & Purity", x: 2, y: 4.5, rotate: 0, scale: 1, visible: true },
  gw: { id: "gw", name: "Gross Weight (GW)", x: 2, y: 7.5, rotate: 0, scale: 1, visible: true, gap: 0.5 },
  nw: { id: "nw", name: "Net Weight (NW)", x: 2, y: 10.5, rotate: 0, scale: 1, visible: true, gap: 0.5 },
  skuText: { id: "skuText", name: "SKU Label", x: 34, y: 1.5, rotate: 0, scale: 1, visible: true },
  barcode: { id: "barcode", name: "Barcode/QR", x: 33, y: 4.5, rotate: 0, scale: 1, visible: true, type: "barcode" },
  dgw: { id: "dgw", name: "Diamond GW (D.GW)", x: 48, y: 8.5, rotate: 0, scale: 1, visible: true, gap: 0.5 },
  sgw: { id: "sgw", name: "Stone GW (S.GW)", x: 48, y: 11.5, rotate: 0, scale: 1, visible: true, gap: 0.5 },
  fine: { id: "fine", name: "Fine Weight", x: 34, y: 11.5, rotate: 0, scale: 0.8, visible: true },
  huid: { id: "huid", name: "HUID / Hallmark", x: 34, y: 8.5, rotate: 0, scale: 0.8, visible: true },
  custom: { id: "custom", name: "Custom Note", x: 48, y: 1.5, rotate: 0, scale: 0.8, visible: true },
};

export default function BarcodeTagPrinter() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { products: initialProducts = [] } = location.state || {};

  // Editor State
  const [elements, setElements] = useState(INITIAL_ELEMENTS);
  const [selectedId, setSelectedId] = useState("barcode");
  const [format, setFormat] = useState("butterfly_65x15");
  const [zoom, setZoom] = useState(1.4);

  // Sidebar Mode
  const [sidebarTab, setSidebarTab] = useState("product_list"); // "product_list", "manual", or "quick"
  const [quickCodeValue, setQuickCodeValue] = useState("SKU-999");
  const [quickCodeType, setQuickCodeType] = useState("barcode");
  const [quickCodeScale, setQuickCodeScale] = useState(1);
  const [quickCodeList, setQuickCodeList] = useState([]);
  const [manualData, setManualData] = useState({
    title: "Bangle",
    jewelleryCategory: "Bangle",
    sku: "SKU-001",
    metalType: "Gold",
    metalPurity: "22KT",
    grossWeight: 10.500,
    netWeight: 9.800,
    jewelleryStones: [
      { stoneType: "Diamond", stoneWeight: 0.50 },
      { stoneType: "Stone", stoneWeight: 0.20 }
    ],
    fine: 9.160,
    huid: "HUID12345",
    custom: "LIMITED EDITION",
    customFields: []
  });

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const updateElement = (id, updates) => {
    setElements(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const resetLayout = () => {
    setElements(INITIAL_ELEMENTS);
  };

  const handleManualChange = (field, value) => {
    setManualData(prev => ({ ...prev, [field]: value }));
  };

  const handleStoneChange = (idx, value) => {
    const newStones = [...manualData.jewelleryStones];
    newStones[idx].stoneWeight = parseFloat(value) || 0;
    setManualData(prev => ({ ...prev, jewelleryStones: newStones }));
  };

  const addCustomField = () => {
    const id = `custom_${Date.now()}`;
    const newField = { id, label: "New Field", value: "Value" };

    setManualData(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField]
    }));

    // Add corresponding element configuration
    setElements(prev => ({
      ...prev,
      [id]: { id, name: "Custom Field", x: 34, y: 13, rotate: 0, scale: 0.8, visible: true }
    }));

    setSelectedId(id);
  };

  const removeCustomField = (id) => {
    setManualData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.id !== id)
    }));
    setElements(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selectedId === id) setSelectedId(null);
  };

  const updateCustomField = (id, field, value) => {
    setManualData(prev => ({
      ...prev,
      customFields: prev.customFields.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Flatten the data and filter out empty values
      const codes = data.flat().filter(val => val && String(val).trim() !== "");
      if (codes.length > 0) {
        setQuickCodeList(codes);
        setSidebarTab("quick");
      }
    };
    reader.readAsBinaryString(file);
  };

  const activeProducts = sidebarTab === "manual" ? [manualData] : sidebarTab === "quick" ? (quickCodeList.length > 0 ? quickCodeList.map(v => ({ quickValue: v })) : [{ quickValue: quickCodeValue }]) : initialProducts;

  // Mouse Handlers for Dragging
  const onMouseDown = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging || !selectedId) return;

      const dx = (e.clientX - dragStart.x) * (1 / zoom) * 0.264583; // px to mm approx based on screen DPI
      const dy = (e.clientY - dragStart.y) * (1 / zoom) * 0.264583;

      setElements(prev => ({
        ...prev,
        [selectedId]: {
          ...prev[selectedId],
          x: prev[selectedId].x + dx,
          y: prev[selectedId].y + dy
        }
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const onMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, selectedId, dragStart, zoom]);

  if (activeProducts.length === 0 && sidebarTab === "product_list") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <Layout size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">No Tags to Print</h2>
          <p className="text-gray-500 mt-2 mb-6">Select products from the list or use Manual Mode in results.</p>
          <div className="space-y-4">
            <button onClick={() => navigate("/products")} className="w-full py-3 bg-[#5A374F] text-white rounded-xl font-bold">Go to Product List</button>
            <button onClick={() => setSidebarTab("manual")} className="w-full py-3 border-2 border-[#5A374F] text-[#5A374F] rounded-xl font-bold">Try Manual Entry</button>
          </div>
        </div>
      </div>
    );
  }

  const selected = elements[selectedId];

  return (
    <div className={`h-screen w-screen overflow-hidden flex transition-colors duration-300 ${isDark ? "bg-[#0b0b0b]" : "bg-[#f8f9fa]"} print:bg-white print:h-auto print:overflow-visible`}>
      <style>{`
        body, html { margin: 0; padding: 0; overflow: hidden !important; height: 100% !important; width: 100% !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* ⚙️ PROFESSIONAL DESIGNER SIDEBAR (Hidden on Print)       {/* ⚙️ PROFESSIONAL DESIGNER SIDEBAR (Hidden on Print) */}
      <div className={`hidden lg:flex flex-col w-80 h-screen border-r transition-all duration-300 print:hidden ${isDark ? "bg-[#111] border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.3)]" : "bg-white border-gray-100 shadow-[20px_0_50px_rgba(0,0,0,0.02)]"}`}>

        {/* Sidebar Header with Mode Switching */}
        <div className="border-b border-inherit bg-slate-50/50">
          <div className="flex px-2 pt-2 gap-1">
            <button
              onClick={() => setSidebarTab("product_list")}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest rounded-t-xl transition-all ${sidebarTab === "product_list" ? "bg-white text-[#5A374F] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]" : "text-slate-400 opacity-60 hover:opacity-100"}`}
            >
              <List size={12} /> List
            </button>
            <button
              onClick={() => setSidebarTab("manual")}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest rounded-t-xl transition-all ${sidebarTab === "manual" ? "bg-white text-[#5A374F] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]" : "text-slate-400 opacity-60 hover:opacity-100"}`}
            >
              <User size={12} /> Manual
            </button>
            <button
              onClick={() => setSidebarTab("quick")}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest rounded-t-xl transition-all ${sidebarTab === "quick" ? "bg-white text-[#5A374F] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]" : "text-slate-400 opacity-60 hover:opacity-100"}`}
            >
              <Zap size={12} /> Quick
            </button>
          </div>

          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#5A374F]">
              <div className="p-1.5 bg-[#5A374F] rounded-lg text-white">
                {sidebarTab === 'manual' ? <User size={14} /> : sidebarTab === 'quick' ? <Zap size={14} /> : <Layout size={14} />}
              </div>
              <h2 className="font-black text-[10px] uppercase tracking-wider">
                {sidebarTab === 'manual' ? 'Manual' : sidebarTab === 'quick' ? 'Quick Print' : 'Explorer'}
              </h2>
            </div>
            <button onClick={resetLayout} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-all" title="Reset Layout">
              <RefreshCcw size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-6">

          {sidebarTab === 'quick' ? (
            <section className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="p-4 bg-[#5A374F]/5 rounded-2xl border border-[#5A374F]/10 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5A374F] uppercase tracking-wider flex items-center gap-2">
                    <Type size={12} /> Code Value
                  </label>
                  <input
                    type="text"
                    value={quickCodeValue}
                    onChange={(e) => setQuickCodeValue(e.target.value)}
                    placeholder="e.g. SKU-123456"
                    className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-[13px] font-bold focus:ring-2 focus:ring-[#5A374F] transition-all outline-none shadow-sm"
                  />
                  <p className="text-[9px] text-slate-400 italic px-1">Type any text or SKU to generate instant code.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Format Type</label>
                  <div className="flex p-1 bg-slate-100/50 rounded-xl gap-1">
                    <button
                      onClick={() => setQuickCodeType("barcode")}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${quickCodeType === 'barcode' ? "bg-white text-[#5A374F] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      Barcode
                    </button>
                    <button
                      onClick={() => setQuickCodeType("qrcode")}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${quickCodeType === 'qrcode' ? "bg-white text-[#5A374F] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      QR Code
                    </button>
                  </div>
                </div>

                {/* SIZE SLIDER */}
                <div className="space-y-3 pt-2 border-t border-[#5A374F]/10">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <SlidersHorizontal size={12} /> Code Size
                    </label>
                    <span className="text-[10px] font-mono font-bold text-[#5A374F] bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">
                      {Math.round(quickCodeScale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range" min="0.4" max="2.0" step="0.05"
                    value={quickCodeScale}
                    onChange={(e) => setQuickCodeScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5A374F]"
                  />
                </div>

                {/* BULK IMPORT */}
                <div className="pt-2 border-t border-[#5A374F]/10">
                  <input
                    type="file" accept=".xlsx, .xls, .csv"
                    id="bulk-import-input"
                    className="hidden"
                    onChange={handleExcelImport}
                  />
                  <button
                    onClick={() => document.getElementById('bulk-import-input').click()}
                    className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-100 hover:border-[#5A374F] text-[#5A374F] rounded-xl transition-all shadow-sm group"
                  >
                    <div className="p-1.5 bg-[#5A374F]/5 rounded-lg group-hover:bg-[#5A374F] group-hover:text-white transition-colors">
                      <Upload size={14} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-tight font-sans">Import Excel / Bulk</span>
                  </button>

                  {quickCodeList.length > 0 && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase">{quickCodeList.length} Items Loaded</span>
                        <button
                          onClick={() => setQuickCodeList([])}
                          className="text-[9px] font-bold text-red-400 hover:text-red-500 uppercase flex items-center gap-1"
                        >
                          <Trash2 size={10} /> Clear
                        </button>
                      </div>
                      <div className="max-h-24 overflow-y-auto custom-scrollbar space-y-1">
                        {quickCodeList.slice(0, 5).map((code, i) => (
                          <div key={i} className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded truncate">
                            {code}
                          </div>
                        ))}
                        {quickCodeList.length > 5 && <div className="text-[9px] text-slate-300 text-center py-1">+{quickCodeList.length - 5} more...</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-2 space-y-4 text-slate-400">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-[#5A374F]">
                    <Printer size={14} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-600 uppercase">Instant Replacement</h4>
                    <p className="text-[9px] leading-relaxed mt-0.5">Use this for single misprinted labels. Centered layout ensures zero wastage.</p>
                  </div>
                </div>
              </div>
            </section>
          ) : sidebarTab === 'manual' ? (
            <section className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Item Category</label>
                  <input
                    type="text" value={manualData.jewelleryCategory}
                    onChange={(e) => handleManualChange("jewelleryCategory", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold focus:bg-white focus:ring-1 focus:ring-[#5A374F] transition-all outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">SKU / Barcode ID</label>
                  <input
                    type="text" value={manualData.sku}
                    onChange={(e) => handleManualChange("sku", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold focus:bg-white focus:ring-1 focus:ring-[#5A374F] transition-all outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Type</label>
                    <input
                      type="text" value={manualData.metalType}
                      onChange={(e) => handleManualChange("metalType", e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Purity</label>
                    <input
                      type="text" value={manualData.metalPurity}
                      onChange={(e) => handleManualChange("metalPurity", e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Gross Wt.</label>
                    <input
                      type="number" step="0.001" value={manualData.grossWeight}
                      onChange={(e) => handleManualChange("grossWeight", parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Net Wt.</label>
                    <input
                      type="number" step="0.001" value={manualData.netWeight}
                      onChange={(e) => handleManualChange("netWeight", parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Fine Wt.</label>
                    <input
                      type="number" step="0.001" value={manualData.fine}
                      onChange={(e) => handleManualChange("fine", parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">HUID / Hallmark</label>
                    <input
                      type="text" value={manualData.huid}
                      onChange={(e) => handleManualChange("huid", e.target.value)}
                      className="w-full bg-slate-50 border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Custom Note</label>
                  <input
                    type="text" value={manualData.custom}
                    onChange={(e) => handleManualChange("custom", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[11px] font-bold focus:bg-white focus:ring-1 focus:ring-[#5A374F] outline-none transition-all"
                  />
                </div>

                {/* Dynamic Custom Fields Section */}
                <div className="space-y-3 pt-2 border-t border-slate-50">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Additional Attributes</label>
                    <button
                      onClick={addCustomField}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#5A374F]/5 hover:bg-[#5A374F]/10 text-[#5A374F] rounded-lg transition-all active:scale-95 text-[10px] font-black uppercase tracking-tight"
                    >
                      <Plus size={12} /> Add Field
                    </button>
                  </div>

                  <div className="space-y-2">
                    {manualData.customFields.map((field) => (
                      <div key={field.id} className="group relative flex gap-2 items-start bg-white p-2 rounded-xl border border-slate-100 hover:border-[#5A374F]/20 transition-all shadow-sm">
                        <div className="flex-1 space-y-2">
                          <input
                            placeholder="Label (e.g. Cert No)"
                            value={field.label}
                            onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                            className="w-full bg-slate-50 border-transparent text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded focus:bg-white focus:ring-1 focus:ring-[#5A374F] outline-none"
                          />
                          <input
                            placeholder="Value"
                            value={field.value}
                            onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                            className="w-full bg-slate-50 border-transparent text-[11px] font-bold px-2 py-1.5 rounded focus:bg-white focus:ring-1 focus:ring-[#5A374F] outline-none"
                          />
                        </div>
                        <button
                          onClick={() => removeCustomField(field.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 block">Layers</label>
                <div className="text-[9px] font-mono font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded">{Object.keys(elements).length} TOTAL</div>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {Object.values(elements).map(el => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className={`group relative w-full p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-3 ${selectedId === el.id
                      ? "border-[#5A374F] bg-[#5A374F] text-white shadow-lg shadow-[#5A374F]/20"
                      : "border-transparent bg-slate-50/50 hover:bg-slate-100/80 text-slate-600"
                      }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${selectedId === el.id ? "bg-white/10" : "bg-white shadow-sm border border-slate-100"
                      }`}>
                      {el.id === 'barcode' ? <QrCode size={12} /> : <Type size={12} />}
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-[10px] font-black block leading-none mb-0.5">{el.name}</span>
                      <span className={`text-[8px] font-mono opacity-60 ${selectedId === el.id ? "text-white" : "text-slate-400"}`}>
                        {el.x.toFixed(1)}, {el.y.toFixed(1)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Precision Controls */}
          {selected && (
            <section className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 px-2">
                <Settings size={10} className="text-[#5A374F]" />
                <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 block">Edit Layer</label>
              </div>

              <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-100 shadow-xl shadow-slate-200/40"} space-y-4`}>

                {/* Special Settings for Barcode Type */}
                {selectedId === 'barcode' && (
                  <div className="space-y-2 pb-2 border-b border-slate-50">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      <span>Type</span>
                      <span className="text-[#5A374F] font-black">{selected.type === 'qrcode' ? 'QR Code' : 'Barcode'}</span>
                    </div>
                    <div className="flex p-1 bg-slate-50 rounded-xl gap-1">
                      <button
                        onClick={() => updateElement('barcode', { type: 'barcode' })}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${selected.type === 'barcode' ? "bg-white shadow-sm text-[#5A374F]" : "text-slate-400"}`}
                      >Barcode</button>
                      <button
                        onClick={() => updateElement('barcode', { type: 'qrcode' })}
                        className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${selected.type === 'qrcode' ? "bg-white shadow-sm text-[#5A374F]" : "text-slate-400"}`}
                      >QR Code</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      <span>Rotation</span>
                      <span className="text-[#5A374F] font-black">{selected.rotate}°</span>
                    </div>
                    <input
                      type="range" min="-180" max="180"
                      value={selected.rotate} onChange={(e) => updateElement(selectedId, { rotate: parseInt(e.target.value) })}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#5A374F]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      <span>Scaling</span>
                      <span className="text-[#5A374F] font-black">{(selected.scale * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range" min="0.5" max="3" step="0.01"
                      value={selected.scale} onChange={(e) => updateElement(selectedId, { scale: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#5A374F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">X</span>
                    <input
                      type="number" value={selected.x.toFixed(1)}
                      onChange={(e) => updateElement(selectedId, { x: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border-transparent rounded-xl text-[11px] font-mono font-bold focus:bg-white focus:ring-1 focus:ring-[#5A374F] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Y</span>
                    <input
                      type="number" value={selected.y.toFixed(1)}
                      onChange={(e) => updateElement(selectedId, { y: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border-transparent rounded-xl text-[11px] font-mono font-bold focus:bg-white focus:ring-1 focus:ring-[#5A374F] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Global View Controls */}
        <div className={`p-5 border-t border-inherit ${isDark ? "bg-[#111]" : "bg-white"} space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]`}>
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                <ZoomIn size={12} className="text-slate-400" />
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Canvas Zoom</label>
              </div>
              <span className="text-[10px] font-black text-[#5A374F]">{(zoom * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range" min="0.5" max="4" step="0.1"
              value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#5A374F]"
            />
          </div>
        </div>
      </div>

      {/* 🖼️ INTERACTIVE CANVAS AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Designer Top Bar */}
        <div className={`h-16 flex justify-between items-center px-8 border-b z-10 print:hidden ${isDark ? "bg-[#111]/90 backdrop-blur border-white/5" : "bg-white/95 backdrop-blur border-slate-100 shadow-sm"}`}>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-[#5A374F]"><ChevronLeft size={20} /></button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm text-[#5A374F]"><FileText size={20} /></div>
              <div>
                <h1 className="font-black text-sm tracking-tight text-slate-800 uppercase leading-none mb-1">Visual Studio</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{activeProducts.length} {activeProducts.length === 1 ? 'Tag' : 'Tags'} Queued • Precision Engine</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Info size={12} className="text-[#5A374F]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#5A374F]">Auto-Calibration Active</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#5A374F] hover:bg-[#4a2d41] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#5A374F]/20 transition-all active:scale-95"
            >
              <Printer size={16} /> Print All Tags
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ready</span>
            </div>
          </div>
        </div>

        {/* Workspace Canvas */}
        <div
          className="flex-1 overflow-auto bg-[#f8f9fa] relative print:bg-white print:p-0 flex justify-center p-20 custom-scrollbar"
          onMouseDown={() => setSelectedId(null)}
          style={{
            backgroundImage: `radial-gradient(#d1d5db 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
          onMouseMove={(e) => isDragging && e.preventDefault()}
        >
          {/* Centered Desktop Area */}
          <div
            ref={containerRef}
            className="relative flex flex-col items-center gap-12 print:gap-4 transition-transform duration-200 ease-out py-20"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center top"
            }}
          >
            {activeProducts.map((p, index) => {
              // Special case for Quick Print mode
              if (sidebarTab === "quick") {
                return (
                  <div
                    key={index === 0 && quickCodeList.length === 0 ? "quick-tag" : `quick-tag-${index}`}
                    className="butterfly-tag relative bg-white border border-slate-100 shadow-sm print:shadow-none mb-8 transition-all duration-500 overflow-hidden"
                    style={{
                      width: "65mm",
                      height: "15mm",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <div style={{ transform: `scale(${quickCodeScale})`, transition: 'transform 0.2s ease-out' }}>
                        {quickCodeType === "barcode" ? (
                          <Barcode
                            value={p.quickValue || "EMPTY"}
                            width={1.2}
                            height={40}
                            fontSize={10}
                            margin={0}
                            background="transparent"
                          />
                        ) : (
                          <QRCodeCanvas
                            value={p.quickValue || "EMPTY"}
                            size={45}
                            level="H"
                            includeMargin={false}
                          />
                        )}
                      </div>
                    </div>
                    {/* Visual markers for center */}
                    <div className="absolute inset-0 border-r border-dashed border-slate-100/50 left-1/2" />
                  </div>
                );
              }

              // Standard Tag Designer Loop
              const diamondGW = p.jewelleryStones?.filter(s => s.stoneType?.toUpperCase() === "DIAMOND").reduce((acc, s) => acc + (Number(s.stoneWeight) || 0), 0) || 0;
              const stoneGW = p.jewelleryStones?.filter(s => s.stoneType?.toUpperCase() !== "DIAMOND").reduce((acc, s) => acc + (Number(s.stoneWeight) || 0), 0) || 0;

              return (
                <div
                  key={index}
                  className="butterfly-tag relative bg-white print:border-none shadow-2xl print:shadow-none mb-12 print:mb-[3mm] overflow-visible"
                  style={{
                    width: `65mm`,
                    height: `15mm`,
                    display: "flex",
                    cursor: isDragging ? "grabbing" : "default"
                  }}
                >
                  {/* Visual Center Divider (Editor only) */}
                  <div className="absolute left-[32.5mm] top-0 bottom-0 border-l border-dashed border-slate-200 z-10 print:hidden" />

                  {/* Canvas Labeling (Dimensions) */}
                  <div className="absolute -top-6 left-0 right-0 flex justify-between px-2 print:hidden">
                    <span className="text-[10px] font-black text-slate-300">{sidebarTab === 'manual' ? 'MANUAL PREVIEW' : `TAG #${index + 1}`}</span>
                    <span className="text-[10px] font-black text-slate-300">65mm x 15mm</span>
                  </div>

                  {/* 1. CATEGORY */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "category")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "category" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.category.x}mm`,
                      top: `${elements.category.y}mm`,
                      transform: `rotate(${elements.category.rotate}deg) scale(${elements.category.scale})`,
                      transformOrigin: "left top"
                    }}
                  >
                    <span className="text-[6px] font-black tracking-tight p-0.5 whitespace-nowrap block leading-none">{p.jewelleryCategory}</span>
                  </div>

                  {/* 2. METAL & PURITY */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "metalPurity")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "metalPurity" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.metalPurity.x}mm`,
                      top: `${elements.metalPurity.y}mm`,
                      transform: `rotate(${elements.metalPurity.rotate}deg) scale(${elements.metalPurity.scale})`,
                      transformOrigin: "left top"
                    }}
                  >
                    <span className="text-[5px] font-black text-slate-500 p-0.5 whitespace-nowrap block leading-none">{p.metalType} {p.metalPurity}</span>
                  </div>

                  {/* 3. GW */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "gw")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "gw" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.gw.x}mm`,
                      top: `${elements.gw.y}mm`,
                      transform: `rotate(${elements.gw.rotate}deg) scale(${elements.gw.scale})`,
                      transformOrigin: "left top"
                    }}
                  >
                    <div
                      className="flex items-center text-[5px] font-black p-0.5 whitespace-nowrap leading-none"
                      style={{ gap: `${elements.gw.gap || 0.5}mm` }}
                    >
                      <span className="text-slate-400">GW:</span><span className="text-black">{Number(p.grossWeight || 0).toFixed(3)}g</span>
                    </div>
                  </div>

                  {/* 4. NW */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "nw")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "nw" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.nw.x}mm`,
                      top: `${elements.nw.y}mm`,
                      transform: `rotate(${elements.nw.rotate}deg) scale(${elements.nw.scale})`,
                      transformOrigin: "left top"
                    }}
                  >
                    <div
                      className="flex items-center text-[5px] font-black p-0.5 whitespace-nowrap leading-none"
                      style={{ gap: `${elements.nw.gap || 0.5}mm` }}
                    >
                      <span className="text-slate-400">NW:</span><span className="text-black">{Number(p.netWeight || 0).toFixed(3)}g</span>
                    </div>
                  </div>

                  {/* 5. SKU TEXT */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "skuText")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "skuText" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.skuText.x}mm`,
                      top: `${elements.skuText.y}mm`,
                      transform: `rotate(${elements.skuText.rotate}deg) scale(${elements.skuText.scale})`,
                      transformOrigin: "left top"
                    }}
                  >
                    <span className="text-[7.5px] font-black tracking-tight px-1 py-0.5 whitespace-nowrap leading-none block">{p.sku}</span>
                  </div>

                  {/* 6. BARCODE / QR CODE */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "barcode")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "barcode" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.barcode.x}mm`,
                      top: `${elements.barcode.y}mm`,
                      transform: `rotate(${elements.barcode.rotate}deg) scale(${elements.barcode.scale})`,
                      transformOrigin: "left top"
                    }}
                  >
                    <div className="bg-white px-1 flex items-center justify-center">
                      {elements.barcode.type === 'qrcode' ? (
                        <QRCodeCanvas value={p.sku} size={30} level="H" includeMargin={false} />
                      ) : (
                        <Barcode value={p.sku} width={0.4} height={10} fontSize={0} margin={0} background="transparent" />
                      )}
                    </div>
                  </div>

                  {/* 7. D.GW */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "dgw")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "dgw" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.dgw.x}mm`,
                      top: `${elements.dgw.y}mm`,
                      transform: `rotate(${elements.dgw.rotate}deg) scale(${elements.dgw.scale})`,
                      transformOrigin: "left top"
                    }}
                  >
                    <div
                      className="flex items-center text-[5px] font-black p-0.5 whitespace-nowrap leading-none"
                      style={{ gap: `${elements.dgw.gap}mm` }}
                    >
                      <span className="text-slate-400">D.GW:</span><span className="text-black">{diamondGW.toFixed(2)}g</span>
                    </div>
                  </div>

                  {/* 8. S.GW */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "sgw")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "sgw" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.sgw.x}mm`,
                      top: `${elements.sgw.y}mm`,
                      transform: `rotate(${elements.sgw.rotate}deg) scale(${elements.sgw.scale})`,
                      transformOrigin: "left top"
                    }}
                  >
                    <div
                      className="flex items-center text-[5px] font-black p-0.5 whitespace-nowrap leading-none"
                      style={{ gap: `${elements.sgw.gap}mm` }}
                    >
                      <span className="text-slate-400">S.GW:</span><span className="text-black">{stoneGW.toFixed(2)}g</span>
                    </div>
                  </div>

                  {/* 9. FINE */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "fine")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "fine" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.fine.x}mm`,
                      top: `${elements.fine.y}mm`,
                      transform: `rotate(${elements.fine.rotate}deg) scale(${elements.fine.scale})`,
                      transformOrigin: "left top",
                      display: elements.fine.visible ? "block" : "none"
                    }}
                  >
                    <div className="flex items-center text-[5px] font-black p-0.5 whitespace-nowrap leading-none gap-[0.5mm]">
                      <span className="text-slate-400">FINE:</span><span className="text-black">{Number(p.fine || 0).toFixed(3)}g</span>
                    </div>
                  </div>

                  {/* 10. HUID */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "huid")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "huid" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.huid.x}mm`,
                      top: `${elements.huid.y}mm`,
                      transform: `rotate(${elements.huid.rotate}deg) scale(${elements.huid.scale})`,
                      transformOrigin: "left top",
                      display: elements.huid.visible ? "block" : "none"
                    }}
                  >
                    <span className="text-[5px] font-black p-0.5 whitespace-nowrap block leading-none">{p.huid}</span>
                  </div>

                  {/* 11. CUSTOM */}
                  <div
                    onMouseDown={(e) => onMouseDown(e, "custom")}
                    className={`absolute cursor-move select-none transition-colors ${selectedId === "custom" ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                    style={{
                      left: `${elements.custom.x}mm`,
                      top: `${elements.custom.y}mm`,
                      transform: `rotate(${elements.custom.rotate}deg) scale(${elements.custom.scale})`,
                      transformOrigin: "left top",
                      display: elements.custom.visible ? "block" : "none"
                    }}
                  >
                    <span className="text-[5px] font-black p-0.5 whitespace-nowrap block leading-none italic">{p.custom}</span>
                  </div>

                  {/* Dynamic Custom Fields Rendering */}
                  {manualData.customFields.map((field) => {
                    const el = elements[field.id];
                    if (!el || !el.visible) return null;

                    return (
                      <div
                        key={field.id}
                        onMouseDown={(e) => onMouseDown(e, field.id)}
                        className={`absolute cursor-move select-none transition-colors ${selectedId === field.id ? "bg-slate-50 border border-[#5A374F]/20" : "hover:bg-slate-50"}`}
                        style={{
                          left: `${el.x}mm`,
                          top: `${el.y}mm`,
                          transform: `rotate(${el.rotate}deg) scale(${el.scale})`,
                          transformOrigin: "left top"
                        }}
                      >
                        <div className="flex items-center text-[5px] font-black p-0.5 whitespace-nowrap leading-none gap-[0.5mm]">
                          <span className="text-slate-400 uppercase">{field.label}:</span>
                          <span className="text-black">{field.value}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Tail Preview (Hidden on print) */}
                  <div className="absolute top-1/2 left-[65mm] w-[35mm] h-[6mm] bg-gradient-to-r from-slate-200 to-slate-50 border-r border-t border-b border-slate-100 rounded-r-full -translate-y-1/2 print:hidden opacity-30 shadow-inner" title="Physical Tag Tail" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 0; -webkit-print-color-adjust: exact; }
          .butterfly-tag {
            border: none !important;
            page-break-inside: avoid;
            margin-bottom: 3mm !important;
            box-shadow: none !important;
          }
        }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        input[type="range"]::-webkit-slider-thumb {
          width: 14px;
          height: 14px;
          background: #5A374F;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(90, 55, 79, 0.3);
          -webkit-appearance: none;
          margin-top: -5px;
        }

        .butterfly-tag div {
           -webkit-font-smoothing: antialiased;
           -moz-osx-font-smoothing: grayscale;
        }

        .animate-in {
          animation: animate-in 0.3s ease-out forwards;
        }
        @keyframes animate-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
