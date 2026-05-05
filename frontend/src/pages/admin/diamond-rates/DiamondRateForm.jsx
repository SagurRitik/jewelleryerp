
// import { useState } from "react";
// import { isOverlappingSlab } from "../../../utils/validateDiamondSlab";
// import { createDiamondRate } from "../../../api/diamondRateApi";

// const COLORS = ["D","E","F","G","H","I","J"];
// const CLARITY = ["IF","VVS1","VVS2","VS1","VS2","SI1","SI2"];

// export default function DiamondRateForm({
//   onSubmit,          // OPTIONAL
//   existingRates = [], // OPTIONAL
// }) {
//   const [saving, setSaving] = useState(false);

//   const [f, setF] = useState({
//     shape: "",
//     colorFrom: 0,
//     colorTo: 0,
//     clarityFrom: 0,
//     clarityTo: 0,
//     weightFrom: "",
//     weightTo: "",
//     rateType: "PER_CT",
//     rate: "",
//   });

//   const submit = async () => {
//     const weightFrom = Number(f.weightFrom);
//     const weightTo = Number(f.weightTo);

//     /* ---------- VALIDATION ---------- */
//     if (!f.shape) return alert("Shape required");
//     if (!weightFrom || !weightTo || weightFrom >= weightTo)
//       return alert("Invalid weight slab");
//     if (!f.rate || Number(f.rate) <= 0)
//       return alert("Invalid rate");

//     /* ---------- PAYLOAD ---------- */
//     const payload = {
//       shape: f.shape.trim(),

//       colorFrom: COLORS[f.colorFrom],
//       colorTo: COLORS[f.colorTo],
//       colorFromIndex: f.colorFrom,
//       colorToIndex: f.colorTo,

//       clarityFrom: CLARITY[f.clarityFrom],
//       clarityTo: CLARITY[f.clarityTo],
//       clarityFromIndex: f.clarityFrom,
//       clarityToIndex: f.clarityTo,

//       weightFrom,
//       weightTo,

//       rateType: f.rateType,
//       rate: Number(f.rate),
//       active: true,
//     };

//     /* ---------- OVERLAP CHECK ---------- */
//     if (existingRates.length && isOverlappingSlab(payload, existingRates)) {
//       return alert("❌ Overlapping slab already exists");
//     }

//     try {
//       setSaving(true);

//       // ✅ 1. If parent handler exists, use it
//       if (typeof onSubmit === "function") {
//         await onSubmit(payload);
//       } 
//       // ✅ 2. Otherwise DIRECT API CALL
//       else {
//         await createDiamondRate(payload);
//       }

//       alert("✅ Diamond rate saved successfully");

//       // optional reset
//       setF({
//         shape: "",
//         colorFrom: 0,
//         colorTo: 0,
//         clarityFrom: 0,
//         clarityTo: 0,
//         weightFrom: "",
//         weightTo: "",
//         rateType: "PER_CT",
//         rate: "",
//       });

//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to save diamond rate");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="max-w-xl bg-white border rounded-xl p-6 space-y-4 shadow-sm">

//       <h2 className="font-semibold text-lg flex items-center gap-2">
//         ➕ Add Diamond Rate Slab
//       </h2>

//       <Input label="Shape" value={f.shape}
//         onChange={(v)=>setF({...f,shape:v})} />

//       <RangeSelect
//         label="Color Range"
//         list={COLORS}
//         from={f.colorFrom}
//         to={f.colorTo}
//         onChange={(a,b)=>setF({...f,colorFrom:a,colorTo:b})}
//       />

//       <RangeSelect
//         label="Clarity Range"
//         list={CLARITY}
//         from={f.clarityFrom}
//         to={f.clarityTo}
//         onChange={(a,b)=>setF({...f,clarityFrom:a,clarityTo:b})}
//       />

//       <div className="grid grid-cols-2 gap-2">
//         <Input label="Weight From (ct)"
//           value={f.weightFrom}
//           onChange={(v)=>setF({...f,weightFrom:v})} />
//         <Input label="Weight To (ct)"
//           value={f.weightTo}
//           onChange={(v)=>setF({...f,weightTo:v})} />
//       </div>

