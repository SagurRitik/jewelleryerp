import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import { useLocation, useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import { QRCodeCanvas } from "qrcode.react";
import {
  Printer, ChevronLeft, Layout, Settings,
  ArrowUp, ArrowLeft, ArrowDown, ArrowRight, ZoomIn, Info,
  RotateCw, Move, Type, Eye, RefreshCcw,
  Maximize, FileText, User, List, QrCode, Plus, Trash2, Zap,
  Upload, SlidersHorizontal, Sparkles, Save, Check,
  Ruler, Target, Crosshair, AlignCenter, AlignLeft, AlignRight, X, ChevronDown, ShieldCheck
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const TAG_SIZE_PRESETS = [
  { id: "65x15", name: "Standard Butterfly (65×15 mm)", width: 65, height: 15, tailWidth: 35, desc: "Most popular for rings, bangles & pendants" },
  { id: "75x12", name: "Slim Butterfly (75×12 mm)", width: 75, height: 12, tailWidth: 35, desc: "Sleek look for lightweight jewellery" },
  { id: "85x15", name: "Wide Flap Tag (85×15 mm)", width: 85, height: 15, tailWidth: 40, desc: "Extra space for large barcodes or long descriptions" },
  { id: "50x12", name: "Compact Ring Tag (50×12 mm)", width: 50, height: 12, tailWidth: 25, desc: "Small tags for delicate rings & earrings" },
  { id: "100x14", name: "Extended Chain Tag (100×14 mm)", width: 100, height: 14, tailWidth: 45, desc: "Long tail for necklaces, chains and heavy ornaments" },
  { id: "custom", name: "Custom Size...", width: 65, height: 15, tailWidth: 35, desc: "Custom width & height for any thermal label roll" }
];

export const FORMAT_PRESETS = {
  compact_center: {
    id: "compact_center",
    name: "Standard (Center Layout)",
    badge: "Best Fit",
    elements: {
      category: { id: "category", name: "Category Name", x: 1.0, y: 1.0, rotate: 0, scale: 1, visible: true },
      metalPurity: { id: "metalPurity", name: "Metal & Purity", x: 1.0, y: 3.8, rotate: 0, scale: 1, visible: true },
      gw: { id: "gw", name: "Gross Weight (GW)", x: 1.0, y: 6.8, rotate: 0, scale: 1, visible: true, gap: 0.5 },
      nw: { id: "nw", name: "Net Weight (NW)", x: 1.0, y: 9.8, rotate: 0, scale: 1, visible: true, gap: 0.5 },
      skuText: { id: "skuText", name: "SKU Label", x: 14.0, y: 0.5, rotate: 0, scale: 1, visible: true },
      barcode: { id: "barcode", name: "Barcode/QR", x: 10.4, y: 3.4, rotate: 0, scale: 1, visible: true, type: "barcode" },
      fine: { id: "fine", name: "Fine Weight", x: 13.5, y: 12.8, rotate: 0, scale: 0.8, visible: true },
      dgw: { id: "dgw", name: "Diamond GW (D.GW)", x: 30.3, y: 4.2, rotate: 0, scale: 1, visible: true, gap: 0.4 },
      sgw: { id: "sgw", name: "Stone GW (S.GW)", x: 30.1, y: 6.4, rotate: 0, scale: 1, visible: true, gap: 0.4 },
      huid: { id: "huid", name: "HUID / Hallmark", x: 30.1, y: 8.8, rotate: 0, scale: 0.8, visible: false },
      custom: { id: "custom", name: "Custom Note", x: 30.1, y: 1.5, rotate: 0, scale: 0.8, visible: false },
    }
  },
  dual_wing: {
    id: "dual_wing",
    name: "Dual Wing (Head + Flap)",
    badge: "Wide",
    elements: {
      category: { id: "category", name: "Category Name", x: 1.0, y: 1.0, rotate: 0, scale: 1, visible: true },
      metalPurity: { id: "metalPurity", name: "Metal & Purity", x: 1.0, y: 4.0, rotate: 0, scale: 1, visible: true },
      gw: { id: "gw", name: "Gross Weight (GW)", x: 1.0, y: 7.0, rotate: 0, scale: 1, visible: true, gap: 0.5 },
      nw: { id: "nw", name: "Net Weight (NW)", x: 1.0, y: 10.0, rotate: 0, scale: 1, visible: true, gap: 0.5 },
      skuText: { id: "skuText", name: "SKU Label", x: 33.0, y: 1.0, rotate: 0, scale: 1, visible: true },
      barcode: { id: "barcode", name: "Barcode/QR", x: 31.0, y: 4.0, rotate: 0, scale: 1, visible: true, type: "barcode" },
      dgw: { id: "dgw", name: "Diamond GW (D.GW)", x: 49.0, y: 7.0, rotate: 0, scale: 1, visible: true, gap: 0.4 },
      sgw: { id: "sgw", name: "Stone GW (S.GW)", x: 49.0, y: 10.0, rotate: 0, scale: 1, visible: true, gap: 0.4 },
      fine: { id: "fine", name: "Fine Weight", x: 33.0, y: 12.0, rotate: 0, scale: 0.8, visible: true },
      huid: { id: "huid", name: "HUID / Hallmark", x: 33.0, y: 9.0, rotate: 0, scale: 0.8, visible: true },
      custom: { id: "custom", name: "Custom Note", x: 49.0, y: 1.0, rotate: 0, scale: 0.8, visible: true },
    }
  }
};

const INITIAL_ELEMENTS = FORMAT_PRESETS.compact_center.elements;

function TagSizeModal({ isOpen, onClose, currentSize, onSave }) {
  const [selectedPreset, setSelectedPreset] = useState(currentSize?.presetId || "65x15");
  const [width, setWidth] = useState(currentSize?.width || 65);
  const [height, setHeight] = useState(currentSize?.height || 15);
  const [tailWidth, setTailWidth] = useState(currentSize?.tailWidth || 35);

  useEffect(() => {
    if (isOpen) {
      setSelectedPreset(currentSize?.presetId || "65x15");
      setWidth(currentSize?.width || 65);
      setHeight(currentSize?.height || 15);
      setTailWidth(currentSize?.tailWidth || 35);
    }
  }, [isOpen, currentSize]);

  if (!isOpen) return null;

  const handleSelectPreset = (p) => {
    setSelectedPreset(p.id);
    if (p.id !== "custom") {
      setWidth(p.width);
      setHeight(p.height);
      setTailWidth(p.tailWidth);
    }
  };

  const handleApply = () => {
    onSave({
      presetId: selectedPreset,
      width: Number(width) || 65,
      height: Number(height) || 15,
      tailWidth: Number(tailWidth) || 35
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#5A374F] flex items-center justify-center border border-purple-100">
              <Ruler size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Tag Dimension Setup</h2>
              <p className="text-[11px] text-slate-400 font-medium">Select a standard jewellery tag or specify custom mm</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Standard Tag Sizes</label>
          <div className="grid grid-cols-2 gap-2">
            {TAG_SIZE_PRESETS.map((p) => {
              const isSelected = selectedPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? "bg-purple-50/70 border-[#5A374F] ring-2 ring-[#5A374F]/10 text-slate-800"
                      : "bg-slate-50/60 hover:bg-slate-50 border-slate-200/70 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black">{p.width}×{p.height} mm</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#5A374F]" />}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-700 truncate">{p.name.split('(')[0]}</div>
                  <div className="text-[9px] text-slate-400 line-clamp-1">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input Fields */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Fine-tune Dimensions (mm)</label>
            <span className="text-[10px] font-bold text-[#5A374F]">Active: {width} × {height} mm</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-[9px] font-bold text-slate-400 block mb-1">Total Width</span>
              <div className="relative">
                <input
                  type="number"
                  min="20"
                  max="150"
                  step="0.5"
                  value={width}
                  onChange={(e) => {
                    setWidth(parseFloat(e.target.value) || 0);
                    setSelectedPreset("custom");
                  }}
                  className="w-full px-3 py-2 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#5A374F]/20 focus:border-[#5A374F] outline-none"
                />
                <span className="absolute right-2.5 top-2.5 text-[9px] font-bold text-slate-400 pointer-events-none">mm</span>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block mb-1">Height</span>
              <div className="relative">
                <input
                  type="number"
                  min="8"
                  max="60"
                  step="0.5"
                  value={height}
                  onChange={(e) => {
                    setHeight(parseFloat(e.target.value) || 0);
                    setSelectedPreset("custom");
                  }}
                  className="w-full px-3 py-2 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#5A374F]/20 focus:border-[#5A374F] outline-none"
                />
                <span className="absolute right-2.5 top-2.5 text-[9px] font-bold text-slate-400 pointer-events-none">mm</span>
              </div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 block mb-1">Tail Width</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="80"
                  step="1"
                  value={tailWidth}
                  onChange={(e) => {
                    setTailWidth(parseFloat(e.target.value) || 0);
                    setSelectedPreset("custom");
                  }}
                  className="w-full px-3 py-2 pr-7 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#5A374F]/20 focus:border-[#5A374F] outline-none"
                />
                <span className="absolute right-2.5 top-2.5 text-[9px] font-bold text-slate-400 pointer-events-none">mm</span>
              </div>
            </div>
          </div>
          {/* Visual scale representation */}
          <div className="pt-2 flex items-center justify-center">
            <div
              className="border-2 border-[#5A374F] bg-white rounded flex items-center justify-between px-2 text-[8px] font-bold text-slate-600 shadow-sm relative"
              style={{
                width: `${Math.min(220, Math.max(80, width * 2.2))}px`,
                height: `${Math.min(50, Math.max(22, height * 2.2))}px`
              }}
            >
              <span>Flap 1</span>
              <div className="h-full border-r border-dashed border-[#5A374F]/40" />
              <span>Flap 2</span>
              {tailWidth > 0 && (
                <div
                  className="absolute top-1/2 left-full -translate-y-1/2 bg-slate-200 border border-slate-300 rounded-r-full"
                  style={{ width: `${Math.min(60, tailWidth)}px`, height: '35%' }}
                  title="Tail"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5A374F] to-[#45273b] hover:from-[#4a2d41] hover:to-[#381f30] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#5A374F]/25 active:scale-95 transition-all"
          >
            Apply Tag Size
          </button>
        </div>
      </div>
    </div>
  );
}

function CalibrationModal({ isOpen, onClose, calibration, onSave, onTestPrint, tagDimensions }) {
  const [offsetX, setOffsetX] = useState(calibration?.offsetX || 0);
  const [offsetY, setOffsetY] = useState(calibration?.offsetY || 0);

  useEffect(() => {
    if (isOpen) {
      setOffsetX(calibration?.offsetX || 0);
      setOffsetY(calibration?.offsetY || 0);
    }
  }, [isOpen, calibration]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave({
      offsetX: Math.round(Number(offsetX) * 10) / 10,
      offsetY: Math.round(Number(offsetY) * 10) / 10
    });
    onClose();
  };

  const handleReset = () => {
    setOffsetX(0);
    setOffsetY(0);
    onSave({ offsetX: 0, offsetY: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Printer Hardware Calibration</h2>
              <p className="text-[11px] text-slate-400 font-medium">Compensate for thermal printer feed & roller drift</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Calibration instructions */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-start gap-3">
          <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed">
            If prints are cutting off on the left or top of your tag roll, shift the global offset below. Click <strong>Test Pattern</strong> to print a calibration grid and measure mechanical shift.
          </p>
        </div>

        {/* X Offset */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Horizontal Shift (X-Offset)</span>
              <p className="text-[9px] text-slate-400">Positive moves right (+), negative moves left (-)</p>
            </div>
            <span className="text-xs font-mono font-black text-[#5A374F] bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
              {offsetX >= 0 ? `+${offsetX.toFixed(1)}` : offsetX.toFixed(1)} mm
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOffsetX(prev => Math.round((prev - 0.2) * 10) / 10)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-100 active:scale-95 shadow-sm"
            >
              -0.2mm
            </button>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={offsetX}
              onChange={(e) => setOffsetX(parseFloat(e.target.value) || 0)}
              className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5A374F]"
            />
            <button
              onClick={() => setOffsetX(prev => Math.round((prev + 0.2) * 10) / 10)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-100 active:scale-95 shadow-sm"
            >
              +0.2mm
            </button>
          </div>
        </div>

        {/* Y Offset */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Vertical Shift (Y-Offset)</span>
              <p className="text-[9px] text-slate-400">Positive moves down (+), negative moves up (-)</p>
            </div>
            <span className="text-xs font-mono font-black text-[#5A374F] bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
              {offsetY >= 0 ? `+${offsetY.toFixed(1)}` : offsetY.toFixed(1)} mm
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOffsetY(prev => Math.round((prev - 0.2) * 10) / 10)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-100 active:scale-95 shadow-sm"
            >
              -0.2mm
            </button>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.1"
              value={offsetY}
              onChange={(e) => setOffsetY(parseFloat(e.target.value) || 0)}
              className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5A374F]"
            />
            <button
              onClick={() => setOffsetY(prev => Math.round((prev + 0.2) * 10) / 10)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 hover:bg-slate-100 active:scale-95 shadow-sm"
            >
              +0.2mm
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
              Reset to 0
            </button>
            <button
              type="button"
              onClick={onTestPrint}
              className="px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-[10px] font-black text-[#5A374F] hover:bg-purple-100 transition-all flex items-center gap-1.5 shadow-sm"
              title="Prints 1 tag with outer millimeter grid to measure error"
            >
              <Printer size={12} />
              <span>Print Test Pattern</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5A374F] to-[#45273b] hover:from-[#4a2d41] hover:to-[#381f30] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#5A374F]/25 active:scale-95 transition-all"
          >
            Save Calibration
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BarcodeTagPrinter() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { products: initialProducts = [] } = location.state || {};

  // Editor State with localStorage persistence
  const [elements, setElements] = useState(() => {
    try {
      const saved = localStorage.getItem("barcode_tag_layout");
      if (saved) return { ...INITIAL_ELEMENTS, ...JSON.parse(saved) };
    } catch (e) { }
    return INITIAL_ELEMENTS;
  });
  const [selectedId, setSelectedId] = useState("barcode");
  const [format, setFormat] = useState("butterfly_65x15");
  const [activePreset, setActivePreset] = useState("compact_center");
  const [formatSavedToast, setFormatSavedToast] = useState("");
  const [zoom, setZoom] = useState(1.4);
  const [printOrientation, setPrintOrientation] = useState("landscape"); // "landscape" or "portrait"
  const [printRotation, setPrintRotation] = useState(0); // 0, 90, 180, 270 degrees

  // Tag Dimensions State (persist in localStorage)
  const [tagDimensions, setTagDimensions] = useState(() => {
    try {
      const saved = localStorage.getItem("barcode_tag_dimensions");
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return { presetId: "65x15", width: 65, height: 15, tailWidth: 35 };
  });

  // Printer Mechanical Calibration Offset in mm (persist in localStorage)
  const [calibration, setCalibration] = useState(() => {
    try {
      const saved = localStorage.getItem("barcode_tag_calibration");
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return { offsetX: 0, offsetY: 0 };
  });

  // Modals & Display Toggles
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [showSafeMargins, setShowSafeMargins] = useState(true);

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
    diamondGW: 0.50,
    stoneGW: 0.20,
    fine: 9.160,
    huid: "HUID12345",
    custom: "LIMITED EDITION",
    customFields: []
  });

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleUpdateTagDimensions = (newDims) => {
    setTagDimensions(newDims);
    try {
      localStorage.setItem("barcode_tag_dimensions", JSON.stringify(newDims));
    } catch (e) { }
    setFormatSavedToast(`✓ Tag Size Set: ${newDims.width}×${newDims.height}mm`);
    setTimeout(() => setFormatSavedToast(""), 2500);
  };

  const handleUpdateCalibration = (newCal) => {
    setCalibration(newCal);
    try {
      localStorage.setItem("barcode_tag_calibration", JSON.stringify(newCal));
    } catch (e) { }
    setFormatSavedToast(`✓ Printer Calibration Saved (X:${newCal.offsetX}mm, Y:${newCal.offsetY}mm)`);
    setTimeout(() => setFormatSavedToast(""), 2500);
  };

  const handleAlignElement = (type) => {
    if (!selectedId || !elements[selectedId]) return;
    const halfWidth = tagDimensions.width / 2;
    const flapCenter1 = halfWidth / 2;
    const flapCenter2 = halfWidth + halfWidth / 2;
    const centerY = tagDimensions.height / 2;

    if (type === "flap1_center") {
      updateElement(selectedId, { x: Math.max(0.5, Math.round((flapCenter1 - 4) * 10) / 10) });
    } else if (type === "flap2_center") {
      updateElement(selectedId, { x: Math.max(0.5, Math.round((flapCenter2 - 4) * 10) / 10) });
    } else if (type === "center_h") {
      updateElement(selectedId, { x: Math.max(0.5, Math.round((halfWidth - 4) * 10) / 10) });
    } else if (type === "center_v") {
      updateElement(selectedId, { y: Math.max(0.5, Math.round((centerY - 1.5) * 10) / 10) });
    } else if (type === "left_edge") {
      updateElement(selectedId, { x: 1.0 });
    } else if (type === "right_edge") {
      updateElement(selectedId, { x: Math.round((tagDimensions.width - 15) * 10) / 10 });
    }
  };

  const handleNudge = (dx, dy) => {
    if (!selectedId || !elements[selectedId]) return;
    const cur = elements[selectedId];
    updateElement(selectedId, {
      x: Math.max(0, Math.round((cur.x + dx) * 10) / 10),
      y: Math.max(0, Math.round((cur.y + dy) * 10) / 10)
    });
  };

  const handlePrintTestPattern = () => {
    let iframe = document.getElementById("barcode-print-iframe");
    if (iframe) iframe.remove();
    iframe = document.createElement("iframe");
    iframe.id = "barcode-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    const halfW = tagDimensions.width / 2;

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Tag Calibration Test Sheet</title>
        <style>
          @page {
            size: ${tagDimensions.width}mm ${tagDimensions.height}mm ${printOrientation};
            margin: 0;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: ${tagDimensions.width}mm !important;
            height: ${tagDimensions.height}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: hidden !important;
            font-family: monospace;
          }
          .cal-box {
            width: ${tagDimensions.width}mm;
            height: ${tagDimensions.height}mm;
            position: relative;
            border: 0.3mm solid #000;
            overflow: hidden;
            background: #fff;
            transform: translate(${calibration.offsetX}mm, ${calibration.offsetY}mm);
            ${printRotation !== 0 ? `transform: rotate(${printRotation}deg) translate(${calibration.offsetX}mm, ${calibration.offsetY}mm); transform-origin: center center;` : ''}
          }
        </style>
      </head>
      <body>
        <div class="cal-box">
          <!-- Top millimeter scale -->
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 2mm; border-bottom: 0.2mm solid #000; display: flex; justify-content: space-between; font-size: 4px; padding: 0 1mm; line-height: 2mm;">
            <span>0</span><span>${Math.round(halfW / 2)}mm</span><span>${Math.round(halfW)}mm</span><span>${Math.round(halfW + halfW / 2)}mm</span><span>${tagDimensions.width}mm</span>
          </div>
          <!-- Center divider line -->
          <div style="position: absolute; left: ${halfW}mm; top: 0; bottom: 0; border-left: 0.3mm dashed #000;"></div>
          <!-- Outer Corner markers -->
          <div style="position: absolute; top: 2.2mm; left: 1mm; font-size: 4.5px; font-weight: bold;">(1,1)┌</div>
          <div style="position: absolute; top: 2.2mm; right: 1mm; font-size: 4.5px; font-weight: bold;">┐(${tagDimensions.width - 1},1)</div>
          <div style="position: absolute; bottom: 0.8mm; left: 1mm; font-size: 4.5px; font-weight: bold;">(1,${tagDimensions.height - 1})└</div>
          <div style="position: absolute; bottom: 0.8mm; right: 1mm; font-size: 4.5px; font-weight: bold;">┘(${tagDimensions.width - 1},${tagDimensions.height - 1})</div>
          <!-- Flap 1 info -->
          <div style="position: absolute; left: ${halfW / 2}mm; top: 52%; transform: translate(-50%, -50%); text-align: center; width: ${halfW - 3}mm;">
            <div style="font-size: 5.5px; font-weight: 900; letter-spacing: -0.2px;">FLAP 1 CENTER</div>
            <div style="font-size: 4px; color: #444; margin-top: 0.5mm;">CAL: X=${calibration.offsetX >= 0 ? '+' : ''}${calibration.offsetX}mm, Y=${calibration.offsetY >= 0 ? '+' : ''}${calibration.offsetY}mm</div>
          </div>
          <!-- Flap 2 info -->
          <div style="position: absolute; left: ${halfW + halfW / 2}mm; top: 52%; transform: translate(-50%, -50%); text-align: center; width: ${halfW - 3}mm;">
            <div style="font-size: 5.5px; font-weight: 900; letter-spacing: -0.2px;">FLAP 2 CENTER</div>
            <div style="font-size: 4px; color: #444; margin-top: 0.5mm;">SIZE: ${tagDimensions.width}×${tagDimensions.height}mm</div>
          </div>
        </div>
      </body>
      </html>
    `);
    iframeDoc.close();
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        window.print();
      }
    }, 200);
  };

  const handlePrint = () => {
    const container = containerRef.current;
    if (!container) {
      window.print();
      return;
    }

    const tagElements = container.querySelectorAll(".butterfly-tag");
    if (!tagElements || tagElements.length === 0) {
      window.print();
      return;
    }

    // 1. Create dedicated invisible print iframe
    let iframe = document.getElementById("barcode-print-iframe");
    if (iframe) {
      iframe.remove();
    }
    iframe = document.createElement("iframe");
    iframe.id = "barcode-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);

    // 2. Clone each tag and preserve canvas images
    let tagsHtml = "";
    tagElements.forEach((tag, idx) => {
      const clone = tag.cloneNode(true);

      // Remove elements that shouldn't be printed (visual center lines, tail guides, etc.)
      const nonPrintable = clone.querySelectorAll(".print\\:hidden, [title='Physical Tag Tail'], [title='Safe printable margin (0.8mm bleed boundary)']");
      nonPrintable.forEach(el => el.remove());

      // Convert any QR code canvas elements to data URL images
      const originalCanvases = tag.querySelectorAll("canvas");
      const clonedCanvases = clone.querySelectorAll("canvas");
      originalCanvases.forEach((origCanvas, cIdx) => {
        try {
          const img = document.createElement("img");
          img.src = origCanvas.toDataURL("image/png");
          img.style.width = origCanvas.style.width || "45px";
          img.style.height = origCanvas.style.height || "45px";
          img.style.display = "block";
          if (clonedCanvases[cIdx] && clonedCanvases[cIdx].parentNode) {
            clonedCanvases[cIdx].parentNode.replaceChild(img, clonedCanvases[cIdx]);
          }
        } catch (err) {
          console.error("Canvas export error:", err);
        }
      });

      tagsHtml += `
        <div class="tag-page" style="width: ${tagDimensions.width}mm; height: ${tagDimensions.height}mm; position: relative; overflow: hidden; page-break-after: ${idx === tagElements.length - 1 ? 'auto' : 'always'}; break-after: ${idx === tagElements.length - 1 ? 'auto' : 'page'}; page-break-inside: avoid; break-inside: avoid; background: #ffffff;">
          <div style="width: 100%; height: 100%; position: relative; transform: translate(${calibration.offsetX}mm, ${calibration.offsetY}mm);">
            ${clone.innerHTML}
          </div>
        </div>
      `;
    });

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Barcode Tag Print</title>
        <style>
          @page {
            size: ${tagDimensions.width}mm ${tagDimensions.height}mm ${printOrientation};
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${tagDimensions.width}mm !important;
            height: ${tagDimensions.height}mm !important;
            background: #ffffff !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .tag-page {
            width: ${tagDimensions.width}mm !important;
            height: ${tagDimensions.height}mm !important;
            position: relative !important;
            overflow: hidden !important;
            background: #ffffff !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            ${printRotation !== 0 ? `transform: rotate(${printRotation}deg) !important; transform-origin: center center !important;` : ''}
          }
        </style>
      </head>
      <body>
        ${tagsHtml}
      </body>
      </html>
    `);

    // Copy stylesheet styles into iframe head
    const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    styleSheets.forEach(style => {
      try {
        iframeDoc.head.appendChild(style.cloneNode(true));
      } catch (e) { }
    });

    iframeDoc.close();

    // Trigger print
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        window.print();
      }
    }, 200);
  };

  const updateElement = (id, updates) => {
    setElements(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const applyPreset = (presetKey) => {
    const preset = FORMAT_PRESETS[presetKey];
    if (!preset) return;
    setElements(preset.elements);
    setActivePreset(presetKey);
    try {
      localStorage.setItem("barcode_tag_layout", JSON.stringify(preset.elements));
    } catch (e) { }
    setFormatSavedToast(`✓ ${preset.name} Set Successfully!`);
    setTimeout(() => setFormatSavedToast(""), 2500);
  };

  const saveCustomLayout = () => {
    try {
      localStorage.setItem("barcode_tag_layout", JSON.stringify(elements));
      setFormatSavedToast("✓ Custom Layout Saved as Default!");
      setTimeout(() => setFormatSavedToast(""), 2500);
    } catch (e) { }
  };

  const resetLayout = () => {
    const defaultElements = FORMAT_PRESETS.compact_center.elements;
    setElements(defaultElements);
    setActivePreset("compact_center");
    try {
      localStorage.removeItem("barcode_tag_layout");
    } catch (e) { }
    setFormatSavedToast("✓ Layout Reset to Standard Default!");
    setTimeout(() => setFormatSavedToast(""), 2500);
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
    <div className={`h-screen w-screen overflow-hidden flex transition-colors duration-300 ${isDark ? "bg-[#0b0b0b]" : "bg-[#f8f9fa]"} print:bg-white print:h-auto print:w-auto print:overflow-visible print:block`}>
      <style>{`
        @media screen {
          body, html { margin: 0; padding: 0; overflow: hidden !important; height: 100% !important; width: 100% !important; }
        }
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => applyPreset("compact_center")}
                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 border border-[#5A374F]/20 text-[#5A374F] rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                title="1-Click Set Standard Format"
              >
                <Sparkles size={10} /> Auto-Format
              </button>
              <button onClick={resetLayout} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg transition-all" title="Reset Layout to Standard Default">
                <RefreshCcw size={14} />
              </button>
            </div>
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[11px] font-mono font-bold"
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Diamond GW</label>
                    <input
                      type="number" step="0.01" value={manualData.diamondGW !== undefined ? manualData.diamondGW : ""}
                      onChange={(e) => handleManualChange("diamondGW", e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[11px] font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Stone GW</label>
                    <input
                      type="number" step="0.01" value={manualData.stoneGW !== undefined ? manualData.stoneGW : ""}
                      onChange={(e) => handleManualChange("stoneGW", e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[11px] font-mono font-bold"
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">X (mm)</span>
                    <input
                      type="number" value={selected.x.toFixed(1)}
                      onChange={(e) => updateElement(selectedId, { x: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border-transparent rounded-xl text-[11px] font-mono font-bold focus:bg-white focus:ring-1 focus:ring-[#5A374F] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Y (mm)</span>
                    <input
                      type="number" value={selected.y.toFixed(1)}
                      onChange={(e) => updateElement(selectedId, { y: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-50 border-transparent rounded-xl text-[11px] font-mono font-bold focus:bg-white focus:ring-1 focus:ring-[#5A374F] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Smart Flap Alignment Shortcuts */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    <span>Alignment</span>
                    <span className="text-[8px] text-slate-400">Snap to Flap</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => handleAlignElement('flap1_center')}
                      className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 rounded-xl text-[8px] font-black text-slate-600 flex flex-col items-center gap-0.5 border border-slate-200/50 transition-all active:scale-95"
                      title="Center horizontally in Left Flap (Flap 1)"
                    >
                      <AlignLeft size={12} className="text-[#5A374F]" />
                      <span>Flap 1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAlignElement('center_h')}
                      className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 rounded-xl text-[8px] font-black text-slate-600 flex flex-col items-center gap-0.5 border border-slate-200/50 transition-all active:scale-95"
                      title="Center horizontally across the entire tag"
                    >
                      <AlignCenter size={12} className="text-[#5A374F]" />
                      <span>Center</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAlignElement('flap2_center')}
                      className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 rounded-xl text-[8px] font-black text-slate-600 flex flex-col items-center gap-0.5 border border-slate-200/50 transition-all active:scale-95"
                      title="Center horizontally in Right Flap (Flap 2)"
                    >
                      <AlignRight size={12} className="text-[#5A374F]" />
                      <span>Flap 2</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAlignElement('center_v')}
                      className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 rounded-xl text-[8px] font-black text-slate-600 flex flex-col items-center gap-0.5 border border-slate-200/50 transition-all active:scale-95"
                      title="Center vertically"
                    >
                      <SlidersHorizontal size={12} className="text-[#5A374F]" />
                      <span>Center V</span>
                    </button>
                  </div>
                </div>

                {/* Fine Nudge D-Pad (0.2mm precision) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    <span>Fine Nudge (±0.2mm)</span>
                    <span className="text-[8px] text-slate-400">Micro-adjust</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => handleNudge(-0.2, 0)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-slate-600 font-bold active:scale-90 transition-all shadow-sm"
                      title="Nudge Left 0.2mm"
                    >
                      <ArrowLeft size={13} />
                    </button>
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleNudge(0, -0.2)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-slate-600 font-bold active:scale-90 transition-all shadow-sm"
                        title="Nudge Up 0.2mm"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(0, 0.2)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-slate-600 font-bold active:scale-90 transition-all shadow-sm"
                        title="Nudge Down 0.2mm"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNudge(0.2, 0)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-slate-600 font-bold active:scale-90 transition-all shadow-sm"
                      title="Nudge Right 0.2mm"
                    >
                      <ArrowRight size={13} />
                    </button>
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative print:h-auto print:w-auto print:overflow-visible print:block print:p-0 print:m-0">

        {/* Designer Top Bar */}
        <div className={`h-16 flex justify-between items-center px-6 border-b z-10 print:hidden ${isDark ? "bg-[#111]/90 backdrop-blur border-white/5" : "bg-white/95 backdrop-blur border-slate-100 shadow-sm"}`}>
          {/* Left Title & Status */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              className="h-9 w-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-[#5A374F] border border-slate-200/70 transition-all active:scale-95 shadow-sm"
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100/80 text-[#5A374F] shadow-sm">
                <FileText size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-xs tracking-tight text-slate-800 uppercase leading-none">Tag Studio</h1>
                  <button
                    type="button"
                    onClick={() => setShowSizeModal(true)}
                    className="flex items-center gap-1.5 bg-purple-100/70 hover:bg-purple-200/90 text-[#5A374F] text-[9px] font-black px-2.5 py-1 rounded-full border border-[#5A374F]/20 shadow-sm transition-all active:scale-95 cursor-pointer"
                    title="Change Tag Dimensions & Presets"
                  >
                    <Ruler size={10} />
                    <span>{tagDimensions.width}×{tagDimensions.height}mm</span>
                    <ChevronDown size={10} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">
                  {activeProducts.length} {activeProducts.length === 1 ? 'Tag Ready' : 'Tags Ready'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2">
            {/* 1. Layout Preset Dropdown with Sparkles */}
            <div className="flex items-center bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 h-9 gap-1.5 shadow-sm transition-all focus-within:border-[#5A374F]/40 focus-within:ring-2 focus-within:ring-[#5A374F]/10" title="Choose Tag Layout Template">
              <Sparkles size={13} className="text-[#5A374F]" />
              <span className="text-[10px] font-bold text-slate-400 hidden 2xl:inline">Template:</span>
              <select
                value={activePreset}
                onChange={(e) => applyPreset(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-800 outline-none cursor-pointer pr-1"
              >
                {Object.entries(FORMAT_PRESETS).map(([key, p]) => (
                  <option key={key} value={key}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Save Layout Button */}
            <button
              type="button"
              onClick={saveCustomLayout}
              className="h-9 px-2.5 flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-[10px] font-bold text-slate-700 shadow-sm transition-all active:scale-95 hover:border-slate-300"
              title="Save current layout as your default"
            >
              <Save size={13} className="text-[#5A374F]" />
              <span className="hidden xl:inline">Save</span>
            </button>

            {/* 3. Reset Layout Button */}
            <button
              type="button"
              onClick={resetLayout}
              className="h-9 w-9 flex items-center justify-center bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-slate-400 hover:text-slate-700 shadow-sm transition-all active:scale-95"
              title="Reset to default 65x15 layout"
            >
              <RefreshCcw size={13} />
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

            {/* Hardware Calibration Button */}
            <button
              type="button"
              onClick={() => setShowCalibrationModal(true)}
              className={`h-9 px-2.5 flex items-center gap-1.5 border rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer ${
                calibration.offsetX !== 0 || calibration.offsetY !== 0
                  ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                  : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700 hover:border-slate-300"
              }`}
              title="Printer Hardware Calibration (Adjust X/Y feed offsets)"
            >
              <Target size={13} className={calibration.offsetX !== 0 || calibration.offsetY !== 0 ? "text-amber-600" : "text-[#5A374F]"} />
              <span>Calibrate</span>
              {(calibration.offsetX !== 0 || calibration.offsetY !== 0) && (
                <span className="text-[8px] font-mono font-black bg-amber-200 text-amber-900 px-1 py-0.5 rounded leading-none">
                  {calibration.offsetX},{calibration.offsetY}
                </span>
              )}
            </button>

            {/* Safe Margins Toggle Button */}
            <button
              type="button"
              onClick={() => setShowSafeMargins(prev => !prev)}
              className={`h-9 px-2.5 flex items-center gap-1.5 border rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer ${
                showSafeMargins
                  ? "bg-purple-50 border-[#5A374F]/30 text-[#5A374F]"
                  : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-400"
              }`}
              title="Toggle 0.8mm Safe Margin printable guide"
            >
              <ShieldCheck size={13} />
              <span className="hidden xl:inline">Margins</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

            {/* 4. Orientation Segmented Pill */}
            <div className="flex items-center bg-slate-100/70 p-0.5 rounded-xl h-9 border border-slate-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => setPrintOrientation("landscape")}
                className={`h-7 px-2.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${printOrientation === 'landscape' ? "bg-white text-[#5A374F] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="Horizontal (Landscape) - Tag Roll"
              >
                Horizontal
              </button>
              <button
                type="button"
                onClick={() => setPrintOrientation("portrait")}
                className={`h-7 px-2.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${printOrientation === 'portrait' ? "bg-white text-[#5A374F] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                title="Vertical (Portrait)"
              >
                Vertical
              </button>
            </div>

            {/* 5. Rotation Selector */}
            <div className="flex items-center bg-slate-50/80 border border-slate-200/80 rounded-xl px-2 h-9 gap-1 shadow-sm" title="Print Rotation Angle">
              <RotateCw size={12} className="text-[#5A374F]" />
              <select
                value={printRotation}
                onChange={(e) => setPrintRotation(parseInt(e.target.value))}
                className="bg-transparent text-[10px] font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value={0}>0°</option>
                <option value={90}>90°</option>
                <option value={180}>180°</option>
                <option value={270}>270°</option>
              </select>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

            {/* 6. Primary Print Button */}
            <button
              onClick={handlePrint}
              className="h-9 flex items-center gap-2 bg-gradient-to-r from-[#5A374F] to-[#45273b] hover:from-[#4a2d41] hover:to-[#381f30] text-white px-5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md shadow-[#5A374F]/25 hover:shadow-lg hover:shadow-[#5A374F]/35 transition-all active:scale-95"
            >
              <Printer size={15} />
              <span>Print Tags ({activeProducts.length})</span>
            </button>

            {/* 7. Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50/80 border border-green-200/50 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-green-700">Ready</span>
            </div>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {formatSavedToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#5A374F] text-white px-5 py-2.5 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <Sparkles size={15} className="text-amber-300 animate-pulse" />
            <span>{formatSavedToast}</span>
          </div>
        )}

        {/* Workspace Canvas */}
        <div
          className="flex-1 overflow-auto bg-[#f8f9fa] relative print:bg-white print:p-0 print:m-0 flex justify-center p-20 custom-scrollbar print-workspace-canvas"
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
            className="relative flex flex-col items-center gap-12 print:gap-0 transition-transform duration-200 ease-out py-20 print:py-0 print:m-0 print-container"
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
                    className="butterfly-tag relative bg-white border border-slate-100 shadow-sm print:shadow-none print:border-none mb-8 print:mb-0 transition-all duration-500 overflow-hidden"
                    style={{
                      width: `${tagDimensions.width}mm`,
                      height: `${tagDimensions.height}mm`,
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
                    <div
                      className="absolute inset-y-0 border-r border-dashed border-slate-100/50 print:hidden"
                      style={{ left: `${tagDimensions.width / 2}mm` }}
                    />
                  </div>
                );
              }

              // Standard Tag Designer Loop
              let diamondGW = 0;
              let stoneGW = 0;

              if (p.diamondGW !== undefined || p.stoneGW !== undefined) {
                diamondGW = Number(p.diamondGW || 0);
                stoneGW = Number(p.stoneGW || 0);
              } else if (p.components && Array.isArray(p.components) && p.components.length > 0) {
                // DB Product Mode (using components)
                diamondGW = p.components
                  .filter(c => {
                    const t = (c.type || "").toUpperCase();
                    return ["DIAMOND", "POLKI", "MOISSANITE"].includes(t);
                  })
                  .reduce((acc, c) => {
                    const gw = c.grossWeight != null && c.grossWeight > 0
                      ? Number(c.grossWeight)
                      : Number(c.weight || 0) * Number(c.count || 1);
                    return acc + gw;
                  }, 0);
                stoneGW = p.components
                  .filter(c => {
                    const t = (c.type || "").toUpperCase();
                    return !["DIAMOND", "POLKI", "MOISSANITE", "ACCESSORY", "BELT", ""].includes(t);
                  })
                  .reduce((acc, c) => {
                    const gw = c.grossWeight != null && c.grossWeight > 0
                      ? Number(c.grossWeight)
                      : Number(c.weight || 0) * Number(c.count || 1);
                    return acc + gw;
                  }, 0);
              } else if (p.jewelleryStones && Array.isArray(p.jewelleryStones) && p.jewelleryStones.length > 0) {
                // Manual / Quick Mode fallback structure
                diamondGW = p.jewelleryStones
                  .filter(s => s.stoneType?.toUpperCase() === "DIAMOND")
                  .reduce((acc, s) => acc + (Number(s.stoneWeight) || 0), 0);
                stoneGW = p.jewelleryStones
                  .filter(s => s.stoneType?.toUpperCase() !== "DIAMOND")
                  .reduce((acc, s) => acc + (Number(s.stoneWeight) || 0), 0);
              }

              let fineGoldWeight = p.fine !== undefined ? Number(p.fine) : (p.fineGold !== undefined ? Number(p.fineGold) : 0);
              if (!fineGoldWeight && p.netWeight && p.metalPurity) {
                const purityStr = String(p.metalPurity).toUpperCase().replace(/\s+/g, "");
                let purityMultiplier = 0;
                if (purityStr.includes("24K")) purityMultiplier = 0.995;
                else if (purityStr.includes("22K")) purityMultiplier = 0.916;
                else if (purityStr.includes("18K")) purityMultiplier = 0.750;
                else if (purityStr.includes("14K")) purityMultiplier = 0.585;

                if (purityMultiplier > 0) {
                  fineGoldWeight = Number(p.netWeight) * purityMultiplier;
                }
              }

              return (
                <div
                  key={index}
                  className="butterfly-tag relative bg-white print:border-none shadow-2xl print:shadow-none mb-12 print:mb-0 overflow-visible print:overflow-hidden"
                  style={{
                    width: `${tagDimensions.width}mm`,
                    height: `${tagDimensions.height}mm`,
                    display: "flex",
                    cursor: isDragging ? "grabbing" : "default"
                  }}
                >
                  {/* Visual Center Divider (Editor only) */}
                  <div
                    className="absolute top-0 bottom-0 border-l border-dashed border-slate-200 z-10 print:hidden"
                    style={{ left: `${tagDimensions.width / 2}mm` }}
                  />

                  {/* Safe Printable Margin Guide */}
                  {showSafeMargins && (
                    <div
                      className="absolute inset-[0.8mm] border border-dashed border-[#5A374F]/25 pointer-events-none z-10 print:hidden rounded-[1px]"
                      title="Safe printable margin (0.8mm bleed boundary)"
                    />
                  )}

                  {/* Canvas Labeling (Dimensions) */}
                  <div className="absolute -top-6 left-0 right-0 flex justify-between px-2 print:hidden">
                    <span className="text-[10px] font-black text-slate-300">{sidebarTab === 'manual' ? 'MANUAL PREVIEW' : `TAG #${index + 1}`}</span>
                    <span className="text-[10px] font-black text-slate-300">{tagDimensions.width}mm x {tagDimensions.height}mm</span>
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
                    <span className="text-[7px] font-black tracking-tight p-0.5 whitespace-nowrap block leading-none">{p.jewelleryCategory}</span>
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
                    <span className="text-[8px] font-black tracking-tight px-1 py-0.5 whitespace-nowrap leading-none block">{p.sku}</span>
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
                    <div className="bg-white flex items-center justify-center">
                      {elements.barcode.type === 'qrcode' ? (
                        <QRCodeCanvas value={p.sku} size={38} level="H" includeMargin={false} />
                      ) : (
                        <Barcode value={p.sku} width={0.7} height={25} fontSize={5} margin={0} background="transparent" />
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
                      <span className="text-slate-400">D.GW:</span><span className="text-black">{diamondGW.toFixed(2)}ct</span>
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
                      <span className="text-slate-400">S.GW:</span><span className="text-black">{stoneGW.toFixed(2)}ct</span>
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
                      <span className="text-slate-400">FINE:</span><span className="text-black">{Number(fineGoldWeight || 0).toFixed(3)}g</span>
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
                  <div
                    className="absolute top-1/2 bg-gradient-to-r from-slate-200 to-slate-50 border-r border-t border-b border-slate-100 rounded-r-full -translate-y-1/2 print:hidden opacity-30 shadow-inner"
                    style={{
                      left: `${tagDimensions.width}mm`,
                      width: `${tagDimensions.tailWidth || 35}mm`,
                      height: `${Math.min(6, Math.max(3, tagDimensions.height * 0.4))}mm`
                    }}
                    title="Physical Tag Tail"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🏷️ Tag Size Configuration Modal */}
      <TagSizeModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        currentSize={tagDimensions}
        onSave={handleUpdateTagDimensions}
      />

      {/* 🎯 Hardware Calibration Modal */}
      <CalibrationModal
        isOpen={showCalibrationModal}
        onClose={() => setShowCalibrationModal(false)}
        calibration={calibration}
        onSave={handleUpdateCalibration}
        onTestPrint={handlePrintTestPattern}
        tagDimensions={tagDimensions}
      />

      <style>{`
        @page {
          size: ${tagDimensions.width}mm ${tagDimensions.height}mm ${printOrientation};
          margin: 0;
        }

        @media print {
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: ${tagDimensions.width}mm !important;
            height: auto !important;
            min-height: ${tagDimensions.height}mm !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          #root,
          #root > div,
          main {
            margin: 0 !important;
            padding: 0 !important;
            width: ${tagDimensions.width}mm !important;
            height: auto !important;
            min-height: ${tagDimensions.height}mm !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
            background: #ffffff !important;
          }

          nav, header, aside, .navbar, .sidebar, .print-hidden {
            display: none !important;
            visibility: hidden !important;
          }

          .print-workspace-canvas,
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            gap: 0 !important;
            transform: none !important;
            background: transparent !important;
            width: ${tagDimensions.width}mm !important;
            height: auto !important;
            min-height: ${tagDimensions.height}mm !important;
            display: block !important;
            overflow: visible !important;
            position: static !important;
          }

          .butterfly-tag {
            width: ${tagDimensions.width}mm !important;
            height: ${tagDimensions.height}mm !important;
            min-width: ${tagDimensions.width}mm !important;
            min-height: ${tagDimensions.height}mm !important;
            max-width: ${tagDimensions.width}mm !important;
            max-height: ${tagDimensions.height}mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-before: auto !important;
            break-before: auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            position: relative !important;
            overflow: hidden !important;
            display: block !important;
            background: #ffffff !important;
            ${printRotation !== 0 ? `transform: rotate(${printRotation}deg) translate(${calibration.offsetX}mm, ${calibration.offsetY}mm) !important; transform-origin: center center !important;` : `transform: translate(${calibration.offsetX}mm, ${calibration.offsetY}mm) !important;`}
          }

          .butterfly-tag:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
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
