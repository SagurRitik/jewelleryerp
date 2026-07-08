



// import { useEffect, useState } from "react";
// import API from "../api";
// import { useNavigate } from "react-router-dom";

// export default function ExpensePage() {
//   const navigate = useNavigate();

//   const [expenses, setExpenses] = useState([]);
//   const [summary, setSummary] = useState({ totalExpense: 0 });

//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState({ pages: 1 });

//   useEffect(() => {
//     fetchExpenses();
//   }, [page]);

//   const fetchExpenses = async () => {
//     try {
//       const res = await API.get(`/expenses?page=${page}&limit=10`);

//       setExpenses(res.data.expenses || []);
//       setSummary(res.data.summary || {});
//       setPagination(res.data.pagination || {});
//     } catch (err) {
//       console.error(err);
//       alert("Failed to fetch expenses");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F5F3F0] p-6 flex flex-col">

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold text-gray-800">
//           Expense Management
//         </h1>

//         <button
//           onClick={() => navigate("/expenses/new")}
//           className="bg-[#6B2E4A] hover:bg-[#5A2640] text-white px-4 py-2 rounded-md text-sm"
//         >
//           + Add Expense
//         </button>
//       </div>

//       {/* SUMMARY */}
//       <div className="bg-white rounded-lg shadow-sm p-5 mb-6 border border-gray-200">
//         <div className="flex justify-between items-center">
//           <span className="text-gray-600 text-sm">Total Expense</span>
//           <span className="text-xl font-semibold text-red-600">
//             ₹ {summary.totalExpense?.toFixed(2) || "0.00"}
//           </span>
//         </div>
//       </div>

//       {/* TABLE (flex-1 = pushes pagination down) */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex-1">
//         <table className="w-full text-sm">

//           <thead className="bg-gray-100 text-gray-700">
//             <tr>
//               <th className="p-3 text-left">Date</th>
//               <th className="p-3 text-left">Category</th>
//               <th className="p-3 text-left">Amount</th>
//               <th className="p-3 text-left">Payment</th>
//               <th className="p-3 text-left">Reference</th>
//               <th className="p-3 text-left">Party</th>
//               <th className="p-3 text-left">Notes</th>
//             </tr>
//           </thead>

//           <tbody>
//             {expenses.length === 0 ? (
//               <tr>
//                 <td colSpan="7" className="text-center p-6 text-gray-500">
//                   No expenses found
//                 </td>
//               </tr>
//             ) : (
//               expenses.map((e) => (
//                 <tr key={e._id} className="border-t hover:bg-gray-50">

//                   <td className="p-3">
//                     {new Date(e.expenseDate).toLocaleDateString("en-IN")}
//                   </td>

//                   <td className="p-3 font-medium">
//                     {e.category}
//                   </td>

//                   <td className="p-3 text-red-600 font-semibold">
//                     ₹ {e.amount?.toFixed(2)}
//                   </td>

//                   <td className="p-3">
//                     {e.paymentMode}
//                   </td>

//                   <td className="p-3">
//                     {e.reference || "-"}
//                   </td>

//                   <td className="p-3">
//                     {e.partyName || "-"}
//                   </td>

//                   <td className="p-3 text-gray-500 max-w-[200px] truncate">
//                     {e.notes || "-"}
//                   </td>

//                 </tr>
//               ))
//             )}
//           </tbody>

//         </table>
//       </div>

//       {/* PAGINATION (always bottom now) */}
//       <div className="flex justify-center items-center gap-2 mt-6 flex-wrap pb-4">

//         {/* Prev */}
//         <button
//           disabled={page === 1}
//           onClick={() => setPage(page - 1)}
//           className="px-3 py-1 border rounded disabled:opacity-50"
//         >
//           Prev
//         </button>

//         {/* Page Numbers */}
//         {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1).map(p => (
//           <button
//             key={p}
//             onClick={() => setPage(p)}
//             className={`px-3 py-1 border rounded ${
//               p === page ? "bg-[#6B2E4A] text-white" : ""
//             }`}
//           >
//             {p}
//           </button>
//         ))}