//       <select
//         className="input"
//         value={f.rateType}
//         onChange={(e)=>setF({...f,rateType:e.target.value})}
//       >
//         <option value="PER_CT">Per Carat</option>
//         <option value="PER_PC">Per Piece</option>
//       </select>

//       <Input label="Rate (₹)"
//         value={f.rate}
//         onChange={(v)=>setF({...f,rate:v})} />

//       <button
//         disabled={saving}
//         onClick={submit}
//         className={`w-full py-2 rounded-lg font-semibold text-white
//           ${saving ? "bg-gray-400" : "bg-black hover:bg-gray-900"}`}
//       >
//         {saving ? "Saving…" : "Save Diamond Rate"}
//       </button>
//     </div>
//   );
// }

// /* ---------- UI HELPERS ---------- */

// const Input = ({ label, value, onChange, ...p }) => (
//   <div>
//     <label className="text-xs font-semibold text-gray-600">{label}</label>
//     <input
//       {...p}
//       className="input w-full"
//       value={value}
//       onChange={(e)=>onChange(e.target.value)}
//     />
//   </div>
// );

// const RangeSelect = ({ label, list, from, to, onChange }) => (
//   <div>
//     <label className="text-xs font-semibold text-gray-600">{label}</label>
//     <div className="grid grid-cols-2 gap-2">
//       <select className="input" value={from}
//         onChange={(e)=>onChange(+e.target.value,to)}>
//         {list.map((v,i)=><option key={v} value={i}>From {v}</option>)}
//       </select>
//       <select className="input" value={to}
//         onChange={(e)=>onChange(from,+e.target.value)}>
//         {list.map((v,i)=><option key={v} value={i}>To {v}</option>)}
//       </select>
//     </div>
//   </div>
// );

//=======================================


// import { useState } from "react";
// import { isOverlappingSlab } from "../../../utils/validateDiamondSlab";
// import { createDiamondRate } from "../../../api/diamondRateApi";

// import { DIAMOND_COLORS as COLORS, DIAMOND_CLARITIES as CLARITY, DIAMOND_SHAPES as SHAPES } from "../../../utils/diamondConstants";

// export default function DiamondRateForm({
//   onSubmit,
//   existingRates = [],
// }) {
//   const [saving, setSaving] = useState(false);

//   const [f, setF] = useState({
//     shape: "",
//     colorFromIndex: 0,
//     colorToIndex: 0,
//     clarityFromIndex: 0,
//     clarityToIndex: 0,
//     weightFrom: "",
//     weightTo: "",
//     rateType: "PER_CT",
//     rate: "",
//   });

//   const submit = async () => {
//     const weightFrom = Number(f.weightFrom);
//     const weightTo = Number(f.weightTo);

//     if (!f.shape) return alert("Shape required");

//     if (weightFrom <= 0 || weightTo <= 0 || weightFrom >= weightTo)
//       return alert("Invalid weight slab");

//     if (f.colorFromIndex > f.colorToIndex)
//       return alert("Invalid color range");

//     if (f.clarityFromIndex > f.clarityToIndex)
//       return alert("Invalid clarity range");

//     if (!f.rate || Number(f.rate) <= 0)
//       return alert("Invalid rate");

//     const payload = {
//       shape: f.shape.trim(),

//       colorFromIndex: f.colorFromIndex,
//       colorToIndex: f.colorToIndex,

//       clarityFromIndex: f.clarityFromIndex,
//       clarityToIndex: f.clarityToIndex,

//       weightFrom,
//       weightTo,

//       rateType: f.rateType,
//       rate: Number(f.rate),
//       active: true,
//     };

//     if (existingRates.length && isOverlappingSlab(payload, existingRates)) {
//       return alert("❌ Overlapping slab already exists");
//     }

//     try {
//       setSaving(true);

//       if (typeof onSubmit === "function") {
//         await onSubmit(payload);
//       } else {
//         await createDiamondRate(payload);
//       }

//       alert("✅ Diamond rate saved successfully");

//       setF({
//         shape: "",
//         colorFromIndex: 0,
//         colorToIndex: 0,
//         clarityFromIndex: 0,
//         clarityToIndex: 0,
//         weightFrom: "",
//         weightTo: "",
//         rateType: "PER_CT",
//         rate: "",
//       });

