

import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../api/productApi";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getImageUrl } from "../utils/getImageUrl";
import { 
  ChevronDown, ShoppingBag, ChevronRight, 
  ShieldCheck, Tag, Headset, Check, FileText,
  Barcode, Printer
} from "lucide-react";
import { formatCt } from "../utils/format";
import { useTheme } from "../context/ThemeContext";

const displayValue = (v) =>
  v !== undefined && v !== null && v !== "" ? v : "-";

// Helper function to get metal color name
const getMetalColorName = (colorValue) => {
  const colorMap = {
    "yellow-gold": "Yellow Gold",
    "white-gold": "White Gold",
    "rose-gold": "Rose Gold",
    "silver": "Silver",
    "platinum": "Platinum"
  };
  return colorMap[colorValue] || colorValue;
};

// Helper function to get metal color hex
const getMetalColorHex = (colorValue) => {
  const colorMap = {
    "yellow-gold": "linear-gradient(135deg, #EAD385 0%, #C8A153 100%)",
    "white-gold": "linear-gradient(135deg, #F5F5F5 0%, #D4D4D4 100%)",
    "rose-gold": "linear-gradient(135deg, #E6BAA9 0%, #C98B75 100%)",
    "silver": "linear-gradient(135deg, #F5F5F5 0%, #C0C0C0 100%)",
    "platinum": "linear-gradient(135deg, #FFFFFF 0%, #E5E4E2 100%)"
  };
  return colorMap[colorValue] || "linear-gradient(135deg, #EAD385 0%, #C8A153 100%)";
};

