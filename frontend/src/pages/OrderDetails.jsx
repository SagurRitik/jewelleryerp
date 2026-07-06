



import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getOrderById,
  updateOrderStatusById,
  cancelOrderById,
  deleteOrderById,
  getOrdersByGroupOrderNo,
} from "../api/orderApi";
import StatusBadge from "../components/StatusBadge";
import { useCart } from "../context/CartContext";
import API from "../api";
import {
  ArrowLeft, User, Coins, Diamond, Sparkles, CreditCard,
  FileText, Printer, Calculator, Play, CheckCircle,
  XCircle, ShoppingCart, Eye, ChevronDown, Layers,
  Maximize2, Clock, Calendar, Lock, Tag, Edit, Package,
  Scale, Gem, Settings, AlertTriangle, Zap, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../utils/getImageUrl";

// --- REUSABLE COMPONENTS ---

const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-stone-200/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 px-4 hover:bg-[#F5F1EB]/50 transition-colors group select-none"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-md transition-all duration-200 ${isOpen
            ? 'bg-[#A0826D] text-white'
            : 'bg-[#F5F1EB] text-[#8B7355] group-hover:bg-[#E8DFD6]'
            }`}>
            <Icon size={16} strokeWidth={1.5} />
          </div>
          <h3 className="font-serif text-base text-[#2D2D2D] font-medium tracking-tight">{title}</h3>
        </div>
        <div className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#A0826D]' : ''}`}>
          <ChevronDown size={16} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-6 pt-1 px-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DataRow = ({ label, value, subValue, isPremium = false }) => (
  <div className="flex justify-between items-center py-3 border-b border-dashed border-stone-200/60 last:border-0 hover:bg-[#F5F1EB]/30 px-2 transition-colors group">
    <span className="text-[#8B7355] text-[10px] font-semibold tracking-widest uppercase">{label}</span>
    <div className="text-right">
      <span className={`block ${isPremium ? 'text-[#2D2D2D] font-serif text-base font-medium' : 'text-[#2D2D2D] text-sm font-medium'}`}>
        {value || "—"}
      </span>
      {subValue && <span className="text-[10px] text-stone-400">{subValue}</span>}
    </div>
  </div>
);

