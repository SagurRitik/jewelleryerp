

import { useState, useEffect } from "react";
import API from "../api/productApi";
import { getImageUrl } from "../utils/getImageUrl";
import { Camera, Upload } from "lucide-react";
import Webcam from "react-webcam";
import { useRef } from "react";
import { useModal } from "../context/ModalContext";
/* ======================================================
   COMPONENT TYPES & OPTIONS
   ====================================================== */
const STONE_OPTIONS = [
  "ruby", "pearl", "red-coral", "emerald", "yellow-sapphire",
  "diamond", "blue-sapphire", "hessonite", "cats-eye", "gemstone"
];

import { DIAMOND_COLORS as COLORS_DIAMOND, DIAMOND_CLARITIES as CLARITIES, DIAMOND_SHAPES as SHAPES } from "../utils/diamondConstants";


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

const SelectWithGroups = ({ list, groups, value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={selectClass}
  >
    <option value="">Select</option>

    {/* GROUPS */}
    {Object.keys(groups).map((g) => (
      <option key={g} value={g}>
        {g}
      </option>
    ))}

    {/* INDIVIDUAL */}
    <optgroup label="Individual">
      {list.map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </optgroup>
  </select>
);



const METAL_PURITY_OPTIONS = {
  Gold: ["24KT", "22KT", "18KT", "14KT", "10KT", "9KT"],
  Silver: ["999", "925", "835", "800"],
  Platinum: ["950"],
};

const JEWELLERY_CATEGORIES = [
  "Ring", "Necklace", "Bracelet", "Earring", "Bangle", "Pendant",
  "Other",
];

export default function ProductForm({ existingProduct, onSuccess, onSubmit: outsideSubmit, onCancel, standalone = true }) {

  const [showOptions, setShowOptions] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);

  const { showConfirm, showAlert } = useModal();
  const [previewImage, setPreviewImage] = useState(null);

  /* ======================================================
     INITIAL STATE
     ====================================================== */
  const [form, setForm] = useState({
    title: "",
    description: "",
    jewelleryCategory: "Ring",
    productType: "",
    sku: "",
    stock: "",
    hsnCode: "",
    huid: "",
    // certificateNo: "",
    certificates: [{ certificateNo: "", lab: "" }],
    metalType: "Gold",
    metalPurity: "22KT",
    metalColor: "yellow-gold",
    netWeight: "",
    grossWeight: "",
    fineGold: "",
    targetAudience: "UNISEX",
    diamonds: [],
    gemstones: [],
  });

  const addCertificate = () => {
    setForm(p => ({
      ...p,
      certificates: [...p.certificates, { certificateNo: "", lab: "" }]
    }));
  };

  const removeCertificate = (index) => {
    setForm(p => ({
      ...p,
      certificates: p.certificates.filter((_, i) => i !== index)
    }));
  };

  const updateCertificate = (index, field, value) => {
    setForm(p => {
      const updated = [...p.certificates];
      updated[index][field] = value;
      return { ...p, certificates: updated };
    });
  };



  const toggleRateLock = (index) => {
    setForm((prev) => {
      const diamonds = [...prev.diamonds];

      diamonds[index] = {
        ...diamonds[index],
        rateLocked: !diamonds[index].rateLocked
      };

      return {
        ...prev,
        diamonds
      };
    });
  };

  const toggleGemstoneRateLock = (index) => {
    setForm(prev => {
      const gemstones = [...prev.gemstones];

      gemstones[index] = {
        ...gemstones[index],
        rateLocked: !gemstones[index].rateLocked
      };

      return {
        ...prev,
        gemstones
      };
    });
  };


  // const [image, setImage] = useState(null);
  // const [imagePreview, setImagePreview] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDiamondIndex, setActiveDiamondIndex] = useState(null);
  const [activeGemstoneIndex, setActiveGemstoneIndex] = useState(null);

  /* ======================================================
     EDIT MODE - POPULATE DATA
     ====================================================== */
  useEffect(() => {
    if (existingProduct) {
      const existingComponents = existingProduct.components || [];
      const diamonds = [];
      const gemstones = [];

      existingComponents.forEach(component => {
        if (component.type === "Diamond" || component.type === "Polki" || component.type === "Moissanite") {
          diamonds.push({
            shape: component.shape || "",
            // weight: component.weight || "",

            color: component.color || "D",
            clarity: component.clarity || "VS2",
            // grossWeight: component.grossWeight || "",
            // size: component.size || "",
            count: component.count || 1,
            weight: component.weight ?? "",
            // grossWeight: component.grossWeight ?? "",
            grossWeight: component.grossWeight ?? "",
            fineGold: existingProduct.fineGold ?? "",
            size: component.size ?? "",
            rateOverride: component.rateOverride || null,
            rateLocked: true
          });
        } else {
          gemstones.push({
            name: component.type || "Ruby",
            shape: component.shape || "",
            weight: component.weight || "",
            count: component.count || 1,
            grossWeight: component.grossWeight ?? "",
            rateOverride: component.rateOverride || null,
            rateLocked: true
          });
        }
      });

      setForm({
        title: existingProduct.title || "",
        description: existingProduct.description || "",
        jewelleryCategory: existingProduct.jewelleryCategory || "Ring",
        productType: existingProduct.productType || "",
        sku: existingProduct.sku || "",
        stock: existingProduct.stock ?? 0,
        hsnCode: existingProduct.hsnCode || "",
        huid: existingProduct.huid || "",
        // certificateNo: existingProduct.certificateNo || "",
        certificates: existingProduct.certificates?.length
          ? existingProduct.certificates
          : [{ certificateNo: "", lab: "" }],
        metalType: existingProduct.metalType || "Gold",
        metalPurity: existingProduct.metalPurity || "14KT",
        metalColor: existingProduct.metalColor || "yellow-gold",
        netWeight: existingProduct.netWeight ?? "",
        grossWeight: existingProduct.grossWeight ?? "",
        fineGold: existingProduct.fineGold ?? "",
        targetAudience: existingProduct.targetAudience || "UNISEX",
        diamonds: diamonds,
        gemstones: gemstones,
      });


      if (existingProduct.images && existingProduct.images.length > 0) {
        const firstImg = existingProduct.images[0];
        if (typeof firstImg === 'string') {
          // Server-stored image path 
          setExistingImages(existingProduct.images);
          setImagePreviews(existingProduct.images.map(img => getImageUrl(img)));
        } else {
          // Local File object (during purchase entry)
          setImages(existingProduct.images);
          setImagePreviews(existingProduct.images.map(img => {
            try { return URL.createObjectURL(img); } catch (e) { return ""; }
          }));
        }
      }
    }
  }, [existingProduct]);

  /* ======================================================
     HANDLERS
     ====================================================== */
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "metalType") {
      const firstPurity = METAL_PURITY_OPTIONS[value][0];
      setForm((p) => ({
        ...p,
        metalType: value,
        metalPurity: firstPurity,
        metalColor: value === "Gold" ? "yellow-gold" : value === "Silver" ? "silver" : "platinum",
      }));
      return;
    }

    if (type === "number") {
      setForm((p) => ({ ...p, [name]: value === "" ? "" : Number(value) }));
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Append new files instead of replacing
    setImages((prev) => [...prev, ...files]);

    const previews = files.map(file =>
      URL.createObjectURL(file)
    );

    setImagePreviews((prev) => [...prev, ...previews]);

    // Reset input so same file can be selected again
    e.target.value = null;
  };


  const disableScrollOnFocus = (e) => {
    const el = e.target;

    const handler = (evt) => {
      evt.preventDefault(); // 🔥 main fix
    };

    el.addEventListener("wheel", handler, { passive: false });

    const cleanup = () => {
      el.removeEventListener("wheel", handler);
      el.removeEventListener("blur", cleanup);
    };

    el.addEventListener("blur", cleanup);
  };



  /* ======================================================
     DIAMOND & GEMSTONE MANAGEMENT
     ====================================================== */
  const addDiamond = () => {
    setForm(p => ({
      ...p,
      diamonds: [...p.diamonds, {
        shape: "", weight: "", grossWeight: "",
        size: "", color: "D", clarity: "VS2", count: "", rateOverride: null, rateLocked: true
      }]
    }));
    setActiveDiamondIndex(form.diamonds.length);
  };

  const removeDiamond = (index) => {
    setForm(p => ({ ...p, diamonds: p.diamonds.filter((_, i) => i !== index) }));
    if (activeDiamondIndex === index) setActiveDiamondIndex(null);
    else if (activeDiamondIndex > index) setActiveDiamondIndex(activeDiamondIndex - 1);
  };

  const updateDiamond = (index, field, value) => {
    setForm(p => {
      const updated = [...p.diamonds];

      updated[index] = {
        ...updated[index],
        [field]:
          field === "grossWeight" || field === "count"
            ? (value === "" ? "" : Number(value))
            : value
      };

      // const grossWeight = Number(updated[index].grossWeight) || 0;
      // const count = Number(updated[index].count) || 0;

      // if (count > 0) {
      //   // updated[index].weight = Number((grossWeight / count).toFixed(3)); // ✅ FIXED
      //   updated[index].weight = Number((grossWeight / count));
      // } else {
      //   updated[index].weight = 0;
      // }


      if (field === "grossWeight" || field === "count") {
  const grossWeight = Number(updated[index].grossWeight) || 0;
  const count = Number(updated[index].count) || 0;

  updated[index].weight = count > 0 ? grossWeight / count : 0;
}

      return { ...p, diamonds: updated };
    });
  };

  const addGemstone = () => {
    setForm(p => ({
      ...p,
      gemstones: [...p.gemstones, { name: "Ruby", shape: "", weight: "",grossWeight: "", count: 1, rateOverride: null, rateLocked: true }]
    }));
    setActiveGemstoneIndex(form.gemstones.length);
  };

  const removeGemstone = (index) => {
    setForm(p => ({ ...p, gemstones: p.gemstones.filter((_, i) => i !== index) }));
    if (activeGemstoneIndex === index) setActiveGemstoneIndex(null);
    else if (activeGemstoneIndex > index) setActiveGemstoneIndex(activeGemstoneIndex - 1);
  };

  // const updateGemstone = (index, field, value) => {
  //   setForm(p => {
  //     const updated = [...p.gemstones];
  //     updated[index] = { ...updated[index], [field]: value };
  //     return { ...p, gemstones: updated };
  //   });
  // };

 const updateGemstone = (index, field, value) => {
  setForm(p => {
    const updated = [...p.gemstones];

    updated[index] = {
      ...updated[index],
      [field]:
        field === "grossWeight" || field === "count"
          ? (value === "" ? "" : Number(value))
          : value
    };

    // const total = Number(updated[index].grossWeight) || 0;
    // const count = Number(updated[index].count) || 0;

    // if (count > 0) {
    //   updated[index].weight = Number((total / count));
    // } else {
    //   updated[index].weight = 0;
    // }

//     if (field === "grossWeight" || field === "count") {
//   const total = Number(updated[index].grossWeight) || 0;
//   const count = Number(updated[index].count) || 0;

//   updated[index].weight = count > 0 ? total / count : 0;
// }

if (field === "grossWeight" || field === "count") {
  const grossWeight = Number(updated[index].grossWeight) || 0;
  const count = Number(updated[index].count) || 0;

  updated[index].weight = count > 0 ? grossWeight / count : 0;
}

    return { ...p, gemstones: updated };
  });
};

  /* ======================================================
     SUBMIT
     ====================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      const fieldsToAppend = [
        "title", "description", "jewelleryCategory", "productType", "sku", "stock",
        "hsnCode", "huid", "metalType", "metalPurity", "metalColor",
        "netWeight", "grossWeight", "fineGold", "targetAudience",
      ];


      fieldsToAppend.forEach((field) => {
        if (form[field] !== undefined && form[field] !== null) {
          // 🔥 ALLOW EMPTY STRING TO CLEAR FIELDS (HSN, HUID, etc)
          formData.append(field, form[field]);
        }
      });



      /* ---------------- COMPONENTS ---------------- */
      const components = [];

      form.diamonds.forEach((diamond) => {
        components.push({
          type: "Diamond",
          componentRole: "MAIN",
          category: "",
          shape: diamond.shape,
          color: diamond.color,
          clarity: diamond.clarity,
          cut: "",
          // certificateNo: "",
          // certificates: form.certificates,
          count: diamond.count,
          weight: diamond.weight,
          grossWeight: Number(diamond.grossWeight || 0),
          //  size: Number(diamond.size || 0),
          size: diamond.size,
          pricingRef: "DIAMOND",
          rateOverride: diamond.rateOverride,
          settingApplicable: false,
          settingRuleRef: "",

        });
      });

      form.gemstones.forEach((gemstone) => {
        components.push({
          type: gemstone.name,
          componentRole: "SIDE",
          category: "",
          shape: gemstone.shape,
          color: "",
          clarity: "",
          cut: "",
          // certificateNo: "",
          //  certificates: form.certificates,
          count: gemstone.count,
          weight: gemstone.weight,
          grossWeight: Number(gemstone.grossWeight || 0),
          size: "",
          pricingRef: "STONE",
          rateOverride: gemstone.rateOverride,
          settingApplicable: false,
          settingRuleRef: "",
        });
      });
      const cleanCertificates = form.certificates.filter(
        c => c.certificateNo && c.lab
      );

      formData.append("certificates", JSON.stringify(cleanCertificates));
      formData.append("components", JSON.stringify(components));
      formData.append("existingImages", JSON.stringify(existingImages));
      // formData.append("certificates", JSON.stringify(form.certificates));

      console.log("🚀 SENDING COMPONENTS:", components);

      /* ---------------- MULTIPLE IMAGES (IMPORTANT) ---------------- */
      if (images && images.length > 0) {
        images.forEach((img) => {
          formData.append("images", img);   // ⚠️ must match backend field name
        });
      }

      /* ---------------- API CALL ---------------- */
      if (!standalone && outsideSubmit) {
        // Assemble final product data for Purchase module
        // We remove diamonds/gemstones as they are mapped into components
        const { diamonds, gemstones, ...restOfForm } = form;
        const productData = {
          ...restOfForm,
          components,
          certificates: cleanCertificates
        };
        outsideSubmit(productData, images);
        if (onSuccess) onSuccess();
        return;
      }

      // if (existingProduct) {
      // await API.patch(`/${existingProduct._id}`, formData);
      // } else {
      //   await API.post("/", formData);
      // }

      if (existingProduct) {
 // await API.patch(`/product/${existingProduct._id}`, formData);

 await API.patch(`/${existingProduct._id}`, formData);

 
} else {
  await API.post("/", formData);
}

      onSuccess();

      console.log("SELECTED FILES:", images);

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to save product"
      );
    } finally {
      setLoading(false);
    }
  };


  /* ======================================================
     STYLES (Matches Target UI)
     ====================================================== */

  const cardClass = "border border-slate-200 rounded-md bg-white p-5 mb-4 shadow-sm";
  const sectionTitleClass = "text-[15px] font-semibold text-[#1B3B59] mb-4 flex items-center";
  const lineMarkerClass = "w-0.5 h-4 bg-[#632947] mr-2";

  const labelClass = "block text-[11px] font-medium text-slate-600 mb-1";
  const inputClass = "w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:border-[#632947] transition-colors placeholder:text-slate-400";
  const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.6rem_auto] bg-[position:right_0.75rem_center] bg-no-repeat cursor-pointer`;

  const addButtonClass = "bg-[#632947] text-white text-[11px] px-3 py-1 rounded flex items-center gap-1 hover:bg-[#4a1e35] transition-colors ";

  const SelectWithGroups = ({ list, groups, value, onChange, className }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className} // ✅ FIXED
    >
      <option value="">Select</option>

      {Object.keys(groups).map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}

      <optgroup label="Individual">
        {list.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </optgroup>
    </select>
  );

  return (
    <div className="min-h-screen bg-[#F5F3F0]">

      {/* Form Container */}
      <div className="max-w-6xl mx-auto px-4 ">

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden flex flex-col">

          {/* Top Header */}
          <div className="bg-[#632947] px-6 py-4">
            <h2 className="text-white text-lg font-medium tracking-wide">
              {existingProduct ? "Edit Product" : "Create New Product"}
            </h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="m-6 mb-0 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="flex flex-col lg:flex-row p-6 gap-6">

            {/* LEFT COLUMN */}
            <div className="flex-1 space-y-0">

              {/* Product Reference Card */}
              <div className={cardClass}>
                <div className={sectionTitleClass}><span className={lineMarkerClass}></span>Product Reference</div>



                {/* Image Upload Section */}
                <div className="mb-6">

                  <div className="flex justify-between items-center mb-2">
                    <label className={labelClass}>Product Images</label>
                    <span className="text-[10px] text-slate-500">
                      {imagePreviews.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">



                    {showCamera && (
                      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col">


                        <div className="flex items-center justify-between px-4 py-3 text-white">
                          <span className="text-sm font-medium opacity-80">Camera</span>

                          <button
                            onClick={() => setShowCamera(false)}
                            className="text-xs bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition"
                          >
                            Close
                          </button>
                        </div>


                        <div className="flex-1 flex items-center justify-center px-4">
                          <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">

                            <Webcam
                              ref={webcamRef}
                              screenshotFormat="image/jpeg"
                              className="w-full"
                              videoConstraints={{ facingMode: "environment" }}
                            />


                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                              {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="border border-white/10" />
                              ))}
                            </div>

                          </div>
                        </div>


                        <div className="pb-8 pt-4 flex items-center justify-center gap-8">


                          <button
                            onClick={() => setShowCamera(false)}
                            className="text-white text-sm opacity-70 hover:opacity-100 transition"
                          >
                            Cancel
                          </button>


                          <button
                            onClick={() => {
                              const imageSrc = webcamRef.current.getScreenshot();

                              fetch(imageSrc)
                                .then(res => res.blob())
                                .then(blob => {
                                  const file = new File([blob], "camera.jpg", { type: "image/jpeg" });

                                  setImages(prev => [...prev, file]);
                                  setImagePreviews(prev => [...prev, imageSrc]);
                                });

                              setShowCamera(false);
                            }}
                            className="relative w-20 h-20 flex items-center justify-center"
                          >

                            <div className="absolute w-20 h-20 rounded-full border-4 border-white/30" />


                            <div className="w-14 h-14 rounded-full bg-white shadow-lg 
                        transition active:scale-90" />
                          </button>


                          <div className="w-10" />

                        </div>
                      </div>
                    )}
                    {previewImage && (
                      <div className="fixed inset-0 bg-black/80 z-[500] flex flex-col items-center justify-center">

                        {/* CLOSE */}
                        <button
                          onClick={() => setPreviewImage(null)}
                          className="absolute top-6 right-6 text-white text-xl bg-white/10 
                 rounded-full w-10 h-10 flex items-center justify-center
                 hover:bg-white/20 transition"
                        >
                          ✕
                        </button>

                        {/* IMAGE */}
                        <img
                          src={previewImage}
                          alt="Full Preview"
                          className="max-w-[90%] max-h-[80%] object-contain rounded-lg shadow-2xl"
                        />

                        {/* TITLE */}
                        <p className="text-white/80 mt-4 text-sm italic">
                          Product Image
                        </p>

                      </div>
                    )}

                    {/* <button
  type="button"
  onClick={() => setShowOptions(true)}
  className="h-20 rounded-xl bg-white border border-slate-200 
             flex flex-col items-center justify-center gap-1
             text-[#632947] text-xs font-semibold shadow-sm"
>
  <Camera size={20} />
  <span>Add Image</span>
</button> */}

                    <button
                      type="button"
                      onClick={() => setShowOptions(true)}
                      className="group relative h-20 rounded-xl 
             
             /* GLASS */
             bg-white/30 backdrop-blur-md
             border border-white/40

             /* LAYOUT */
             flex flex-col items-center justify-center gap-1
             text-[#632947] text-xs font-semibold

             /* NEUMORPHISM */
             shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)]

             /* TRANSITION */
             transition-all duration-300 ease-out

             /* DESKTOP HOVER */
             hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)]
             hover:scale-[1.02]

             /* 📱 MOBILE / TABLET */
             active:scale-95 active:shadow-inner"
                    >

                      {/* ✨ GLASS SHINE */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br 
                  from-white/40 via-transparent to-white/10 
                  opacity-60 pointer-events-none" />

                      {/* ICON */}
                      <Camera
                        size={20}
                        className="relative z-10 transition-transform duration-300 
               group-hover:scale-110 group-active:scale-95"
                      />

                      {/* TEXT */}
                      <span className="relative z-10">Add Image</span>

                      {/* 🔥 UNDERLINE (Desktop + Mobile both) */}
                      <div
                        className="absolute bottom-0 left-0 h-[2px] w-0 
               bg-gradient-to-r from-[#632947] via-[#a46a86] to-[#632947]
               transition-all duration-500 ease-out
               group-hover:w-full group-active:w-full"
                      />

                    </button>

                    {showOptions && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                        <div className="bg-white rounded-xl p-6 w-72 space-y-4">

                          <h3 className="text-sm font-semibold text-center">Select Option</h3>

                          {/* Camera */}
                          <button
                            onClick={() => {
                              setShowOptions(false);
                              setShowCamera(true);
                            }}
                            className="w-full py-2 bg-[#632947] text-white rounded"
                          >
                            Open Camera
                          </button>

                          {/* Upload */}
                          <label className="block w-full text-center py-2 border rounded cursor-pointer">
                            Upload Image
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                handleImageChange(e);
                                setShowOptions(false);
                              }}
                            />
                          </label>

                          {/* Cancel */}
                          <button
                            onClick={() => setShowOptions(false)}
                            className="w-full py-2 text-red-500"
                          >
                            Cancel
                          </button>

                        </div>
                      </div>
                    )}



                    {/* <div className="grid grid-cols-2 gap-3">

 
  <button
    type="button"
    onClick={() => setShowCamera(true)}
    className="group relative h-20 rounded-xl 
               bg-white border border-slate-200
               flex flex-col items-center justify-center gap-1
               text-[#632947] text-xs font-semibold
               shadow-sm hover:shadow-md
               transition-all duration-300
               active:scale-[0.97]"
  >
    
    <Camera
      size={20}
      className="transition-transform duration-300 group-hover:scale-110"
    />

   
    <span className="tracking-wide">Camera</span>

    
    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#632947] 
                    group-hover:w-full transition-all duration-300" />
  </button>


  <label
    className="group relative h-20 rounded-xl 
               bg-white border border-slate-200
               flex flex-col items-center justify-center gap-1
               text-slate-600 text-xs font-semibold cursor-pointer
               shadow-sm hover:shadow-md
               transition-all duration-300
               active:scale-[0.97]"
  >
   
    <Upload
      size={20}
      className="transition-transform duration-300 group-hover:scale-110"
    />

   
    <span className="tracking-wide">Upload</span>

    <input
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={handleImageChange}
    />

    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-slate-700 
                    group-hover:w-full transition-all duration-300" />
  </label>

</div> */}

                    {/* Existing Images */}
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-visible"
                      //className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          loading="lazy"
                          className="w-full h-28 object-cover cursor-pointer z-0"
                          onClick={() => setPreviewImage(preview)}
                        />

                        {/* Delete Button */}
                        {/* <button
          type="button"
          onClick={(e) => {
            e.preventDefault();

            const newPreviews = [...imagePreviews];
newPreviews.splice(index, 1);
setImagePreviews(newPreviews);

if (index < existingImages.length) {
  // deleting existing server image
  const updatedExisting = [...existingImages];
  updatedExisting.splice(index, 1);
  setExistingImages(updatedExisting);
} else {
  // deleting newly uploaded image
  const newIndex = index - existingImages.length;
  const updatedNewImages = [...images];
  updatedNewImages.splice(newIndex, 1);
  setImages(updatedNewImages);
}

          }}
className="absolute top-1 right-1 z-30 
bg-red-500 text-white 

w-7 h-7 rounded-full text-xs 
flex items-center justify-center

shadow-md backdrop-blur-sm

opacity-100 md:opacity-0 md:group-hover:opacity-100
transition-all duration-200

active:scale-90"
          // className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        >
          ✕
        </button> */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();

                            const newPreviews = [...imagePreviews];
                            newPreviews.splice(index, 1);
                            setImagePreviews(newPreviews);

                            if (index < existingImages.length) {
                              // deleting existing server image
                              const updatedExisting = [...existingImages];
                              updatedExisting.splice(index, 1);
                              setExistingImages(updatedExisting);
                            } else {
                              // deleting newly uploaded image
                              const newIndex = index - existingImages.length;
                              const updatedNewImages = [...images];
                              updatedNewImages.splice(newIndex, 1);
                              setImages(updatedNewImages);
                            }
                          }} className="absolute top-1 right-1 z-50 
  bg-[#632947] text-white 

  w-7 h-7 rounded-full text-xs 
  flex items-center justify-center

  shadow-md

  opacity-100
  transition-all duration-200

  hover:scale-110 active:scale-90"
                        >
                          ✕
                        </button>
                      </div>
                    ))}


                  </div>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className={labelClass}>Product Title</label>
                    <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Floral Diamond Bracelet" className={inputClass} required />
                  </div>


                  <div>
                    <label className={labelClass}>Stock</label>
                    <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" className={inputClass} />
                  </div>




                  <div>
                    <label className={labelClass}>Category</label>
                    <select name="jewelleryCategory" value={form.jewelleryCategory} onChange={handleChange} className={selectClass} required>
                      {JEWELLERY_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Product Type</label>
                    <input name="productType" value={form.productType} onChange={handleChange} placeholder="e.g. Engagement" className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Target Audience</label>
                    <select
                      name="targetAudience"
                      value={form.targetAudience}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="MEN">Men</option>
                      <option value="WOMEN">Women</option>
                      <option value="UNISEX">Unisex</option>
                      <option value="KIDS">Kids</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>SKU</label>
                    <input name="sku" value={form.sku} onChange={handleChange} placeholder="Item Code" className={`${inputClass} ${existingProduct ? 'bg-slate-100' : ''}`} required />
                  </div>


                  <div>
                    <label className={labelClass}>Gross Weight (g)</label>
                    <input type="number" min="0" step="0.001" name="grossWeight" value={form.grossWeight} onChange={handleChange} placeholder="0.00" className={inputClass} required />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description..." className={`${inputClass} h-auto py-2 resize-none`} rows="2" />
                  </div>
                </div>
              </div>

              {/* Metal Specifications Card */}
              <div className={cardClass}>
                <div className={sectionTitleClass}><span className={lineMarkerClass}></span>Metal Specifications</div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>Metal</label>
                    <select name="metalType" value={form.metalType} onChange={handleChange} className={selectClass}>
                      <option>Gold</option><option>Silver</option><option>Platinum</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Purity</label>
                    <select name="metalPurity" value={form.metalPurity} onChange={handleChange} className={selectClass}>
                      {METAL_PURITY_OPTIONS[form.metalType].map(p => (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Color</label>
                    <select name="metalColor" value={form.metalColor} onChange={handleChange} className={selectClass}>
                      {form.metalType === "Gold" && (<><option value="yellow-gold">Yellow Gold</option><option value="white-gold">White Gold</option><option value="rose-gold">Rose Gold</option></>)}
                      {form.metalType === "Silver" && <option value="silver">Silver</option>}
                      {form.metalType === "Platinum" && <option value="platinum">Platinum</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Net Weight (g)</label>
                    <input type="number" min="0" step="0.001" name="netWeight" value={form.netWeight} onFocus={disableScrollOnFocus} onChange={handleChange} placeholder="0.00" className={inputClass} required />
                  </div>



                  <div>
                    <label className={labelClass}>Fine Gold (g)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      onFocus={disableScrollOnFocus}
                      name="fineGold"
                      value={form.fineGold}
                      onChange={handleChange}
                      placeholder="0.000"
                      className={inputClass}
                    />
                  </div>

                </div>
              </div>

              {/* Diamonds Card */}
              <div className={cardClass}>
                <div className="flex justify-between items-center mb-4">
                  <div className={`${sectionTitleClass} mb-0`}><span className={lineMarkerClass}></span>Diamonds</div>
                  {/* <button type="button" onClick={addDiamond} className={addButtonClass}>+ Add</button> */}
                </div>

                <div className="space-y-3">
                  {form.diamonds.map((diamond, index) => (
                    <div key={index} className="border border-slate-200 rounded p-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-700">Diamond {index + 1}</span>
                        <button type="button" onClick={() => removeDiamond(index)} className="text-red-500 text-xs hover:underline">Remove</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                        {/* SHAPE */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Shape</label>
                          <select
                            value={diamond.shape}
                            onChange={(e) => updateDiamond(index, "shape", e.target.value)}
                            className={selectClass}
                          >
                            <option value="">Select</option>
                            {SHAPES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>

                        {/* COLOR */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Color</label>
                          {/* <select
      value={diamond.color}
      onChange={(e)=>updateDiamond(index,"color",e.target.value)}
      className={selectClass}
    >
      <option value="">Select</option>
      {COLORS_DIAMOND.map(c=><option key={c}>{c}</option>)}
    </select> */}

                          {/* <SelectWithGroups
                            list={COLORS_DIAMOND}
                            groups={COLOR_GROUPS}
                            value={diamond.color}
                            onChange={(v) => updateDiamond(index, "color", v)}
                          /> */}

                          <SelectWithGroups
                            list={COLORS_DIAMOND}
                            groups={COLOR_GROUPS}
                            value={diamond.color}
                            onChange={(v) => updateDiamond(index, "color", v)}
                            className={selectClass} // ✅ PASS HERE
                          />
                        </div>

                        {/* CLARITY */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Clarity</label>
                          {/* <select
      value={diamond.clarity}
      onChange={(e)=>updateDiamond(index,"clarity",e.target.value)}
      className={selectClass}
    >
      <option value="">Select</option>
      {CLARITIES.map(c=><option key={c}>{c}</option>)}
    </select> */}

                          {/* <SelectWithGroups
                            list={CLARITIES}
                            groups={CLARITY_GROUPS}
                            value={diamond.clarity}
                            onChange={(v) => updateDiamond(index, "clarity", v)}
                          /> */}

                          <SelectWithGroups
                            list={CLARITIES}
                            groups={CLARITY_GROUPS}
                            value={diamond.clarity}
                            onChange={(v) => updateDiamond(index, "clarity", v)}
                            className={selectClass}
                          />
                        </div>

                        {/* SIZE */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Size (mm)</label>
                          <input
                            // type="text"
                            type="text"

                            value={diamond.size || ""}
                            onFocus={disableScrollOnFocus}
                            onChange={(e) => updateDiamond(index, "size", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        {/* TOTAL (CT) */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Total (Ct)</label>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={diamond.grossWeight ?? ""}
                            // value={diamond.grossWeight ?? ""}
                            // value={diamond.grossWeight === 0 ? "" : diamond.grossWeight}
                            onFocus={disableScrollOnFocus}
                            onChange={(e) => updateDiamond(index, "grossWeight", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        {/* QTY */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Qty / Pcs</label>
                          <input
                            type="number"
                            min="1"
                            value={diamond.count ?? ""}
                            onFocus={disableScrollOnFocus}
                            onChange={(e) => updateDiamond(index, "count", e.target.value === "" ? "" : parseInt(e.target.value))}
                            className={inputClass}
                          />
                        </div>

                        {/* WEIGHT (CT) */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Weight (Ct)</label>
                          <input
                            type="number"
                            value={diamond.weight || ""}
                            onFocus={disableScrollOnFocus}
                            readOnly
                            className={`${inputClass} bg-gray-100`}
                          />
                        </div>


                        {/* RATE */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Rate (₹)</label>

                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              onFocus={disableScrollOnFocus}
                              value={diamond.rateOverride || ""}
                              readOnly={diamond.rateLocked}
                              onChange={(e) =>
                                updateDiamond(
                                  index,
                                  "rateOverride",
                                  e.target.value === "" ? null : parseFloat(e.target.value)
                                )
                              }
                              className={`${inputClass} pr-10 ${diamond.rateLocked ? "bg-gray-100" : ""}`}
                            />

                            <button
                              type="button"
                              onClick={() => toggleRateLock(index)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                              {diamond.rateLocked ? "🔒" : "🔓"}
                            </button>
                          </div>
                        </div>

                      </div>


                    </div>

                  ))}
                  <button type="button" onClick={addDiamond} className={addButtonClass}>+ Add</button>
                </div>
              </div>

              {/* Gemstones Card */}
              <div className={cardClass}>
                <div className="flex justify-between items-center mb-4">
                  <div className={`${sectionTitleClass} mb-0`}><span className={lineMarkerClass}></span>Precious Gemstones</div>

                </div>

                <div className="space-y-3">
                  {form.gemstones.map((gemstone, index) => (
                    <div key={index} className="border border-slate-200 rounded p-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-700">Gemstone {index + 1}</span>
                        <button type="button" onClick={() => removeGemstone(index)} className="text-red-500 text-xs hover:underline">Remove</button>
                      </div>


                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                        {/* STONE NAME */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Stone</label>
                          <select
                            value={gemstone.name}
                            onChange={(e) => updateGemstone(index, "name", e.target.value)}
                            className={selectClass}
                          >
                            {STONE_OPTIONS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* SHAPE */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Shape</label>
                          <select
                            value={gemstone.shape}
                            onChange={(e) => updateGemstone(index, "shape", e.target.value)}
                            className={selectClass}
                          >
                            <option value="">Select</option>
                            {SHAPES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>


                        {/* TOTAL WEIGHT */}
<div className="flex flex-col">
  <label className="text-xs text-gray-500 mb-1">Total (ct)</label>
  <input
    type="number"
    step="0.01"
    min="0"
    onFocus={disableScrollOnFocus}
    value={gemstone.grossWeight ?? ""}
    onChange={(e) =>
      updateGemstone(index, "grossWeight", e.target.value)
    }
    className={inputClass}
  />
</div>

{/* QTY */}
<div className="flex flex-col">
  <label className="text-xs text-gray-500 mb-1">Qty</label>
  <input
    type="number"
    min="1"
    onFocus={disableScrollOnFocus}
    value={gemstone.count ?? ""}
    onChange={(e) => {
      const val = e.target.value;
      updateGemstone(
        index,
        "count",
        val === "" ? "" : Math.max(1, parseInt(val))
      );
    }}
    className={inputClass}
  />
</div>

{/* WEIGHT PER PCS */}
<div className="flex flex-col">
  <label className="text-xs text-gray-500 mb-1">Weight (ct)</label>
  <input
    type="number"
    value={gemstone.weight ?? ""}
    readOnly
    className={`${inputClass} bg-gray-100`}
  />
</div>

                       
                        {/* <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Weight (ct)</label>
                          <input
                            type="number"
                            onFocus={disableScrollOnFocus}
                            step="0.01"
                            min="0"
                            value={gemstone.weight === 0 ? "" : gemstone.weight}
                            onChange={(e) => updateGemstone(index, "weight", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            onFocus={disableScrollOnFocus}
                            value={gemstone.count === 0 ? "" : gemstone.count}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateGemstone(
                                index,
                                "count",
                                val === "" ? 0 : Math.max(1, parseInt(val))
                              );
                            }}
                            onBlur={(e) => {
                              if (!e.target.value) {
                                updateGemstone(index, "count", 1);
                              }
                            }}
                            className={inputClass}
                          />
                        </div> */}

                        {/* RATE */}
                        <div className="flex flex-col">
                          <label className="text-xs text-gray-500 mb-1">Rate (₹)</label>

                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              value={gemstone.rateOverride || ""}
                              onFocus={disableScrollOnFocus}
                              readOnly={gemstone.rateLocked}
                              onChange={(e) =>
                                updateGemstone(
                                  index,
                                  "rateOverride",
                                  e.target.value === "" ? null : parseFloat(e.target.value)
                                )
                              }
                              className={`${inputClass} pr-10 ${gemstone.rateLocked ? "bg-gray-100 cursor-not-allowed" : ""
                                }`}
                            />

                            <button
                              type="button"
                              onClick={() => toggleGemstoneRateLock(index)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                            >
                              {gemstone.rateLocked ? "🔒" : "🔓"}
                            </button>
                          </div>
                        </div>

                      </div>


                    </div>
                  ))}
                  <button type="button" onClick={addGemstone} className={addButtonClass}>+ Add</button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (Compliance & Action Summary) */}
            <div className="w-full lg:w-[320px] space-y-0">

              {/* Compliance & Certification Card (Adapting leftover fields into a matching style) */}
              <div className={cardClass}>
                <div className={sectionTitleClass}><span className={lineMarkerClass}></span>Compliance / Codes</div>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>HSN Code</label>
                    <input name="hsnCode" value={form.hsnCode} onChange={handleChange} placeholder="7113" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>HUID (Hallmark)</label>
                    <input name="huid" value={form.huid} onChange={handleChange} placeholder="HUID1234" className={inputClass} />
                  </div>
                  <div>
                    {/* <label className={labelClass}>Certificate No.</label> */}
                    {/* //   <input name="certificateNo" value={form.certificateNo} onChange={handleChange} placeholder="GIA-XXXXXX" className={inputClass} /> */}
                    <div>
                      <label className={labelClass}>Certificates</label>

                      {form.certificates.map((cert, index) => (
                        <div key={index} className="flex gap-2 mb-2">

                          <input
                            placeholder="Certificate No (e.g. GIA12345)"
                            value={cert.certificateNo}
                            onChange={(e) =>
                              updateCertificate(index, "certificateNo", e.target.value)
                            }
                            className={inputClass}
                          />

                          <input
                            placeholder="Lab (GIA / IGI)"
                            value={cert.lab}
                            onChange={(e) =>
                              updateCertificate(index, "lab", e.target.value)
                            }
                            className={inputClass}
                          />

                          <button
                            type="button"
                            onClick={() => removeCertificate(index)}
                            className="text-red-500 text-xs hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addCertificate}
                        //  className="text-xs text-blue-600 mt-1"
                        className={addButtonClass}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action/Summary Box (Mimicking the Order Summary card) */}
              <div className="bg-[#632947] rounded-md p-5 text-white shadow-md">
                <h3 className="text-sm font-semibold mb-4 border-b border-[#7A3F5C] pb-2">Product Summary</h3>

                <div className="space-y-2 text-[11px] mb-6">
                  <div className="flex justify-between text-slate-200">
                    <span>Metal Type:</span>
                    <span className="font-medium text-white">{form.metalType}</span>
                  </div>
                  <div className="flex justify-between text-slate-200">
                    <span>Purity:</span>
                    <span className="font-medium text-white">{form.metalPurity}</span>
                  </div>
                  <div className="flex justify-between text-slate-200 border-b border-[#7A3F5C] pb-2">
                    <span>Net Weight:</span>
                    <span className="font-medium text-white">{form.netWeight ? `${form.netWeight}g` : '0g'}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-200">Diamonds:</span>
                    <span className="font-medium text-white">{form.diamonds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-200">Gemstones:</span>
                    <span className="font-medium text-white">{form.gemstones.length}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="w-full py-2 border border-white/30 text-white text-[10px] font-bold rounded hover:bg-white/10 transition-colors uppercase tracking-wider"
                    >
                      Cancel / Close
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#C5A859] hover:bg-[#B39648] text-white text-xs font-bold rounded shadow transition-colors disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    {loading ? "Saving..." : (standalone ? (existingProduct ? "UPDATE PRODUCT" : "CREATE PRODUCT") : (existingProduct ? "UPDATE IN LIST" : "ADD TO PURCHASE"))}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}