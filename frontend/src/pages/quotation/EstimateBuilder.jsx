import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus, Trash2, ChevronDown, ChevronUp, Save, Eye,
  Calculator, Gem, Layers, RefreshCw, User, Phone,
  Mail, MapPin, Clock, AlertCircle, Sparkles, ArrowLeft,
  Diamond
} from "lucide-react";
import { useRates } from "../../context/RatesContext";
import { calculateEstimate, createEstimate, updateEstimate, getEstimate } from "../../api/quotationApi";
import { getImageUrl } from "../../utils/getImageUrl";


/* ──────────────────── CONSTANTS ──────────────────── */
import { DIAMOND_COLORS as COLORS, DIAMOND_CLARITIES as CLARITIES, DIAMOND_SHAPES as SHAPES } from "../../utils/diamondConstants";
import { PURITY_FACTORS } from "../../../../backend/utils/purityFactors.js";


const PURITY_OPTIONS = {
  Gold: ["24KT", "22KT", "18KT", "14KT", "10KT", "9KT"],
  Silver: ["999", "925", "835", "800"],
  Platinum: ["950"],
};
const METAL_TYPES = ["Gold", "Silver", "Platinum"];
const STONE_OPTIONS = [
  "ruby", "pearl", "red-coral", "emerald", "yellow-sapphire",
  "diamond", "blue-sapphire", "hessonite", "cats-eye", "gemstone"
];
const JEWELLERY_CATEGORIES = ["Ring", "Necklace", "Bracelet", "Earring", "Bangle", "Pendant", "Other"];

const VALID_DAYS_OPTIONS = [7, 15, 30, 60, 90];

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => Number(n || 0).toLocaleString("en-IN");

const COLOR_GROUPS = {
  "D-F": ["D", "E", "F"],
  "G-H": ["G", "H"],
  "I-J": ["I", "J"],
  "K-L": ["K", "L"],
  "M-N": ["M", "N"],
  "O-P": ["O", "P"],
};

const CLARITY_GROUPS = {
  "VVS-VS": ["VVS1", "VVS2", "VS1", "VS2"],
  "SI-I": ["SI1", "SI2", "I1", "I2"],
};

const SelectWithGroups = ({ list, groups, value, onChange, className }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={className}
  >
    <option value="">Select</option>
    {Object.keys(groups).map((g) => (
      <option key={g} value={g}>{g}</option>
    ))}
    <optgroup label="Individual">
      {list.map((v) => (
        <option key={v} value={v}>{v}</option>
      ))}
    </optgroup>
  </select>
);

/* ──────────────────── DEFAULT STATE ──────────────────── */



const defaultItem = () => ({
  _key: Math.random().toString(36).slice(2),
  title: "",
  jewelleryCategory: "Ring",
  description: "",
  metalType: "Gold",
  metalPurity: "22KT",
  netWeight: "",
  grossWeight: "",
  fineGold: "",
  huid: "",
  hsnCode: "",
  quantity: "1",
  discountEnabled: true,
  images: [],
  imagePreviews: [],
  diamonds: [],
  gemstones: [],
  breakup: null,
  collapsed: false,
});

const defaultForm = () => ({
  customerName: "",
  mobile: "",
  email: "",
  address: "",
  notes: "",
  validDays: 7,
});


/* ──────────────────── COMPONENT: Metal Rate Badge ──────────────────── */
function MetalRateBadge({ metalType, metalPurity, rates }) {
  if (!rates) return null;
  const r = rates.helpers?.getMetalRate(metalType, metalPurity) || 0;
  if (!r) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded-full text-[10px] text-yellow-700 font-medium">
      <Sparkles size={8} />
      ₹{fmtInt(r)}/gm
    </span>
  );
}

