import { useState } from "react";
import API from "../api";

/* ================= VIEW ================= */
function QuotationView({ data }) {
  return (
    <div className="mt-10 bg-white p-8 border">

      <h1 className="text-2xl font-bold mb-4">
        Quotation for {data.specifications.metalPurity} Diamond Jewellery
      </h1>

      <p className="mb-4">
        <b>Client Name:</b> {data.customerName}
      </p>

      {/* ================= PRODUCT SPEC ================= */}
      <h2 className="font-bold mb-2">Product Specifications:</h2>

      <table className="w-full border mb-6">
        <tbody>
          <tr>
            <td className="border p-2">Gold Purity</td>
            <td className="border p-2">{data.specifications.metalPurity}</td>
          </tr>
          <tr>
            <td className="border p-2">Gold Weight</td>
            <td className="border p-2">{data.specifications.netWeight} gm</td>
          </tr>
          <tr>
            <td className="border p-2">Diamond Type</td>
            <td className="border p-2">{data.specifications.diamondType}</td>
          </tr>
          <tr>
            <td className="border p-2">Number of Diamonds</td>
            <td className="border p-2">{data.specifications.diamondCount}</td>
          </tr>
        </tbody>
      </table>

      {/* ================= COST ================= */}
      <h2 className="font-bold mb-2">Cost Breakdown:</h2>

      <table className="w-full border">
        <tbody>
          <tr>
            <td className="border p-2">
              Gold Value ({data.breakdown.gold.weight} gm × {data.breakdown.gold.rate})
            </td>
            <td className="border p-2">₹{data.breakdown.gold.value}</td>
          </tr>

          <tr>
            <td className="border p-2">Diamond Value</td>
            <td className="border p-2">₹{data.breakdown.diamond}</td>
          </tr>

          <tr>
            <td className="border p-2">Making Charges</td>
            <td className="border p-2">₹{data.breakdown.making}</td>
          </tr>

          <tr>
            <td className="border p-2">Design Charges</td>
            <td className="border p-2">₹{data.designCharges || 0}</td>
          </tr>

          <tr className="font-bold">
            <td className="border p-2">Total Amount</td>
            <td className="border p-2">₹{data.totals.total}</td>
          </tr>
        </tbody>
      </table>

      {/* ================= NOTES ================= */}
      <div className="mt-6 text-sm">
        <p><b>Important Notes:</b></p>
        <ol className="list-decimal ml-5">
          <li>Gold rate is volatile.</li>
          <li>IGI charges not included.</li>
          <li>GST extra.</li>
        </ol>
      </div>
    </div>
  );
}

/* ================= MAIN FORM ================= */
export default function QuotationBuilder() {
  const [form, setForm] = useState({
    customerName: "",
    metalPurity: "14KT",
    metalWeight: "",
    diamondWeight: "",
    diamondType: "",
    diamondCount: "",
    makingCharge: "",
    designCharges: "",
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
        diamondCount: Number(form.diamondCount),
        makingCharge: Number(form.makingCharge),
        designCharges: Number(form.designCharges),
      });

      setQuotation({
        ...res.data.quotation,
        customerName: form.customerName,
        designCharges: Number(form.designCharges),
        specifications: {
          ...res.data.quotation.specifications,
          diamondType: form.diamondType,
          diamondCount: form.diamondCount,
        },
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Jewellery Quotation Form
      </h1>

      {/* ================= FORM ================= */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded">

        <input
          name="customerName"
          placeholder="Client Name"
          onChange={handleChange}
          className="border p-2"
        />

        <select
          name="metalPurity"
          onChange={handleChange}
          className="border p-2"
        >
          <option value="14KT">14KT</option>
          <option value="18KT">18KT</option>
        </select>

        <input
          name="metalWeight"
          placeholder="Gold Weight (gm)"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="diamondWeight"
          placeholder="Diamond Weight (ct)"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="diamondType"
          placeholder="Diamond Type (CVD / VVS)"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="diamondCount"
          placeholder="Number of Diamonds"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="makingCharge"
          placeholder="Making Charges"
          onChange={handleChange}
          className="border p-2"
        />

        <input
          name="designCharges"
          placeholder="Design Charges"
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

      {/* RESULT */}
      {quotation && <QuotationView data={quotation} />}
    </div>
  );
}