const ComponentBadge = ({ component, index }) => (
  <div className="flex items-center justify-between p-4 bg-white border border-stone-200/60 hover:border-[#A0826D]/30 transition-all">

    {/* LEFT SIDE */}
    <div className="flex items-center gap-4">
      <span className="text-stone-300 font-serif text-lg italic font-light">
        0{index + 1}
      </span>

      <div>
        <p className="font-semibold text-[#2D2D2D] capitalize text-sm flex items-center gap-2">
          {component.type}

          {component.componentRole && (
            <span className="px-2 py-0.5 bg-[#A0826D] text-white text-[9px] uppercase tracking-wider font-semibold">
              {component.componentRole}
            </span>
          )}
        </p>

        <div className="flex items-center gap-2 mt-1">
          {component.shape && (
            <span className="text-[10px] text-[#8B7355] px-2 py-0.5 bg-[#F5F1EB] font-medium">
              {component.shape}
            </span>
          )}

          {component.clarity && (
            <span className="text-[10px] text-[#8B7355] px-2 py-0.5 bg-[#F5F1EB] font-medium">
              {component.clarity}
            </span>
          )}

          {component.color && (
            <span className="text-[10px] text-[#8B7355] px-2 py-0.5 bg-[#F5F1EB] font-medium">
              {component.color}
            </span>
          )}
        </div>
      </div>
    </div>

    {/* RIGHT SIDE DATA */}
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right text-xs">

      {component.size > 0 && (
        <div>
          <p className="text-stone-400 text-[9px] uppercase">Size</p>
          <p className="font-semibold">{component.size}</p>
        </div>
      )}

      {component.grossWeight > 0 && (
        <div>
          <p className="text-stone-400 text-[9px] uppercase">Total (Ct)</p>
          <p className="font-semibold">{component.grossWeight} ct</p>
        </div>
      )}

      <div>
        <p className="text-stone-400 text-[9px] uppercase">per piece (ct)</p>
        <p className="font-semibold">{component.weight.toFixed(3)} ct</p>
      </div>

      <div>
        <p className="text-stone-400 text-[9px] uppercase">Count</p>
        <p className="font-semibold">{component.count} pcs</p>
      </div>

    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessionId, addCustomOrder } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isStartingProduction, setIsStartingProduction] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [isSendingToSupplier, setIsSendingToSupplier] = useState(false);
  const [groupOrders, setGroupOrders] = useState([]);

  /* ================= FETCH ================= */
  useEffect(() => {
    setLoading(true);
    getOrderById(id)
      .then((res) => {
        if (res.data?.success) {
          const fetchedOrder = res.data.order;
          setOrder(fetchedOrder);
          
          if (fetchedOrder.groupOrderNo) {
            getOrdersByGroupOrderNo(fetchedOrder.groupOrderNo)
              .then((groupRes) => {
                if (groupRes.data?.success) {
                  setGroupOrders(groupRes.data.orders || []);
                }
              })
              .catch((err) => console.error("Failed to load group orders:", err));
          }
        }
        else setError("Order not found");
      })
      .catch(() => setError("Failed to fetch order"))
      .finally(() => setLoading(false));

    // Fetch Suppliers
    const fetchSuppliersData = async () => {
      try {
        const res = await API.get("/suppliers");
        console.log("Suppliers Data Received:", res.data);

        if (Array.isArray(res.data)) {
          setSuppliers(res.data);
        } else if (res.data?.success) {
          setSuppliers(res.data.suppliers || []);
        } else if (res.data?.data && Array.isArray(res.data.data)) {
          setSuppliers(res.data.data);
        }
      } catch (err) {
        console.error("Supplier fetch failed", err);
      }
    };

    fetchSuppliersData();
  }, [id]);

  /* ================= HANDLERS ================= */
  const handleAddOrderToCart = async () => {
    try {
      await addCustomOrder({
        sessionId,
        orderId: order._id,
      });
      navigate("/cart");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to add order to cart. Please make sure the order is 'Ready' for billing.";
      alert(errorMessage);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await cancelOrderById(order._id, "Cancelled by user via dashboard");
      if (response && (response.data?.success || response.success)) {
        setOrder((prev) => ({ ...prev, status: "Cancelled" }));
      } else {
        setOrder((prev) => ({ ...prev, status: "Cancelled" }));
      }
    } catch (err) {
      console.error("Cancel Error:", err);
      alert("Failed to cancel order.");
    } finally {
      setIsCancelling(false);
    }
  };

  /* ================= START PRODUCTION ================= */
  const handleStartProduction = async () => {
    const hasMetalInfo = !!order?.metalSnapshot?.ratePerGram || !!order?.metalPayment?.totalValue;

    if (!hasMetalInfo) {
      alert("Cannot start production: Metal information is required. Please add metal details first.");
      navigate(`/orders/${order._id}/edit`);
      return;
    }

    setIsStartingProduction(true);
    try {
      const response = await updateOrderStatusById(order._id, "In-Process");
      if (response.data?.success) {
        setOrder({ ...order, status: "In-Process" });
      }
    } catch (err) {
      console.error("Error starting production:", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to start production. Please check if metal information is complete.");
      }
    } finally {
      setIsStartingProduction(false);
    }
  };

  /* ================= MARK AS COMPLETE ================= */
  const handleMarkComplete = () => {
    navigate(`/orders/${order._id}/complete`);
  };

  /* ================= EDIT ORDER ================= */
  const handleEditOrder = () => {
    navigate(`/orders/${order._id}/edit`);
  };

  const handleDeleteOrder = async () => {
    if (!window.confirm(`Are you sure you want to delete order ${order.orderNo}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteOrderById(order._id);
      alert("Order deleted successfully");
      navigate("/orders");
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.response?.data?.message || "Failed to delete order.");
    }
  };

  /* ================= MARK AS DELIVERED ================= */
  const handleMarkDelivered = async () => {
    if (!window.confirm("Mark this order as Delivered? This should only be done after creating the invoice.")) {
      return;
    }

    try {
      const response = await updateOrderStatusById(order._id, "Delivered");
      const fresh = await getOrderById(order._id);
      setOrder(fresh.data.order);
    } catch (err) {
      console.error("Error marking as delivered:", err);
      alert(err.response?.data?.message || "Failed to mark as delivered.");
    }
  };

  const handleSendToSupplier = (supplierId) => {
    const supplier = suppliers.find(s => s._id === supplierId);
    if (!supplier) return;

    if (!window.confirm(`Send order details to ${supplier.name} via WhatsApp?`)) return;

    try {
      const orderNo = order.orderNo || "N/A";
      const product = order.productSnapshot || {};
      const components = product.components || [];

      // Build Components Text
      const diamondText = components
        .filter(c => c.pricingRef === "DIAMOND" || c.type?.toLowerCase().includes("diamond"))
        .map(c => `• ${c.type}: ${c.count}pcs (${c.grossWeight || c.weight}ct) ${c.clarity || ""}/${c.color || ""}`)
        .join("\n");

      const stoneText = components
        .filter(c => c.pricingRef === "STONE" && !c.type?.toLowerCase().includes("diamond"))
        .map(c => `• ${c.type}: ${c.count}pcs (${c.grossWeight || c.weight}ct)`)
        .join("\n");

      const beltText = components
        .filter(c => c.pricingRef === "BELT")
        .map(c => `• Belt: ${c.category || ""} ${c.shape || ""} ${c.size || ""} (${c.count}pcs)`)
        .join("\n");

      const message = `🔨 *NEW MANUFACTURING ORDER* 🔨\n\nनमस्ते,\n\nनया ऑर्डर तैयार है:\n*Order No:* ${orderNo}\n\n*आइटम विवरण:*\n--------------------------------\n• श्रेणी: ${product.jewelleryCategory || "Jewellery"}\n• मेटल: ${product.metalType || ""} (${product.metalPurity || ""})\n• नेट वजन: ${product.netWeight || 0} g\n• साइज: ${product.size || "Standard"}\n--------------------------------\n\n${diamondText ? `*हीरे (Diamonds):*\n${diamondText}\n\n` : ""}${stoneText ? `*नग (Stones):*\n${stoneText}\n\n` : ""}${beltText ? `*बेल्ट/एक्सेसरीज (Belts):*\n${beltText}\n\n` : ""}*विशेष निर्देश (Notes):*\n${product.description || product.notes || "No special instructions"}\n\n कृपया काम शुरू करें।\nधन्यवाद,\n💎 *Nazara Diamonds* 💎`;

      const encodedMessage = encodeURIComponent(message);
      const mobile = supplier.mobile.replace(/\D/g, "");
      const finalMobile = mobile.length === 10 ? `91${mobile}` : mobile;

      window.open(`https://wa.me/${finalMobile}?text=${encodedMessage}`, "_blank");
    } catch (err) {
      console.error("WhatsApp Error:", err);
      alert("Failed to send WhatsApp message.");
    }
  };

  // --- LOADING STATE ---
  if (loading) return (
    <div className="min-h-screen bg-[#EBE2E6] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border border-stone-200 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-t-2 border-[#A0826D] rounded-full animate-spin"></div>
          <div className="absolute inset-0 m-auto text-[#A0826D] animate-pulse">
            <Coins size={18} />
          </div>
        </div>
        <p className="font-serif text-[#8B7355] tracking-wide text-sm">Retrieving Particulars...</p>
      </div>
    </div>
  );

  // --- ERROR STATE ---
  if (error || !order) return (
    <div className="min-h-screen bg-[#EBE2E6] flex items-center justify-center p-4">
      <div className="bg-white p-10 shadow-lg border border-stone-200/60 text-center max-w-md w-full">
        <XCircle className="w-12 h-12 text-stone-300 mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-3xl font-serif text-[#2D2D2D] mb-3">Record Missing</h2>
        <p className="text-[#8B7355] mb-8 text-sm">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 bg-[#1E293B] text-white hover:bg-[#0F172A] transition-colors uppercase tracking-wider text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );

  // --- ORDER DATA ---
  const { customer, productSnapshot = {}, metalSnapshot, advancePayment, metalPayment } = order;

  const imagesArray = (
    productSnapshot.productImages ||
    productSnapshot.images ||
    (productSnapshot.productImage ? [productSnapshot.productImage] : [])
  ).map((img) => getImageUrl(img));

  const imageSrc = imagesArray.length
    ? imagesArray[activeImageIndex]
    : null;


  console.log("ORDER DATA:", order);
  console.log("PRODUCT SNAPSHOT:", productSnapshot);
  console.log("IMAGES ARRAY:", imagesArray);


  const isCancelled = order.status === "Cancelled";
  const isReadyForBilling = order.status === "Ready";
  const isEditable = !["Ready", "Delivered", "Cancelled"].includes(order.status);
  const hasMetalInfo = metalSnapshot || metalPayment;

  const normalizedComponents = (productSnapshot.components || []).map(c => ({
    ...c,
    weight: Number(c.weight || c.stoneWeight || 0),
    count: Number(c.count || 0),
    pricingRef: c.pricingRef || (c.type?.toLowerCase().includes("diamond") ? "DIAMOND" : "STONE"),
  }));

  const diamondComponents = productSnapshot.components?.filter(c =>
    c.type.toLowerCase().includes("diamond") || c.pricingRef === "DIAMOND"
  ) || [];

  const gemstoneComponents = productSnapshot.components?.filter(c =>
    (!c.type.toLowerCase().includes("diamond") && c.pricingRef === "STONE") || (c.pricingRef === "STONE")
  ) || [];

  const beltComponents = productSnapshot.components?.filter(c =>
    c.pricingRef === "BELT"
  ) || [];

  const orderDate = new Date(order.createdAt);
  const dateStr = orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const displayTitle = productSnapshot.title || `Custom ${productSnapshot.metalType} ${productSnapshot.jewelleryCategory || "Item"}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2D2D2D] pb-20 selection:bg-[#E8DFD6] selection:text-[#2D2D2D]">

      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-[#8B7355] hover:text-[#2D2D2D] transition-colors group py-2"
          >
            <div className="p-1.5 border border-stone-200 group-hover:border-[#A0826D] transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] font-semibold tracking-widest uppercase">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            {isEditable && (
              <button
                onClick={handleEditOrder}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#A0826D] text-[#A0826D] hover:bg-[#A0826D] hover:text-white transition-all group"
              >
                <Edit size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">Edit Order</span>
              </button>
            )}

            {!["Delivered"].includes(order.status) && (
              <button
                onClick={handleDeleteOrder}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-600 text-rose-600 hover:bg-rose-600 hover:text-white transition-all group"
              >
                <Trash2 size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-wide">Delete Order</span>
              </button>
            )}
            <span className="px-4 py-1.5 bg-[#EBE2E6] border border-stone-200/60 text-[#8B7355] text-[9px] uppercase tracking-[0.15em] font-semibold">
              Order #{order.orderNo}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* --- HEADER SECTION --- */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200/60 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-[#8B7355] text-[10px] tracking-wider uppercase font-medium">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-stone-200/60">
                <Calendar size={11} className="text-[#A0826D]" />
                <span>{dateStr}</span>
              </div>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-stone-200/60">
                <Clock size={11} className="text-[#A0826D]" />
                <span>{timeStr}</span>
              </div>
              {order.expectedDeliveryDate && (
                <>
                  <span className="text-stone-300">•</span>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-stone-200/60">
                    <Package size={11} className="text-emerald-600" />
                    <span>Exp: {new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] tracking-tight font-normal">
                Order #{order.orderNo}
              </h1>
            </div>
            <p className="text-xs text-[#8B7355] uppercase tracking-widest font-medium">Premium Collection</p>
          </div>

          <div className="flex flex-col items-end justify-end pb-2 gap-2">
            <StatusBadge status={order.status} className="border border-stone-200/60 px-5 py-2 text-sm" />
            {!isCancelled && metalSnapshot?.ratePerGram && (
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-[#8B7355] font-semibold">Metal Rate: ₹{metalSnapshot.ratePerGram?.toLocaleString()}/g</span>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* --- LEFT COLUMN (Visuals & Client) --- */}
          <div className="lg:col-span-4 space-y-6">

            {/* Product Image Gallery */}
            <div className="w-full flex flex-col items-center">
              <div className="bg-white p-2 border border-stone-200/60 relative group max-w-[280px] w-full">

                {/* MAIN IMAGE */}
                <div
                  className="relative aspect-[4/5] bg-[#EBE2E6] overflow-hidden cursor-pointer"
                  onClick={() => imageSrc && setIsImageZoomed(true)}
                >
                  {imageSrc ? (
                    <>
                      <img
                        src={imageSrc}
                        alt="Design Preview"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="px-4 py-2 bg-white/90 backdrop-blur flex items-center gap-2">
                          <Maximize2 size={12} className="text-[#A0826D]" />
                          <span className="text-[9px] font-semibold uppercase tracking-widest">
                            View Full
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs uppercase tracking-wider">
                      No Preview
                    </div>
                  )}
                </div>
              </div>

              {/* THUMBNAILS */}
              {imagesArray.length > 1 && (
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  {imagesArray.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-16 h-20 border cursor-pointer overflow-hidden transition-all ${activeImageIndex === index
                        ? "border-[#A0826D] ring-1 ring-[#A0826D]"
                        : "border-stone-200 hover:border-[#A0826D]"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`thumb-${index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Details Card */}
            <div className="bg-[#6B3151] text-white border border-stone-200/60 relative overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-dashed border-stone-200/60 pb-4">
                  <div className="p-2 bg-[#EBE2E6]">
                    <User className="text-[#A0826D]" size={14} />
                  </div>
                  <h3 className="font-serif text-base  font-medium">Client Profile</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-[9px]  uppercase tracking-widest mb-1 font-semibold">Name</p>
                    <p className=" font-serif text-lg tracking-tight">{customer?.name}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-[9px]  uppercase tracking-widest mb-1 font-semibold">Contact</p>
                      <p className="font-mono text-sm">{customer?.mobile}</p>
                      {customer?.email && <p className=" text-xs mt-0.5 truncate hover:text-[#A0826D] cursor-pointer">{customer.email}</p>}
                      {customer?.mobile && (
                        <a
                          href={`/orders?search=${encodeURIComponent(customer.mobile)}`}
                          className="inline-flex items-center gap-1 mt-1.5 text-[9px] uppercase tracking-widest font-bold text-white/70 hover:text-white border-b border-white/30 hover:border-white transition-colors"
                        >
                          View All Orders ↗
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest mb-1 font-semibold">Address</p>
                      <p className=" text-xs leading-relaxed border-l-2 border-[#E8DFD6] pl-3">
                        {customer?.address || "Walk-in Customer"}
                      </p>
                    </div>
                  </div>
                  {(customer?.city || customer?.gstin || customer?.stateCode) && (
                    <div className="pt-4 border-t border-stone-200/60">
                      <div className="grid grid-cols-2 gap-3">
                        {customer?.city && (
                          <div>
                            <p className="text-[9px] uppercase tracking-widest mb-1 font-semibold">City</p>
                            <p className=" text-xs">{customer.city}</p>
                          </div>
                        )}
                        {customer?.gstin && (
                          <div>
                            <p className="text-[9px] text-[#8B7355] uppercase tracking-widest mb-1 font-semibold">GSTIN</p>
                            <p className="text-[#2D2D2D] text-xs font-mono">{customer.gstin}</p>
                          </div>
                        )}
                        {customer?.stateCode && (
                          <div>
                            <p className="text-[9px] text-[#8B7355] uppercase tracking-widest mb-1 font-semibold">State Code</p>
                            <p className="text-[#2D2D2D] text-xs">{customer.stateCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metal Information Card */}
            <div className={`border p-6 ${hasMetalInfo ? 'bg-[#F8EFF3] border-[#F8EFF3]' : 'bg-amber-50/30 border-amber-200/50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 ${hasMetalInfo ? 'bg-[#F8EFF3]' : 'bg-amber-100/50'}`}>
                  <Lock className={hasMetalInfo ? 'text-white' : 'text-amber-700'} size={14} />
                </div>
                <h3 className="font-serif text-base text-[#2D2D2D] font-medium">Metal Information</h3>
              </div>

              {hasMetalInfo ? (
                <div className="space-y-3">
                  {metalSnapshot && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#8B7355] font-medium">Metal Type</span>
                        <span className="font-semibold text-[#2D2D2D] text-sm">{metalSnapshot.metalType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#8B7355] font-medium">Purity</span>
                        <span className="font-semibold text-[#2D2D2D] text-sm">{metalSnapshot.purity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#8B7355] font-medium">Rate/Gram</span>
                        <span className="font-semibold text-[#2D2D2D] text-sm">₹{metalSnapshot.ratePerGram?.toLocaleString()}</span>
                      </div>
                      <div className="pt-3 border-t border-[#5A374F]-200/50">
                        <p className="text-[10px] text-[#5A374F]-700 font-medium">
                          Locked on {new Date(metalSnapshot.lockedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                  {metalPayment && (
                    <div className="mt-3 pt-3 border-t border-[#F8EFF3]">
                      <p className="text-[10px] font-semibold text-white-800 mb-2 uppercase tracking-wider">Customer Provided Metal</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-[#8B7355] font-medium">Weight</span>
                          <p className="font-semibold text-sm">{metalPayment.weight} g</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8B7355] font-medium">Value</span>
                          <p className="font-semibold text-sm">₹{metalPayment.totalValue?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 mb-3">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-semibold">Metal Information Required</span>
                  </div>
                  <p className="text-xs text-[#8B7355] mb-4 leading-relaxed">
                    Add metal details (customer-provided or system metal) before starting production.
                  </p>
                  <button
                    onClick={handleEditOrder}
                    className="w-full px-4 py-2 bg-[#A0826D] text-white text-[10px] uppercase tracking-wider font-semibold hover:bg-[#8B7355] transition-colors"
                  >
                    Add Metal Details
                  </button>
                </div>
              )}
            </div>

            {/* Booking Group Linked Items */}
            {groupOrders.length > 1 && (
              <div className="bg-white border border-stone-200/60 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-dashed border-stone-200">
                  <div className="p-2 bg-[#F5F1EB] text-[#8B7355] rounded">
                    <Layers size={14} />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm text-[#2D2D2D] font-semibold">Booking Group ({groupOrders.length} Items)</h3>
                    <p className="text-[9px] text-[#8B7355] font-mono tracking-wider">Group: {order.groupOrderNo}</p>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {groupOrders.map((o) => {
                    const itemSnapshot = o.productSnapshot || {};
                    const isCurrent = o._id === order._id;
                    const itemImage = (itemSnapshot.productImages || itemSnapshot.images || [])[0];
                    
                    return (
                      <div
                        key={o._id}
                        onClick={() => {
                          if (!isCurrent) navigate(`/orders/${o._id}`);
                        }}
                        className={`flex items-center gap-3 p-2 border transition cursor-pointer rounded ${
                          isCurrent
                            ? "bg-[#6B3151]/5 border-[#6B3151]/30 font-medium"
                            : "border-stone-100 hover:border-[#A0826D]/30 hover:bg-[#F5F1EB]/30"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-10 h-12 bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200 rounded">
                          {itemImage ? (
                            <img
                              src={getImageUrl(itemImage)}
                              alt="thumb"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] uppercase text-stone-400">
                              No Pic
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-[#2D2D2D] truncate font-semibold">
                            {itemSnapshot.title || `Custom Item`}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-mono text-stone-400">{o.orderNo.split("-").pop()}</span>
                            <span className="text-[9px] text-stone-300">•</span>
                            <span className="text-[9px] text-[#8B7355]">{itemSnapshot.jewelleryCategory || "Jewellery"}</span>
                          </div>
                        </div>

                        {/* Status & Indicator */}
                        <div className="text-right flex-shrink-0">
                          <span className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded ${
                            o.status === "Ready" ? "bg-emerald-100 text-emerald-800" :
                            o.status === "In-Process" ? "bg-amber-100 text-amber-800" :
                            o.status === "Delivered" ? "bg-blue-100 text-blue-800" :
                            o.status === "Cancelled" ? "bg-rose-100 text-rose-800" :
                            "bg-stone-100 text-stone-700"
                          }`}>
                            {o.status}
                          </span>
                          {isCurrent && (
                            <p className="text-[7px] text-[#6B3151] font-extrabold uppercase mt-1 tracking-widest text-center">Active</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions Panel */}
            {!isCancelled && (
              <div className="space-y-4">
                <div className="bg-white border border-stone-200/60 p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-[#2D2D2D]">
                      <Package size={14} className="text-[#A0826D]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Supplier Delegation</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-stone-100 text-stone-500 font-bold rounded">
                      {suppliers.length} Available
                    </span>
                  </div>
                  <div className="relative group">
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleSendToSupplier(e.target.value);
                        e.target.value = ""; // Reset
                      }}
                      className="w-full bg-[#F9F7F2] border border-stone-200 p-3 text-xs focus:ring-1 focus:ring-[#A0826D] outline-none appearance-none cursor-pointer pr-10 font-medium"
                      defaultValue=""
                    >
                      <option value="" disabled>Select Supplier to Send Details</option>
                      {suppliers.length > 0 ? (
                        suppliers.map(s => (
                          <option key={s._id} value={s._id}>{s.name} ({s.mobile})</option>
                        ))
                      ) : (
                        <option disabled>No suppliers found in Master</option>
                      )}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <p className="mt-3 text-[9px] text-stone-400 leading-tight italic">
                    * Selecting a supplier will automatically open WhatsApp with the order details.
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/orders/${order._id}/slip`)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-stone-200/60 hover:border-[#A0826D]/50 transition-all group"
                >
                  <span className="flex items-center gap-3 text-xs font-semibold text-[#2D2D2D] uppercase tracking-wide">
                    <Printer size={14} className="text-[#A0826D]" />
                    Print Job Slip
                  </span>
                  <ChevronDown className="group-hover:-rotate-90 transition-transform text-stone-300 group-hover:text-[#A0826D]" size={14} />
                </button>
              </div>
            )}

          </div>

          {/* --- RIGHT COLUMN (Specifications) --- */}
          <div className="lg:col-span-8">
            <div className="bg-[#6B3151] border border-stone-200/60 relative">
              <div className="px-8 py-6 border-b border-stone-200/60 flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-xl text-white mb-1 font-medium">Specification Sheet</h2>
                  <p className="text-[9px] text-[#8B7355] uppercase tracking-widest font-semibold">Technical Details & Requirements</p>
                </div>
                <Layers size={20} className="text-stone-300" strokeWidth={1} />
              </div>

              {/* PRODUCT TITLE & DESCRIPTION SECTION */}
              <div className="px-8 pt-6 pb-4 bg-white">
                <h1 className="font-serif text-2xl md:text-3xl text-[#6B3151] mb-3 leading-tight font-normal">
                  {displayTitle}
                </h1>

                {productSnapshot.productType && (
                  <p className="text-[#8B7355] text-sm italic mb-3">
                    {productSnapshot.productType}
                  </p>
                )}

                {productSnapshot.certificateNo && (
                  <div className="flex items-center gap-2 mt-2">
                    <Tag size={12} className="text-[#A0826D]" />
                    <span className="text-xs text-[#8B7355]">Certificate: {productSnapshot.certificateNo}</span>
                  </div>
                )}
              </div>

              <div className="px-8 bg-white min-h-[500px]">

                {/* 1. Metal Specifications */}
                <AccordionSection title="Metal & Base Structure" icon={Coins} defaultOpen={true}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-1">
                    <DataRow label="Jewellery Category" value={productSnapshot.jewelleryCategory} />
                    <DataRow
                      label="Size"
                      value={
                        productSnapshot.size ||
                        productSnapshot.ringSize ||
                        productSnapshot.bangleSize ||
                        productSnapshot.length ||
                        "Standard"
                      }
                    />
                    <DataRow label="Metal Type" value={productSnapshot.metalType} />
                    <DataRow label="Purity Standard" value={productSnapshot.metalPurity} />
                    <DataRow label="Metal Color" value={productSnapshot.metalColor} />
                    <DataRow label="Est Net Weight" value={`${productSnapshot.netWeight || 0} g`} />
                    <DataRow label="Est Gross Weight" value={`${productSnapshot.grossWeight || 0} g`} />
                  </div>

                  {(productSnapshot.description || productSnapshot.notes || productSnapshot.remark) && (
                    <div className="mt-4 p-4 bg-[#EBE2E6] border border-stone-200/60">
                      <p className="text-[9px] uppercase tracking-widest text-[#8B7355] font-semibold mb-2">
                        Product Description
                      </p>
                      <p className="text-xs text-[#2D2D2D] leading-relaxed whitespace-pre-line">
                        {productSnapshot.description || productSnapshot.notes || productSnapshot.remark}
                      </p>
                    </div>
                  )}
                </AccordionSection>

                {/* 2. Diamond Components */}
                {diamondComponents.length > 0 && (
                  <AccordionSection title="Diamond Specifications" icon={Diamond} >
                    <div className="space-y-4">
                      {diamondComponents.map((diamond, idx) => (
                        <ComponentBadge key={idx} component={diamond} index={idx} />
                      ))}
                      <div className=" grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-stone-200/60">
                        <div>
                          <span className=" text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Total Carats</span>
                          <span className="font-semibold text-[#2D2D2D]">
                            {diamondComponents.reduce((sum, d) => sum + (d.grossWeight || 0), 0).toFixed(3)} ct
                          </span>
                        </div>
                        <div>

                          <span className=" text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Total Pieces</span>
                          <span className="font-semibold text-[#2D2D2D]">
                            {diamondComponents.reduce((sum, d) => sum + (d.count || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionSection>
                )}

                {/* 3. Gemstone Components */}
                {gemstoneComponents.length > 0 && (
                  <AccordionSection title="Gemstone Accents" icon={Sparkles}>
                    <div className="space-y-4">
                      {gemstoneComponents.map((stone, idx) => (
                        <ComponentBadge key={idx} component={stone} index={idx} />
                      ))}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-stone-200/60">
                        <div>
                          <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Total Carats</span>
                          <span className="font-semibold text-[#2D2D2D]">
                            {gemstoneComponents.reduce((sum, s) => sum + (s.grossWeight || s.weight), 0).toFixed(3)} ct
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Total Pieces</span>
                          <span className="font-semibold text-[#2D2D2D]">
                            {gemstoneComponents.reduce((sum, s) => sum + (s.count || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionSection>
                )}

                {/* Belts / Accessories */}
                {beltComponents.length > 0 && (
                  <AccordionSection title="Belts & Accessories" icon={Settings}>
                    <div className="space-y-4">
                      {beltComponents.map((belt, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-stone-200/60">
                          <div className="flex items-center gap-4">
                            <span className="text-stone-300 font-serif text-lg italic font-light">0{idx + 1}</span>
                            <div>
                              <p className="font-semibold text-[#2D2D2D] capitalize text-sm">Belt Accessory</p>
                              <div className="flex items-center gap-2 mt-1">
                                {belt.category && <span className="text-[10px] text-[#8B7355] px-2 py-0.5 bg-[#F5F1EB] font-medium">{belt.category}</span>}
                                {belt.shape && <span className="text-[10px] text-[#8B7355] px-2 py-0.5 bg-[#F5F1EB] font-medium">{belt.shape}</span>}
                                {belt.size && <span className="text-[10px] text-[#8B7355] px-2 py-0.5 bg-[#F5F1EB] font-medium">{belt.size}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-stone-400 text-[9px] uppercase">Quantity</p>
                            <p className="font-semibold">{belt.count} pcs</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionSection>
                )}

                {/* 4. Components Summary */}
                {productSnapshot.components?.length > 0 && (
                  <AccordionSection title="Components Summary" icon={Package}>
                    <div className="p-4 bg-[#EBE2E6] border border-stone-200/60">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <span className="block text-2xl font-serif text-[#2D2D2D] font-normal">
                            {productSnapshot.components.length}
                          </span>
                          <span className="text-[9px] text-[#8B7355] uppercase tracking-widest font-semibold">Total Components</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-2xl font-serif text-[#2D2D2D] font-normal">
                            {productSnapshot.components.reduce((sum, c) => sum + (c.grossWeight || 0), 0).toFixed(3)} ct
                          </span>
                          <span className="text-[9px] text-[#8B7355] uppercase tracking-widest font-semibold">Total Weight</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-2xl font-serif text-[#2D2D2D] font-normal">
                            {productSnapshot.components.reduce((sum, c) => sum + (c.count || 0), 0)}
                          </span>
                          <span className="text-[9px] text-[#8B7355] uppercase tracking-widest font-semibold">Total Pieces</span>
                        </div>
                        <div className="text-center">
                          <span className="block text-2xl font-serif text-[#2D2D2D] font-normal">
                            {new Set(productSnapshot.components.map(c => c.type)).size}
                          </span>
                          <span className="text-[9px] text-[#8B7355] uppercase tracking-widest font-semibold">Unique Types</span>
                        </div>
                      </div>
                    </div>
                  </AccordionSection>
                )}

                {/* 5. Financials - HIDE IF CANCELLED */}
                {!isCancelled && (
                  <AccordionSection title="Financial Overview" icon={CreditCard} defaultOpen={true}>
                    <div className="space-y-6">
                      {/* Advance Payment */}
                      <div className="p-4 bg-emerald-50/30 border border-emerald-200/50">
                        <h4 className="font-serif text-base text-[#2D2D2D] mb-3 flex items-center gap-2 font-medium">
                          <CreditCard size={14} className="text-emerald-600" />
                          Advance Payment
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Amount</span>
                            <span className="font-semibold text-[#2D2D2D] text-base">
                              ₹{advancePayment?.amount?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Mode</span>
                            <span className="font-medium text-[#2D2D2D] text-sm">
                              {advancePayment?.mode || "Not Specified"}
                            </span>
                          </div>
                          {advancePayment?.transactionId && (
                            <div className="col-span-2">
                              <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Transaction ID</span>
                              <span className="font-mono text-xs text-[#2D2D2D] break-all">
                                {advancePayment.transactionId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Metal Payment (if any) */}
                      {metalPayment && (
                        <div className="p-4 bg-blue-50/30 border border-blue-200/50">
                          <h4 className="font-serif text-base text-[#2D2D2D] mb-3 flex items-center gap-2 font-medium">
                            <Scale size={14} className="text-blue-600" />
                            Metal Provided by Customer
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Metal</span>
                              <span className="font-medium text-[#2D2D2D] text-sm">{metalPayment.metalType}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Purity</span>
                              <span className="font-medium text-[#2D2D2D] text-sm">{metalPayment.purity}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Weight</span>
                              <span className="font-medium text-[#2D2D2D] text-sm">{metalPayment.weight} g</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-[#8B7355] uppercase tracking-widest block mb-1 font-semibold">Value</span>
                              <span className="font-semibold text-[#2D2D2D] text-sm">₹{metalPayment.totalValue?.toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-blue-600 mt-3 font-medium">
                            Received on {new Date(metalPayment.receivedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionSection>
                )}

              </div>

              {/* --- ACTION FOOTER --- */}
              <div className="bg-[#F8EFF3] p-8 border-t border-stone-200/60 flex flex-wrap gap-4 justify-end items-center">

                {isCancelled ? (
                  <div className="w-full flex justify-center py-2">
                    <span className="text-red-600 font-serif italic text-base flex items-center gap-2">
                      <XCircle size={18} /> Order has been cancelled.
                    </span>
                  </div>
                ) : (
                  <>
                    {/* START PRODUCTION BUTTON */}
                    {order.status === "Placed" && (
                      <div className="w-full space-y-3 mb-4">
                        {!hasMetalInfo && (
                          <div className="mb-4 p-4 bg-amber-50/50 border border-amber-200/50">
                            <p className="text-amber-800 text-xs mb-2 flex items-center gap-2 font-semibold">
                              <AlertTriangle size={14} />
                              <span>Metal information required</span>
                            </p>
                            <p className="text-amber-700 text-[10px]">
                              Add metal details before starting production.
                            </p>
                          </div>
                        )}
                        <button
                          onClick={handleStartProduction}
                          disabled={isStartingProduction || !hasMetalInfo}
                          className={`w-full px-8 py-3 transition-all text-xs font-semibold uppercase tracking-wider ${(!hasMetalInfo || isStartingProduction)
                            ? 'bg-[#5A374F] cursor-not-allowed text-white'
                            : 'bg-[#6B3151] text-white hover:bg-[#5A374F]'
                            }`}
                        >
                          {isStartingProduction ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Starting...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Play size={12} fill="currentColor" /> Start Production
                            </span>
                          )}
                        </button>
                      </div>
                    )}

                    {/* MARK COMPLETE BUTTON */}
                    {order.status === "In-Process" && (
                      <button
                        onClick={handleMarkComplete}
                        className="px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 w-full text-xs font-semibold uppercase tracking-wider"
                      >
                        <CheckCircle size={14} />
                        Finalize & Mark Ready
                      </button>
                    )}

                    {/* ACTION BUTTONS ROW */}
                    <div className="w-full flex flex-wrap gap-3 justify-between items-center pt-4 border-t border-stone-200/60">



                      {/* ADD TO CART */}
                      <button
                        disabled={!isReadyForBilling}
                        onClick={handleAddOrderToCart}
                        className={`px-6 py-2.5 border transition-colors flex items-center gap-2 ${isReadyForBilling
                          ? "bg-[#A0826D] border-[#A0826D] text-white hover:bg-[#8B7355] cursor-pointer"
                          : "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-70"
                          }`}
                      >
                        <ShoppingCart size={14} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide">
                          {isReadyForBilling ? "Add to Cart for Billing" : "Not Ready for Billing"}
                        </span>
                      </button>

                      {/* CANCEL BUTTON */}
                      {order.status !== "Delivered" && (
                        <button
                          onClick={handleCancelOrder}
                          disabled={isCancelling}
                          className={`px-6 py-2.5 border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-2 ${isCancelling ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isCancelling ? (
                            <span className="animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"></span>
                          ) : (
                            <XCircle size={14} />
                          )}
                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            {isCancelling ? "Cancelling..." : "Cancel"}
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- IMAGE ZOOM OVERLAY --- */}
      <AnimatePresence>
        {isImageZoomed && imageSrc && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-stone-900/90 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsImageZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[90vh] bg-transparent outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsImageZoomed(false)}
                className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close View</span>
                <XCircle size={28} strokeWidth={1} />
              </button>

              <img
                src={imageSrc}
                alt="Full View"
                className="max-h-[85vh] w-auto object-contain shadow-2xl border-2 border-white"
              />

              <div className="mt-4 text-center">
                <p className="text-white/60 font-serif text-base italic tracking-wide">{productSnapshot.jewelleryCategory} Masterpiece</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}