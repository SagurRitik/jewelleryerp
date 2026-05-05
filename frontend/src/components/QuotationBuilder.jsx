

import { useState } from "react";
import API from "../api";

export default function QuotationBuilder() {
  const [form, setForm] = useState({
    metalPurity: "18KT",
    metalWeight: "",
    diamondWeight: "",
    makingCharge: "",
  });

  const [quotation, setQuotation] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const generateQuotation = async () => {
    try {
      const res = await API.post("/quotation/manual", {
        ...form,
        metalWeight: Number(form.metalWeight),
        diamondWeight: Number(form.diamondWeight),
        makingCharge: Number(form.makingCharge),
      });

      setQuotation(res.data.quotation);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Jewellery Quotation</h1>

      {/* ================= FORM ================= */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded">

        <input
          name="metalWeight"
          placeholder="Gold Weight (gm)"
          value={form.metalWeight}
          onChange={handleChange}
          className="border p-2"
        />

        <select
          name="metalPurity"
          value={form.metalPurity}
          onChange={handleChange}
          className="border p-2"
        >
          <option value="18KT">18KT</option>
          <option value="14KT">14KT</option>
        </select>

        <input
          name="diamondWeight"
          placeholder="Diamond Weight (ct)"
          value={form.diamondWeight}
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="makingCharge"
          placeholder="Making Charge"
          value={form.makingCharge}
          onChange={handleChange}
          className="border p-2"
        />
      </div>

      <button
        onClick={generateQuotation}
        className="mt-4 bg-black text-white px-6 py-2 rounded"
      >
        Generate Quotation
      </button>

      {/* ================= RESULT ================= */}
      {quotation && <QuotationView data={quotation} />}
    </div>
  );
}