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
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Search,
  CheckSquare,
  Square,
  Layers,
  Check,
  Camera,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCw
} from "lucide-react";
import Webcam from "react-webcam";
import { toast } from "react-hot-toast";
import ProductForm from "../../components/ProductForm";
import { getImageUrl } from "../../utils/getImageUrl";

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

  const [isScanning, setIsScanning] = useState(false);
  const aiFileInputRef = useRef(null);

  const handleAiScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const formDataPayload = new FormData();
    formDataPayload.append("bill", file);

    try {
      const response = await axios.post("/api/ai/parse-bill", formDataPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success) {
        const data = response.data.data;

        // Populate basic form data
        setFormData((prev) => ({
          ...prev,
          purchaseDate: data.date || prev.purchaseDate,
          description: data.partyDetails?.name ? `AI Purchase from ${data.partyDetails.name}` : prev.description,
          amount: data.pricing?.totalAmount || prev.amount,
          notes: `Invoice No: ${data.invoiceNo || "N/A"}. Automatically scanned by AI.`
        }));

        // Attempt to match supplier by name or GSTIN
        if (data.partyDetails?.name) {
          const matched = suppliers.find(s =>
            s.name.toLowerCase().includes(data.partyDetails.name.toLowerCase()) ||
            (data.partyDetails.gstin && s.gstin && s.gstin.toLowerCase() === data.partyDetails.gstin.toLowerCase())
          );
          if (matched) {
            setFormData(prev => ({ ...prev, supplierId: matched._id }));
            toast.success(`Matched supplier: ${matched.name}`);
          } else {
            toast.error(`Supplier "${data.partyDetails.name}" not found. Select manually.`);
          }
        }

        // Map items to products list
        if (data.items && data.items.length > 0) {
          const items = data.items.map((item) => ({
            metadata: {
              title: item.description || "Jewellery Item",
              sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              metalType: item.metalType || "Gold",
              metalPurity: item.purity || "18KT",
              metalWeight: item.netWeight || item.grossWeight || 0,
              grossWeight: item.grossWeight || 0,
              purchasePrice: item.rate || 0,
              stock: 1,
            },
            images: []
          }));
          setAddedProducts(items);
          toast.success(`Extracted and added ${items.length} items to products!`);
        }
      } else {
        toast.error("Failed to parse invoice using AI.");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to scan.";
      toast.error(`AI Scan Error: ${errorMsg}`);
    } finally {
      setIsScanning(false);
      if (aiFileInputRef.current) aiFileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (location.state?.parsedPurchase && suppliers.length > 0) {
      const data = location.state.parsedPurchase;

      setFormData((prev) => ({
        ...prev,
        purchaseDate: data.date || prev.purchaseDate,
        description: data.partyDetails?.name ? `AI Purchase from ${data.partyDetails.name}` : prev.description,
        amount: data.pricing?.totalAmount || prev.amount,
        notes: `Invoice No: ${data.invoiceNo || "N/A"}. Automatically scanned by AI.`
      }));

      // Match supplier
      if (data.partyDetails?.name) {
        const matched = suppliers.find(s =>
          s.name.toLowerCase().includes(data.partyDetails.name.toLowerCase()) ||
          (data.partyDetails.gstin && s.gstin && s.gstin.toLowerCase() === data.partyDetails.gstin.toLowerCase())
        );
        if (matched) {
          setFormData(prev => ({ ...prev, supplierId: matched._id }));
          toast.success(`Matched supplier: ${matched.name}`);
        } else {
          toast.error(`Supplier "${data.partyDetails.name}" not found. Select manually.`);
        }
      }

      // Map items
      if (data.items && data.items.length > 0) {
        const items = data.items.map((item) => ({
          metadata: {
            title: item.description || "Jewellery Item",
            sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            metalType: item.metalType || "Gold",
            metalPurity: item.purity || "18KT",
            metalWeight: item.netWeight || item.grossWeight || 0,
            grossWeight: item.grossWeight || 0,
            purchasePrice: item.rate || 0,
            stock: 1,
          },
          images: []
        }));
        setAddedProducts(items);
        toast.success(`Extracted and added ${items.length} items to products!`);
      }
    }
  }, [location.state, suppliers]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  const [isSelectInventoryModalOpen, setIsSelectInventoryModalOpen] = useState(false);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState(new Set());

  // Multiple bill/slip images states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [previewModalIndex, setPreviewModalIndex] = useState(null);
  const webcamRef = useRef(null);

  const fetchInventoryProducts = async (query = "") => {
    setInventoryLoading(true);
    try {
      const url = query
        ? `/api/products?search=${encodeURIComponent(query)}&limit=30`
        : `/api/products?limit=30`;
      const res = await axios.get(url);
      setInventoryProducts(res.data?.products || []);
    } catch (err) {
      console.error("Failed to fetch inventory products:", err);
      toast.error("Failed to load inventory products");
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    if (!isSelectInventoryModalOpen) return;
    const timer = setTimeout(() => {
      fetchInventoryProducts(inventorySearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [inventorySearch, isSelectInventoryModalOpen]);

  const toggleSelectInventoryItem = (id) => {
    setSelectedInventoryIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllInventory = () => {
    if (selectedInventoryIds.size === inventoryProducts.length) {
      setSelectedInventoryIds(new Set());
    } else {
      setSelectedInventoryIds(new Set(inventoryProducts.map(p => p._id)));
    }
  };

  const handleAddSelectedInventory = () => {
    if (selectedInventoryIds.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    const toAdd = inventoryProducts
      .filter(p => selectedInventoryIds.has(p._id))
      .map(p => ({
        isExisting: true,
        metadata: {
          _id: p._id,
          productId: p._id,
          isExisting: true,
          title: p.title,
          sku: p.sku,
          jewelleryCategory: p.jewelleryCategory,
          productType: p.productType || "",
          metalType: p.metalType,
          metalPurity: p.metalPurity,
          netWeight: p.netWeight,
          grossWeight: p.grossWeight,
          fineGold: p.fineGold || 0,
          stock: p.stock || 1,
          purchaseCost: p.purchaseCost || "",
          images: p.images || [],
          components: p.components || [],
          certificates: p.certificates || []
        },
        images: []
      }));

    setAddedProducts(prev => [...prev, ...toAdd]);
    setSelectedInventoryIds(new Set());
    setIsSelectInventoryModalOpen(false);
    toast.success(`Linked ${toAdd.length} existing inventory product(s) to purchase`);
  };

  const updateProductCost = (index, cost) => {
    setAddedProducts(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        metadata: {
          ...updated[index].metadata,
          purchaseCost: cost === "" ? "" : Number(cost)
        }
      };
      return updated;
    });
  };

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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    const validPreviews = [];

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10MB limit`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...validPreviews]);
      toast.success(`Added ${validFiles.length} bill image(s)`);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCaptureCamera = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Could not capture image from camera");
      return;
    }

    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], `bill_camera_${Date.now()}.jpg`, { type: "image/jpeg" });

      setSelectedFiles((prev) => [...prev, file]);
      setPreviewUrls((prev) => [...prev, imageSrc]);
      toast.success("Bill photo captured!");
      setShowCamera(false);
    } catch (err) {
      console.error("Camera capture error:", err);
      toast.error("Failed to process captured photo");
    }
  };

  const removeFileAt = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      try { URL.revokeObjectURL(prev[index]); } catch (e) {}
      return prev.filter((_, i) => i !== index);
    });
    if (previewModalIndex === index) {
      setPreviewModalIndex(null);
    } else if (previewModalIndex !== null && previewModalIndex > index) {
      setPreviewModalIndex(previewModalIndex - 1);
    }
  };

  const removeAllFiles = () => {
    selectedFiles.forEach((_, i) => {
      try { URL.revokeObjectURL(previewUrls[i]); } catch (e) {}
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setPreviewModalIndex(null);
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

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        data.append("purchaseSlips", file);
      });
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
      removeAllFiles();
    } catch (err) {
      console.error("Purchase Submission Error:", err);
      const backendError = err.response?.data?.error;
      const genericMessage = err.response?.data?.message || "Failed to record purchase";
      toast.error(backendError ? `${genericMessage}: ${backendError}` : genericMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProduct = (metadata, images, billFiles) => {
    if (editingProductIndex !== null) {
      const newProducts = [...addedProducts];
      newProducts[editingProductIndex] = { metadata, images };
      setAddedProducts(newProducts);
      setEditingProductIndex(null);
    } else {
      setAddedProducts([...addedProducts, { metadata, images }]);
    }

    // If bill files were captured/uploaded in ProductForm, also attach them to this purchase!
    if (billFiles && billFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...billFiles]);
      setPreviewUrls(prev => [...prev, ...billFiles.map(f => URL.createObjectURL(f))]);
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
          {/* Products Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
              <div>
                <label className="text-sm font-bold text-gray-800 uppercase tracking-tight flex items-center">
                  <Package className="w-4 h-4 mr-2 text-indigo-500" /> Included Products
                </label>
                <p className="text-[10px] text-gray-400 font-medium">Add new product items or link existing inventory to this purchase</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsSelectInventoryModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Layers size={14} className="text-amber-600" /> Link Existing Inventory
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingProductIndex(null); setIsProductModalOpen(true); }}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-1.5"
                >
                  <Plus size={14} /> + Add New Product
                </button>
              </div>
            </div>

            {addedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {addedProducts.map((p, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {p.images && p.images.length > 0 ? (
                          <img src={URL.createObjectURL(p.images[0])} alt="preview" className="w-full h-full object-cover" />
                        ) : p.metadata?.images && p.metadata.images.length > 0 ? (
                          <img src={getImageUrl(p.metadata.images[0])} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-300 w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-gray-800 text-sm truncate">{p.metadata.title}</h4>
                          {p.isExisting || p.metadata?.isExisting ? (
                            <span className="text-[10px] bg-amber-100/80 text-amber-800 border border-amber-300/80 px-2 py-0.5 rounded-full font-bold">
                              Existing SKU: {p.metadata.sku}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100/80 text-emerald-800 border border-emerald-300/80 px-2 py-0.5 rounded-full font-bold">
                              New Product
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight mt-0.5">
                          {p.metadata.metalType} {p.metadata.metalPurity} • Net: {p.metadata.netWeight}g
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {/* Purchase Cost Input */}
                      <div className="flex items-center bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 shadow-sm">
                        <span className="text-xs text-gray-400 font-bold mr-1">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Cost"
                          value={p.metadata?.purchaseCost ?? ""}
                          onChange={(e) => updateProductCost(idx, e.target.value)}
                          className="w-24 text-xs font-bold text-gray-800 outline-none bg-transparent"
                          title="Purchase Cost for this product"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => editProduct(idx)}
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-100"
                          title="Edit product details"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeProduct(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
                          title="Remove from purchase"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400">
                <Package size={32} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">No products added yet</p>
                <p className="text-[10px] uppercase tracking-widest mt-1">Add new products or link existing inventory</p>
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <span className="w-4 h-4 mr-2 text-indigo-500 font-bold">₹</span> Total Product Amount
                </label>
                {addedProducts.reduce((sum, p) => sum + (Number(p.metadata?.purchaseCost) || 0), 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const total = addedProducts.reduce((sum, p) => sum + (Number(p.metadata?.purchaseCost) || 0), 0);
                      setFormData(prev => ({ ...prev, amount: total }));
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                  >
                    Set to sum: ₹{addedProducts.reduce((sum, p) => sum + (Number(p.metadata?.purchaseCost) || 0), 0).toLocaleString()}
                  </button>
                )}
              </div>
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
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Upload className="w-4 h-4 mr-2 text-indigo-500" /> Purchase Bills / Slips
                {previewUrls.length > 0 && (
                  <span className="ml-2.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {previewUrls.length} attached
                  </span>
                )}
              </label>
              {previewUrls.length > 0 && (
                <button
                  type="button"
                  onClick={removeAllFiles}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove All
                </button>
              )}
            </div>

            {/* Action Buttons: Camera + Gallery */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex items-center justify-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 rounded-2xl font-semibold text-xs transition-all shadow-sm active:scale-98"
              >
                <Camera size={16} />
                <span>Camera (Take Photo)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-2xl font-semibold text-xs transition-all shadow-sm active:scale-98"
              >
                <Upload size={16} />
                <span>Upload from Gallery</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            {/* Previews Grid */}
            {previewUrls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all"
                  >
                    <img
                      src={url}
                      alt={`Bill ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreviewModalIndex(idx)}
                    />
                    
                    {/* Badge */}
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                      #{idx + 1}
                    </div>

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalIndex(idx)}
                        className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow hover:scale-110 transition-transform"
                        title="Preview Full Image"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFileAt(idx);
                        }}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow hover:scale-110 transition-transform"
                        title="Remove this bill"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Quick Add Card */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all"
                >
                  <Plus size={20} className="mb-1" />
                  <span className="text-[11px] font-semibold">Add More</span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/60 hover:bg-gray-50 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-105 transition-transform text-gray-400 group-hover:text-indigo-600">
                  <ImageIcon size={22} />
                </div>
                <p className="text-xs font-semibold text-gray-600">No bills or slips attached</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Use Camera or Gallery buttons above to upload multiple images</p>
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

      {/* Select Inventory Modal */}
      {isSelectInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[32px] shadow-2xl relative flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Link Existing Inventory</h3>
                  <p className="text-xs text-gray-500">Select products already in your catalog to record purchase cost & link bill</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectInventoryModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white/80 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by SKU, Product Name, Category..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              {inventoryProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllInventory}
                  className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  {selectedInventoryIds.size === inventoryProducts.length ? (
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  {selectedInventoryIds.size === inventoryProducts.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {/* Products List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
              {inventoryLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
                  <p className="text-sm font-medium">Searching inventory...</p>
                </div>
              ) : inventoryProducts.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No products found matching your search</p>
                </div>
              ) : (
                inventoryProducts.map((prod) => {
                  const isSelected = selectedInventoryIds.has(prod._id);
                  const isAlreadyAdded = addedProducts.some(p => p.metadata?._id === prod._id);

                  return (
                    <div
                      key={prod._id}
                      onClick={() => !isAlreadyAdded && toggleSelectInventoryItem(prod._id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isAlreadyAdded
                          ? "bg-gray-100/80 border-gray-200 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "bg-amber-50/70 border-amber-300 shadow-sm"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className={`w-5 h-5 rounded-md border ${isAlreadyAdded ? "border-gray-300 bg-gray-200" : "border-gray-300"}`} />
                          )}
                        </div>

                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center">
                          {prod.images && prod.images.length > 0 ? (
                            <img
                              src={getImageUrl(prod.images[0])}
                              alt={prod.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-gray-300 w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm truncate">{prod.title}</span>
                            <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {prod.sku}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            {prod.metalType} {prod.metalPurity} • Net: {prod.netWeight}g • Stock: {prod.stock ?? 0}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-3">
                        {isAlreadyAdded ? (
                          <span className="text-[11px] font-semibold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">
                            Already In List
                          </span>
                        ) : prod.purchaseCost ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                            Cost: ₹{prod.purchaseCost}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-gray-400">
                            No Cost Set
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                {selectedInventoryIds.size} item(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSelectInventoryModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedInventoryIds.size === 0}
                  onClick={handleAddSelectedInventory}
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-200 flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Selected to Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📷 Live Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-6 py-4 text-white border-b border-white/10">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold">Capture Purchase Bill / Slip</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCameraFacing(prev => prev === "environment" ? "user" : "environment")}
                className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition text-white"
              >
                <RotateCw size={13} /> Switch Camera
              </button>
              <button
                type="button"
                onClick={() => setShowCamera(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg aspect-[3/4] max-h-[70vh] rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/20">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: cameraFacing }}
                className="w-full h-full object-cover"
              />
              {/* Document Alignment Frame */}
              <div className="absolute inset-6 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-white/60 text-xs bg-black/40 px-3 py-1 rounded-full font-medium">
                  Align bill inside frame
                </span>
              </div>
            </div>
          </div>

          <div className="pb-8 pt-3 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setShowCamera(false)}
              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCaptureCamera}
              className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all border-4 border-white"
              title="Capture Photo"
            >
              <Camera size={26} />
            </button>
          </div>
        </div>
      )}

      {/* 🖼️ Fullscreen Bill Preview Lightbox Modal */}
      {previewModalIndex !== null && previewUrls[previewModalIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-6 py-4 text-white border-b border-white/10">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold">
                Bill Image {previewModalIndex + 1} of {previewUrls.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => removeFileAt(previewModalIndex)}
                className="flex items-center gap-1 text-xs bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 rounded-full transition"
              >
                <Trash2 size={13} /> Remove
              </button>
              <button
                type="button"
                onClick={() => setPreviewModalIndex(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
            <img
              src={previewUrls[previewModalIndex]}
              alt={`Bill Preview ${previewModalIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {/* Prev / Next buttons */}
            {previewUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setPreviewModalIndex(prev => (prev > 0 ? prev - 1 : previewUrls.length - 1))}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition hover:scale-110"
                  title="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalIndex(prev => (prev < previewUrls.length - 1 ? prev + 1 : 0))}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition hover:scale-110"
                  title="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseEntry;
