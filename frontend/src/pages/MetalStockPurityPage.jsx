// import { useEffect, useState } from "react"
// import API from "../api"

// export default function MetalStockPurityPage(){

// const [entries,setEntries] = useState([])
// const [loading,setLoading] = useState(true)

// useEffect(()=>{
// fetchLedger()
// },[])

// const fetchLedger = async()=>{

// try{

// setLoading(true)

// const res = await API.get("/metal-ledger")

// setEntries(res.data.entries || [])

// }catch(err){

// console.error(err)

// }finally{
// setLoading(false)
// }

// }


// /* ---------------- CALCULATE STOCK ---------------- */

// const stock = {}

// entries.forEach(e=>{

// if(!e.metalType || !e.purity) return

// const metal = e.metalType
// const purity = e.purity

// if(!stock[metal]) stock[metal] = {}

// if(!stock[metal][purity]){

// stock[metal][purity] = {
// credit:0,
// debit:0,
// balance:0
// }

// }

// if(e.type === "CREDIT"){
// stock[metal][purity].credit += Number(e.weight) || 0
// }

// if(e.type === "DEBIT"){
// stock[metal][purity].debit += Number(e.weight) || 0
// }

// })


// /* FINAL BALANCE */

// Object.keys(stock).forEach(metal=>{

// Object.keys(stock[metal]).forEach(purity=>{

// const p = stock[metal][purity]

// p.balance = p.credit - p.debit

// })

// })


// return(

// <div className="p-6">

// <h1 className="text-2xl font-bold mb-6">
// Metal Stock (Purity Wise)
// </h1>

// {loading && <p>Loading...</p>}

// {!loading && Object.keys(stock).length === 0 && (
// <p>No stock found</p>
// )}

// {Object.entries(stock).map(([metal,purities])=>(

// <div key={metal} className="mb-8">

// <h2 className="text-xl font-semibold mb-4">
// {metal}
// </h2>

// <div className="overflow-x-auto">

// <table className="w-full border">

// <thead className="bg-gray-200">

// <tr>

// <th className="p-2 text-left">Purity</th>
// <th className="p-2 text-left">Credit</th>
// <th className="p-2 text-left">Debit</th>
// <th className="p-2 text-left">Balance</th>

// </tr>

// </thead>

// <tbody>

// {Object.entries(purities).map(([purity,data])=>(

// <tr key={purity} className="border-t">

// <td className="p-2 font-semibold">
// {purity}
// </td>

// <td className="p-2 text-green-600">
// {data.credit} g
// </td>

// <td className="p-2 text-red-600">
// {data.debit} g
// </td>

// <td className="p-2 font-semibold">
// {data.balance} g
// </td>

// </tr>

// ))}

// </tbody>

// </table>

// </div>

// </div>

// ))}

// </div>

// )

// }




import React, { useEffect, useState } from "react";
import API from "../api";
import { TrendingUp, ArrowRight } from "lucide-react";

