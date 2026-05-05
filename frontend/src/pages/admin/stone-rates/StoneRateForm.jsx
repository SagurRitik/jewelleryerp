

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createStoneRate,
  updateStoneRate,
  getStoneRates,
} from "../../../api/stoneRateApi";

/* ================= MASTER OPTIONS ================= */

// const STONE_TYPES = [
//   "Gemstone",
//   "Ruby",
//   "Coral",
//   "Pearl",
//  "Emerald",
//   "Yellow Sapphire",
//   "Cat's Eye",
//   "Blue Sapphire",
//   "Hessonite Garnet"
// ];

const STONE_TYPES = [
  { label: "Gemstone", value: "gemstone" },
  { label: "Ruby", value: "ruby" },
  { label: "Coral", value: "coral" },
  { label: "Pearl", value: "pearl" },
  { label: "Emerald", value: "emerald" },
  { label: "Yellow Sapphire", value: "yellow-sapphire" },
  { label: "Cat's Eye", value: "cats-eye" },
  { label: "Blue Sapphire", value: "blue-sapphire" },
  { label: "Hessonite Garnet", value: "hessonite" }
];

const SHAPES = [
  "Round",
  "Oval",
  "Princess",
  "Cushion",
  "Emerald",
  "Pear",
  "Marquise",
];

/* ================= COMPONENT ================= */

export default function StoneRateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const [f, setF] = useState({
    stoneType: "",
    shape: "",
    weightFrom: "",
    weightTo: "",
    rateType: "PER_PC",
    rate: "",
    active: true,
  });

  /* ================= LOAD FOR EDIT ================= */

  useEffect(() => {
    if (!isEdit) return;

    const loadRate = async () => {
      try {
        setInitialLoading(true);

        const res = await getStoneRates();
        const rate = res.data?.rates?.find((r) => r._id === id);

        if (!rate) {
          alert("Stone rate not found");
          navigate("/admin/stone-rates");
          return;
        }

        setF({
          stoneType: rate.stoneType || "",
          shape: rate.shape || "",
          weightFrom: rate.weightFrom,
          weightTo: rate.weightTo,
          rateType: rate.rateType,
          rate: rate.rate,
          active: rate.active,
        });
      } catch (err) {
        alert("Failed to load stone rate");
      } finally {
        setInitialLoading(false);
      }
    };

    loadRate();
  }, [id, isEdit, navigate]);

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!f.stoneType) return alert("Please select stone type");

    const payload = {
      stoneType: f.stoneType,
      shape: f.shape || undefined,
      weightFrom: Number(f.weightFrom),
      weightTo: Number(f.weightTo),
      rateType: f.rateType,
      rate: Number(f.rate),
      active: f.active,
    };

    if (payload.weightFrom <= 0 || payload.weightTo <= 0)
      return alert("Weight must be greater than 0");

    if (payload.weightFrom >= payload.weightTo)
      return alert("Invalid weight slab");

    if (payload.rate <= 0)
      return alert("Invalid rate");

    try {
      setLoading(true);

      if (isEdit) {
        await updateStoneRate(id, payload);
        alert("✅ Stone rate updated");
      } else {
        await createStoneRate(payload);
        alert("✅ Stone rate created");
      }

      navigate("/admin/stone-rates");
    } catch (err) {
      alert(err.response?.data?.error || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading stone rate...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            🪨 {isEdit ? "Edit Stone Rate" : "Add Stone Rate"}
          </h1>

          <button
            onClick={() => navigate("/admin/stone-rates")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>
        </div>

        {/* STONE TYPE */}

        
        {/* <Select
          label="Stone Type"
          value={f.stoneType}
          onChange={(v) => setF({ ...f, stoneType: v })}
          options={[
            { value: "", label: "Select Stone Type" },
            ...STONE_TYPES.map((s) => ({
              value: s,
              label: s,
            })),
          ]}
        /> */}

        <Select
  label="Stone Type"
  value={f.stoneType}
  onChange={(v) => setF({ ...f, stoneType: v })}
  options={[
    { value: "", label: "Select Stone Type" },
    ...STONE_TYPES, // ✅ FIXED
  ]}
/>

        {/* SHAPE */}
        <Select
          label="Shape (Optional)"
          value={f.shape}
          onChange={(v) => setF({ ...f, shape: v })}
          options={[
            { value: "", label: "All Shapes" },
            ...SHAPES.map((s) => ({
              value: s,
              label: s,
            })),
          ]}
        />

        {/* WEIGHT */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Weight From (ct)"
            type="number"
            value={f.weightFrom}
            onChange={(v) => setF({ ...f, weightFrom: v })}
          />
          <Input
            label="Weight To (ct)"
            type="number"
            value={f.weightTo}
            onChange={(v) => setF({ ...f, weightTo: v })}
          />
        </div>

        {/* RATE TYPE */}
        <Select
          label="Rate Type"
          value={f.rateType}
          onChange={(v) => setF({ ...f, rateType: v })}
          options={[
            { value: "PER_CT", label: "Per Carat" },
            { value: "PER_PC", label: "Per Piece" },
          ]}
        />

        {/* RATE */}
        <Input
          label="Rate (₹)"
          type="number"
          value={f.rate}
          onChange={(v) => setF({ ...f, rate: v })}
        />

        {/* BUTTONS */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={submit}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-semibold text-white transition
              ${
                loading
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md"
              }`}
          >
            {loading
              ? "Saving…"
              : isEdit
              ? "Update Rate"
              : "Save Rate"}
          </button>

          <button
            onClick={() => navigate("/admin/stone-rates")}
            className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

const Input = ({ label, value, onChange, type="text", ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input
      {...props}
      type={type}
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="label">{label}</label>
    <select
      className="input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);