//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to save diamond rate");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

//       <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">

//         <h2 className="text-xl font-bold text-gray-800">
//           ➕ Add Diamond Rate Slab
//         </h2>

//         {/* Shape */}
//         <div>
//           <label className="label">Shape</label>
//           <select
//             className="input"
//             value={f.shape}
//             onChange={(e) => setF({ ...f, shape: e.target.value })}
//           >
//             <option value="">Select shape</option>
//             {SHAPES.map(s => (
//               <option key={s} value={s}>{s}</option>
//             ))}
//           </select>
//         </div>

//         {/* Color Range */}
//         <RangeSelect
//           label="Color Range"
//           list={COLORS}
//           from={f.colorFromIndex}
//           to={f.colorToIndex}
//           onChange={(a, b) => setF({ ...f, colorFromIndex: a, colorToIndex: b })}
//         />

//         {/* Clarity Range */}
//         <RangeSelect
//           label="Clarity Range"
//           list={CLARITY}
//           from={f.clarityFromIndex}
//           to={f.clarityToIndex}
//           onChange={(a, b) => setF({ ...f, clarityFromIndex: a, clarityToIndex: b })}
//         />

//         {/* Weight */}
//         <div className="grid grid-cols-2 gap-4">
//           <Input
//             type="number"
//             label="Weight From (ct)"
//             value={f.weightFrom}
//             onChange={(v) => setF({ ...f, weightFrom: v })}
//           />
//           <Input
//             type="number"
//             label="Weight To (ct)"
//             value={f.weightTo}
//             onChange={(v) => setF({ ...f, weightTo: v })}
//           />
//         </div>

//         {/* Rate Type */}
//         <div>
//           <label className="label">Rate Type</label>
//           <select
//             className="input"
//             value={f.rateType}
//             onChange={(e) => setF({ ...f, rateType: e.target.value })}
//           >
//             <option value="PER_CT">Per Carat</option>
//             <option value="PER_PC">Per Piece</option>
//           </select>
//         </div>

//         {/* Rate */}
//         <Input
//           type="number"
//           label="Rate (₹)"
//           value={f.rate}
//           onChange={(v) => setF({ ...f, rate: v })}
//         />

//         <button
//           disabled={saving}
//           onClick={submit}
//           className={`w-full py-3 rounded-xl font-semibold text-white transition
//             ${saving
//               ? "bg-gray-400"
//               : "bg-blue-600 hover:bg-blue-700 shadow-md"
//             }`}
//         >
//           {saving ? "Saving…" : "Save Diamond Rate"}
//         </button>

//       </div>
//     </div>
//   );
// }

// /* ---------- UI Helpers ---------- */

// const Input = ({ label, value, onChange, type = "text" }) => (
//   <div>
//     <label className="label">{label}</label>
//     <input
//       type={type}
//       className="input"
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//     />
//   </div>
// );

// const RangeSelect = ({ label, list, from, to, onChange }) => (
//   <div>
//     <label className="label">{label}</label>
//     <div className="grid grid-cols-2 gap-4">
//       <select
//         className="input"
//         value={from}
//         onChange={(e) => onChange(+e.target.value, to)}
//       >
//         {list.map((v, i) => (
//           <option key={v} value={i}>From {v}</option>
//         ))}
//       </select>

//       <select
//         className="input"
//         value={to}
//         onChange={(e) => onChange(from, +e.target.value)}
//       >
//         {list.map((v, i) => (
//           <option key={v} value={i}>To {v}</option>
//         ))}
//       </select>
//     </div>
//   </div>
// );



//=======================================




// import { useState } from "react";
// import { isOverlappingSlab } from "../../../utils/validateDiamondSlab";
// import { createDiamondRate } from "../../../api/diamondRateApi";

// import {
//   DIAMOND_COLORS as COLORS,
//   DIAMOND_CLARITIES as CLARITY,
//   DIAMOND_SHAPES as SHAPES,
// } from "../../../utils/diamondConstants";

// /* ================= GROUP MAPS ================= */
// const COLOR_GROUPS = {
//   "D-F": ["D", "E", "F"],
//   "G-H": ["G", "H"],
//   "I-J": ["I", "J"],
//   "K-L": ["K", "L"],
//   "M-N": ["M", "N"],
//   "O-P": ["O", "P"],
// };

