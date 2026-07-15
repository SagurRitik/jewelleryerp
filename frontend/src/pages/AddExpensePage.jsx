


import { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import { ArrowLeft } from "lucide-react";

export default function AddExpensePage() {
  const navigate = useNavigate();

  const { showAlert } = useModal();

  const { id } = useParams();

  const [form, setForm] = useState({
    amount: 0,
    category: "OTHER",
    customCategory: "",
    paymentMode: "CASH",
    partyName: "",
    reference: "",
    notes: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  const safeNumber = (val) => {
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? 0 : num;
  };


  useEffect(() => {
    if (id) {
      API.get(`/expenses/${id}`).then(res => {
        const data = res.data;
        if (data.expenseDate) {
          data.expenseDate = new Date(data.expenseDate).toISOString().split("T")[0];
        }
        setForm(data);
      });
    }
  }, [id]);


  const showReferenceField = form.paymentMode !== "CASH";

  const handleSubmit = async (e) => {
    e.preventDefault();



    const payload = {
      ...form,
      category:
        form.category === "OTHER" && form.customCategory
          ? form.customCategory
          : form.category,

      paymentMode: form.paymentMode,
      reference: form.reference,
      // partyName: form.partyName,
      partyName:
        form.category === "OTHER"
          ? form.customCategory
          : form.partyName,
      notes: form.notes,

      title: form.customCategory || form.category,

      amount: Number(form.amount)
    };

    if (id) {
      await API.put(`/expenses/${id}`, payload);
    } else {
      await API.post(`/expenses`, payload);
    }

    // await API.post("/expenses", payload);

    await showAlert("Expense added");
    navigate("/expenses");
  };

  const showPartyField = ["PURCHASE", "REPAIR", "TRANSPORT"].includes(
    form.category
  );

  return (
    <div className="min-h-screen bg-[#F5F3F0] py-8 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="bg-[#6B2E4A] text-white px-6 py-4 rounded-t-lg flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-semibold">{id ? "Edit Expense" : "Add Expense"}</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 space-y-5 rounded-b-lg shadow-sm"
        >
          {/* Amount */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Amount *
            </label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              value={form.amount === 0 ? "" : form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount: safeNumber(e.target.value),
                })
              }
            />
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Expense Date *
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              value={form.expenseDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  expenseDate: e.target.value,
                })
              }
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Category *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                  customCategory: "",
                  partyName: "",
                })
              }
            >
              <option value="RENT">Rent</option>
              <option value="SALARY">Salary</option>
              <option value="ELECTRICITY">Electricity</option>
              <option value="INTERNET">Internet</option>
              <option value="REPAIR">Repair</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="TRANSPORT">Transport</option>
              <option value="MARKETING">Marketing</option>
              <option value="PURCHASE">Purchase</option>
              <option value="TEA">Food</option>
              <option value="OTHER">Miscellaneous</option>
            </select>
          </div>

          {/* 🔥 Custom Category (ONLY for OTHER) */}
          {form.category === "OTHER" && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Specify Expense Type *
              </label>
              <input
                placeholder="e.g. Office cleaning"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                value={form.customCategory}
                onChange={(e) =>
                  setForm({ ...form, customCategory: e.target.value })
                }
              />
            </div>
          )}

          {/* Payment Mode */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Payment Mode *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
              value={form.paymentMode}
              onChange={(e) =>
                setForm({ ...form, paymentMode: e.target.value, reference: "" })
              }
            >
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          {showReferenceField && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Reference Number *
              </label>
              <input
                placeholder="Txn ID / Cheque No / UTR"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                value={form.reference}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
              />
            </div>
          )}

          {/* 🔥 Party Name (Conditional) */}
          {showPartyField && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Party / Vendor Name
              </label>
              <input
                placeholder="Enter vendor name"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                value={form.partyName}
                onChange={(e) =>
                  setForm({ ...form, partyName: e.target.value })
                }
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Notes
            </label>
            <textarea
              placeholder="Optional details..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              rows={3}
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-[#6B2E4A] hover:bg-[#5A2640] text-white py-2.5 rounded font-medium"
          >
            Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}