// Helper to format component type for display
const formatComponentType = (type) => {
  if (!type) return "";
  return type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function SingleProduct() {
  const navigate = useNavigate();
  const { id ,sku } = useParams();
  const { addProduct } = useCart();
  const { isDark } = useTheme();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [selectedMetalColor, setSelectedMetalColor] = useState("yellow-gold");
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState(2);
  const [currentIndex, setCurrentIndex] = useState(0);
  // 🔥 add this state at top (inside component)
const [isCustomized, setIsCustomized] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState("");

  const resolveImage = (img) => getImageUrl(img);
  

useEffect(() => {
  if (product?.images?.length) {
    setSelectedImage(resolveImage(product.images[currentIndex]));
  }
}, [currentIndex, product]);




const prevImage = () => {
  setCurrentIndex((prev) =>
    prev === 0 ? product.images.length - 1 : prev - 1
  );
};

const nextImage = () => {
  setCurrentIndex((prev) =>
    prev === product.images.length - 1 ? 0 : prev + 1
  );
};


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/sku/${id}`);
        const prod = res.data.product;

        setProduct(prod);

        if (prod?.metalColor) {
          setSelectedMetalColor(prod.metalColor);
        }

        if (prod?.images && prod.images.length > 0) {
          setSelectedImage(resolveImage(prod.images[0]));
        }

      } catch (err) {
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // const handleMouseMove = (e) => {
  //   if (!containerRef.current || !imageRef.current) return;
  //   const container = containerRef.current;
  //   const rect = container.getBoundingClientRect();
  //   const x = ((e.clientX - rect.left) / rect.width) * 100;
  //   const y = ((e.clientY - rect.top) / rect.height) * 100;
  //   setZoomPosition({ x, y });
  //   setIsZooming(true);
  // };


  const handleMouseMove = (e) => {
  if (!containerRef.current) return;

  const rect = containerRef.current.getBoundingClientRect();

  let x = ((e.clientX - rect.left) / rect.width) * 100;
  let y = ((e.clientY - rect.top) / rect.height) * 100;

  // clamp values
  x = Math.max(0, Math.min(100, x));
  y = Math.max(0, Math.min(100, y));

  setZoomPosition({ x, y });
  setIsZooming(true);
};

const handleMouseLeave = () => {
  setIsZooming(false);
};

//   const totalGemstoneCount = gemstones.reduce(
//   (sum, g) => sum + (Number(g.count) || 0),
//   0
// );

// const totalGemstoneWeight = gemstones.reduce(
//   (sum, g) => sum + (Number(g.weight) || 0),
//   0
// );

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    try {
      await addProduct(product._id, quantity);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  const getComponentsByType = () => {
    if (!product?.components) return {};
    return product.components.reduce((acc, component) => {
      const type = component.type || "Other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(component);
      return acc;
    }, {});
  };

  if (loading) return <Loader text="Loading masterpiece..." />;

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F5F5F5]">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-serif font-light text-[#3A332C] mb-3">{error}</h1>
          <Link to="/" className="inline-block px-8 py-3 border border-[#D5CEC4] text-[#3A332C] rounded-lg hover:bg-white transition-colors">
            ← Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = product?.images?.length > 0 ? resolveImage(product.images[0]) : "/placeholder.png";

  const availableMetalColors = [
    { value: "yellow-gold", name: "Yellow Gold" },
    { value: "white-gold", name: "White Gold" },
    { value: "rose-gold", name: "Rose Gold" },
  ];

  const diamonds = product.components?.filter(c => ["Diamond", "Polki", "Moissanite"].includes(c.type)) || [];
  const belts = product.components?.filter(c => c.type === "Belt" || c.type === "Accessory") || [];
  const gemstones = product.components?.filter(c => !["Diamond", "Polki", "Moissanite", "Belt", "Accessory"].includes(c.type)) || [];

  const getGrossWeight = (c) => {
  return c.grossWeight != null && c.grossWeight > 0
    ? Number(c.grossWeight)
    : Number(c.weight || 0) * Number(c.count || 0);
};

  const totalDiamondCount = diamonds.reduce((sum, d) => sum + (Number(d.count) || 0), 0);
 // const totalDiamondWeight = diamonds.reduce((sum, d) => sum + (Number(d.grossWeight) || Number(d.weight) || 0), 0);
// const totalDiamondWeight = diamonds.reduce((sum, d) => {
//   const gross =
//     d.grossWeight != null && d.grossWeight > 0
//       ? Number(d.grossWeight)
//       : Number(d.weight || 0) * Number(d.count || 0);
//   return sum + gross;
// }, 0);
const totalDiamondWeight = diamonds.reduce(
  (sum, d) => sum + getGrossWeight(d),
  0
);

  const totalGemstoneCount = gemstones.reduce((sum, g) => sum + (Number(g.count) || 0), 0);
 // const totalGemstoneWeight = gemstones.reduce((sum, g) => sum + (Number(g.grossWeight) || Number(g.weight) || 0), 0);
// const totalGemstoneWeight = gemstones.reduce((sum, g) => {
//   const gross =
//     g.grossWeight != null && g.grossWeight > 0
//       ? Number(g.grossWeight)
//       : Number(g.weight || 0) * Number(g.count || 0);

//   return sum + gross;
// }, 0);

const totalGemstoneWeight = gemstones.reduce(
  (sum, g) => sum + getGrossWeight(g),
  0
);

const totalBeltCount = belts.reduce((sum, b) => sum + (Number(b.count) || 0), 0);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#121212] text-[#e0e0e0]" : "bg-[#F8EFF3] text-[#3A332C]"} font-sans pb-24 relative`}>
      <div  className={`max-w-7xl mx-auto ${isDark ? "bg-[#121212]" : "bg-[#F8EFF3]"}`}>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-8 right-8 bg-[#3A332C] text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center gap-3">
            <Check size={16} className="text-[#D4AF37]" />
            <p className="font-serif text-sm">Added to cart successfully</p>
          </div>
        </div>
      )}

      {/* Decorative Blur Background Element */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[#FFFFF] to-[#FFFFFF]/0 pointer-events-none z-0" />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12 relative z-10">
              <div className="mb-8">
           <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 font-serif transition-colors duration-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collection
          </Link>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">

          
          
          {/* ================= LEFT COLUMN ================= */}
          <div
          // className="lg:col-span-5 flex flex-col gap-6"
         // className="lg:col-span-5 flex flex-col gap-6 sticky top-24 self-start h-fit"
         className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24 self-start h-fit"
           >



<div className="flex gap-4 items-start">
  
  {/* Left Column: Vertical Thumbnails Slider */}
  {product?.images?.length > 0 && (
    <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
      
      {/* Up Arrow */}
      <button
        type="button"
        className="w-full h-8 bg-[#4A2840] text-white rounded-sm flex items-center justify-center hover:bg-[#3A1E31] transition-colors disabled:opacity-50"
        onClick={() => {
         const currentIndex = product.images.findIndex(
  (img) => resolveImage(img) === selectedImage
);
          if (currentIndex > 0) {
            setSelectedImage(resolveImage(product.images[currentIndex - 1]));
          }
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Thumbnails Container */}
      <div className="flex flex-col gap-2 max-h-[380px] overflow-hidden py-1">
        {product.images.map((img, index) => {
          const imgUrl = resolveImage(img);
          const isSelected = selectedImage === imgUrl;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedImage(imgUrl)}
              className={`w-[72px] h-[72px] flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
                isSelected 
                  ? "border-[#4A2840] shadow-sm p-0.5" 
                  : "border-gray-200 hover:border-gray-300 p-1"
              }`}
            >
              <img
                src={imgUrl}
                alt={`${product.title} - view ${index + 1}`}
                className="w-full h-full object-contain bg-white"
              />
            </button>
          );
        })}
      </div>

      {/* Down Arrow */}
      <button
        type="button"
        className="w-full h-8 bg-[#4A2840] text-white rounded-sm flex items-center justify-center hover:bg-[#3A1E31] transition-colors disabled:opacity-50"
        onClick={() => {
         const currentIndex = product.images.findIndex(
  (img) => resolveImage(img) === selectedImage
);
          if (currentIndex < product.images.length - 1 && currentIndex !== -1) {
            setSelectedImage(resolveImage(product.images[currentIndex + 1]));
          }
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )}

  {/* Right Column: Main Image & Badges */}
  <div className={`${isDark ? "bg-[#1a1a1a]" : "bg-[#F3E9E8]"} flex flex-col gap-4 flex-1 overflow-hidden transition-colors`}>
    
    {/* Main Image Container */}

{/* <div
  ref={containerRef}
 
  className="relative w-full aspect-square bg-white border border-gray-200 rounded-sm overflow-hidden cursor-crosshair group flex items-center justify-center p-8"
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
> */}

<div
  ref={containerRef}
  className="relative w-full aspect-square bg-transparent border border-gray-200 rounded-xl overflow-hidden cursor-crosshair group flex items-center justify-center"
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
  onMouseEnter={() => setIsZooming(true)}
>
  
  {/* 1. The Base Image (Visible when NOT zooming) */}
  <img
    ref={imageRef}
    src={selectedImage}
    alt={product?.title || "Product Image"}
    // CHANGE 2: Removed p-8 from here. Added opacity transition.
    // It fades out when zooming so you only see the high-res overlay.
    className={`w-full h-full object-contain transition-opacity duration-200 ${isZooming ? 'opacity-0' : 'opacity-100'}`}
    // REMOVED: The style={{ transform: ... }} block is gone from here.
  />

  {/* 2. The High-Clarity Zoom Overlay (Visible only WHEN zooming) */}
  <div
    // Sit on top of the base image, don't steal mouse events
    className={`absolute inset-0 pointer-events-none bg-white transition-opacity duration-200 ease-out ${isZooming ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
    style={{
      // NOTE: For best results, use a distinct, higher-resolution URL here if you have one.
      // e.g. backgroundImage: `url(${product.highResImageUrl || selectedImage})`,
      backgroundImage: `url(${selectedImage})`,
      backgroundRepeat: 'no-repeat',
      // CHANGE 3: Control zoom level via background size (e.g., "200%" instead of scale(2))
      backgroundSize: `${(zoomScale || 2) * 100}%`,
      // CHANGE 4: Move the background image based on mouse coordinates
      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
      // Ensure background respects the container's padding
     // backgroundOrigin: 'content-box',
     // padding: '2rem', // Match the p-8 of container (2rem usually equals p-8)
    }}
  />
</div>

  </div>

</div>






  
            {/* Thumbnails */}

      
            {product?.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1 ml-20">
                {product.images.map((img, index) => {
                  const imgUrl = resolveImage(img);
                  const isSelected = selectedImage === imgUrl;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-[72px] h-[72px] shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                        isSelected ? "border-[#B89047] p-0.5" : "border-transparent bg-white shadow-sm hover:shadow-md"
                      }`}
                    >
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover rounded-xl" />
                    </button>
                  );
                })}
              </div>
            )}

            
                        {/* Select Metal Color */}
            <div className="mt-2">
              <h3 className="font-serif text-lg text-[#3A332C] mb-1">Select Metal Color</h3>
              <p className="text-xs text-[#8A8178] mb-4">Available colors based on your preference</p>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {availableMetalColors.map((color) => {
                  const isSelected = selectedMetalColor === color.value;
                  return (
                    <button
                      key={color.value}
                      onClick={() => setSelectedMetalColor(color.value)}
                      className={`flex flex-col items-center py-4 px-2 rounded-2xl border transition-all ${
                        isSelected ? "border-[#D4AF37] bg-[#FAF8F5] shadow-sm" : "border-[#EAE3D9] bg-white hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-full mb-3 shadow-sm border border-black/5" 
                        style={{ background: getMetalColorHex(color.value) }}
                      />
                      <span className={`text-[11px] font-medium ${isSelected ? "text-[#B89047]" : "text-[#3A332C]"}`}>
                        {color.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selection Status Note */}
              <div className={`${isDark ? "bg-[#1f1f1f] border-[#333333]" : "bg-[#FAF8F5] border-[#EAE3D9]"} border rounded-xl p-4 flex gap-3 items-center transition-colors`}>
                <div 
                  className="w-6 h-6 rounded-full shrink-0 shadow-sm border border-black/5"
                  style={{ background: getMetalColorHex(selectedMetalColor) }}
                />
                <div>
                  <p className="text-sm text-[#3A332C] font-medium">Selected: <span className="text-[#B89047]">{getMetalColorName(selectedMetalColor)}</span></p>
                  <p className="text-[11px] text-[#8A8178]">The color as specified on the product details</p>
                </div>
              </div>
            </div>


  {/* Compliance Info */}
              {(product.hsnCode || product.huid || product.certificateNo) && (
                <InfoCard 
                  title="Compliance & Certification" 
                  icon={<ShieldCheck className="w-4 h-4" />}
                >
                  <div className="grid grid-cols-3 gap-y-4 pt-2">
                    {product.huid && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#8A8178] mb-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> HUID
                        </div>
                        <p className="text-[#3A332C] font-medium pl-6">{displayValue(product.huid)}</p>
                      </div>
                    )}
                    {product.hsnCode && (
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#8A8178] mb-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="M4 8h16M4 16h16M8 4v16M16 4v16"/></svg> HSN Code
                        </div>
                        <p className="text-[#3A332C] font-medium pl-6">{displayValue(product.hsnCode)}</p>
                      </div>
                    )}


{product.certificates?.map((cert, i) => (
  <div key={i}>
    <div className="flex items-center gap-2 text-xs text-[#8A8178] mb-1">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16v16H4z"/>
        <path d="M4 8h16M4 16h16M8 4v16M16 4v16"/>
      </svg>
      Certificate
    </div>

    <p className="text-[#3A332C] text-xs font-medium pl-4">
      {cert.lab} - {cert.certificateNo}
    </p>
  </div>
))}

                  </div>
                </InfoCard>
              )}

          </div>


          {/* 
  <button
  type="button"
  onClick={() => {
    navigate("/orders/new", {
      state: {
        initialProduct: {
          productRef: product._id,
          title: product.title,
          jewelleryCategory: product.jewelleryCategory,
          description: product.description,
          metalType: product.metalType,
          metalPurity: product.metalPurity,
          metalColor: product.metalColor,
          netWeight: product.netWeight,
          grossWeight: product.grossWeight,
          components: product.components || [],
          hsnCode: product.hsnCode,
          certificateNo: product.certificateNo,
          images: product.images || [],
        },
      },
    });
  }}
  className="
    inline-flex items-center justify-center
    w-8 h-8

    rounded-full
    border border-black/10
    bg-white

    text-[#1d1d1f]

    hover:bg-black hover:text-white
    transition-all duration-200

    active:scale-[0.95]
  "
  aria-label="Customize Design"
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
  
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3l6 6-12 12H3v-6L15 3z" />
  </svg>
</button> */}


          {/* ================= RIGHT COLUMN ================= */}
          <div className="lg:col-span-7 flex flex-col pt-2 lg:pl-4">
            
            {/* Header Area */}
            <div className="flex justify-between items-start mb-2">
              <h1 className={`text-[40px] font-serif leading-tight rounded-md font-sans transition-colors ${isDark ? "text-pink-400" : "text-[#6B3151]"}`}>
                {displayValue(product.title)}
              </h1>

              {product.targetAudience && (
                <div className="mt-2">
                  <span className="px-3 py-1 bg-[#6B3151]/10 text-[#6B3151] text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {product.targetAudience}
                  </span>
                </div>
              )}


              <div className="flex justify-between items-start mb-2 gap-5">

<button
  type="button"
  onClick={(e) => {
    // Ripple effect
    const circle = document.createElement("span");
    circle.className =
      "absolute bg-white/40 rounded-full animate-ripple pointer-events-none";
    const rect = e.currentTarget.getBoundingClientRect();
    circle.style.width = circle.style.height = "120px";
    circle.style.left = `${e.clientX - rect.left - 60}px`;
    circle.style.top = `${e.clientY - rect.top - 60}px`;
    e.currentTarget.appendChild(circle);
    setTimeout(() => circle.remove(), 600);

    // Action
    setIsCustomized(true);

    setTimeout(() => {
      navigate("/orders/new", {
        state: {
          initialProduct: {
            productRef: product._id,
            title: product.title,
            jewelleryCategory: product.jewelleryCategory,
            description: product.description,
            metalType: product.metalType,
            metalPurity: product.metalPurity,
            metalColor: product.metalColor,
            netWeight: product.netWeight,
            grossWeight: product.grossWeight,
            components: product.components || [],
            hsnCode: product.hsnCode,
            certificateNo: product.certificateNo,
            certificates: product.certificates || [],
            images: product.images || [],
          },
        },
      });
    }, 250);
  }}
  className={`
    relative overflow-visible
    group inline-flex items-center gap-2
    h-9 px-4 rounded-full
    text-xs font-medium tracking-tight

    border border-[#EAE3D9]
    bg-[#FAF8F5] text-[#6B3151]

    shadow-[0_2px_6px_rgba(0,0,0,0.05)]

    hover:bg-[#6B3151] hover:text-white
    hover:shadow-[0_4px_12px_rgba(107,49,81,0.25)]

    transition-all duration-200 ease-out
    active:scale-[0.95]

    ${isCustomized ? "bg-[#6B3151] text-white border-[#6B3151]" : ""}
  `}
>
  {/* 🔄 Icon */}
  <div className="relative w-4 h-4 flex items-center justify-center">

    {/* 👇 Tap Icon */}
    <svg
      className={`
        transition-all duration-300
        ${isCustomized ? "opacity-0 scale-50" : "opacity-100 scale-100 animate-pulse"}
      `}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11V5a2 2 0 114 0v6m0 0l3-3m-3 3l-3-3m3 3v6" />
    </svg>

    {/* ✅ Check */}
    <svg
      className={`
        absolute transition-all duration-300
        ${isCustomized ? "opacity-100 scale-100" : "opacity-0 scale-50"}
      `}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </div>

  {/* 🏷️ Label */}
  <span>
    {isCustomized ? "Added" : "Customize"}
  </span>

  {/* 💬 Tooltip */}
  <span
    className="
      absolute -top-10 left-1/2 -translate-x-1/2

      px-3 py-1.5
      text-[11px] font-medium

      bg-black text-white rounded-lg
      whitespace-nowrap

      opacity-0 translate-y-2
      group-hover:opacity-100 group-hover:translate-y-0

      transition-all duration-200 ease-out
      pointer-events-none
    "
  >
    Customize Product

    {/* 🔻 Arrow */}
    <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></span>
  </span>
</button>

<button
  type="button"
  onClick={() => {
    navigate("/quotations/new", {
      state: {
        initialProduct: {
          title: product.title,
          jewelleryCategory: product.jewelleryCategory,
          description: product.description,
          metalType: product.metalType || "Gold",
          metalPurity: product.metalPurity || "22KT",
          metalColor: product.metalColor,
          netWeight: product.netWeight,
          grossWeight: product.grossWeight,
          fineGold: product.fineGold,
          huid: product.huid,
          hsnCode: product.hsnCode,
          components: product.components || [],
          images: product.images || [],
        },
      },
    });
  }}
  className="
    group relative inline-flex items-center justify-center
    h-9 px-4 rounded-full
    text-xs font-medium tracking-tight
    border border-[#EAE3D9]
    bg-white text-[#6B3151]
    shadow-[0_2px_6px_rgba(0,0,0,0.05)]
    hover:bg-[#6B3151] hover:text-white
    hover:shadow-[0_4px_12px_rgba(107,49,81,0.25)]
    transition-all duration-200 ease-out
    active:scale-[0.95]
  "
>
  <FileText size={14} className="mr-2" />
  <span>Estimate</span>
  
  {/* Tooltip */}
  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[11px] font-medium bg-black text-white rounded-lg whitespace-nowrap opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
    Create Estimate
    <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></span>
  </span>
</button>

<button
  type="button"
  onClick={() => {
    navigate("/barcode-print", {
      state: {
        products: [product],
      },
    });
  }}
  className="
    group relative inline-flex items-center justify-center
    h-9 px-4 rounded-full
    text-xs font-medium tracking-tight
    border border-[#EAE3D9]
    bg-white text-[#6B3151]
    shadow-[0_2px_6px_rgba(0,0,0,0.05)]
    hover:bg-[#6B3151] hover:text-white
    hover:shadow-[0_4px_12px_rgba(107,49,81,0.25)]
    transition-all duration-200 ease-out
    active:scale-[0.95]
    mr-2
  "
>
  <Barcode size={14} className="mr-2" />
  <span>Barcode</span>
  
  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[11px] font-medium bg-black text-white rounded-lg whitespace-nowrap opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none">
    Generate Barcode
    <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></span>
  </span>
</button>

<Link
  to={`/edit/${product._id}`}
  className="
    group relative inline-flex items-center justify-center

    w-9 h-9
    rounded-full

    bg-[#6B3151] text-white
    border border-[#EAE3D9]

    text-[#8A8178]

    shadow-[0_2px_6px_rgba(0,0,0,0.05)]

    hover:bg-[#FAF8F5] hover:text-[#6B3151]
    hover:shadow-[0_6px_18px_rgba(107,49,81,0.3)]

    transition-all duration-300 ease-out
    active:scale-[0.92]
  "
  aria-label="Edit Product"
>

  {/* ✏️ Pencil Icon (Draw Animation) */}
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      className="stroke-draw"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536M9 11l6.768-6.768a2.5 2.5 0 113.536 3.536L12.536 14.536a2 2 0 01-.878.513L9 16l.951-2.658a2 2 0 01.513-.878z"
    />
  </svg>

  {/* 💬 Tooltip */}
  <span
    className="
      absolute -top-9 left-1/2 -translate-x-1/2

      px-2.5 py-1
      text-[10px] font-medium tracking-wide

      bg-black text-white rounded-md
      whitespace-nowrap

      opacity-0 translate-y-1
      group-hover:opacity-100 group-hover:translate-y-0

      transition-all duration-200
      pointer-events-none
    "
  >
    Edit Product
  </span>
</Link>
</div>
            </div>

               {/* <button
  type="button"
  onClick={() => {
    navigate("/orders/new", {
      state: {
        initialProduct: {
          productRef: product._id,
          title: product.title,
          jewelleryCategory: product.jewelleryCategory,
          description: product.description,
          metalType: product.metalType,
          metalPurity: product.metalPurity,
          metalColor: product.metalColor,
          netWeight: product.netWeight,
          grossWeight: product.grossWeight,
          components: product.components || [],
          hsnCode: product.hsnCode,
          certificateNo: product.certificateNo,
          images: product.images || [],   // ✅ SEND ALL IMAGES
        },
      },
    });
  }}
  className="group inline-flex items-center gap-2 text-sm font-medium text-[bg-[#6B3151]] hover:text-[#D4AF37] transition-colors"
>
  <span className="border-b border-transparent group-hover:border-[#D4AF37] transition-all duration-300">
    Customize This Design
  </span>
</button> */}
              {/* Premium Custom Order CTA - Only show if not editing an existing custom order, or maybe always show as "Edit" if it's already a custom order? I'll leave the Edit button as it was and just style it nicely. */}
              {/* <Link to={`/edit/${product.sku}`} className="bg-[#F3E9E8] text-[#8A8178] hover:bg-[#FAF8F5] hover:text-[#3A332C] px-4 py-1.5 rounded-md text-xs font-medium transition-colors mt-2 border border-[#EAE3D9]">
                Edit
              </Link> */}
            
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-[#8A8178] uppercase tracking-wider">SKU. {displayValue(product.sku)}</span>
              {product.jewelleryCategory && (
                <span className="bg-[#EADDCB] text-[#8C6B4A] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                  {product.jewelleryCategory.substring(0, 3).toUpperCase()}
                </span>
              )}
            </div>

            <div className="text-xl font-serif text-[#3A332C] mb-4">
              {displayValue(product.description)}
            </div>

            {product.productType && (
              <div className="mb-6">
                <span className="text-[11px] uppercase tracking-widest text-gray-400 font-sans">
                  Product Type
                </span>
                <div className="text-sm font-medium text-[#3A332C] mt-1 font-sans">
                  {formatComponentType(product.productType)}
                </div>
              </div>
            )}
            

            <p className="text-sm text-[#8A8178] mb-8">
              Availability: <span className="text-[#328D4D] font-medium ml-1">✓ {product.stock > 0 ? `${product.stock} In stock` : 'Out of stock'}</span>
            </p>

            {/* ================= ACCORDION CARDS ================= */}
            <div className="space-y-4 flex-1">
              
              {/* Right Metal Composition Card */}
              {product.metalType && (
                <InfoCard 
                  title="Metal Composition" 
                  icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
                >
                  <div className="grid grid-cols-2 gap-y-5 gap-x-6 pt-2">
                    <SpecItem label="Type" value={displayValue(product.metalType)} />
                    <SpecItem label="Purity" value={displayValue(product.metalPurity)} />
                    <SpecItem label="Color" value={<span className="text-[#B89047] font-medium">{getMetalColorName(product.metalColor)}</span>} />
                    <SpecItem label="Net Weight" value={product.netWeight ? `${displayValue(product.netWeight)} g` : "-"} />
                    {/* {product.fineGold && (
                      <SpecItem label="Fine Gold" value={`${displayValue(product.fineGold)} g`} />
                    )} */}

{product.fineGold && (
  <div className="col-span-2 mt-2">
    <div className="bg-[#F8EFF3] border border-[#EAE3D9] rounded-xl p-3 flex justify-between items-center">
      <span className="text-sm text-[#8A8178]">Fine Metal</span>
      <span className="text-[#B89047] font-semibold">
        {displayValue(product.fineGold)} g
      </span>
    </div>
  </div>
)}

                  </div>
                </InfoCard>
              )}

              {/* Primary Diamonds */}

              {/* {diamonds.length > 0 && (
                <InfoCard 
                  title="Diamonds" 
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                >
                  {diamonds.map((stone, idx) => (
                    <div key={`d1-${idx}`} className="pt-2">
                      <div className="flex items-center gap-3 bg-[#F3E9E8] border border-[#EAE3D9] rounded-lg p-3 mb-3">
                        <div className="w-6 h-6 bg-[#3A332C] rounded-full flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-[#3A332C]">
                          
          {stone.shape && (
            <span className="text-gray-500">
              Shape: <span className="text-gray-900 font-medium">{stone.shape}</span>
            </span>
          )}

          {stone.cut && (
            <span className="text-gray-500">
              Cut: <span className="text-gray-900 font-medium">{stone.cut}</span>
            </span>
          )}

          {stone.color && (
            <span className="text-gray-500">
              Color: <span className="text-gray-900 font-medium">{stone.color}</span>
            </span>
          )}

          {stone.clarity && (
            <span className="text-gray-500">
              Clarity: <span className="text-gray-900 font-medium">{stone.clarity}</span>
            </span>
          )}

          {stone.size && (
              <span className="text-gray-900 font-medium">Size : {stone.size || "-"} mm
             </span>
          )}

          <span className="text-gray-500">
            Weight: <span className="text-gray-900 font-medium">{stone.weight || "-"} ct</span>
          </span>

          <span className="text-gray-500">
            Count: <span className="text-gray-900 font-medium">{stone.count || 1}</span>
          </span>

          <span className="text-gray-500">
            Total : <span className="text-gray-900 font-medium">{stone.grossWeight !== undefined ? stone.grossWeight : "-"} ct</span>
          </span>

             {stone.rateOverride && (
              <span className="text-gray-900 font-medium">Rate : {stone.rateOverride || "-"} 
             </span>
          )}

                        </div>
                      </div>
                      <div className="flex gap-8 px-2">
                        
                      </div>
                    </div>
                  ))}

  <div className="flex justify-between px-2 text-sm border-t border-[#EAE3D9] pt-4">
                         <span className="text-[#8A8178]">Total Count <span className="text-[#3A332C] font-medium ml-2">{totalDiamondCount} </span></span>
                         <span className="text-[#8A8178]">Total Weight <span className="text-[#3A332C] font-medium ml-2">{totalDiamondWeight.toFixed(3)} ct</span></span>
                      </div>
                </InfoCard>
              )} */}


              {diamonds.length > 0 && (
  <div className="bg-[#FAF8F5] border border-gray-100 rounded-2xl p-6 shadow-sm font-serif mb-6 relative ">
    {/* Header */}
    <div className="flex justify-between items-center mb-6 ">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 italic font-sans">
          02
        </div>
        <h3 className="text-xl text-[#4A2C3C] font-medium tracking-tight">Diamonds</h3>
      </div>
      <div className="bg-[#F4F1F0] text-[#8A8178] text-[9px] tracking-[0.2em] px-4 py-1.5 rounded-full font-sans uppercase ">
        Set of Diamonds
      </div>
    </div>

    {/* Diamond List with Separate Styled Divs */}
    <div className="grid grid-cols-1 gap-4 mb-3">
      {diamonds.map((stone, idx) => (
        // <div 
        //   key={`d1-${idx}`} 
        //   className="bg-[#F8EFF3] border border-[#F0EDEA] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
        // >
         
        //   <div className="flex items-center gap-4 border-r border-[#EAE3D9] ">
        //      <div className="flex flex-col">
        //       <span className="text-[8px] uppercase tracking-widest text-gray-400 font-sans mb-0.5">Shape</span>
        //       <span className="text-sm text-[#3A332C] font-semibold font-sans ">{stone.shape || "-"}</span>
        //     </div>
        //     <div className="flex flex-col">
        //       <span className="text-[8px] uppercase tracking-widest text-gray-400 font-sans mb-0.5">Color/Clarity</span>
        //       <span className="text-sm text-[#3A332C] font-sans font-semibold">{stone.color || "-"}/{stone.clarity || "-"}</span>
        //     </div>
        //   </div>

          
        //   <div className="grid grid-cols-4 gap-6 flex-1 px-1">
        //      <div className="flex flex-col">
        //       <span className="text-[8px] uppercase tracking-widest text-gray-400 font-sans mb-0.5">Size</span>
        //       <span className="text-sm text-[#3A332C]">{stone.size ? `${stone.size}mm` : "-"}</span>
        //     </div>
        //     <div className="flex flex-col">
        //       <span className="text-[8px] uppercase tracking-widest text-gray-400 font-sans mb-0.5">Weight/pcs</span>
        //       <span className="text-sm text-[#3A332C]">
        //         {/* {stone.weight || "-"}ct */}{formatCt(stone.weight, "perPiece")}ct
        //         </span>
        //     </div>
        //     <div className="flex flex-col">
        //       <span className="text-[8px] uppercase tracking-widest text-gray-400 font-sans mb-0.5">Count</span>
        //       <span className="text-sm text-[#3A332C]">{stone.count || 1}</span>
        //     </div>
        //     <div className="flex flex-col">
        //       <span className="text-[8px] uppercase tracking-widest text-gray-400 font-sans mb-0.5">Total</span>
        //       <span className="text-sm text-[#4A2C3C] font-bold">{(stone.grossWeight) || "-"}ct</span>
        //     </div>
        //   </div>

          
        //   {stone.rateOverride && (
        //     <div className="bg-[#F4F1F0] px-3 py-1.5 rounded-lg border border-[#EAE3D9] text-center min-w-[80px]">
        //       <span className="text-[8px] uppercase text-gray-400 block font-sans">Rate</span>
        //       <span className="text-xs font-semibold text-[#3A332C]">{stone.rateOverride}</span>
        //     </div>
        //   )}
        // </div>

//  <div 
//   key={`d1-${idx}`} 
//   className="bg-[#F8EFF3] border border-[#F0EDEA] rounded-xl p-5 flex flex-col gap-4"
// >

 
//   <div className="flex justify-between items-center flex-wrap gap-4">

//       <div>
//         <p className="text-[9px] uppercase tracking-widest text-gray-400">Shape</p>
//         <p className="text-sm font-semibold text-[#3A332C]">{stone.shape || "-"}</p>
//       </div>

//       <div>
//         <p className="text-[9px] uppercase tracking-widest text-gray-400">Color / Clarity</p>
//         <p className="text-sm font-semibold text-[#3A332C]">
//           {stone.color || "-"} / {stone.clarity || "-"}
//         </p>
//       </div>


//        <div>
//       <p className="text-[9px] uppercase text-gray-400">Count</p>
//       <p className="text-sm text-[#3A332C]">{stone.count || 1}</p>
//     </div>


//          <div>
//       <p className="text-[9px] uppercase text-gray-400">Size</p>
//       <p className="text-sm text-[#3A332C]">{stone.size ? `${stone.size}mm` : "-"}</p>
//     </div>

      
    


//   </div>


//   <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">

//     <div>
//       <p className="text-[9px] uppercase text-gray-400">Weight / pcs</p>
//       <p className="text-sm text-[#3A332C]">
//         {formatCt(stone.weight, "perPiece")} ct
//       </p>
//     </div>

//     <div>
//       <p className="text-[9px] uppercase text-gray-400">Total</p>
//       <p className="text-sm font-semibold text-[#4A2C3C]">
//         {getGrossWeight(stone).toFixed(3)} ct
//       </p>
//     </div>

        
//     {stone.rateOverride && (
//       <div className="bg-[#F4F1F0] px-3 py-1.5 rounded-lg border text-center">
//         <p className="text-[9px] text-gray-400 uppercase">Rate</p>
//         <p className="text-sm font-semibold text-[#3A332C]">{stone.rateOverride}</p>
//       </div>
//     )}

//   </div>
// </div>



<div
  key={`d1-${idx}`}
  className="bg-[#F8EFF3] border border-[#F0EDEA] rounded-xl p-5"
>
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Shape</p>
      <p className="text-sm font-semibold text-[#3A332C] break-words">{stone.shape || "-"}</p>
    </div>

    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Color / Clarity</p>
      <p className="text-sm font-semibold text-[#3A332C] break-words">
        {stone.color || "-"} / {stone.clarity || "-"}
      </p>
    </div>

    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Count</p>
      <p className="text-sm text-[#3A332C] break-words">{stone.count || 1}</p>
    </div>

    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Size</p>
      <p className="text-sm text-[#3A332C] break-words">
        {stone.size ? `${stone.size} mm` : "-"}
      </p>
    </div>

    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Weight / pcs</p>
      <p className="text-sm text-[#3A332C] break-words">
        {formatCt(stone.weight, "perPiece")} ct
      </p>
    </div>

    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Total</p>
      <p className="text-sm font-semibold text-[#4A2C3C] break-words">
        {getGrossWeight(stone).toFixed(3)} ct
      </p>
    </div>

    {stone.rateOverride && (
      <div className="min-w-0 bg-[#F4F1F0] px-3 py-3 rounded-lg border">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Rate</p>
        <p className="text-sm font-semibold text-[#3A332C] break-words">
          {stone.rateOverride}
        </p>
      </div>
    )}
  </div>
</div>

      ))}
    </div>

    {/* Totals Summary (Refined Height) */}
    <div className="flex justify-end border-t border-gray-100 pt-6">
      <div className="bg-[#6B3151] rounded-xl px-6 py-4 flex items-center gap-8 border border-[#F0EDEA]">
        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400 mb-1">Total Count</span>
          <span className="text-xl text-white font-light">
            {totalDiamondCount} <span className="text-xs italic text-white ml-1">pcs</span>
          </span>
        </div>
        
        <div className="h-8 w-px bg-[#EAE3D9]"></div>

        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400 mb-1">Total Weight</span>
          <span className="text-xl text-white font-semibold">
           {totalDiamondWeight.toFixed(3)}  <span className="text-xs font-light ml-1">ct</span>
          </span>
        </div>
      </div>
    </div>
  </div>
)}



              {/* Secondary Diamonds / Gemstones */}
              {/* {(diamonds.length > 1 || gemstones.length > 0) && (
                <InfoCard 
                  title={gemstones.length > 0 ? "Gemstones" : "Diamonds"} 
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l9 7-3 13H6L3 9l9-7z"/></svg>}
                >
                  {(gemstones.length > 0 ? gemstones : diamonds.slice(1)).map((stone, idx) => (
                    <div key={`s2-${idx}`} className="pt-2">
                      <div className="flex items-center gap-3 mb-4 pl-2">
                        <div className="text-gray-400">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                        </div>
                        <div className="flex gap-4 text-sm">
                           {formatComponentType(stone.type)}
                          <span className="text-[#8A8178]">Shape <span className="text-[#3A332C] font-medium ml-2">{stone.shape || "-"}</span></span>
                          <span className="text-[#8A8178]">Carat <span className="text-[#3A332C] font-medium ml-2">{stone.weight || "-"}</span></span>
                          <span className="text-[#8A8178]">Count <span className="text-[#3A332C] font-medium ml-2">{stone.count || 1}</span></span>
                                           {stone.rateOverride && (
              <span className="text-gray-900 font-medium">Rate : {stone.rateOverride || "-"} 
             </span>
          )}
                        
                        </div>
                      </div>
                    </div>
                  ))}

                    <div className="flex justify-between px-2 text-sm border-t border-[#EAE3D9] pt-4">
                         <span className="text-[#8A8178]">Total Count <span className="text-[#3A332C] font-medium ml-2">{totalGemstoneCount}</span></span>
                         <span className="text-[#8A8178]">Total Weight <span className="text-[#3A332C] font-medium ml-2">{totalGemstoneWeight.toFixed(3)} ct</span></span>
                      </div>

                  
                </InfoCard>
              )} */}

              {/* // final */}
              
{(gemstones.length > 0) && (
  <div className="bg-[#FAF8F5] border border-gray-100 rounded-2xl p-6 shadow-sm font-serif">
    {/* Header Section */}
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 italic">
          01
        </div>
        <h3 className="text-xl text-[#4A2C3C] font-medium">
          {gemstones.length > 0 ? "Gemstones" : "Natural Accent Diamonds"}
        </h3>
      </div>
      <div className="bg-[#F4F1F0] text-[#8A8178] text-[10px] tracking-widest px-4 py-1.5 rounded-full font-sans uppercase">
        Set of Stones
      </div>
    </div>

    {/* <div className="flex flex-col md:flex-row justify-between items-start gap-8"> */}
  
  {/* LEFT: Stone Details */}
  <div className="flex-1 w-full">
    {(gemstones.length > 0 ? gemstones : diamonds.slice(1)).map((stone, idx) => (
      
//       <div
//         key={`s2-${idx}`}
//         className="
//           grid 
//           grid-cols-2 
//           sm:grid-cols-4 
//           md:grid-cols-[2fr_1fr_1fr_1fr] 
//           gap-x-6 gap-y-4 
//           mb-6
//           bg-[#F8EFF3] border border-[#F0EDEA] rounded-xl
//         "
//       >
        
//         {/* TYPE */}
//         <div className="flex flex-col gap-1 col-span-2 sm:col-span-1 ml-2">
//           <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-sans">
//             Type
//           </span>
//           <span className="font-sans text-[15px] text-[#3A332C] uppercase tracking-wide leading-snug">
//             {formatComponentType(stone.type)}
//           </span>
//         </div>

//         {/* WEIGHT */}
//         <div className="flex flex-col gap-1">
//           <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-sans">
//             Weight
//           </span>
//           <span className="text-[18px] text-[#3A332C] font-light">
//             {stone.weight || "-"}
//             <span className="text-sm ml-1">ct</span>
//           </span>
//         </div>

//         {/* COUNT */}
//         <div className="flex flex-col gap-1">
//           <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-sans">
//             Count
//           </span>
//           <span className="text-[18px] text-[#3A332C] font-light">
//             {stone.count || 1}
//             <span className="text-sm ml-1 italic text-gray-400">pcs</span>
//           </span>
//         </div>

//         {/* TOTAL (Gross Weight) */}
// <div className="flex flex-col gap-1">
//   <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-sans">
//     Total
//   </span>
//   <span className="text-[18px] font-semibold text-[#4A2C3C]">
//     {getGrossWeight(stone).toFixed(3)}
//     <span className="text-sm ml-1">ct</span>
//   </span>
// </div>

//         {/* SHAPE */}
//         <div className="flex flex-col gap-1">
//           <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400 font-sans">
//             Shape
//           </span>
//           <span className="text-[18px] font-medium font-sans text-[#3A332C]">
//             {stone.shape || "-"}
//           </span>
//         </div>
//          {stone.rateOverride && (
//       <div className="bg-[#F4F1F0] px-3 py-1.5 rounded-lg border text-center">
//         <p className="text-[9px] text-gray-400 uppercase">Rate</p>
//         <p className="text-sm font-semibold text-[#3A332C]">{stone.rateOverride}</p>
//       </div>
//     )}

//       </div>


<div
  key={`s2-${idx}`}
  className="
    grid 
    grid-cols-2 
    sm:grid-cols-3 
    lg:grid-cols-4
    gap-5
    p-5
    mb-6
    bg-[#F8EFF3] border border-[#F0EDEA] rounded-xl
  "
>
  {/* TYPE */}
  <div className="min-w-0 col-span-2 sm:col-span-1">
    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
      Type
    </p>
    <p className="text-sm font-semibold text-[#3A332C] break-words uppercase">
      {formatComponentType(stone.type)}
    </p>
  </div>

  {/* WEIGHT */}
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
      Weight
    </p>
    <p className="text-base text-[#3A332C] font-light break-words">
      {stone.weight || "-"}
      <span className="text-sm ml-1">ct</span>
    </p>
  </div>

  {/* COUNT */}
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
      Count
    </p>
    <p className="text-base text-[#3A332C] font-light break-words">
      {stone.count || 1}
      <span className="text-sm ml-1 italic text-gray-400">pcs</span>
    </p>
  </div>

  {/* TOTAL */}
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
      Total
    </p>
    <p className="text-base font-semibold text-[#4A2C3C] break-words">
      {getGrossWeight(stone).toFixed(3)}
      <span className="text-sm ml-1">ct</span>
    </p>
  </div>

  {/* SHAPE */}
  <div className="min-w-0">
    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
      Shape
    </p>
    <p className="text-sm font-medium text-[#3A332C] break-words">
      {stone.shape || "-"}
    </p>
  </div>

  {/* RATE */}
  {stone.rateOverride && (
    <div className="min-w-0 bg-[#F4F1F0] px-3 py-3 rounded-lg border">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
        Rate
      </p>
      <p className="text-sm font-semibold text-[#3A332C] break-words">
        {stone.rateOverride}
      </p>
    </div>
  )}
</div>

    ))}
  </div>

  {/* RIGHT: Summary Card */}
  
{/* <div
  className="
    bg-[#F9F7F6] 
    rounded-2xl 
    px-6 sm:px-8 
    py-5 sm:py-6 
    flex 
    items-center 
    justify-center
    gap-8 sm:gap-10 
    w-full 
    md:w-[220px] 
    md:mt-6 
    shadow-sm
  "
> */}
    
{/*     
    <div className="flex flex-col items-center">
      <span className="text-[9px] uppercase tracking-[0.15em] text-[#8A8178] mb-2">
        Total Count
      </span>
      <span className="text-xl sm:text-2xl text-[#3A332C] font-light">
        {totalGemstoneCount}
        <span className="text-sm italic text-gray-400 ml-1">pcs</span>
      </span>
    </div>

    
    <div className="h-8 sm:h-10 w-px bg-gray-200"></div>

    
    <div className="flex flex-col items-center">
      <span className="text-[9px] uppercase tracking-[0.15em] text-[#8A8178] mb-2">
        Total Weight
      </span>
      <span className="text-xl sm:text-2xl text-[#4A2C3C] font-medium">
        {totalGemstoneWeight.toFixed(3)}
        <span className="text-sm font-light ml-1">ct</span>
      </span>
    </div> */}

  {/* </div> */}
{/* </div> */}

<div className="flex justify-end border-t border-gray-100 pt-6">
      <div className="bg-[#6B3151] rounded-xl px-6 py-4 flex items-center gap-8 border border-[#F0EDEA]">
        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400 mb-1">Total Count</span>
          <span className="text-xl text-white font-light">
            {totalGemstoneCount} <span className="text-xs italic text-white ml-1">pcs</span>
          </span>
        </div>
        
        <div className="h-8 w-px bg-[#EAE3D9]"></div>

        <div className="flex flex-col items-center">
          <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400 mb-1">Total Weight</span>
          <span className="text-xl text-white font-semibold">
           {totalGemstoneWeight.toFixed(3)} <span className="text-xs font-light ml-1 ">ct</span>
          </span>
        </div>
      </div>
    </div>

  </div>
)}

{belts.length > 0 && (
  <div className="bg-[#FAF8F5] border border-gray-100 rounded-2xl p-6 shadow-sm font-serif mb-6 relative">
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[10px] text-gray-400 italic">
          03
        </div>
        <h3 className="text-xl text-[#4A2C3C] font-medium tracking-tight">Accessories</h3>
      </div>
      <div className="bg-[#F4F1F0] text-[#8A8178] text-[9px] tracking-[0.2em] px-4 py-1.5 rounded-full font-sans uppercase">
        Product Accessories
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {belts.map((belt, idx) => (
        <div
          key={`accessory-${idx}`}
          className="bg-[#F8EFF3] border border-[#F0EDEA] rounded-xl p-5 grid grid-cols-2 sm:grid-cols-5 gap-4"
        >
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Category</p>
            <p className="text-sm font-semibold text-[#3A332C] break-words uppercase">{belt.category || "-"}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Material</p>
            <p className="text-sm font-semibold text-[#3A332C] break-words uppercase">{belt.description || "-"}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Color</p>
            <p className="text-sm font-semibold text-[#3A332C] break-words">{belt.shape || "-"}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Size</p>
            <p className="text-sm font-semibold text-[#3A332C] break-words">{belt.size || "-"}</p>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Qty</p>
            <p className="text-sm font-semibold text-[#3A332C] break-words">{belt.count || 1}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}









            
            </div>

            {/* ================= PURCHASE BLOCK ================= */}
            <div className="mt-8 pt-6 border-t border-[#EAE3D9]">
              
              <div className="flex items-end gap-3 mb-6 ml-5">
                <span className="text-2xl font-serif text-[#3A332C]">Total</span>
                <span className="text-[32px] font-serif text-[#3A332C] leading-none">
                  {product?.pricing?.grandTotal != null ? `₹${Number(product.pricing.grandTotal * quantity).toLocaleString("en-IN")}` : "Calculating..."}
                </span>
                
                    
                          {/* Left: Quantity */}
                <div className="flex items-center border border-gray-300 rounded-full h-7 w-[120px] bg-transparent] ml-5">
                   <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors rounded-l-full disabled:opacity-50" disabled={product.stock <= 0}>−</button>
                   <input type="number" min="1" max={product.stock} value={quantity} onChange={(e) => setQuantity(Math.min(Math.max(1, +e.target.value || 1), product.stock))} className="w-full h-full text-center bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-800 p-0" disabled={product.stock <= 0} />
                   <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors rounded-r-full disabled:opacity-50" disabled={product.stock <= 0}>+</button>
                 </div>
                
                 {/* Inclusive of GST */}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={Number(product?.stock || 0) <= 0}
                  className="flex-1 h-14 bg-gradient-to-r from-[#6B3151] to-[#5A374F] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {Number(product?.stock || 0) > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
                <button
                  onClick={() => {
                    if (Number(product?.stock || 0) > 0) {
                      handleAddToCart();
                      navigate("/checkout/calculate");
                    }
                  }}
                  disabled={Number(product?.stock || 0) <= 0}
                  className="flex-1 h-14 bg-gradient-to-r from-[#6B3151] to-[#5A374F] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed shadow-md shadow-[#C29B57]/20"
                >
                  {Number(product?.stock || 0) > 0 ? (
                    <>
                      Buy Now <ChevronRight className="w-5 h-5" />
                    </>
                  ) : (
                    "Sold Out"
                  )}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[#8A8178] font-medium">
                <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#C29B57]" /> 100% Authentication,</div>
                <div className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-[#C29B57]" /> Best Price</div>
                <div className="flex items-center gap-1.5"><Headset className="w-4 h-4 text-[#C29B57]" /> Dedicated Support</div>
              </div>

              {/* Footer row */}
              <div className="flex justify-between items-center mt-6 text-sm">
                <div className="text-[#328D4D] font-medium flex items-center gap-1">
                  <Check className="w-4 h-4" /> {product.stock > 0 ? `${product.stock} available in stock` : 'Out of stock'}
                </div>
                {/* <button onClick={() => navigate("/cart")} className="text-[#8A8178] hover:text-[#3A332C] font-medium flex items-center gap-1">
                  View Cart <ArrowRightIcon />
                </button> */}

                <button
  onClick={() => navigate("/cart")}
  className="
    group inline-flex items-center gap-2

    px-4 py-1.5
    rounded-full

    text-xs font-medium tracking-tight

    bg-[#FAF8F5] 
    border border-[#6B3151]

    shadow-[0_4px_12px_rgba(107,49,81,0.25)]

    hover:bg-[#F8EFF3] 
    hover:shadow-[0_6px_18px_rgba(107,49,81,0.35)]

    transition-all duration-200 ease-out
    active:scale-[0.95]
  "
>
  <span>View Cart</span>

  <span className="
    transition-transform duration-200
    group-hover:translate-x-1
  ">
    <ArrowRightIcon />
  </span>
</button>
              </div>

            </div>
          </div>
        </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ---------------- Helper Components ----------------

function InfoCard({ title, icon, children }) {
  return (
    <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center border-b border-[#EAE3D9] pb-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#C8A153]">{icon}</span>
          <h3 className="font-serif text-lg text-[#3A332C]">{title}</h3>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

function SpecItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-[#8A8178]">{label}</span>
      <span className="text-[15px] font-medium text-[#3A332C]">{value}</span>
    </div>
  );
}

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
































































// import { useParams, Link } from "react-router-dom";
// import { useEffect, useState, useRef } from "react";
// import API from "../api/productApi";
// import Loader from "../components/Loader";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext";
// import { getImageUrl } from "../utils/getImageUrl";

// const displayValue = (v) =>
//   v !== undefined && v !== null && v !== "" ? v : "-";

// // Helper function to get metal color name
// const getMetalColorName = (colorValue) => {
//   const colorMap = {
//     "yellow-gold": "Yellow Gold",
//     "white-gold": "White Gold",
//     "rose-gold": "Rose Gold",
//     "silver": "Silver",
//     "platinum": "Platinum"
//   };
//   return colorMap[colorValue] || colorValue;
// };

// // Helper function to get metal color hex
// const getMetalColorHex = (colorValue) => {
//   const colorMap = {
//     "yellow-gold": "#FFD700",
//     "white-gold": "#E6E8FA",
//     "rose-gold": "#B76E79",
//     "silver": "#C0C0C0",
//     "platinum": "#E5E4E2"
//   };
//   return colorMap[colorValue] || "#FFD700";
// };

// // Helper to format component type for display
// const formatComponentType = (type) => {
//   if (!type) return "";
//   return type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
// };

// export default function SingleProduct() {
//   const navigate = useNavigate();
//   const { sku } = useParams();
//   const { addProduct } = useCart();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [showToast, setShowToast] = useState(false);
//   const [selectedMetalColor, setSelectedMetalColor] = useState("#FFD700");
//   const [isZooming, setIsZooming] = useState(false);
//   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
//   const [zoomScale, setZoomScale] = useState(2);

//   const imageRef = useRef(null);
//   const containerRef = useRef(null);
//   const zoomRef = useRef(null);

//   const [selectedImage, setSelectedImage] = useState("");

// const resolveImage = (img) => getImageUrl(img);
  
// useEffect(() => {
//   const fetchProduct = async () => {
//     try {
//       setLoading(true);
//       const res = await API.get(`/sku/${sku}`);
//       const prod = res.data.product;

//           console.log("FULL PRODUCT:", prod);
//       console.log("IMAGES ARRAY:", prod.images);

//       setProduct(prod);

//       /* ---------------- METAL COLOR ---------------- */
//       if (prod?.metalColor) {
//         const initialColor = getMetalColorHex(prod.metalColor);
//         setSelectedMetalColor(initialColor);
//       }

//       /* ---------------- MULTIPLE IMAGES ---------------- */
//       if (prod?.images && prod.images.length > 0) {
//         setSelectedImage(resolveImage(prod.images[0]));
//       }

//     } catch (err) {
//       setError("Product not found");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchProduct();
// }, [sku]);



//   const handleMouseMove = (e) => {
//     if (!containerRef.current || !imageRef.current) return;

//     const container = containerRef.current;
//     const rect = container.getBoundingClientRect();

//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;

//     setZoomPosition({ x, y });
//     setIsZooming(true);
//   };

//   const handleMouseLeave = () => {
//     setIsZooming(false);
//   };

//   // Wheel handler for zoom scale
//   const handleWheel = (e) => {
//     e.preventDefault();
//     const delta = e.deltaY > 0 ? -0.2 : 0.2;
//     const newScale = Math.max(1, Math.min(5, zoomScale + delta));
//     setZoomScale(newScale);
//   };

//   const handleAddToCart = async () => {
//     if (!product || product.stock <= 0) return;

//     try {
//       await addProduct(product._id, quantity);
//       setShowToast(true);
//       setTimeout(() => setShowToast(false), 2000);
//     } catch (err) {
//       console.error("Add to cart failed", err);
//     }
//   };

//   // Group components by type for display
//   const getComponentsByType = () => {
//     if (!product?.components) return {};
    
//     return product.components.reduce((acc, component) => {
//       const type = component.type || "Other";
//       if (!acc[type]) acc[type] = [];
//       acc[type].push(component);
//       return acc;
//     }, {});
//   };

//   // Get center stone (main stone)
//   const getCenterStone = () => {
//     if (!product?.components) return null;
//     return product.components.find(c => c.componentRole === "CENTER");
//   };

//   // Get side stones
//   const getSideStones = () => {
//     if (!product?.components) return [];
//     return product.components.filter(c => c.componentRole !== "CENTER");
//   };

  

//   if (loading) return <Loader text="Loading masterpiece..." />;

//   if (error || !product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4 bg-white">
//         <div className="text-center max-w-md">
//           <h1 className="text-2xl font-serif font-light text-gray-800 mb-3">{error}</h1>
//           <Link
//             to="/"
//             className="inline-block px-8 py-3 border border-gray-300 text-gray-700 font-serif hover:bg-gray-50 transition-colors duration-300"
//           >
//             ← Back to Collection
//           </Link>
//         </div>
//       </div>
//     );
//   }

// // const imageUrl =
// //   product?.images && product.images.length > 0
// //     ? resolveImage(product.images[0])
// //     : "";

// const imageUrl =
//   product?.images?.length > 0
//     ? resolveImage(product.images[0])
//     : "/placeholder.png";

//   // Available metal colors based on backend enum
//   const availableMetalColors = [
//     {
//       value: "yellow-gold",
//       name: "Yellow Gold",
//       hex: "#FFD700",
//       description: "Classic warm gold color",
//     },
//     {
//       value: "white-gold",
//       name: "White Gold",
//       hex: "#E6E8FA",
//       description: "Modern silver-like appearance",
//     },
//     {
//       value: "rose-gold",
//       name: "Rose Gold",
//       hex: "#B76E79",
//       description: "Romantic pinkish hue",
//     },
//   ];

//   const componentsByType = getComponentsByType();
//   const centerStone = getCenterStone();
//   const sideStones = getSideStones();
//   const hasComponents = product.components && product.components.length > 0;
//   const diamonds = product.components?.filter(c => c.type === "Diamond") || [];
// const gemstones = product.components?.filter(c => c.type !== "Diamond") || [];

// const totalDiamondCount = diamonds.reduce(
//   (sum, d) => sum + (Number(d.count) || 0),
//   0
// );

// const totalDiamondWeight = diamonds.reduce(
//   (sum, d) => sum + (Number(d.grossWeight) || Number(d.weight) || 0),
//   0
// );

// const totalGemstoneCount = gemstones.reduce(
//   (sum, g) => sum + (Number(g.count) || 0),
//   0
// );

// const totalGemstoneWeight = gemstones.reduce(
//   (sum, g) => sum + (Number(g.weight) || 0),
//   0
// );

//   return (
//     <div className="min-h-screen bg-[#FDFBF7]">
//       {/* Premium Toast Notification */}
//       {showToast && (
//         <div className="fixed top-8 right-8 bg-[#1a1a1a] text-white px-6 py-4 shadow-2xl z-50 max-w-sm animate-fade-in">
//           <div className="flex items-center gap-3">
//             <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></div>
//             <p className="font-serif">✔ Added to cart successfully</p>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Back Navigation */}
//         <div className="mb-8">
//           <Link
//             to="/"
//             className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 font-serif transition-colors duration-300"
//           >
//             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
//             </svg>
//             Back to Collection
//           </Link>
//         </div>

//         {/* Main Product Container */}
//         <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 bg-white">
//           {/* Left Column: Image with Custom Zoom */}
//           <div className="space-y-6">
            
     
// <div className="flex gap-4 items-start">
  
//   {/* Left Column: Vertical Thumbnails Slider */}
//   {product?.images?.length > 0 && (
//     <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
      
//       {/* Up Arrow */}
//       <button
//         type="button"
//         className="w-full h-8 bg-[#4A2840] text-white rounded-sm flex items-center justify-center hover:bg-[#3A1E31] transition-colors disabled:opacity-50"
//         onClick={() => {
//          const currentIndex = product.images.findIndex(
//   (img) => resolveImage(img) === selectedImage
// );
//           if (currentIndex > 0) {
//             setSelectedImage(resolveImage(product.images[currentIndex - 1]));
//           }
//         }}
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
//         </svg>
//       </button>

//       {/* Thumbnails Container */}
//       <div className="flex flex-col gap-2 max-h-[380px] overflow-hidden py-1">
//         {product.images.map((img, index) => {
//           const imgUrl = resolveImage(img);
//           const isSelected = selectedImage === imgUrl;
          
//           return (
//             <button
//               key={index}
//               type="button"
//               onClick={() => setSelectedImage(imgUrl)}
//               className={`w-[72px] h-[72px] flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
//                 isSelected 
//                   ? "border-[#4A2840] shadow-sm p-0.5" 
//                   : "border-gray-200 hover:border-gray-300 p-1"
//               }`}
//             >
//               <img
//                 src={imgUrl}
//                 alt={`${product.title} - view ${index + 1}`}
//                 className="w-full h-full object-contain bg-white"
//               />
//             </button>
//           );
//         })}
//       </div>

//       {/* Down Arrow */}
//       <button
//         type="button"
//         className="w-full h-8 bg-[#4A2840] text-white rounded-sm flex items-center justify-center hover:bg-[#3A1E31] transition-colors disabled:opacity-50"
//         onClick={() => {
//          const currentIndex = product.images.findIndex(
//   (img) => resolveImage(img) === selectedImage
// );
//           if (currentIndex < product.images.length - 1 && currentIndex !== -1) {
//             setSelectedImage(resolveImage(product.images[currentIndex + 1]));
//           }
//         }}
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>
//     </div>
//   )}

//   {/* Right Column: Main Image & Badges */}
//   <div className="flex flex-col gap-4 flex-1 overflow-hidden">
    
//     {/* Main Image Container */}

// <div
//   ref={containerRef}
//   // CHANGE 1: Moved padding (p-8) to the container for better alignment
//   className="relative w-full aspect-square bg-white border border-gray-200 rounded-sm overflow-hidden cursor-crosshair group flex items-center justify-center p-8"
//   onMouseMove={handleMouseMove}
//   onMouseLeave={handleMouseLeave}
// >
//   {/* 1. The Base Image (Visible when NOT zooming) */}
//   <img
//     ref={imageRef}
//     src={selectedImage}
//     alt={product?.title || "Product Image"}
//     // CHANGE 2: Removed p-8 from here. Added opacity transition.
//     // It fades out when zooming so you only see the high-res overlay.
//     className={`w-full h-full object-contain transition-opacity duration-200 ${isZooming ? 'opacity-0' : 'opacity-100'}`}
//     // REMOVED: The style={{ transform: ... }} block is gone from here.
//   />

//   {/* 2. The High-Clarity Zoom Overlay (Visible only WHEN zooming) */}
//   <div
//     // Sit on top of the base image, don't steal mouse events
//     className={`absolute inset-0 pointer-events-none bg-white transition-opacity duration-200 ease-out ${isZooming ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
//     style={{
//       // NOTE: For best results, use a distinct, higher-resolution URL here if you have one.
//       // e.g. backgroundImage: `url(${product.highResImageUrl || selectedImage})`,
//       backgroundImage: `url(${selectedImage})`,
//       backgroundRepeat: 'no-repeat',
//       // CHANGE 3: Control zoom level via background size (e.g., "200%" instead of scale(2))
//       backgroundSize: `${(zoomScale || 2) * 100}%`,
//       // CHANGE 4: Move the background image based on mouse coordinates
//       backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
//       // Ensure background respects the container's padding
//       backgroundOrigin: 'content-box',
//       padding: '2rem', // Match the p-8 of container (2rem usually equals p-8)
//     }}
//   />
// </div>
//     {/* Trust Badges Row (Matches your screenshot exactly) */}
//     <div className="flex items-center justify-between border border-[#E2E8F0] bg-[#F8FAFC] rounded-sm text-[#4A2840] text-xs font-semibold tracking-wide">
      
//       {/* Badge 1: 100% Original */}
//       <div className="flex-1 flex items-center justify-center gap-2 py-3 border-r border-[#E2E8F0]">
//         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//           <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-1.998A11.954 11.954 0 0110 1.944zM6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l5-5a1 1 0 00-1.414-1.414L9 10.586 6.707 8.293z" clipRule="evenodd" />
//         </svg>
//         100% Authenticate
//       </div>

//       {/* Badge 2: Best Price */}
//       <div className="flex-1 flex items-center justify-center gap-2 py-3 border-r border-[#E2E8F0]">
//         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//           <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
//         </svg>
//         Best Price
//       </div>

//       {/* Badge 3: Free Shipping */}
//       <div className="flex-1 flex items-center justify-center gap-2 py-3">
//         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//           <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
//           <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
//         </svg>
//         Dedicated Support
//       </div>
      
//     </div>
//   </div>

// </div>

//             {/* Metal Color Selection */}
//             <div className="border border-gray-100 p-6">
//               <h3 className="font-serif text-lg text-gray-900 mb-4">Select Metal Color</h3>
//               <p className="text-sm text-gray-600 mb-4 bg-white">
//                 Available colors based on your product specifications
//               </p>

//               {/* Premium Color Selection Grid */}
//               <div className="grid grid-cols-3 gap-4 mb-8">
//                 {availableMetalColors.map((color) => (
//                   <button
//                     key={color.value}
//                     onClick={() => setSelectedMetalColor(color.hex)}
//                     className={`
//                       relative group flex flex-col items-center justify-center
//                       rounded-2xl px-4 py-5
//                       font-medium cursor-pointer
//                       transition-all duration-300
//                       border-2 overflow-hidden
//                       ${
//                         selectedMetalColor === color.hex
//                           ? "border-[#d4af37] bg-gradient-to-b from-[#3c1144]/5 to-transparent shadow-xl scale-[1.02]"
//                           : "border-gray-100 hover:border-gray-300 hover:shadow-lg hover:scale-[1.01]"
//                       }
//                     `}
//                   >
//                     {/* Background Glow */}
//                     <div
//                       className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
//                       style={{ backgroundColor: color.hex }}
//                     ></div>

//                     {/* Color Circle with Ring */}
//                     <div className="relative z-10 mb-4">
//                       <div
//                         className="w-16 h-16 rounded-full border-4 border-white shadow-xl"
//                         style={{ backgroundColor: color.hex }}
//                       />
//                       {selectedMetalColor === color.hex && (
//                         <div className="absolute -inset-2 border-2 border-[#d4af37] rounded-full animate-pulse"></div>
//                       )}
//                     </div>

//                     {/* Color Details */}
//                     <span className="relative z-10 text-sm font-bold text-gray-900 mb-1">
//                       {color.name}
//                     </span>
//                     <span className="relative z-10 text-xs text-gray-600 text-center">
//                       {color.description}
//                     </span>

//                     {/* Selection Indicator */}
//                     {selectedMetalColor === color.hex && (
//                       <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] flex items-center justify-center">
//                         <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
//                           <path
//                             fillRule="evenodd"
//                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       </div>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               {/* Selected Color Preview */}
//               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-center">
//                   <div
//                     className="w-10 h-10 rounded-full mr-4 border-2 border-gray-300 shadow"
//                     style={{ backgroundColor: selectedMetalColor }}
//                   />
//                   <div>
//                     <p className="text-sm font-medium text-gray-800">
//                       Selected: {availableMetalColors.find((c) => c.hex === selectedMetalColor)?.name || "Custom Color"}
//                     </p>
//                     <p className="text-xs text-gray-600">{selectedMetalColor.toUpperCase()}</p>
//                   </div>
//                 </div>
//                 <div className="text-xs text-gray-500">Preview only</div>
//               </div>

//               {/* Current Product Metal Color */}
//               {product.metalColor && (
//                 <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
//                   <div className="flex items-center">
//                     <div
//                       className="w-8 h-8 rounded-full mr-3 border border-gray-300"
//                       style={{ backgroundColor: getMetalColorHex(product.metalColor) }}
//                     />
//                     <div>
//                       <p className="text-sm font-medium text-gray-800">
//                         Original product color: {getMetalColorName(product.metalColor)}
//                       </p>
//                       <p className="text-xs text-gray-600">This is the color specified in the product details</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div>

            
//             <div className="mb-8 pb-6 border-b border-gray-200">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h1 className="text-3xl lg:text-4xl font-serif font-light text-gray-900 tracking-tight leading-tight mb-2">
//                     {displayValue(product.title)}
//                   </h1>
//                   <p className="text-sm text-gray-500 font-light">
//                     SKU: <span className="font-medium">{displayValue(product.sku)}</span>
//                     {product.jewelleryCategory && (
//                       <span className="ml-4 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
//                         {product.jewelleryCategory}
//                       </span>
//                     )}
//                   </p>
//                 </div>

          
//                 {/* Premium Custom Order CTA */}
// <div className="mt-6 text-center">

//   <button
//   type="button"
//   onClick={() => {
//     navigate("/orders/new", {
//       state: {
//         initialProduct: {
//           productRef: product._id,
//           title: product.title,
//           jewelleryCategory: product.jewelleryCategory,
//           description: product.description,
//           metalType: product.metalType,
//           metalPurity: product.metalPurity,
//           metalColor: product.metalColor,
//           netWeight: product.netWeight,
//           grossWeight: product.grossWeight,
//           components: product.components || [],
//           hsnCode: product.hsnCode,
//           certificateNo: product.certificateNo,
//           images: product.images || [],   // ✅ SEND ALL IMAGES
//         },
//       },
//     });
//   }}
//   className="group inline-flex items-center gap-2 text-sm font-medium text-[#4A2840] hover:text-[#D4AF37] transition-colors"
// >
//   <span className="border-b border-transparent group-hover:border-[#D4AF37] transition-all duration-300">
//     Customize This Design
//   </span>
// </button>

//   <p className="text-xs text-gray-400 mt-2">
//     Modify metal, stones or create a bespoke variation
//   </p>
// </div>

//                 <Link
//                   to={`/edit/${product.sku}`}
//                   className="flex items-center justify-center w-12 h-full bg-[#F5F5F4] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917] rounded-sm transition-colors"
//                 >
//                   Edit
//                 </Link>
//               </div>

//               <p className="text-gray-600 font-light leading-relaxed">
//                 {displayValue(product.description) || "A beautifully crafted piece of jewellery with exquisite details and premium quality."}
//               </p>

//               {/* FIXED ALIGNMENT HERE */}
//               <div className="mt-4 flex justify-between items-end">
//                 {/* Grouped Availability so it stays on the left */}
//                 <div className="flex items-center pb-1">
//                   <span className="text-sm text-gray-600 mr-3">Availability:</span>
//                   <span className={`text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
//                     {product.stock > 0 ? `✓ ${product.stock} in stock` : "✗ Out of stock"}
//                   </span>
//                 </div>

//                 {/* Gross Weight box neatly pushed to the right */}
//                 <div className="flex flex-col">
//                   <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">
//                     Gross Weight
//                   </span>
//                   <div className="inline-flex items-center justify-center border-2 border-gray-200 bg-[#F4F4F4] text-gray-700 px-5 py-2 text-sm font-medium w-fit min-w-[80px]">
//                     {product.grossWeight ? `${displayValue(product.grossWeight)} g` : "-"}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Product Specifications */}
//             <div className="space-y-8 mb-10">
    
//               {/* Metal Details Card */}
//               {product.metalType && (
//                 <div className="bg-[#F2F2F2] border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow duration-300">
//                   <h3 className="font-serif text-lg text-[#1C1917] mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
//                     Metal Composition
//                     <div
//                       className="w-3.5 h-3.5 rounded-full shadow-sm border border-black/10"
//                       style={{ backgroundColor: getMetalColorHex(product.metalColor) }}
//                     />
//                   </h3>
//                   <div className="grid grid-cols-2 gap-y-4 gap-x-6">
//                     <SpecItem label="Type" value={displayValue(product.metalType)} />
//                     <SpecItem label="Purity" value={displayValue(product.metalPurity)} />
//                     <SpecItem label="Color" value={getMetalColorName(product.metalColor)} />
//                     <SpecItem label="Net Weight" value={product.netWeight ? `${displayValue(product.netWeight)} g` : "-"} />
//                     {/* <SpecItem label="Gross Weight" value={product.grossWeight ? `${displayValue(product.grossWeight)} g` : "-"} /> */}
//                    <SpecItem 
//   label="Fine Gold" 
//   value={`${displayValue(product.fineGold)} g`} 
// />
//                   </div>
//                 </div>
//               )}

              
//               {diamonds.length > 0 && (

//   <div className="bg-[#F2F2F2] border border-gray-100 rounded-xl p-6">
//   <h3 className="font-serif text-lg text-[#1C1917] mb-4 border-b border-gray-200 pb-3 flex items-center justify-between">
//     Diamonds
//     <span className="text-xs text-gray-400 font-medium">
//      Set of Diamonds : {diamonds.length} 
//     </span>
//   </h3>

//   <div className="space-y-3">
//     {diamonds.map((stone, index) => (
//       <div
//         key={`dia-${index}`}
//         className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-white border border-gray-100 rounded-lg gap-3"
//       >
//         {/* LEFT SIDE */}
//         <div className="flex items-center gap-3">
//           <span className="w-7 h-7 rounded-full bg-[#1C1917] text-[#D4AF37] text-xs font-serif flex items-center justify-center">
//             D{index + 1}
//           </span>

//           <div>
//             <span className="font-medium text-[#1C1917] text-sm block">
//               {formatComponentType(stone.type)}
//             </span>
//             <span className="text-[10px] text-gray-500 uppercase tracking-wider">
//               {stone.componentRole}
//             </span>
//           </div>
//         </div>

//         {/* RIGHT SIDE SPECS */}
//         <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">

//           {/* Quality */}
//           {stone.shape && (
//             <span className="text-gray-500">
//               Shape: <span className="text-gray-900 font-medium">{stone.shape}</span>
//             </span>
//           )}

//           {stone.cut && (
//             <span className="text-gray-500">
//               Cut: <span className="text-gray-900 font-medium">{stone.cut}</span>
//             </span>
//           )}

//           {stone.color && (
//             <span className="text-gray-500">
//               Color: <span className="text-gray-900 font-medium">{stone.color}</span>
//             </span>
//           )}

//           {stone.clarity && (
//             <span className="text-gray-500">
//               Clarity: <span className="text-gray-900 font-medium">{stone.clarity}</span>
//             </span>
//           )}

//           {/* Measurements */}
//           {/* <span className="text-gray-500">
//             Size: <span className="text-gray-900 font-medium">{stone.size || "-"} mm</span>
//           </span> */}
//           {stone.size && (
//               <span className="text-gray-900 font-medium">Size : {stone.size || "-"} mm
//              </span>
//           )}

//           <span className="text-gray-500">
//             Weight: <span className="text-gray-900 font-medium">{stone.weight || "-"} ct</span>
//           </span>

//           <span className="text-gray-500">
//             Count: <span className="text-gray-900 font-medium">{stone.count || 1}</span>
//           </span>

//           <span className="text-gray-500">
//             Total : <span className="text-gray-900 font-medium">{stone.grossWeight || "-"} ct</span>
//           </span>

//         </div>
        
//       </div>
//     ))}
//     <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs flex justify-between mb-3">
//   <span>Total Count: <strong>{totalDiamondCount}</strong></span>
//   <span>Total Weight: <strong>{totalDiamondWeight.toFixed(3)} ct</strong></span>
// </div>

//   </div>
  
// </div>
// )}


// {gemstones.length > 0 && (
//   <div className="bg-[#F2F2F2] border border-gray-100 rounded-xl p-6">
//     <h3 className="font-serif text-lg text-[#1C1917] mb-4 border-b border-gray-200 pb-3 flex items-center justify-between">
//       Gemstones
//       <span className="text-xs text-gray-400 font-medium">
//       Set of Stones : {gemstones.length} 
//       </span>
//     </h3>

//     <div className="space-y-3">
//       {gemstones.map((stone, index) => (
//         <div
//           key={`gem-${index}`}
//           className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
//         >
//           <div className="flex items-center gap-3 mb-2 sm:mb-0">
//             <span className="w-7 h-7 rounded-full bg-gray-50 text-gray-500 text-xs font-serif flex items-center justify-center border border-gray-200">
//               G{index + 1}
//             </span>
//             <div>
//               <span className="font-medium text-[#1C1917] text-sm block">
//                 {formatComponentType(stone.type)}
//               </span>
//               <span className="text-[10px] text-gray-500 uppercase tracking-wider">
//                 {stone.componentRole}
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-4 text-xs">
//             {stone.shape && (
//               <span className="text-gray-500">
//                 Shape: <span className="text-gray-900 font-medium">{stone.shape}</span>
//               </span>
//             )}
//             {stone.color && (
//               <span className="text-gray-500">
//                 Color: <span className="text-gray-900 font-medium">{stone.color}</span>
//               </span>
//             )}
//             {stone.clarity && (
//               <span className="text-gray-500">
//                 Clarity: <span className="text-gray-900 font-medium">{stone.clarity}</span>
//               </span>
//             )}
//             <span className="text-gray-500">
//               weight:{" "}
//               <span className="text-gray-900 font-medium">
//                 {stone.weight || "-"}{" "}
//                 {["Polki", "Moissanite"].includes(stone.type) ? "ct" : "ct"}
//               </span>
//             </span>
//             <span className="text-gray-500">
//               Count: <span className="text-gray-900 font-medium">{stone.count || 1}</span>
//             </span>
//           </div>
//         </div>
//       ))}

// <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs flex justify-between mb-3">
//   <span>Total Count: <strong>{totalGemstoneCount}</strong></span>
//   <span>Total Weight: <strong>{totalGemstoneWeight.toFixed(3)}</strong> ct</span>
// </div>
      
//     </div>
//   </div>
// )}

//               {/* Compliance Info */}
//               {(product.hsnCode || product.huid || product.certificateNo) && (
//                 <div className="bg-[#F2F2F2] p-5 rounded-xl border border-gray-100">
//                   <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Compliance & Certification</h4>
//                   <div className="grid grid-cols-3 gap-2">
//                     {product.huid && <SpecItem label="HUID" value={displayValue(product.huid)} />}
//                     {product.hsnCode && <SpecItem label="HSN Code" value={displayValue(product.hsnCode)} />}
//                     {product.certificateNo && (
                     
//                         <SpecItem label="Certificate No" value={displayValue(product.certificateNo)} />
                     
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Quality Assurance */}
//               {/* <div className="bg-[#F2F2F2] p-6 rounded-lg">
//                 <h3 className="font-serif text-xl text-gray-900 mb-4">Quality Assurance</h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                   <CertItem text="BIS Hallmark Certified" />
//                   {hasComponents && product.components.some(c => c.type === "Diamond") && (
//                     <CertItem text="GIA Certified Diamonds" />
//                   )}
//                   <CertItem text="100% Authentic Jewellery" />
//                   <CertItem text="Secure Prong Setting" />
//                   <CertItem text="Nickel-Free Alloy" />
//                   <CertItem text="Trusted by Jewellery Professionals" />
//                 </div>
//               </div> */}
//             </div>

//             {/* Action Section */}
//             <div className="pt-8 border-t border-gray-200">
             
              
//               <div className="pt-8 border-t border-gray-200 mt-auto space-y-6">

//   {/* ================= PRICE SECTION ================= */}
//   <div className="bg-[#F8F6F2] border border-[#E5DFD2] p-6 rounded-md">
//     {product?.pricing?.grandTotal != null ? (
//       <>
//         <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
//           EST. Price
//         </p>

//         <div className="flex items-end gap-3">
//           <p className="text-3xl font-serif text-[#4A2840]">
//             ₹{Number(product.pricing.grandTotal * quantity).toLocaleString("en-IN")}
//           </p>
//           <span className="text-xs text-gray-500 pb-1">
//             Inclusive of GST
//           </span>
//         </div>

//         {quantity > 1 && (
//           <p className="text-xs text-gray-500 mt-1">
//             ₹{Number(product.pricing.grandTotal).toLocaleString("en-IN")} × {quantity}
//           </p>
//         )}
//       </>
//     ) : (
//       <span className="text-sm text-gray-400">Calculating price...</span>
//     )}
//   </div>


//   {/* ================= CONTROLS ================= */}
//   <div className="flex flex-wrap items-center gap-4">

//     {/* Quantity Selector */}
//     <div className="flex items-center bg-[#F4F4F4] rounded h-[42px] w-[110px]">
//       <button
//         onClick={() => setQuantity((q) => Math.max(1, q - 1))}
//         className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 transition-colors rounded-l disabled:opacity-50"
//         disabled={product.stock <= 0}
//       >
//         −
//       </button>

//       <input
//         type="number"
//         min="1"
//         max={product.stock}
//         value={quantity}
//         onChange={(e) => {
//           const val = Math.min(Math.max(1, +e.target.value || 1), product.stock);
//           setQuantity(val);
//         }}
//         className="w-full h-full text-center bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 font-medium"
//         disabled={product.stock <= 0}
//       />

//       <button
//         onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
//         className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-200 transition-colors rounded-r disabled:opacity-50"
//         disabled={product.stock <= 0}
//       >
//         +
//       </button>
//     </div>

//     {/* Add To Cart */}
//     <button
//       onClick={handleAddToCart}
//       disabled={product.stock <= 0}
//       className="h-[42px] px-6 bg-[#4A2840] text-white text-sm font-medium rounded hover:bg-[#3A1E31] transition-colors disabled:opacity-50 whitespace-nowrap"
//     >
//       Add To Cart
//     </button>

//     {/* Buy Now */}
//     <button
//       onClick={() => {
//         if (product.stock > 0) {
//           handleAddToCart();
//           navigate("/checkout/calculate");
//         }
//       }}
//       disabled={product.stock <= 0}
//       className="h-[42px] px-8 bg-[#4A2840] text-white text-sm font-medium rounded hover:bg-[#3A1E31] transition-colors disabled:opacity-50 whitespace-nowrap"
//     >
//       Buy Now
//     </button>

//   </div>


//   {/* ================= STATUS ROW ================= */}
//   <div className="flex items-center justify-between text-xs font-medium tracking-wide">

//     <div>
//       {product.stock > 0 ? (
//         <span className="text-emerald-600">
//           {product.stock} available in stock
//         </span>
//       ) : (
//         <span className="text-red-500">
//           Currently unavailable
//         </span>
//       )}
//     </div>

//     <button
//       onClick={() => navigate("/cart")}
//       className="text-gray-500 hover:text-[#4A2840] transition-colors flex items-center gap-1 group"
//     >
//       View Cart
//       <svg
//         className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
//       </svg>
//     </button>

//   </div>

// </div>

//               {/* Assurance Note */}
//               <p className="text-center text-sm text-gray-500 pt-6 border-t border-gray-100">
//                 ✦ Complimentary Insured Shipping ✦ 30-Day Return Policy ✦ Lifetime Warranty ✦
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Add CSS for fade-in animation */}
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// // Helper Components
// function SpecItem({ label, value }) {
//   return (
//     <div className="py-2">
//       <p className="text-sm text-gray-500 mb-1 font-light">{label}</p>
//       <p className="text-gray-900 font-medium">{value}</p>
//     </div>
//   );
// }

// function CertItem({ text }) {
//   return (
//     <div className="flex items-center">
//       <svg className="w-4 h-4 text-[#d4af37] mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//         <path
//           fillRule="evenodd"
//           d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//           clipRule="evenodd"
//         />
//       </svg>
//       <span className="text-gray-700 text-sm">{text}</span>
//     </div>
//   );
// }







// import { useParams, Link } from "react-router-dom";
// import { useEffect, useState, useRef } from "react";
// import API from "../api/productApi";
// import Loader from "../components/Loader";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext";
// import { getImageUrl } from "../utils/getImageUrl";
// import '../index.css';


// const displayValue = (v) =>
//   v !== undefined && v !== null && v !== "" ? v : "-";

// // Helper function to get metal color name
// const getMetalColorName = (colorValue) => {
//   const colorMap = {
//     "yellow-gold": "Yellow Gold",
//     "white-gold": "White Gold",
//     "rose-gold": "Rose Gold",
//     "silver": "Silver",
//     "platinum": "Platinum"
//   };
//   return colorMap[colorValue] || colorValue;
// };

// // Helper function to get metal color hex
// const getMetalColorHex = (colorValue) => {
//   const colorMap = {
//     "yellow-gold": "#E5A93D", // Refined gold color
//     "white-gold": "#EBEFEF", // Refined white gold color
//     "rose-gold": "#D49C9C",  // Refined rose gold color
//     "silver": "#C0C0C0",
//     "platinum": "#E5E4E2"
//   };
//   return colorMap[colorValue] || "#FFD700";
// };

// // Helper to format component type for display
// const formatComponentType = (type) => {
//   if (!type) return "";
//   return type.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
// };

// export default function SingleProduct() {
//   const navigate = useNavigate();
//   const { sku } = useParams();
//   const { addProduct } = useCart();

//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [showToast, setShowToast] = useState(false);
//   const [selectedMetalColor, setSelectedMetalColor] = useState("#E5A93D");
//   const [isZooming, setIsZooming] = useState(false);
//   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
//   const [zoomScale, setZoomScale] = useState(2);

//   const imageRef = useRef(null);
//   const containerRef = useRef(null);

//   const [selectedImage, setSelectedImage] = useState("");

//   const resolveImage = (img) => getImageUrl(img);
  
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         const res = await API.get(`/sku/${sku}`);
//         const prod = res.data.product;

//         setProduct(prod);

//         /* ---------------- METAL COLOR ---------------- */
//         if (prod?.metalColor) {
//           const initialColor = getMetalColorHex(prod.metalColor);
//           setSelectedMetalColor(initialColor);
//         }

//         /* ---------------- MULTIPLE IMAGES ---------------- */
//         if (prod?.images && prod.images.length > 0) {
//           setSelectedImage(resolveImage(prod.images[0]));
//         }

//       } catch (err) {
//         setError("Product not found");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [sku]);

//   const handleMouseMove = (e) => {
//     if (!containerRef.current || !imageRef.current) return;
//     const container = containerRef.current;
//     const rect = container.getBoundingClientRect();
//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;
//     setZoomPosition({ x, y });
//     setIsZooming(true);
//   };

//   const handleMouseLeave = () => {
//     setIsZooming(false);
//   };

//   const handleAddToCart = async () => {
//     if (!product || product.stock <= 0) return;
//     try {
//       await addProduct(product._id, quantity);
//       setShowToast(true);
//       setTimeout(() => setShowToast(false), 2000);
//     } catch (err) {
//       console.error("Add to cart failed", err);
//     }
//   };

//   // Group components by type for display
//   const getComponentsByType = () => {
//     if (!product?.components) return {};
//     return product.components.reduce((acc, component) => {
//       const type = component.type || "Other";
//       if (!acc[type]) acc[type] = [];
//       acc[type].push(component);
//       return acc;
//     }, {});
//   };

//   if (loading) return <Loader text="Loading masterpiece..." />;

//   if (error || !product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4 bg-white">
//         <div className="text-center max-w-md">
//           <h1 className="text-2xl font-serif font-light text-gray-800 mb-3">{error}</h1>
//           <Link to="/" className="inline-block px-8 py-3 border border-gray-300 text-gray-700 font-serif hover:bg-gray-50 transition-colors">
//             ← Back to Collection
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const imageUrl = product?.images?.length > 0 ? resolveImage(product.images[0]) : "/placeholder.png";

//   const availableMetalColors = [
//     { value: "yellow-gold", name: "Yellow Gold", hex: "#EFBF04" },
//     { value: "white-gold", name: "White Gold", hex: "#EBEFEF" },
//     { value: "rose-gold", name: "Rose Gold", hex: "#DEA193" },
//   ];

//   const diamonds = product.components?.filter(c => c.type === "Diamond") || [];
//   const gemstones = product.components?.filter(c => c.type !== "Diamond") || [];

//   return (
//     <div className="min-h-screen bg-[#FAFAFA] text-[#2D2A26] font-sans pb-20">
      
//       {/* Premium Toast Notification */}
//       {showToast && (
//         <div className="fixed top-8 right-8 bg-[#62304A] text-white px-6 py-4 rounded-md shadow-xl z-50 animate-fade-in flex items-center gap-3">
//           <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
//           <p className="text-sm font-medium tracking-wide">Added to collection successfully</p>
//         </div>
//       )}

//       <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
//         {/* Main Product Container */}
//         <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          
//           {/* ================= LEFT COLUMN ================= */}
//           <div className="lg:col-span-5 flex flex-col gap-8">
            
//             {/* Image Gallery Area */}
//             <div className="flex flex-col gap-4">
//               {/* Main Image */}
//               <div
//                 ref={containerRef}
//                 className="relative w-full aspect-square bg-[#111111] rounded-2xl overflow-hidden cursor-crosshair flex items-center justify-center shadow-sm"
//                 onMouseMove={handleMouseMove}
//                 onMouseLeave={handleMouseLeave}
//               >
//                 <img
//                   ref={imageRef}
//                   src={selectedImage}
//                   alt={product?.title}
//                   className={`w-full h-full object-cover transition-opacity duration-200 ${isZooming ? 'opacity-0' : 'opacity-100'}`}
//                 />
//                 <div
//                   className={`absolute inset-0 pointer-events-none bg-black transition-opacity duration-200 ease-out ${isZooming ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
//                   style={{
//                     backgroundImage: `url(${selectedImage})`,
//                     backgroundRepeat: 'no-repeat',
//                     backgroundSize: `${(zoomScale || 2) * 100}%`,
//                     backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
//                   }}
//                 />
//                 <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
//                   <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
//                 </div>
//               </div>

//               {/* Horizontal Thumbnails */}
//               {product?.images?.length > 1 && (
//                 <div className="flex items-center gap-2">
//                   <button 
//                     onClick={() => {
//                       const idx = product.images.findIndex((img) => resolveImage(img) === selectedImage);
//                       if (idx > 0) setSelectedImage(resolveImage(product.images[idx - 1]));
//                     }}
//                     className="w-8 h-16 flex items-center justify-center text-gray-400 hover:text-gray-800"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
//                   </button>
                  
//                   <div className="flex flex-1 gap-3 overflow-x-auto no-scrollbar justify-center">
//                     {product.images.map((img, index) => {
//                       const imgUrl = resolveImage(img);
//                       const isSelected = selectedImage === imgUrl;
//                       return (
//                         <button
//                           key={index}
//                           onClick={() => setSelectedImage(imgUrl)}
//                           className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${isSelected ? "border-[#62304A] p-0.5" : "border-transparent"}`}
//                         >
//                           <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover bg-black rounded-lg" />
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button 
//                     onClick={() => {
//                       const idx = product.images.findIndex((img) => resolveImage(img) === selectedImage);
//                       if (idx < product.images.length - 1 && idx !== -1) setSelectedImage(resolveImage(product.images[idx + 1]));
//                     }}
//                     className="w-8 h-16 flex items-center justify-center text-gray-400 hover:text-gray-800"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Select Metal Color (Matched to Reference Image) */}
//             <div className="mt-4">
//               <h3 className="font-serif text-xl text-gray-900 mb-1">Select Metal Color</h3>
//               <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">Exquisite finishes tailored for your style</p>
//               <div className="grid grid-cols-3 gap-3">
//                 {availableMetalColors.map((color) => (
//                   <button
//                     key={color.value}
//                     onClick={() => setSelectedMetalColor(color.hex)}
//                     className={`flex flex-col items-center justify-center py-5 px-2 rounded-xl border transition-all ${
//                       selectedMetalColor === color.hex ? "border-[#62304A] shadow-[0_4px_12px_rgba(98,48,74,0.08)] bg-white" : "border-gray-200 bg-white/50 hover:bg-white"
//                     }`}
//                   >
//                     <div 
//                       className={`w-8 h-8 rounded-full mb-3 shadow-inner ${selectedMetalColor === color.hex ? 'ring-2 ring-offset-2 ring-[#62304A]' : ''}`} 
//                       style={{ backgroundColor: color.hex, backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)' }}
//                     />
//                     <span className="text-[10px] font-bold text-gray-800 tracking-wider uppercase">{color.name}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>

//           </div>


//           {/* ================= RIGHT COLUMN ================= */}
//           <div className="lg:col-span-7 flex flex-col">
            
//             {/* Header / Badges */}
//             <div className="flex justify-between items-start mb-4">
//               <div className="flex items-center gap-3">
//                 <span className="bg-[#F8EFF3] text-[#62304A] text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm">
//                   Exclusive Collection
//                 </span>
//                 <span className="text-[10px] text-gray-400 tracking-widest">
//                   SKU: {displayValue(product.sku)}
//                 </span>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     navigate("/orders/new", {
//                       state: {
//                         initialProduct: { ...product, productRef: product._id },
//                       },
//                     });
//                   }}
//                   className="border border-gray-200 text-gray-600 text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-sm hover:border-[#62304A] hover:text-[#62304A] transition-colors"
//                 >
//                   Create Custom Order
//                 </button>
//                 <Link to={`/edit/${product.sku}`} className="flex items-center gap-1 border border-gray-200 text-gray-600 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-sm hover:bg-gray-50">
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
//                   Edit
//                 </Link>
//               </div>
//             </div>

//             {/* Title & Description */}
//             <h1 className="text-[42px] font-serif text-[#62304A] leading-tight mb-3">
//               {displayValue(product.title)}
//             </h1>
//             <p className="text-sm text-gray-500 font-light leading-relaxed mb-5 max-w-2xl">
//               {displayValue(product.description) || "A mesmerizing symphony of light, this diamond bracelet features hand-selected brilliant-cut stones set in premium gold."}
//             </p>

//             {/* Availability & Gross Weight */}
//             <div className="flex flex-col gap-3 mb-8">
//               {product.stock > 0 ? (
//                 <div className="inline-flex items-center gap-2 bg-[#E6F4EA] text-[#1E7D47] px-3 py-1.5 rounded text-[11px] font-bold tracking-wider w-fit">
//                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
//                   {product.stock} LIMITED PIECES LEFT
//                 </div>
//               ) : (
//                 <div className="inline-flex items-center gap-2 bg-[#FCE8E8] text-[#D12E2E] px-3 py-1.5 rounded text-[11px] font-bold tracking-wider w-fit">
//                   OUT OF STOCK
//                 </div>
//               )}
//               <div className="text-xs text-gray-800 tracking-wide font-medium">
//                 <span className="text-gray-400 uppercase tracking-widest mr-2 text-[10px]">Gross Weight :</span> {product.grossWeight ? `${displayValue(product.grossWeight)} gm` : "-"}
//               </div>
//             </div>

//             {/* ================= SPECIFICATIONS CARDS ================= */}
//             <div className="space-y-8 flex-1">
              
//               {/* Metal Specifications */}
//  <div className="space-y-10 flex-1">
//   {/* Metal Specifications */}
//   {product.metalType && (
//     <div className="group">
//       <SectionHeader title="Metal Specification" />
//       <div 
//       className="card-luxury-gradient bg-spec-pattern border border-[#EBEBEB] rounded-[22px] p-6 flex flex-wrap lg:flex-nowrap justify-between items-center shadow-sm"
      
//       >
//         <div className="flex flex-wrap gap-8 lg:gap-14 pl-2">
//           <SpecBlock label="Type" value={displayValue(product.metalType)} />
//           <SpecBlock label="Purity" value={displayValue(product.metalPurity)} />
//           <SpecBlock label="Color" value={getMetalColorName(product.metalColor)} />
//           <SpecBlock label="Net Weight" value={product.netWeight ? `${displayValue(product.netWeight)} gm` : "-"} />
//         </div>
        
//         {product.fineGold && (
//           <div className="bg-[#663253] backdrop-blur-md border border-white rounded-2xl px-6 py-4 shadow-sm  text-right">
//             <p className="text-[10px] font-bold tracking-[0.15em] text-white/60 uppercase mb-1">Fine Gold</p>
//             <p className="text-white font-serif italic text-xl leading-none">
//               {displayValue(product.fineGold)} <span className="text-xs font-sans not-italic font-medium">g</span>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   )}

//   {/* Primary Diamond Details */}
//   {diamonds.map((stone, idx) => (
//     <div key={`dia-${idx}`} className="group">
//       <SectionHeader title={idx === 0 ? "Primary Diamond Details" : "Additional Diamond Details"} />
//       <div className="card-luxury-gradient bg-spec-pattern border border-[#EBEBEB] rounded-[22px] p-7 flex flex-col lg:flex-row justify-between relative shadow-sm overflow-hidden">
        
//         {/* Background Decorative Element */}
//         <div className="absolute -right-6 -bottom-6 text-[#663253] opacity-[0.04] pointer-events-none transform rotate-12">
//            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 7-3 13H6L3 9l9-7z"/></svg>
//         </div>
        
//         <div className="w-full lg:w-3/5 grid grid-cols-3 gap-y-8 relative z-10">
//           <SpecBlock label="Shape" value={stone.shape || "-"} />
//           <SpecBlock label="Color" value={stone.color || "-"} />
//           <SpecBlock label="Clarity" value={stone.clarity || "-"} />
//           <SpecBlock label="Size" value={stone.size ? `${stone.size} mm` : "-"} />
//           <SpecBlock label="Weight" value={stone.weight ? `${stone.weight} ct` : "-"} />
//           <SpecBlock label="Count" value={stone.count || 1} />
//         </div>

//         <div className="w-full lg:w-1/3 mt-8 lg:mt-0 flex flex-col justify-center relative z-10">
//           <div className="bg-[#663253] backdrop-blur-lg border border-white/50 rounded-[20px] p-6 flex justify-around items-center shadow-inner">
//             <div className="text-center">
//               <p className="text-[9px] font-bold tracking-widest text-white/70 uppercase mb-2">Quantity</p>
//               <p className="text-white font-serif italic text-2xl">
//                 {stone.count || 1} <span className="text-xs font-sans text-slate-400 not-italic text-white">pcs</span>
//               </p>
//             </div>
//             <div className="w-px h-12 bg-[#663253]/10"></div>
//             <div className="text-center">
//               <p className="text-[9px] font-bold tracking-widest text-white/70 uppercase mb-2">Total Carat</p>
//               <p className="text-white font-serif italic text-2xl">
//                 {Number(stone.grossWeight || stone.weight || 0).toFixed(3)} <span className="text-xs font-sans text-white not-italic ">ct</span>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   ))}

//   {/* Compliance & Certification */}
//   {(product.hsnCode || product.huid || product.certificateNo) && (
//     <div>
//       <SectionHeader title="Compliance & Certification" />
//       <div className="bg-[#f9f9f9] border border-[#EBEBEB] rounded-[22px] p-6 flex justify-between items-center shadow-sm">
//         <div className="flex w-full justify-between items-center pr-4">
//            <SpecBlock label="HUID Number" value={displayValue(product.huid)} />
//            <SpecBlock label="HSN Code" value={displayValue(product.hsnCode)} />
//            <div >
//               <p className="text-[8px] uppercase tracking-[0.2em] opacity-70 mb-1">Authenticity ID</p>
//               <p className="text-sm font-medium tracking-wider">{displayValue(product.certificateNo)}</p>
//            </div>
//         </div>
//       </div>
//     </div>
//   )}
// </div>

//               {/* Quality Assurance */}
//               <div>
//                 <SectionHeader title="Quality Assurance" />
//                 <div className="bg-white border border-[#EBEBEB] rounded-[14px] p-6 shadow-sm">
//                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-6 gap-x-4">
//                     <QAItem icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" title="BIS Hallmark Certified" desc="Assured Gold Purity" />
//                     <QAItem icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" title="GIA Certified Diamonds" desc="World Standard Clarity" />
//                     <QAItem icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" title="100% Authentic Jewellery" desc="Genuine Materials Only" />
//                     <QAItem icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" title="Secure Prong Setting" desc="Hand-Set Durability" />
//                     <QAItem icon="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" title="Nickel-Free Alloy" desc="Hypoallergenic Finish" />
//                     <QAItem icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" title="Trusted Professionals" desc="Craftsmanship Excellence" />
//                   </div>
//                 </div>
//               </div>

//             </div>

//             {/* ================= PURCHASE / ACTION AREA ================= */}
//             <div className="mt-12 pt-8 border-t border-gray-200">
//               <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-6">
                
//                 {/* Left: Quantity */}
//                 <div className="flex items-center border border-gray-300 rounded-full h-12 w-[140px] bg-white">
//                   <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors rounded-l-full disabled:opacity-50" disabled={product.stock <= 0}>−</button>
//                   <input type="number" min="1" max={product.stock} value={quantity} onChange={(e) => setQuantity(Math.min(Math.max(1, +e.target.value || 1), product.stock))} className="w-full h-full text-center bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-800 p-0" disabled={product.stock <= 0} />
//                   <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors rounded-r-full disabled:opacity-50" disabled={product.stock <= 0}>+</button>
//                 </div>

//                 {/* Right: Price */}
//                 <div className="text-right">
//                   <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-semibold italic">Market Value</p>
//                   <p className="text-[32px] font-serif text-gray-900 leading-none">
//                     {product?.pricing?.grandTotal != null ? `₹${Number(product.pricing.grandTotal * quantity).toLocaleString("en-IN")}` : "Calculating..."}
//                   </p>
//                 </div>

//               </div>

//               {/* Buttons */}
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={product.stock <= 0}
//                   className="h-14 bg-[#62304A] text-white text-[11px] tracking-[0.2em] font-bold uppercase rounded-md hover:bg-[#4d2539] transition-all disabled:opacity-50 shadow-md"
//                 >
//                   Add To Collection
//                 </button>
//                 <button
//                   onClick={() => {
//                     if (product.stock > 0) {
//                       handleAddToCart();
//                       navigate("/cart");
//                     }
//                   }}
//                   disabled={product.stock <= 0}
//                   className="h-14 bg-white border border-[#62304A] text-[#62304A] text-[11px] tracking-[0.2em] font-bold uppercase rounded-md hover:bg-gray-50 transition-all disabled:opacity-50"
//                 >
//                   Buy Now
//                 </button>
//               </div>

//               {/* View Cart Link */}
//               <div className="mt-6 text-center">
//                 <button onClick={() => navigate("/cart")} className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#62304A] transition-colors gap-2">
//                   View Cart
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
//                 </button>
//               </div>

//             </div>
//           </div>
//         </div>

//         {/* Global Footer Assurances */}
//         <div className="mt-20 pt-10 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-8">
//           <FooterItem icon="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" title="Insured Shipping" subtitle="Complimentary Worldwide" />
//           <FooterItem icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" title="Authenticity Guaranteed" subtitle="GIA & IGI Certified" />
//           <FooterItem icon="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" title="Concierge Service" subtitle="24/7 Expert Support" />
//         </div>

//       </div>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in { animation: fadeIn 0.3s ease-out; }
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//     </div>
//   );
// }

// // ---------------- Helper Components ----------------

// function SectionHeader({ title }) {
//   return (
//     <div className="flex items-center gap-4 mb-5">
//       <h3 className="font-serif text-lg italic text-[#663253]">{title}</h3>
//       <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
//     </div>
//   );
// }

// function SpecBlock({ label, value }) {
//   return (
//     <div className="flex flex-col">
//       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</span>
//       <span className="text-sm font-medium text-gray-900">{value}</span>
//     </div>
//   );
// }

// function QAItem({ icon, title, desc }) {
//   return (
//     <div className="flex items-start gap-3">
//       <div className="w-8 h-8 rounded-full bg-[#f3e6ed] text-[#62304A] flex items-center justify-center flex-shrink-0">
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
//       </div>
//       <div>
//         <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wide mb-0.5">{title}</h4>
//         <p className="text-[10px] text-gray-400 uppercase tracking-wider">{desc}</p>
//       </div>
//     </div>
//   );
// }

// function FooterItem({ icon, title, subtitle }) {
//   return (
//     <div className="flex flex-col items-center justify-center">
//       <svg className="w-6 h-6 text-[#62304A] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={icon} /></svg>
//       <h5 className="text-[10px] font-bold tracking-widest uppercase text-gray-800 mb-1">{title}</h5>
//       <p className="text-[9px] uppercase tracking-widest text-gray-400">{subtitle}</p>
//     </div>
//   );
// }