// const CLARITY_GROUPS = {
//   "VVS-VS": ["VVS1", "VVS2", "VS1", "VS2"],
//   "SI-I": ["SI1", "SI2", "I1", "I2"],
// };

// /* ================= HELPERS ================= */
// const getIndexRange = (value, list, groupMap = {}) => {
//   if (!value) return [-1, -1];

//   // grouped value
//   if (groupMap[value]) {
//     const indexes = groupMap[value].map((v) => list.indexOf(v));
//     return [Math.min(...indexes), Math.max(...indexes)];
//   }

//   // single value
//   const idx = list.indexOf(value);
//   return [idx, idx];
// };

// export default function DiamondRateForm({
//   onSubmit,
//   existingRates = [],
// }) {
//   const [saving, setSaving] = useState(false);

//   const [f, setF] = useState({
//     shape: "",
//     color: "",
//     clarity: "",
//     weightFrom: "",
//     weightTo: "",
//     rateType: "PER_CT",
//     rate: "",
//   });

//   const submit = async () => {
//     const weightFrom = Number(f.weightFrom);
//     const weightTo = Number(f.weightTo);

//     if (!f.shape) return alert("Shape required");

//     if (weightFrom <= 0 || weightTo <= 0 || weightFrom >= weightTo)
//       return alert("Invalid weight slab");

//     if (!f.color) return alert("Color required");
//     if (!f.clarity) return alert("Clarity required");

//     const [colorFromIndex, colorToIndex] = getIndexRange(
//       f.color,
//       COLORS,
//       COLOR_GROUPS
//     );

//     const [clarityFromIndex, clarityToIndex] = getIndexRange(
//       f.clarity,
//       CLARITY,
//       CLARITY_GROUPS
//     );

//     if (colorFromIndex === -1 || clarityFromIndex === -1) {
//       return alert("Invalid color or clarity selection");
//     }

//     if (!f.rate || Number(f.rate) <= 0)
//       return alert("Invalid rate");

//     const payload = {
//       shape: f.shape.trim(),

//       colorFromIndex,
//       colorToIndex,

//       clarityFromIndex,
//       clarityToIndex,

//       weightFrom,
//       weightTo,

//       rateType: f.rateType,
//       rate: Number(f.rate),
//       active: true,
//     };

//     if (existingRates.length && isOverlappingSlab(payload, existingRates)) {
//       return alert("❌ Overlapping slab already exists");
//     }

//     try {
//       setSaving(true);

//       if (typeof onSubmit === "function") {
//         await onSubmit(payload);
//       } else {
//         await createDiamondRate(payload);
//       }

//       alert("✅ Diamond rate saved successfully");

//       setF({
//         shape: "",
//         color: "",
//         clarity: "",
//         weightFrom: "",
//         weightTo: "",
//         rateType: "PER_CT",
//         rate: "",
//       });

//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to save diamond rate");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//       <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">

//         <h2 className="text-xl font-bold text-gray-800">
//           ➕ Add Diamond Rate Slab
//         </h2>

//         {/* Shape */}
//         <div>
//           <label className="label">Shape</label>
//           <select
//             className="input"
//             value={f.shape}
//             onChange={(e) => setF({ ...f, shape: e.target.value })}
//           >
//             <option value="">Select shape</option>
//             {SHAPES.map((s) => (
//               <option key={s} value={s}>
//                 {s}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Color */}
//         <SelectWithGroups
//           label="Color"
//           list={COLORS}
//           groups={COLOR_GROUPS}
//           value={f.color}
//           onChange={(v) => setF({ ...f, color: v })}
//         />

//         {/* Clarity */}
//         <SelectWithGroups
//           label="Clarity"
//           list={CLARITY}
//           groups={CLARITY_GROUPS}
//           value={f.clarity}
//           onChange={(v) => setF({ ...f, clarity: v })}
//         />