//         {/* Next */}
//         <button
//           disabled={page === pagination.pages}
//           onClick={() => setPage(page + 1)}
//           className="px-3 py-1 border rounded disabled:opacity-50"
//         >
//           Next
//         </button>

//       </div>
//     </div>
//   );
// }







import React, { useEffect, useState, useRef } from "react";



import API from "../api";



import { useNavigate } from "react-router-dom";



import { 



  TrendingUp, Plus, Filter, Download, Upload,



  Landmark, Banknote, CreditCard, ChevronLeft, ChevronRight,



  ListOrdered, Trash2



} from "lucide-react";







export default function ExpensePage() {



  const navigate = useNavigate();







  const [expenses, setExpenses] = useState([]);



  const [summary, setSummary] = useState({ totalExpense: 0 });







  const [page, setPage] = useState(1);



  const [pagination, setPagination] = useState({ pages: 1, total: 0, limit: 10 });







  const [isFilterVisible, setIsFilterVisible] = useState(false);



  const [filters, setFilters] = useState({



    startDate: "",



    endDate: "",



    category: "",



  });



  const [categories, setCategories] = useState([]);







  useEffect(() => {



    fetchExpenses();



    fetchCategories();



  }, [page, filters]);







  const fetchExpenses = async () => {



    try {



      const params = new URLSearchParams({



        page,



        limit: 10,



        ...filters,



      });



      const res = await API.get(`/expenses?${params.toString()}`);



      setExpenses(res.data.expenses || []);



      setSummary(res.data.summary || {});



      setPagination(res.data.pagination || { pages: 1, total: res.data.expenses?.length || 0, limit: 10 });



    } catch (err) {



      console.error(err);



      alert("Failed to fetch expenses");



    }



  };







  const fetchCategories = async () => {



    try {



      const res = await API.get("/expenses/categories");



      setCategories(res.data || []);



    } catch (err) {



      console.error(err);



      alert("Failed to fetch categories");



    }



  };







  const handleFilterChange = (e) => {



    const { name, value } = e.target;



    setFilters((prev) => ({ ...prev, [name]: value }));



  };







  const applyFilters = () => {



    setPage(1);



    fetchExpenses();



  };







  const clearFilters = () => {



    setFilters({



      startDate: "",



      endDate: "",



      category: "",



    });



    setPage(1);



  };







  /* Helper for Payment Icons */



  const getPaymentIcon = (mode) => {



    const m = mode?.toUpperCase() || "";



    if (m.includes("UPI")) return <Landmark className="w-4 h-4 mr-2 text-slate-600" />;



    if (m.includes("CASH")) return <Banknote className="w-4 h-4 mr-2 text-slate-600" />;



    if (m.includes("CARD")) return <CreditCard className="w-4 h-4 mr-2 text-slate-600" />;



    return <Landmark className="w-4 h-4 mr-2 text-slate-600" />; // default



  };







  /* Helper for Date Formatting */



  const fmtDate = (dateString) => {



    const d = new Date(dateString);



    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;



  };







  const handleDelete = async (id) => {



    const confirmDelete = window.confirm("Delete this expense?");



    if (!confirmDelete) return;







    try {



      await API.delete(`/expenses/${id}`);



      fetchExpenses(); // refresh list



    } catch (err) {



      console.error(err);



      alert("Delete failed");



    }



  };







  







    const handleExport = async () => {







      try {







        const params = new URLSearchParams(filters);







        const res = await API.get(`/expenses/export?${params.toString()}`, {







          responseType: "blob",







        });







        const url = window.URL.createObjectURL(new Blob([res.data]));







        const link = document.createElement("a");







        link.href = url;







        link.setAttribute("download", "expenses.xlsx");







        document.body.appendChild(link);







        link.click();







      } catch (err) {







        console.error(err);







        alert("Failed to export expenses");

      }

    };

    const fileInputRef = useRef(null);

    const handleImportClick = () => {
      fileInputRef.current?.click();
    };

    const handleImport = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      e.target.value = "";

      const formData = new FormData();
      formData.append("excel", file);

      try {
        const res = await API.post("/expenses/import", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data.success) {
          alert(`Successfully imported ${res.data.count} expenses!`);
          fetchExpenses();
        } else {
          alert(res.data.message || "Failed to import expenses");
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || "Failed to import expenses");
      }
    };







  







    const handleEdit = (id) => {







      navigate(`/expenses/edit/${id}`);







    };







  







  /* Pagination text calculation */



  const startItem = (page - 1) * (pagination.limit || 10) + 1;



  const endItem = Math.min(page * (pagination.limit || 10), pagination.total || expenses.length);







  return (



    <div className="min-h-screen bg-[#FCFBFA] p-8 flex flex-col font-sans text-slate-800 pb-12">







      {/* TOP SECTION: Title & Summary Card */}



      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">



        



        {/* Left: Titles */}



        <div className="max-w-md pt-2">



          <h3 className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase mb-2">



            Overview



          </h3>



          <h1 className="text-[32px] font-bold text-[#6A3D55] tracking-tight mb-3">



            Expense Management



          </h1>



          <p className="text-sm text-slate-500 leading-relaxed">



            Real-time tracking and categorization of your organizational expenditures for the current fiscal period.



          </p>



        </div>







        {/* Right: Summary Card */}



        <div className="bg-white rounded-xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 p-6 w-full md:w-[320px]">



          <div className="flex justify-between items-start mb-4">



            <h3 className="text-[11px] font-bold tracking-[0.1em] text-slate-500 uppercase">Total Expense</h3>



            <div className="bg-[#F4EAEE] text-[#6A3D55] p-1.5 rounded-lg">



              <TrendingUp className="w-4 h-4" />



            </div>



          </div>



          <div className="text-[36px] font-bold text-[#6A3D55] mb-6">



            ₹ {summary.totalExpense?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}



          </div>



          <div className="flex justify-end text-[10px] font-bold uppercase tracking-wider">



            <div className="text-[#6A3D55]">
              {new Date().toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()}
            </div>



          </div>



        </div>







      </div>







      {/* ACTION BAR */}



      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">



        <h2 className="text-xl font-bold text-[#6A3D55]">Recent Transactions</h2>



        



        <div className="flex items-center gap-3">



          <button



            onClick={() => navigate("/expenses/new")}



            className="bg-[#6A3D55] hover:bg-[#5C3149] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center shadow-sm"



          >



            <Plus className="w-4 h-4 mr-2" /> Add Expense



          </button>



          <button



            onClick={() => setIsFilterVisible(!isFilterVisible)}



            className="px-4 py-2.5 border border-transparent hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 transition-colors flex items-center"



          >



            <Filter className="w-4 h-4 mr-2 text-slate-500" /> Filter



          </button>



          



          <button



                      onClick={handleExport}



                      className="px-4 py-2.5 border border-transparent hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 transition-colors flex items-center"



                    >



                      <Download className="w-4 h-4 mr-2 text-slate-500" /> Export



                    </button>

          <button
            onClick={handleImportClick}
            className="px-4 py-2.5 border border-transparent hover:bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 transition-colors flex items-center"
          >
            <Upload className="w-4 h-4 mr-2 text-slate-500" /> Import
          </button>

          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />



          



        </div>



      </div>







      {/* FILTER SECTION */}



      {isFilterVisible && (



        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">



          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">



            <input



              type="date"



              name="startDate"



              value={filters.startDate}



              onChange={handleFilterChange}



              className="p-2 border rounded"



            />



            <input



              type="date"



              name="endDate"



              value={filters.endDate}



              onChange={handleFilterChange}



              className="p-2 border rounded"



            />



            <select



              name="category"



              value={filters.category}



              onChange={handleFilterChange}



              className="p-2 border rounded"



            >



              <option value="">All Categories</option>



              {categories.map((cat) => (



                <option key={cat} value={cat}>



                  {cat}



                </option>



              ))}



            </select>



            <div className="flex gap-2">



              <button



                onClick={applyFilters}



                className="bg-[#6A3D55] text-white px-4 py-2 rounded"



              >



                Apply



              </button>



              <button



                onClick={clearFilters}



                className="bg-gray-300 px-4 py-2 rounded"



              >



                Clear



              </button>



            </div>



          </div>



        </div>



      )}







      {/* TABLE */}



      <div className="bg-white rounded-xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden mb-6 flex-1">



        <div className="overflow-x-auto">



          <table className="w-full text-left border-collapse min-w-[900px]">



            <thead>



              <tr className="bg-[#FAFAFA]">



                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Date</th>



                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Category</th>



                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Amount</th>



                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Payment</th>



                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Reference</th>



                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Specific Expence</th>



                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">Notes</th>



                <th className="py-4 px-6 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase text-center">Actions</th>



              </tr>



            </thead>



            <tbody>



              {expenses.length === 0 ? (



                <tr>



                  <td colSpan="8" className="text-center py-12 text-slate-500 text-sm">



                    No expenses found



                  </td>



                </tr>



              ) : (



                expenses.map((e) => (



                  <tr key={e._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">



                    



                    <td className="py-5 px-6 text-sm font-medium text-slate-800 whitespace-nowrap">



                      {fmtDate(e.expenseDate)}



                    </td>







                    <td className="py-5 px-6">



                      <span className="inline-block bg-[#D2B5C6] text-[#4A1E34] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">



                        {e.category}



                      </span>



                    </td>







                    <td className="py-5 px-6 text-sm font-bold text-[#6A3D55] whitespace-nowrap">



                      <div className="flex items-center">



                        <span className="text-[10px] mr-1">₹</span>



                        {e.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}



                      </div>



                    </td>







                    <td className="py-5 px-6 text-sm font-medium text-slate-700 uppercase flex items-center mt-1">



                      {getPaymentIcon(e.paymentMode)} {e.paymentMode}



                    </td>







                    <td className="py-5 px-6 text-sm text-slate-500">



                      {e.reference || "-"}



                    </td>







                    <td className="py-5 px-6 text-sm text-slate-600">



                      {e.partyName || "-"}



                    </td>







                    <td className="py-5 px-6 text-sm text-slate-500 italic max-w-[150px] truncate">



                      {e.notes || "-"}



                    </td>







                    <td className="py-5 px-6">



                      <div className="flex justify-center items-center gap-2">



                        <button className="p-1.5 text-slate-400 hover:text-[#6A3D55] transition-colors rounded">



                          <ListOrdered className="w-4 h-4"  onClick={() => handleEdit(e._id)}  title="Edit" />



                        </button>



                        <button className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded">



                          <Trash2 className="w-4 h-4" onClick={() => handleDelete(e._id)} title="Delete"



                         >  </Trash2>



                        </button>



                      </div>



                    </td>







                  </tr>



                ))



              )}



            </tbody>



          </table>



        </div>



      </div>







      {/* PAGINATION FOOTER */}



      <div className="flex flex-col sm:flex-row justify-between items-center text-sm">



        



        <div className="text-slate-500 font-medium mb-4 sm:mb-0">



          Showing {expenses.length > 0 ? startItem : 0}-{endItem} of {pagination.total || expenses.length} transactions



        </div>







        <div className="flex items-center space-x-1">



          {/* Prev */}



          <button



            disabled={page === 1}



            onClick={() => setPage(page - 1)}



            className="flex items-center px-3 py-1.5 text-[#6A3D55] font-semibold hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-transparent"



          >



            <ChevronLeft className="w-4 h-4 mr-1" /> Prev



          </button>







          {/* Page Numbers */}



          {Array.from({ length: pagination.pages || 1 }, (_, i) => i + 1).map(p => (



            <button



              key={p}



              onClick={() => setPage(p)}



              className={`w-8 h-8 flex items-center justify-center rounded-md font-bold transition-colors ${



                p === page 



                  ? "bg-[#6A3D55] text-white" 



                  : "text-slate-600 hover:bg-slate-100"



              }`}



            >



              {p}



            </button>



          ))}







          {/* Next */}



          <button



            disabled={page === pagination.pages}



            onClick={() => setPage(page + 1)}



            className="flex items-center px-3 py-1.5 text-[#6A3D55] font-semibold hover:bg-slate-100 rounded-md transition-colors disabled:opacity-40 disabled:hover:bg-transparent"



          >



            Next <ChevronRight className="w-4 h-4 ml-1" />



          </button>



        </div>



      </div>







    </div>



  );



}


