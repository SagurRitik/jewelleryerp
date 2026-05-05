import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Save,
  Calendar,
  User,
  FileText,
  Package,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "react-hot-toast";
import ProductForm from "../../components/ProductForm";
import { Plus, Edit2, Trash2 } from "lucide-react";

const PurchaseEntry = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    supplierId: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    notes: ""
  });
  const [addedProducts, setAddedProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("/api/suppliers?activeOnly=true");
      setSuppliers(res.data);
    } catch (err) {
      toast.error("Failed to fetch suppliers");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) return toast.error("Please select a supplier");
    if (!formData.description) return toast.error("Description is required");
    if (!formData.amount || formData.amount <= 0) return toast.error("Valid amount is required");
    if (addedProducts.length === 0) return toast.error("Please add at least one product");

    setSubmitting(true);

    // Use FormData for file upload
    const data = new FormData();
    data.append("supplierId", formData.supplierId);
    data.append("purchaseDate", formData.purchaseDate);
    data.append("description", formData.description);
    data.append("amount", formData.amount);
    data.append("notes", formData.notes);
    // Multi-Product Handling
    const strippedProducts = addedProducts.map(({ metadata }) => metadata);
    data.append("products", JSON.stringify(strippedProducts));

    addedProducts.forEach((p, pIdx) => {
      if (p.images && p.images.length > 0) {
        p.images.forEach((imgFile) => {
          data.append(`product_${pIdx}_image`, imgFile);
        });
      }
    });

    if (selectedFile) {
      data.append("purchaseSlip", selectedFile);
    }

    try {
      await axios.post("/api/purchases", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Purchase recorded successfully!");

      // Reset form
      setFormData({
        supplierId: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        notes: ""
      });
      setAddedProducts([]);
      removeFile();
    } catch (err) {
      console.error("Purchase Submission Error:", err);
      const backendError = err.response?.data?.error;
      const genericMessage = err.response?.data?.message || "Failed to record purchase";
      toast.error(backendError ? `${genericMessage}: ${backendError}` : genericMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProduct = (metadata, images) => {
    if (editingProductIndex !== null) {
      const newProducts = [...addedProducts];
      newProducts[editingProductIndex] = { metadata, images };
      setAddedProducts(newProducts);
      setEditingProductIndex(null);
    } else {
      setAddedProducts([...addedProducts, { metadata, images }]);
    }
    setIsProductModalOpen(false);

    // Auto-fill description if empty
    if (!formData.description && metadata.title) {
      setFormData(prev => ({ ...prev, description: metadata.title }));
    }
  };

  const removeProduct = (index) => {
    setAddedProducts(addedProducts.filter((_, i) => i !== index));
  };

  const editProduct = (index) => {
    setEditingProductIndex(index);
    setIsProductModalOpen(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Purchase</h1>
        <p className="text-gray-500">Record a simplified purchase entry with slip upload</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-indigo-500" /> Supplier Name
              </label>
              <select
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer hover:bg-gray-100"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.mobile})</option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-indigo-500" /> Billing Date
              </label>
              <input
                type="date"
                required
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 transition-all"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <label className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center">
                  <Package className="w-4 h-4 mr-2 text-indigo-500" /> Included Products
                </label>
                <p className="text-[10px] text-gray-400 font-medium">Add individual stock items included in this purchase</p>
              </div>
              <button
                type="button"
                onClick={() => { setEditingProductIndex(null); setIsProductModalOpen(true); }}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
              >
                <Plus size={14} /> Add Product Item
              </button>
            </div>

            {addedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {addedProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                        {p.images && p.images.length > 0 ? (
                          <img src={URL.createObjectURL(p.images[0])} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-300 w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{p.metadata.title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                          {p.metadata.metalType} {p.metadata.metalPurity} • {p.metadata.netWeight}g
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => editProduct(idx)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(idx)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400">
                <Package size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">No products added yet</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Products added here update inventory</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-500" /> Overall Summary / Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bulk gold purchase for March"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="w-4 h-4 mr-2 text-indigo-500 font-bold">₹</span> Total Product Amount
              </label>
              <input
                type="number"
                required
                placeholder="Enter final bill amount"
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-xl font-bold text-gray-800"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Package className="w-4 h-4 mr-2 text-indigo-500" /> Additional Notes
              </label>
              <input
                type="text"
                placeholder="Optional remarks..."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none hover:bg-gray-100 transition-all"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Upload className="w-4 h-4 mr-2 text-indigo-500" /> Purchase Slip / Bill Image
            </label>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group"
              >
                <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" />
                </div>
                <p className="text-gray-500 font-medium">Click to upload bill or slip</p>
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-gray-50 p-2 group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          disabled={submitting}
          type="submit"
          className={`w-full py-5 rounded-3xl font-bold text-lg flex items-center justify-center transition-all shadow-xl active:scale-95 ${submitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
            }`}
        >
          <Save className="w-6 h-6 mr-3" /> {submitting ? "Saving Entry..." : "Confirm & Record Purchase"}
        </button>
      </form>
      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl relative flex flex-col">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <ProductForm
                standalone={false}
                existingProduct={editingProductIndex !== null ? addedProducts[editingProductIndex].metadata : null}
                onSubmit={handleAddProduct}
                onCancel={() => setIsProductModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseEntry;