//         {/* Weight */}
//         <div className="grid grid-cols-2 gap-4">
//           <Input
//             type="number"
//             label="Weight From (ct)"
//             value={f.weightFrom}
//             onChange={(v) => setF({ ...f, weightFrom: v })}
//           />
//           <Input
//             type="number"
//             label="Weight To (ct)"
//             value={f.weightTo}
//             onChange={(v) => setF({ ...f, weightTo: v })}
//           />
//         </div>

//         {/* Rate Type */}
//         <div>
//           <label className="label">Rate Type</label>
//           <select
//             className="input"
//             value={f.rateType}
//             onChange={(e) => setF({ ...f, rateType: e.target.value })}
//           >
//             <option value="PER_CT">Per Carat</option>
//             <option value="PER_PC">Per Piece</option>
//           </select>
//         </div>

//         {/* Rate */}
//         <Input
//           type="number"
//           label="Rate (₹)"
//           value={f.rate}
//           onChange={(v) => setF({ ...f, rate: v })}
//         />

//         <button
//           disabled={saving}
//           onClick={submit}
//           className={`w-full py-3 rounded-xl font-semibold text-white transition
//             ${saving
//               ? "bg-gray-400"
//               : "bg-blue-600 hover:bg-blue-700 shadow-md"
//             }`}
//         >
//           {saving ? "Saving…" : "Save Diamond Rate"}
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ================= UI HELPERS ================= */

// const Input = ({ label, value, onChange, type = "text" }) => (
//   <div>
//     <label className="label">{label}</label>
//     <input
//       type={type}
//       className="input"
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//     />
//   </div>
// );

// const SelectWithGroups = ({ label, list, groups, value, onChange }) => (
//   <div>
//     <label className="label">{label}</label>
//     <select
//       className="input"
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//     >
//       <option value="">Select {label}</option>

//       {/* GROUP OPTIONS */}
//       {Object.keys(groups).map((g) => (
//         <option key={g} value={g}>
//           {g}
//         </option>
//       ))}

//       {/* INDIVIDUAL */}
//       <optgroup label="Individual">
//         {list.map((v) => (
//           <option key={v} value={v}>
//             {v}
//           </option>
//         ))}
//       </optgroup>
//     </select>
//   </div>
// );




import { useState, useEffect } from "react";
import {
  createDiamondRate,
  getDiamondRates,
  updateDiamondRate,
} from "../../../api/diamondRateApi";
import {
  DIAMOND_COLORS as COLORS,
  DIAMOND_CLARITIES as CLARITY,
  DIAMOND_SHAPES as SHAPES,
} from "../../../utils/diamondConstants";
import { useParams, useNavigate } from "react-router-dom";

/* ================= GROUP MAPS ================= */
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

/* ================= HELPERS ================= */
const getIndexRange = (value, list, groupMap = {}) => {
  if (!value) return [-1, -1];

  if (groupMap[value]) {
    const indexes = groupMap[value].map((v) => list.indexOf(v));
    return [Math.min(...indexes), Math.max(...indexes)];
  }

  const idx = list.indexOf(value);
  return [idx, idx];
};

const getValueFromRange = (from, to, list, groups) => {
  const selected = list.slice(from, to + 1);

  for (let key in groups) {
    const groupVals = groups[key];
    if (
      groupVals.length === selected.length &&
      groupVals.every((v, i) => v === selected[i])
    ) {
      return key;
    }
  }

  return selected[0];
};