export default function MetalStockPurityPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await API.get("/metal-ledger");
      setEntries(res.data.entries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CALCULATE STOCK ---------------- */
  const stock = {};

  entries.forEach((e) => {
    if (!e.metalType || !e.purity) return;

    // Normalize metal names to ensure clean grouping (e.g., "gold" -> "Gold")
    const metal = e.metalType.charAt(0).toUpperCase() + e.metalType.slice(1).toLowerCase();
    const purity = e.purity;

    if (!stock[metal]) stock[metal] = {};

    if (!stock[metal][purity]) {
      stock[metal][purity] = {
        credit: 0,
        debit: 0,
        balance: 0,
      };
    }

    if (e.type === "CREDIT") {
      stock[metal][purity].credit += Number(e.weight) || 0;
    }

    if (e.type === "DEBIT") {
      stock[metal][purity].debit += Number(e.weight) || 0;
    }
  });

  /* FINAL BALANCE & GRAND TOTALS */
  const totals = { Gold: 0, Silver: 0, Platinum: 0 };

  Object.keys(stock).forEach((metal) => {
    let metalGrandTotal = 0;
    Object.keys(stock[metal]).forEach((purity) => {
      const p = stock[metal][purity];
      p.balance = p.credit - p.debit;
      metalGrandTotal += p.balance;
    });

    // Add to grand totals for the summary cards
    if (metal === "Gold") totals.Gold = metalGrandTotal;
    if (metal === "Silver") totals.Silver = metalGrandTotal;
    if (metal === "Platinum") totals.Platinum = metalGrandTotal;
  });

  /* ---------------- FORMATTING HELPERS ---------------- */
  const fmtWeight = (val) => {
    return (Number(val) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " g";
  };

  const fmtBalance = (val) => {
    const num = Number(val) || 0;
    const sign = num > 0 ? "+" : "";
    return sign + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " g";
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 md:p-10 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Metal Stock Inventory</h1>
        <p className="text-sm text-slate-500">Real-time breakdown of stock by metal and purity.</p>
      </div>

      {loading && (
        <div className="text-slate-500 py-10 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#6A3D55] border-t-transparent rounded-full animate-spin"></div>
          Loading inventory...
        </div>
      )}

      {!loading && Object.keys(stock).length === 0 && (
        <p className="text-slate-500">No stock records found in the ledger.</p>
      )}

      {!loading && Object.keys(stock).length > 0 && (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Gold Card */}
            <div className="bg-[#f3e6ed] rounded-lg p-6 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center">
                <div className="w-1 h-3.5 bg-[#6A3D55] rounded-full mr-2"></div>
                <h3 className="text-[10px] font-bold tracking-[0.15em] text-[#5c3149] uppercase">Total Available Gold</h3>
              </div>
              <div className="text-[32px] font-bold text-[#663253] mt-2">
                {totals.Gold.toLocaleString("en-IN")}g
              </div>
              <TrendingUp className="w-4 h-4 text-[#6A3D55] absolute bottom-4 right-4 opacity-70" />
            </div>

            {/* Silver Card */}
            <div className="bg-[#f3e6ed] rounded-lg p-6 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center">
                <div className="w-1 h-3.5 bg-[#6A3D55] rounded-full mr-2"></div>
                <h3 className="text-[10px] font-bold tracking-[0.15em] text-[#5c3149] uppercase">Total Available Silver</h3>
              </div>
              <div className="text-[32px] font-bold text-[#663253] mt-2">
                {totals.Silver.toLocaleString("en-IN")}g
              </div>
              <TrendingUp className="w-4 h-4 text-[#6A3D55] absolute bottom-4 right-4 opacity-70" />
            </div>

            {/* Platinum Card */}
            <div className="bg-[#f3e6ed] rounded-lg p-6 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[140px]">
              <div className="flex items-center">
                <div className="w-1 h-3.5 bg-[#6A3D55] rounded-full mr-2"></div>
                <h3 className="text-[10px] font-bold tracking-[0.15em] text-[#5c3149] uppercase">Total Available Platinum</h3>
              </div>
              <div className="text-[32px] font-bold text-[#663253] mt-2">
                {totals.Platinum.toLocaleString("en-IN")}g
              </div>
              <div className="flex items-center absolute bottom-4 right-4 text-[#6A3D55] opacity-70">
                <span className="text-[8px] font-bold uppercase tracking-wider mr-2"></span>
                {/* <ArrowRight className="w-3 h-3" /> */}
                 <TrendingUp className="w-4 h-4 text-[#6A3D55] absolute bottom-0 right-4 opacity-90" />
              </div>
            </div>

          </div>

          {/* TABLES SECTIONS */}
          <div className="space-y-12">
            {Object.entries(stock).map(([metal, purities]) => (
              <div key={metal}>
                
                {/* Section Title */}
                <div className="flex items-center mb-4">
                  <div className="w-1.5 h-6 bg-[#6A3D55] rounded-full mr-3"></div>
                  <h2 className="text-[22px] font-bold text-slate-800">
                    {metal} Holdings
                  </h2>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#6A3D55] text-white">
                        <tr>
                          <th className="py-4 px-6 text-[10px] font-bold tracking-[0.15em] uppercase w-1/4">Purity</th>
                          <th className="py-4 px-6 text-[10px] font-bold tracking-[0.15em] uppercase text-center w-1/4">Credit (G)</th>
                          <th className="py-4 px-6 text-[10px] font-bold tracking-[0.15em] uppercase text-center w-1/4">Debit (G)</th>
                          <th className="py-4 px-6 text-[10px] font-bold tracking-[0.15em] uppercase text-right w-1/4">Net Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(purities).map(([purity, data]) => {
                          const isNegative = data.balance < 0;
                          
                          return (
                            <tr key={purity} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="py-5 px-6 font-bold text-slate-800 text-sm">
                                {purity}
                              </td>
                              <td className="py-5 px-6 text-sm font-medium text-slate-600 text-center">
                                {fmtWeight(data.credit)}
                              </td>
                              <td className="py-5 px-6 text-sm font-medium text-rose-500 text-center">
                                {fmtWeight(data.debit)}
                              </td>
                              <td className={`py-5 px-6 text-sm font-bold text-right ${
                                isNegative ? "text-rose-500" : "text-slate-700"
                              }`}>
                                {fmtBalance(data.balance)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}