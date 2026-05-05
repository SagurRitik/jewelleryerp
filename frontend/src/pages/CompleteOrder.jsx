
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  getOrderById,
  updateOrderById,
  updateOrderStatusById,
} from "../api/orderApi";

import {
  ArrowLeft,
  Search,
  XCircle,
  Home,
  CheckCircle
} from "lucide-react";

import { getImageUrl } from "../utils/getImageUrl";

/* ================= UTILS ================= */



/* ================= MAIN PAGE ================= */

export default function CompleteOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("weights");

  const [localComponents, setLocalComponents] = useState([]);

  const metalRef = useRef();
  const grossRef = useRef();
  const titleRef = useRef();
  const descriptionRef = useRef();


  useEffect(() => {
    (async () => {
      try {
        const res = await getOrderById(id);
        setOrder(res.data.order);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const ps = order?.productSnapshot || {};

  useEffect(() => {
    if (ps.components) {
      setLocalComponents(ps.components);
    }
  }, [ps.components]);

  const submit = async () => {
    if (!metalRef.current?.value || !grossRef.current?.value) {
      alert("Please fill in both Net Weight and Gross Weight.");
      return;
    }

    setSaving(true);
    try {
      const updatedSnapshot = {
        ...ps,
        title: titleRef.current?.value || ps.title,
        description: descriptionRef.current?.value || ps.description,
        netWeight: Number(metalRef.current.value),
        grossWeight: Number(grossRef.current.value),
        components: localComponents,
      };

      await updateOrderById(id, { productSnapshot: updatedSnapshot });
      await updateOrderStatusById(id, "Ready");
      navigate(`/orders/${id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to complete order");
    } finally {
      setSaving(false);
    }
  };

  const totalCarat = localComponents.reduce((sum, c) => sum + (parseFloat(c.grossWeight) || 0), 0);

  if (loading) return <div className="p-10 font-serif italic text-stone-500">Retrieving Order Details...</div>;
  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#F8EFF3] text-stone-800 p-4 md:p-10 relative">

      {/* Subtle background texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      <div className="max-w-[1200px] mx-auto relative z-10">

        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Header */}
        <header className="mb-10 flex items-baseline gap-4">
          <h1 className="text-3xl font-serif text-[#3A332C]">Job Sheet</h1>
          <span className="text-xl font-sans text-stone-500 tracking-wide">#{order.orderNo}</span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ================= LEFT COLUMN: PRODUCT PREVIEW ================= */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-[#EAE4D8] p-6 flex flex-col">

            <h2 className="font-serif text-xl text-[#3A332C] mb-4">Product Preview</h2>

            {/* Image Container */}
            <div className="bg-[#F8EFF3] rounded-lg aspect-[4/3] flex items-center justify-center relative mb-8 border border-[#E0D6C8] overflow-hidden">
              {ps.productImages?.length ? (
                <img
                  src={getImageUrl(ps.productImages[0])}
                  className="object-contain w-full h-full mix-blend-multiply p-4"
                  alt="Product"
                />
              ) : (
                <span className="text-stone-400 font-serif italic">No Image</span>
              )}
              <button className="absolute top-4 right-4 bg-white p-2 rounded shadow-sm text-stone-500 hover:text-[#C89B53] transition-colors">
                <Search size={16} />
              </button>
            </div>

            <h2 className="font-serif text-xl text-[#3A332C] mb-4">Job Information</h2>

            {/* Product Title */}
            <div className="mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5 block">Product Title</label>
              <input
                ref={titleRef}
                defaultValue={ps.title}
                className="w-full p-3 border border-[#EAE4D8] rounded-md text-sm text-stone-800 outline-none focus:border-[#C89B53] focus:ring-1 focus:ring-[#C89B53]/20 transition-all bg-[#F8EFF3]"
              />
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5 block">Product Description</label>
              <textarea
                ref={descriptionRef}
                defaultValue={ps.description}
                rows={3}
                placeholder="Add any job notes or descriptions..."
                className="w-full p-3 border border-[#EAE4D8] rounded-md text-sm text-stone-800 outline-none focus:border-[#C89B53] focus:ring-1 focus:ring-[#C89B53]/20 transition-all bg-[#F8EFF3] resize-none"
              />
            </div>

            {/* Left Actions */}
            <div className="mt-auto flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3.5 bg-white border border-[#EAE4D8] rounded-md text-stone-600 font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#DC0E0E]/65 hover:text-white transition-colors"
              >
                <XCircle size={16} /> Cancel Job
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="flex-1 py-3.5 bg-gradient-to-b from-[#E2C382] to-[#D4BA7B] rounded-md text-[#4A3311] font-medium text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Mark as Ready
              </button>
            </div>
          </div>


          {/* ================= RIGHT COLUMN: DATA ENTRY ================= */}
          <div
            className="lg:col-span-7 rounded-xl shadow-xl p-8 relative overflow-hidden bg-[#6B3151]"     >
            {/* Dark Texture Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
            //  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }
            //  }
            >
            </div>

            <div className="relative z-10">

              {/* Dark Card Header */}
              <div className="flex items-center gap-3 mb-8 text-[#E2CDAE]">
                <Home size={18} strokeWidth={1.5} />
                <h2 className="font-serif text-xl font-light">Job Information</h2>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#1E1815] rounded-md p-1 mb-8 border border-[#3A312D]">
                <button
                  onClick={() => setTab("weights")}
                  className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${tab === "weights" ? "bg-gradient-to-b from-[#E5C989] to-[#D4BA7B] text-[#4A3311] shadow-sm" : "text-[#8A7D6B] hover:text-[#E2CDAE]"}`}
                >
                  Weights
                </button>
                <button
                  onClick={() => setTab("summary")}
                  className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${tab === "summary" ? "bg-gradient-to-b from-[#E5C989] to-[#D4BA7B] text-[#4A3311] shadow-sm" : "text-[#8A7D6B] hover:text-[#E2CDAE]"}`}
                >
                  Summary
                </button>
              </div>

              {tab === "weights" && (
                <div className="space-y-8">

                  {/* Top Net Weight Display/Input */}
                  <div className="flex items-center justify-between pb-6 border-b border-[#4A403A]/50">

                    {/* <div className="flex gap-6 items-end pt-4"> */}
                    <div className="flex-1  ">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A69785] block mb-2 ml-1">Net Weight (g)</label>
                      <input
                        ref={metalRef}
                        min="0"
                        type="number"
                        step="0.01"
                        defaultValue={ps.netWeight}
                        className="w-full p-3 rounded text-stone-900 text-sm font-medium outline-none bg-[#F8EFF3] focus:ring-2 focus:ring-[#C89B53]/50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A69785] block mb-2 ml-1">Gross Weight (g)</label>
                      <input
                        ref={grossRef}
                        min="0"
                        type="number"
                        step="0.01"
                        defaultValue={ps.grossWeight}
                        className="w-full p-3 rounded text-stone-900 text-sm font-medium outline-none bg-[#F8EFF3] focus:ring-2 focus:ring-[#C89B53]/50 ml-2"
                      />
                    </div>
                    {/* </div> */}




                    {/* <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#A69785]">Net Weight (g)</label>
                    <input 
                      type="number" 
                      defaultValue={ps.netWeight} 
                      readOnly
                      className="w-[140px] p-2.5 rounded text-stone-900 text-sm font-medium outline-none bg-[#F5EFE6]" 
                    /> */}
                  </div>

                  {/* Diamond Breakdown Section */}
                  <div>
                    <h3 className="font-serif text-lg text-[#E2CDAE] mb-5 font-light">Diamond Breakdown</h3>

                    {/* Table Headers */}
                    <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 mb-2 text-[10px] text-[#A69785] px-1">
                      <div></div>
                      <div className="text-center">Count</div>
                      <div className="text-center">Total (ct)</div>
                      <div className="text-center">per piece (ct)</div>
                      <div>Clarity</div>
                    </div>

                    {/* Dynamic Rows */}
                    <div className="space-y-3">
                      {localComponents.map((c, i) => (
                        <div key={i} className="grid grid-cols-[1fr_0.8fr_0.8fr_0.8fr_1fr] gap-3 items-center">
                          <div className="text-sm text-[#D8C7A9] font-medium tracking-wide">  {c.type || "Component"}</div>

                          <input
                            type="number"
                            min="0"
                            value={c.count || 1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setLocalComponents(prev => {
                                const updated = [...prev];
                                updated[i] = { ...updated[i], count: val, weight: updated[i].grossWeight / val || 0 };
                                return updated;
                              });
                            }}
                            className="w-full p-2 text-center rounded text-sm text-stone-900 bg-[#F8EFF3] outline-none focus:ring-2 focus:ring-[#C89B53]/50"
                          />

                          <div className="relative">
                            {/* <input 
                              type="number" 
                              step="0.01" 
                              value={c.grossWeight || 0} 
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLocalComponents(prev => {
                                  const updated = [...prev];
                                  updated[i] = { ...updated[i], grossWeight: val, weight: val / (updated[i].count || 1) };
                                  return updated;
                                });
                              }}
                              className="w-full p-2 text-center rounded text-sm text-stone-900 bg-[#F5EFE6] outline-none focus:ring-2 focus:ring-[#C89B53]/50 pr-6" 
                            /> */}

                            {c.grossWeight !== undefined && c.grossWeight !== 0 && (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={c.grossWeight}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;

                                  setLocalComponents(prev => {
                                    const updated = [...prev];
                                    updated[i] = {
                                      ...updated[i],
                                      grossWeight: val,
                                      weight: val / (updated[i].count || 1)
                                    };
                                    return updated;
                                  });
                                }}
                                className="w-full p-2 text-center rounded text-sm text-stone-900 bg-[#F8EFF3] outline-none focus:ring-2 focus:ring-[#C89B53]/50"
                              />
                            )}

                          </div>

                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="0.001"
                              value={c.weight || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setLocalComponents(prev => {
                                  const updated = [...prev];
                                  updated[i] = { ...updated[i], weight: val, grossWeight: val * (updated[i].count || 1) };
                                  return updated;
                                });
                              }}
                              className="w-full p-2 text-center rounded text-sm text-stone-900 bg-[#F8EFF3] outline-none focus:ring-2 focus:ring-[#C89B53]/50 pr-6"
                            />

                          </div>

                          <div className="relative">
                            {/* <input 
                              type="text" 
                              value={c.clarity || ""} 
                              onChange={(e) => {
                                const val = e.target.value;
                                setLocalComponents(prev => {
                                  const updated = [...prev];
                                  updated[i] = { ...updated[i], clarity: val };
                                  return updated;
                                });
                              }}
                              className="w-full p-2 rounded text-sm text-stone-900 bg-[#F5EFE6] outline-none focus:ring-2 focus:ring-[#C89B53]/50 pr-6" 
                            /> */}

                            {c.clarity !== undefined && c.clarity !== "" && (
                              <input
                                type="text"
                                value={c.clarity}
                                onChange={(e) => {
                                  const val = e.target.value;

                                  setLocalComponents(prev => {
                                    const updated = [...prev];
                                    updated[i] = { ...updated[i], clarity: val };
                                    return updated;
                                  });
                                }}
                                className="w-full p-2 rounded text-sm text-stone-900 bg-[#F8EFF3] outline-none focus:ring-2 focus:ring-[#C89B53]/50"
                              />
                            )}
                            {/* <ChevronDownIcon /> */}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Carat */}
                    <div className="mt-5 pt-4 border-t border-[#4A403A]/50 flex justify-between items-center text-[#E2CDAE]">
                      <span className="text-sm font-medium tracking-wide">Total Carat</span>
                      <span className="text-sm font-bold">{totalCarat.toFixed(3)}</span>
                    </div>
                  </div>

                  {/* Bottom Actual Weights */}


                  {/* Right Action */}
                  <div className="mt-8 flex justify-end pt-2">
                    {/* <button 
                      onClick={submit} 
                      disabled={saving}
                      className="px-10 py-3.5 bg-gradient-to-b from-[#E2C382] to-[#B98C3F] rounded text-[#4A3311] font-medium text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Mark as Ready"}
                    </button> */}
                  </div>

                </div>
              )}

              {tab === "summary" && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-[#1E1815] border border-[#3A312D] rounded-xl p-8">
                    <h3 className="font-serif text-2xl text-[#E2CDAE] mb-6 border-b border-[#3A312D] pb-4">Verification Receipt</h3>

                    <div className="space-y-6">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-[#A69785] bg-opacity-80 uppercase tracking-widest">Net Metal Allocation</span>
                        <span className="text-lg font-bold text-[#E2CDAE]">{metalRef.current?.value || ps.netWeight || 0} g</span>
                      </div>
                      <div className="border-t border-[#3A312D]"></div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-[#A69785] bg-opacity-80 uppercase tracking-widest">Gross Target Weight</span>
                        <span className="text-lg font-bold text-[#E2CDAE]">{grossRef.current?.value || ps.grossWeight || 0} g</span>
                      </div>
                      <div className="border-t border-[#3A312D]"></div>

                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E2C382] mb-4 block">Registered Components</span>
                        {localComponents.length === 0 && <p className="text-sm italic text-[#8A7D6B]">None attached.</p>}
                        {localComponents.map((c, i) => (
                          <div key={i} className="flex justify-between items-center py-2.5">
                            <span className="text-sm font-medium text-[#D8C7A9]">{c.count || 1}x {c.type || "Undefined"}</span>
                            <span className="text-sm font-bold text-white">{parseFloat(c.grossWeight || 0).toFixed(3)} ct</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gradient-to-b from-[#E2C382] to-[#B98C3F] p-5 rounded-lg mt-6 flex justify-between items-center shadow-md">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#4A3311]">Total Component Payload</span>
                        <span className="text-xl font-serif font-bold text-[#4A3311]">{totalCarat.toFixed(3)} ct</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions Form */}
              {/* <div className="mt-8 pt-8 border-t border-[#4A403A]/50 flex gap-4 w-full">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-4 border border-[#3A312D] rounded-md text-[#A69785] font-bold uppercase tracking-widest text-[11px] hover:bg-[#1E1815] transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={15} /> Abort Action
                </button>
                <button
                  onClick={submit}
                  disabled={saving}
                  className="flex-[2] py-4 bg-gradient-to-b from-[#E2C382] to-[#D4BA7B] rounded-md text-[#4A3311] shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                >
                  <CheckCircle size={15} /> {saving ? "Synchronizing Data..." : "Sign-Off & Mark as Ready"}
                </button>
              </div> */}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper SVG for small dropdown arrows on inputs
const ChevronDownIcon = () => (
  <svg
    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);