export default function DiamondRateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [f, setF] = useState({
    shape: "",
    color: "",
    clarity: "",
    weightFrom: "",
    weightTo: "",
    rateType: "PER_CT",
    rate: "",
  });

  /* ================= LOAD EDIT DATA ================= */
  useEffect(() => {
    if (!isEdit) return;

    const loadRate = async () => {
      try {
        setLoading(true);

        const res = await getDiamondRates();
        const rate = res.data?.rates?.find((r) => r._id === id);

        if (!rate) {
          alert("Diamond rate not found");
          return navigate("/admin/diamond-rates");
        }

        setF({
          shape: rate.shape || "",
          color: getValueFromRange(
            rate.colorFromIndex,
            rate.colorToIndex,
            COLORS,
            COLOR_GROUPS
          ),
          clarity: getValueFromRange(
            rate.clarityFromIndex,
            rate.clarityToIndex,
            CLARITY,
            CLARITY_GROUPS
          ),
          weightFrom: rate.weightFrom,
          weightTo: rate.weightTo,
          rateType: rate.rateType,
          rate: rate.rate,
        });

      } catch (err) {
        alert("Failed to load diamond rate");
      } finally {
        setLoading(false);
      }
    };

    loadRate();
  }, [id, navigate, isEdit]);

  /* ================= SUBMIT ================= */
  const submit = async () => {
    const weightFrom = Number(f.weightFrom);
    const weightTo = Number(f.weightTo);

    if (!f.shape) return alert("Shape required");
    if (weightFrom <= 0 || weightTo <= 0 || weightFrom >= weightTo)
      return alert("Invalid weight slab");

    if (!f.color) return alert("Color required");
    if (!f.clarity) return alert("Clarity required");

    const [colorFromIndex, colorToIndex] = getIndexRange(
      f.color,
      COLORS,
      COLOR_GROUPS
    );

    const [clarityFromIndex, clarityToIndex] = getIndexRange(
      f.clarity,
      CLARITY,
      CLARITY_GROUPS
    );

    if (colorFromIndex === -1 || clarityFromIndex === -1) {
      return alert("Invalid color or clarity selection");
    }

    if (!f.rate || Number(f.rate) <= 0)
      return alert("Invalid rate");

    const payload = {
      shape: f.shape.trim(),
      colorFromIndex,
      colorToIndex,
      clarityFromIndex,
      clarityToIndex,
      weightFrom,
      weightTo,
      rateType: f.rateType,
      rate: Number(f.rate),
      active: true,
    };

    try {
      setSaving(true);

      if (isEdit) {
        await updateDiamondRate(id, payload);
        alert("✅ Diamond rate updated");
      } else {
        await createDiamondRate(payload);
        alert("✅ Diamond rate created");
      }

      navigate("/admin/diamond-rates");

    } catch (err) {
      alert(err.response?.data?.error || "Failed to save diamond rate");
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading diamond rate...
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border p-8 space-y-6">

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {isEdit ? "✏️ Edit Diamond Rate" : "➕ Add Diamond Rate"}
          </h2>

          <button
            onClick={() => navigate("/admin/diamond-rates")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* Shape */}
        <select
          className="input"
          value={f.shape}
          onChange={(e) => setF({ ...f, shape: e.target.value })}
        >
          <option value="">Select shape</option>
          {SHAPES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        {/* Color */}
        <SelectWithGroups
          label="Color"
          list={COLORS}
          groups={COLOR_GROUPS}
          value={f.color}
          onChange={(v) => setF({ ...f, color: v })}
        />

        {/* Clarity */}
        <SelectWithGroups
          label="Clarity"
          list={CLARITY}
          groups={CLARITY_GROUPS}
          value={f.clarity}
          onChange={(v) => setF({ ...f, clarity: v })}
        />

        {/* Weight */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Weight From" value={f.weightFrom}
            onChange={(v) => setF({ ...f, weightFrom: v })} />
          <Input label="Weight To" value={f.weightTo}
            onChange={(v) => setF({ ...f, weightTo: v })} />
        </div>

        {/* Rate Type */}
        <select
          className="input"
          value={f.rateType}
          onChange={(e) => setF({ ...f, rateType: e.target.value })}
        >
          <option value="PER_CT">Per Carat</option>
          <option value="PER_PC">Per Piece</option>
        </select>

        {/* Rate */}
        <Input label="Rate (₹)" value={f.rate}
          onChange={(v) => setF({ ...f, rate: v })} />

        <button
          disabled={saving}
          onClick={submit}
          className={`w-full py-3 rounded-xl text-white ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {saving ? "Saving..." : isEdit ? "Update Rate" : "Save Rate"}
        </button>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

const Input = ({ label, value, onChange }) => (
  <div>
    <label className="text-sm">{label}</label>
    <input
      className="input w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SelectWithGroups = ({ label, list, groups, value, onChange }) => (
  <div>
    <label className="text-sm">{label}</label>
    <select
      className="input w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select {label}</option>

      {Object.keys(groups).map((g) => (
        <option key={g}>{g}</option>
      ))}

      <optgroup label="Individual">
        {list.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </optgroup>
    </select>
  </div>
);