/* ──────────────────── COMPONENT: Breakup Panel ──────────────────── */
function BreakupPanel({ breakup }) {
  if (!breakup) return null;
  const rows = [
    { label: "Metal Value", value: breakup.metalValue, color: "text-amber-700" },
    { label: "Diamond Value", value: breakup.diamondValue, color: "text-sky-700" },
    { label: "Stone Value", value: breakup.stoneValue, color: "text-emerald-700" },
    { label: "Making Charges", value: breakup.makingCharge, color: "text-orange-700" },
  ];
  if (breakup.discount > 0) {
    rows.push({ label: "Discount", value: -breakup.discount, color: "text-rose-600" });
  }
  return (
    <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-200 flex items-center gap-2 bg-slate-100/50">
        <Calculator size={12} className="text-slate-400" />
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price Breakdown</span>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((r) => (
          r.value !== 0 ? (
            <div key={r.label} className="flex justify-between px-4 py-1.5 text-xs">
              <span className="text-slate-500">{r.label}</span>
              <span className={`font-mono font-semibold ${r.color}`}>
                {r.value < 0 ? "-" : ""}₹{fmt(Math.abs(r.value))}
              </span>
            </div>
          ) : null
        ))}
        <div className="flex justify-between px-4 py-2 bg-white">
          <span className="text-xs text-slate-600 font-semibold">Subtotal</span>
          <span className="text-sm font-bold text-slate-900 font-mono">₹{fmt(breakup.subtotal)}</span>
        </div>
        <div className="flex justify-between px-4 py-1.5">
          <span className="text-[10px] text-slate-400">GST ({breakup.gstPercent}%)</span>
          <span className="text-[10px] text-slate-600 font-mono">+₹{fmt(breakup.gst)}</span>
        </div>
        <div className="flex justify-between px-4 py-2 bg-amber-50">
          <span className="text-xs text-amber-900 font-bold">Total (incl. GST)</span>
          <span className="text-lg font-extrabold text-amber-700 font-mono">₹{fmt(breakup.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}


/* ──────────────────── MAIN COMPONENT ──────────────────── */
export default function EstimateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rates, loading: ratesLoading } = useRates();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(defaultForm());
  const [items, setItems] = useState([defaultItem()]);
  const [totals, setTotals] = useState({ subtotal: 0, gstTotal: 0, grandTotal: 0 });
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);
  const calcTimerRef = useRef(null);

  /* ───── ITEM HANDLERS ───── */
  const addItem = () => setItems((prev) => [...prev, defaultItem()]);

  const removeItem = (index) => {
    if (items.length === 1) return toast.warning("At least one item is required");
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemField = (index, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const updated = { ...it, [field]: value };

        // Auto-calculate Fine Gold if Net Weight or Purity changes
        if (field === "netWeight" || field === "metalPurity") {
          const nw = Number(field === "netWeight" ? value : it.netWeight) || 0;
          const purity = field === "metalPurity" ? value : it.metalPurity;

          const factor = PURITY_FACTORS[purity] || 1;
          updated.fineGold = (nw * factor).toFixed(3);
        }

        return updated;
      })
    );
  };

  const handleImageChange = (itemIndex, e) => {
    const files = Array.from(e.target.files);
    setItems(prev => prev.map((it, i) => {
      if (i !== itemIndex) return it;
      const newImages = [...it.images, ...files];
      const newPreviews = [...it.imagePreviews, ...files.map(f => getImageUrl(f))];
      return { ...it, images: newImages, imagePreviews: newPreviews };

    }));

    e.target.value = null; // Reset
  };

  const removeImage = (itemIndex, imgIdx) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== itemIndex) return it;
      const newImages = it.images.filter((_, idx) => idx !== imgIdx);
      const newPreviews = it.imagePreviews.filter((_, idx) => idx !== imgIdx);
      return { ...it, images: newImages, imagePreviews: newPreviews };
    }));
  };

  const toggleCollapse = (index) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, collapsed: !it.collapsed } : it))
    );
  };

  /* ───── DIAMOND HANDLERS ───── */
  const addDiamond = (itemIndex) => {
    setItems(prev => prev.map((it, i) => i === itemIndex ? {
      ...it,
      diamonds: [...it.diamonds, {
        _key: Math.random().toString(36).slice(2),
        shape: "Round", weight: "", count: "1", grossWeight: "",
        rateOverride: "", rateLocked: true, color: "G", clarity: "VS1", size: ""
      }]
    } : it));
  };

  const removeDiamond = (itemIndex, dIndex) => {
    setItems(prev => prev.map((it, i) => i === itemIndex ? {
      ...it,
      diamonds: it.diamonds.filter((_, di) => di !== dIndex)
    } : it));
  };

  const updateDiamond = (itemIndex, dIndex, field, value) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== itemIndex) return it;
      const updatedDiamonds = it.diamonds.map((d, di) => {
        if (di !== dIndex) return d;
        const updated = {
          ...d,
          [field]: (field === "grossWeight" || field === "count")
            ? (value === "" ? "" : Number(value))
            : value
        };

        if (field === "grossWeight" || field === "count") {
          const gw = Number(updated.grossWeight) || 0;
          const c = Number(updated.count) || 0;
          updated.weight = c > 0 ? (gw / c) : 0;
        }
        return updated;
      });
      return { ...it, diamonds: updatedDiamonds };
    }));
  };

  const toggleDiamondRateLock = (itemIndex, dIndex) => {
    setItems(prev => prev.map((it, i) => i === itemIndex ? {
      ...it,
      diamonds: it.diamonds.map((d, di) => di === dIndex ? { ...d, rateLocked: !d.rateLocked } : d)
    } : it));
  };

  /* ───── GEMSTONE HANDLERS ───── */
  const addGemstone = (itemIndex) => {
    setItems(prev => prev.map((it, i) => i === itemIndex ? {
      ...it,
      gemstones: [...it.gemstones, {
        _key: Math.random().toString(36).slice(2),
        name: "ruby", shape: "", weight: "", count: "1",
        grossWeight: "", rateOverride: "", rateLocked: true,
        rateType: "PER_CT"
      }]

    } : it));
  };

  const removeGemstone = (itemIndex, gIndex) => {
    setItems(prev => prev.map((it, i) => i === itemIndex ? {
      ...it,
      gemstones: it.gemstones.filter((_, gi) => gi !== gIndex)
    } : it));
  };

  const updateGemstone = (itemIndex, gIndex, field, value) => {
    setItems(prev => prev.map((it, i) => {
      if (i !== itemIndex) return it;
      const updatedGemstones = it.gemstones.map((g, gi) => {
        if (gi !== gIndex) return g;
        const updated = {
          ...g,
          [field]: (field === "grossWeight" || field === "count")
            ? (value === "" ? "" : Number(value))
            : value
        };

        if (field === "grossWeight" || field === "count") {
          const gw = Number(updated.grossWeight) || 0;
          const c = Number(updated.count) || 0;
          updated.weight = c > 0 ? (gw / c) : 0;
        }
        return updated;
      });
      return { ...it, gemstones: updatedGemstones };
    }));
  };

  const toggleGemstoneRateLock = (itemIndex, gIndex) => {
    setItems(prev => prev.map((it, i) => i === itemIndex ? {
      ...it,
      gemstones: it.gemstones.map((g, gi) => gi === gIndex ? { ...g, rateLocked: !g.rateLocked } : g)
    } : it));
  };

  /* ───── Load for Edit ───── */
  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const res = await getEstimate(id);
        const q = res.data.quotation;
        setForm({
          customerName: q.customerName || "",
          mobile: q.mobile || "",
          email: q.email || "",
          address: q.address || "",
          notes: q.notes || "",
          validDays: q.validDays || 7,
        });

        setItems(
          (q.items || []).map((it) => {
            const diamonds = [];
            const gemstones = [];
            (it.components || []).forEach(c => {
              const comp = {
                ...c,
                _key: Math.random().toString(36).slice(2),
                weight: String(c.weight || ""),
                count: String(c.count || "1"),
                grossWeight: String(c.grossWeight || ""),
                rateOverride: String(c.rateOverride || ""),
              };
              if (c.pricingRef === "DIAMOND") diamonds.push(comp);
              else gemstones.push({ ...comp, name: c.type });
            });

            return {
              _key: Math.random().toString(36).slice(2),
              title: it.title || "",
              jewelleryCategory: it.jewelleryCategory || "Ring",
              description: it.description || "",
              metalType: it.metalType || "Gold",
              metalPurity: it.metalPurity || "22KT",
              netWeight: String(it.netWeight || ""),
              grossWeight: String(it.grossWeight || ""),
              fineGold: String(it.fineGold || ""),
              huid: it.huid || "",
              hsnCode: it.hsnCode || "",
              quantity: String(it.quantity || "1"),
              discountEnabled: it.discountEnabled !== false,
              images: it.images || [],
              imagePreviews: (it.images || []).map(img => getImageUrl(img)),

              diamonds,
              gemstones,
              breakup: it.breakup || null,
              collapsed: false,
            };
          })
        );
        setTotals({ subtotal: q.subtotal, gstTotal: q.gstTotal, grandTotal: q.grandTotal });
      } catch {
        toast.error("Failed to load estimate");
        navigate("/quotations");
      } finally {
        setLoadingEdit(false);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  /* ───── DEBOUNCED CALCULATE ───── */
  const triggerCalculate = useCallback(() => {
    clearTimeout(calcTimerRef.current);
    calcTimerRef.current = setTimeout(async () => {
      const payloadItems = items.map((it) => {
        const components = [];
        (it.diamonds || []).forEach(d => components.push({
          type: "diamond",
          pricingRef: "DIAMOND",
          shape: d.shape || "",
          color: d.color || "",
          clarity: d.clarity || "",
          weight: Number(d.weight || 0),
          count: Number(d.count || 1),
          grossWeight: Number(d.grossWeight || 0),
          rateOverride: Number(d.rateOverride || 0),
          size: d.size || "",
        }));
        (it.gemstones || []).forEach(g => components.push({
          type: g.name || "stone",
          pricingRef: "STONE",
          shape: g.shape || "",
          weight: Number(g.weight || 0),
          count: Number(g.count || 1),
          grossWeight: Number(g.grossWeight || 0),
          rateOverride: Number(g.rateOverride || 0),
          rateType: g.rateType || "PER_CT",
        }));


        return {
          metalType: it.metalType,
          metalPurity: it.metalPurity,
          netWeight: Number(it.netWeight || 0),
          quantity: Number(it.quantity || 1),
          discountEnabled: it.discountEnabled !== false,
          components
        };
      });

      const hasWeight = payloadItems.some((it) => it.netWeight > 0 || it.components.some((c) => c.weight > 0));
      if (!hasWeight) {
        setTotals({ subtotal: 0, gstTotal: 0, grandTotal: 0 });
        return;
      }

      try {
        setCalculating(true);
        const res = await calculateEstimate(payloadItems);
        const calcItems = res.data.items || [];
        setItems((prev) =>
          prev.map((item, i) => ({
            ...item,
            breakup: calcItems[i]?.breakup || item.breakup,
          }))
        );
        setTotals(res.data.totals || { subtotal: 0, gstTotal: 0, grandTotal: 0 });
      } catch (err) {
        console.error("Calc error:", err);
      } finally {
        setCalculating(false);
      }
    }, 600);
  }, [items]);

  useEffect(() => {
    if (!loadingEdit) triggerCalculate();
    return () => clearTimeout(calcTimerRef.current);
  }, [items, loadingEdit, triggerCalculate]);

  /* ───── SAVE ───── */
  const buildPayload = (status = "DRAFT") => ({
    customerName: form.customerName.trim(),
    mobile: form.mobile.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    status,
    validDays: form.validDays,
    notes: form.notes,

    items: items.map((it) => {
      const components = [];
      (it.diamonds || []).forEach(d => components.push({
        type: "diamond",
        pricingRef: "DIAMOND",
        shape: d.shape || "",
        color: d.color || "",
        clarity: d.clarity || "",
        weight: Number(d.weight || 0),
        count: Number(d.count || 1),
        grossWeight: Number(d.grossWeight || 0),
        rateOverride: Number(d.rateOverride || 0),
        size: d.size || "",
      }));
      (it.gemstones || []).forEach(g => components.push({
        type: g.name || "stone",
        pricingRef: "STONE",
        shape: g.shape || "",
        weight: Number(g.weight || 0),
        count: Number(g.count || 1),
        grossWeight: Number(g.grossWeight || 0),
        rateOverride: Number(g.rateOverride || 0),
        rateType: g.rateType || "PER_CT",
      }));


      return {
        title: it.title,
        jewelleryCategory: it.jewelleryCategory,
        description: it.description,
        metalType: it.metalType,
        metalPurity: it.metalPurity,
        netWeight: Number(it.netWeight || 0),
        grossWeight: Number(it.grossWeight || 0),
        fineGold: Number(it.fineGold || 0),
        huid: it.huid,
        hsnCode: it.hsnCode,
        quantity: Number(it.quantity || 1),
        discountEnabled: it.discountEnabled !== false,
        images: it.images, // Backend will handle File objects via FormData separately
        components
      };
    }),
  });

  const handleSave = async (status = "DRAFT", redirect = false) => {
    if (!form.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    try {
      setSaving(true);
      const payload = buildPayload(status);

      // Check if we need FormData (if there are any File objects)
      const isFile = (val) => val instanceof File || (val && typeof val === 'object' && val.name && val.size);
      const hasFiles = items.some(it => (it.images || []).some(img => isFile(img)));


      let res;
      if (hasFiles) {
        const formData = new FormData();
        formData.append("customerName", payload.customerName);
        formData.append("mobile", payload.mobile);
        formData.append("email", payload.email);
        formData.append("address", payload.address);
        formData.append("notes", payload.notes || "");
        formData.append("status", payload.status);
        formData.append("validDays", payload.validDays || 7);

        // Append items as string (excluding File objects which can't be stringified)
        const itemsWithPlaceholders = payload.items.map(it => ({
          ...it,
          images: (it.images || []).filter(img => typeof img === "string")
        }));
        formData.append("items", JSON.stringify(itemsWithPlaceholders));

        // Append files with dynamic field names
        items.forEach((item, idx) => {
          (item.images || []).forEach(img => {
            if (isFile(img)) {
              formData.append(`images_${idx}`, img);
            }
          });
        });


        if (isEdit) res = await updateEstimate(id, formData);
        else res = await createEstimate(formData);
      } else {
        // Simple JSON
        if (isEdit) res = await updateEstimate(id, payload);
        else res = await createEstimate(payload);
      }

      const saved = res.data.quotation;
      toast.success(isEdit ? "Estimate updated!" : "Estimate saved!");
      if (redirect) navigate(`/quotations/${saved._id}`);
      else if (!isEdit) navigate(`/quotations/${saved._id}/edit`);
    } catch (err) {
      console.error("Save Error:", err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ───── STYLES ───── */

  const sectionTitleClass = "text-[15px] font-black text-slate-900 mb-5 flex items-center tracking-tight";
  const lineMarkerClass = "w-1 h-5 bg-[#5A374F] rounded-full mr-3";
  const labelClass = "block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider";
  const inputClass = "w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 font-medium";
  const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7rem_auto] bg-[position:right_1rem_center] bg-no-repeat cursor-pointer`;
  const addButtonClass = "bg-[#632947] text-white text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded-xl flex items-center gap-1 hover:bg-[#5A374F] transition-all shadow-md shadow-[#b07fa5] active:scale-95";

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-indigo-600" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ===== TOPBAR ===== */}
      <div className="sticky top-0 z-30 bg-white backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/quotations")}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition border border-slate-200"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">{isEdit ? "Edit Estimate" : "New Estimate"}</h1>
              <p className="text-xs text-slate-500 font-medium">{isEdit ? `Modifying existing record` : "Draft a premium quotation"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {calculating && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold animate-pulse mr-2">
                <RefreshCw size={14} className="animate-spin" />
                <span>Syncing…</span>
              </div>
            )}
            <button
              onClick={() => handleSave("DRAFT", false)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#632947] hover:bg-[#5A374F] text-white text-sm font-bold transition disabled:opacity-50 border border-slate-200"
            >
              <Save size={16} className="text-slate-500" />
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button
              onClick={() => handleSave("DRAFT", true)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#632947] hover:bg-[#5A374F] text-white text-sm font-black transition shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              <Eye size={16} />
              Save & Preview
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ══════════════════ LEFT COLUMN ══════════════════ */}
        <div className="space-y-5">
          {/* ===== CUSTOMER SECTION ===== */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <User size={16} className="text-indigo-600" />
              </div>
              <h2 className="font-bold text-sm text-slate-900 tracking-tight">Customer Information</h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Customer Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Mobile</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="customer@email.com"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Customer address (optional)"
                    rows={2}
                    className={`${inputClass} h-auto py-2 pl-9 resize-none`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===== CONFIGURATION SECTION ===== */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <Clock size={15} className="text-[#632947]" />
              <h2 className="font-semibold text-sm text-[#1B3B59]">Estimate Configuration</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Internal Notes / Terms</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional terms or internal notes..."
                  rows={2}
                  className={`${inputClass} h-auto py-2 resize-none`}
                />
              </div>

            </div>
          </div>


          {/* ===== ITEMS ===== */}
          {items.map((item, itemIndex) => (
            <div key={item._key} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm mb-5">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#632947] text-xs font-bold text-white shrink-0">{itemIndex + 1}</div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[#1B3B59] truncate">{item.title || "New Jewellery Item"}</span>
                    {item.collapsed && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{item.jewelleryCategory}</span>
                        {item.netWeight && <span>• {item.netWeight}g</span>}
                        {item.metalPurity && <span>• {item.metalPurity}</span>}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.breakup?.grandTotal > 0 && (
                    <span className="text-sm font-bold text-[#632947] font-mono mr-2">₹{fmt(item.breakup.grandTotal)}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(itemIndex)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition"
                  >
                    {item.collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(itemIndex)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {!item.collapsed && (
                <div className="p-5 space-y-6">
                  {/* Product Images */}
                  <div className="mb-6">
                    <label className={labelClass}>Product Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-2">
                      {item.imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group shadow-sm bg-white">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(itemIndex, idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus size={12} className="rotate-45" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-[#632947] hover:text-[#632947] cursor-pointer transition-all hover:bg-[#632947]/5">
                        <Plus size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Add Image</span>
                        <input type="file" multiple accept="image/*" onChange={(e) => handleImageChange(itemIndex, e)} className="hidden" />
                      </label>

                    </div>
                  </div>
                  {/* Product Reference */}
                  <div className="space-y-4">
                    <div className={sectionTitleClass}><span className={lineMarkerClass}></span>Product Reference</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>Product Title</label>
                        <input
                          value={item.title}
                          onChange={(e) => updateItemField(itemIndex, "title", e.target.value)}
                          placeholder="e.g. Floral Diamond Bracelet"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Category</label>
                        <select
                          value={item.jewelleryCategory}
                          onChange={(e) => updateItemField(itemIndex, "jewelleryCategory", e.target.value)}
                          className={selectClass}
                        >
                          {JEWELLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemField(itemIndex, "quantity", e.target.value)}
                          placeholder="1"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Gross Weight (g)</label>
                        <input
                          type="number"
                          value={item.grossWeight}
                          onChange={(e) => updateItemField(itemIndex, "grossWeight", e.target.value)}
                          placeholder="0.000"
                          className={inputClass}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelClass}>Description</label>
                        <input
                          value={item.description}
                          onChange={(e) => updateItemField(itemIndex, "description", e.target.value)}
                          placeholder="Short description..."
                          className={inputClass}
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.discountEnabled}
                            onChange={(e) => updateItemField(itemIndex, "discountEnabled", e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#632947]"></div>
                        </label>
                        <span className="text-xs font-semibold text-slate-600">Apply Automated Discount</span>
                      </div>
                    </div>
                  </div>

                  {/* Metal Specifications */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className={sectionTitleClass}><span className={lineMarkerClass}></span>Metal Specifications</div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>Metal</label>
                        <select
                          value={item.metalType}
                          onChange={(e) => {
                            const mt = e.target.value;
                            updateItemField(itemIndex, "metalType", mt);
                            updateItemField(itemIndex, "metalPurity", PURITY_OPTIONS[mt][0]);
                          }}
                          className={selectClass}
                        >
                          {METAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Purity</label>
                        <select
                          value={item.metalPurity}
                          onChange={(e) => updateItemField(itemIndex, "metalPurity", e.target.value)}
                          className={selectClass}
                        >
                          {PURITY_OPTIONS[item.metalType].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="relative">
                        <label className={labelClass}>Net Weight (g)</label>
                        <div className="absolute top-0 right-0">
                          {!ratesLoading && <MetalRateBadge metalType={item.metalType} metalPurity={item.metalPurity} rates={rates} />}
                        </div>
                        <input
                          type="number"
                          value={item.netWeight}
                          onChange={(e) => updateItemField(itemIndex, "netWeight", e.target.value)}
                          placeholder="0.000"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Fine Metal (g)</label>
                        <input
                          type="number"
                          value={item.fineGold}
                          onChange={(e) => updateItemField(itemIndex, "fineGold", e.target.value)}
                          placeholder="0.000"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Diamonds Section */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className={sectionTitleClass}><span className={lineMarkerClass}></span>Diamonds</div>

                    </div>
                    <div className="space-y-3">
                      {item.diamonds.map((diamond, dIndex) => (
                        <div key={diamond._key} className="border border-slate-100 rounded-lg p-3 bg-slate-50/30 relative group">
                          <button
                            type="button"
                            onClick={() => removeDiamond(itemIndex, dIndex)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="grid grid-cols-2 md:grid-cols-8 gap-3">
                            <div>
                              <label className={labelClass}>Shape</label>
                              <select value={diamond.shape} onChange={(e) => updateDiamond(itemIndex, dIndex, "shape", e.target.value)} className={selectClass}>
                                <option value="">Select</option>
                                {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>

                            </div>

                            <div>
                              <label className={labelClass}>Color</label>
                              <SelectWithGroups list={COLORS} groups={COLOR_GROUPS} value={diamond.color} onChange={(v) => updateDiamond(itemIndex, dIndex, "color", v)} className={selectClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Clarity</label>
                              <SelectWithGroups list={CLARITIES} groups={CLARITY_GROUPS} value={diamond.clarity} onChange={(v) => updateDiamond(itemIndex, dIndex, "clarity", v)} className={selectClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Size (mm)</label>
                              <input value={diamond.size || ""} onChange={(e) => updateDiamond(itemIndex, dIndex, "size", e.target.value)} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Total (Ct)</label>
                              <input type="number" step="0.001" value={diamond.grossWeight ?? ""} onChange={(e) => updateDiamond(itemIndex, dIndex, "grossWeight", e.target.value)} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Qty</label>
                              <input type="number" min="1" value={diamond.count ?? ""} onChange={(e) => updateDiamond(itemIndex, dIndex, "count", e.target.value)} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Weight (Ct)</label>
                              <input type="number" value={diamond.weight ? Number(diamond.weight).toFixed(3) : ""} readOnly className={`${inputClass} bg-slate-50`} />
                            </div>
                            <div>
                              <label className={labelClass}>Rate (₹)</label>
                              <div className="relative">
                                <input type="number" step="0.01" value={diamond.rateOverride || ""} readOnly={diamond.rateLocked} onChange={(e) => updateDiamond(itemIndex, dIndex, "rateOverride", e.target.value)} className={`${inputClass} pr-8 ${diamond.rateLocked ? "bg-slate-50 text-slate-500" : ""}`} />
                                <button type="button" onClick={() => toggleDiamondRateLock(itemIndex, dIndex)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#632947] transition">
                                  {diamond.rateLocked ? "🔒" : "🔓"}
                                </button>
                              </div>

                            </div>

                          </div>

                        </div>
                      ))}


                    </div>
                    <button type="button" onClick={() => addDiamond(itemIndex)} className={addButtonClass}>+ Add Diamond</button>
                  </div>

                  {/* Gemstones Section */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className={sectionTitleClass}><span className={lineMarkerClass}></span>Gemstones</div>

                    </div>
                    <div className="space-y-3">
                      {item.gemstones.map((gem, gIndex) => (
                        <div key={gem._key} className="border border-slate-100 rounded-lg p-3 bg-slate-50/30 relative group">
                          <button
                            type="button"
                            onClick={() => removeGemstone(itemIndex, gIndex)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 size={12} />
                          </button>
                          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                            <div>
                              <label className={labelClass}>Stone</label>
                              <select value={gem.name} onChange={(e) => updateGemstone(itemIndex, gIndex, "name", e.target.value)} className={selectClass}>
                                {STONE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Shape</label>
                              <select value={gem.shape} onChange={(e) => updateGemstone(itemIndex, gIndex, "shape", e.target.value)} className={selectClass}>
                                <option value="">Select</option>
                                {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Total (Ct)</label>
                              <input type="number" step="0.001" value={gem.grossWeight ?? ""} onChange={(e) => updateGemstone(itemIndex, gIndex, "grossWeight", e.target.value)} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Qty</label>
                              <input type="number" min="1" value={gem.count ?? ""} onChange={(e) => updateGemstone(itemIndex, gIndex, "count", e.target.value)} className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Weight (Ct)</label>
                              <input type="number" value={gem.weight ? Number(gem.weight).toFixed(3) : ""} readOnly className={`${inputClass} bg-slate-50`} />
                            </div>
                            <div>
                              <label className={labelClass}>Rate (₹)</label>
                              <div className="relative">
                                <input type="number" step="0.01" value={gem.rateOverride || ""} readOnly={gem.rateLocked} onChange={(e) => updateGemstone(itemIndex, gIndex, "rateOverride", e.target.value)} className={`${inputClass} pr-8 ${gem.rateLocked ? "bg-slate-50 text-slate-500" : ""}`} />
                                <button type="button" onClick={() => toggleGemstoneRateLock(itemIndex, gIndex)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#632947] transition">
                                  {gem.rateLocked ? "🔒" : "🔓"}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}>Rate Type</label>
                              <select
                                value={gem.rateType || "PER_CT"}
                                onChange={(e) => updateGemstone(itemIndex, gIndex, "rateType", e.target.value)}
                                className={selectClass}
                              >
                                <option value="PER_CT">Per Ct</option>
                                <option value="PER_PCS">Per Pc</option>
                              </select>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => addGemstone(itemIndex)} className={addButtonClass}>+ Add Gemstone</button>
                  </div>

                  {/* Breakup Panel */}
                  <div className="pt-4 border-t border-slate-100">
                    <BreakupPanel breakup={item.breakup} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Item Button */}
          <button
            onClick={addItem}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-[#632947] text-slate-400 hover:text-[#632947] text-sm font-medium transition-all hover:bg-white/50"
          >
            <Plus size={16} />
            Add Another Item
          </button>
        </div>

        {/* ══════════════════ RIGHT COLUMN — SUMMARY ══════════════════ */}
        <div className="sticky top-24 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <Calculator size={15} className="text-[#632947]" />
              <h3 className="font-semibold text-sm text-[#1B3B59]">Estimate Summary</h3>
              {calculating && <RefreshCw size={12} className="animate-spin text-[#632947] ml-auto" />}
            </div>
            <div className="p-5 space-y-3">
              {items.map((item, i) => (
                <div key={item._key} className="flex justify-between text-xs">
                  <span className="text-slate-500 truncate max-w-[180px]">{i + 1}. {item.title || "Jewellery Item"}</span>
                  <span className="text-slate-700 font-mono font-semibold shrink-0 ml-2">{item.breakup?.grandTotal > 0 ? `₹${fmt(item.breakup.grandTotal)}` : "—"}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-700 font-mono font-semibold">₹{fmt(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">GST Total</span>
                  <span className="text-slate-700 font-mono font-semibold">₹{fmt(totals.gstTotal)}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-[#1B3B59]">Grand Total</span>
                  <span className="text-xl font-extrabold text-[#632947] font-mono">₹{fmt(totals.grandTotal)}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic text-right">Inclusive of GST</p>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-2">
              <button
                onClick={() => handleSave("DRAFT", false)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#4a2b3d] text-sm font-medium transition disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <button
                onClick={() => handleSave("DRAFT", true)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#632947] hover:bg-[#4a1e35] text-white text-sm font-bold transition shadow-lg disabled:opacity-50"
              >
                <Eye size={14} />
                Save & Preview
              </button>
            </div>
          </div>

          {/* Rate Info */}
          {rates && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="text-amber-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Market Rates</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: "Gold 24K", value: rates.base?.gold24KT, unit: "/gm" },
                  { label: "Silver 999", value: rates.base?.silver999, unit: "/gm" },
                  { label: "Plat 950", value: rates.base?.platinum950, unit: "/gm" },
                  { label: "Diamond", value: rates.base?.diamondRate, unit: "/ct" },
                  { label: "Making", value: rates.base?.makingCharge, unit: "/gm" },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-600 font-mono font-medium">₹{Number(value || 0).toLocaleString("en-IN")}{unit}</span>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-400 mt-3 flex items-center gap-1 italic border-t border-slate-50 pt-2">
                <AlertCircle size={9} />
                Live pricing active
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
