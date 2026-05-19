// export default function DailySalesClosing({ data }) {
//   if (!data) {
//     return <p className="p-6">No data available</p>;
//   }

//   return (
//     <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow">
//       <h1 className="text-xl font-bold mb-6">
//         Sales Order Daily Closing
//       </h1>

//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//         <Stat label="Total Invoices" value={data.totalInvoices} />
//         <Stat label="Total Sale" value={`₹ ${data.totalSale}`} />
//         <Stat label="GST" value={`₹ ${data.gst}`} />
//         <Stat label="Cash" value={`₹ ${data.cash}`} />
//         <Stat label="UPI" value={`₹ ${data.upi}`} />
//         <Stat label="Card" value={`₹ ${data.card}`} />
//         <Stat label="Bank" value={`₹ ${data.bank}`} />
//       </div>
//     </div>
//   );
// }

// function Stat({ label, value }) {
//   return (
//     <div className="border rounded p-4">
//       <p className="text-sm text-gray-500">{label}</p>
//       <p className="text-lg font-semibold">{value}</p>
//     </div>
//   );
// }

import React from "react";
import { 
  Calendar, CreditCard, Landmark, Banknote, 
  QrCode, PieChart, TrendingUp, Printer, Info,
  ChevronRight, ArrowUpRight, Receipt, Wallet, FileSpreadsheet
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import * as XLSX from "xlsx";

export default function DailySalesClosing({ data, date, onDateChange }) {
  const { isDark } = useTheme();

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A374F] mb-4"></div>
      <p className="text-lg font-medium">Preparing Report...</p>
    </div>
  );

  const {
    totalInvoices,
    totalSale,
    gst,
    payments = {},
    gstSummary = {},
  } = data;

  // Safe formatting for values
  const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString("en-IN")}`;

  const theme = {
    bg: isDark ? "bg-[#0A0A0A]" : "bg-[#F8FAFC]",
    card: isDark ? "bg-[#171717] border-[#262626]" : "bg-white border-[#E2E8F0]",
    text: isDark ? "text-white" : "text-[#1E293B]",
    muted: isDark ? "text-gray-400" : "text-gray-500",
    header: isDark ? "from-[#171717] to-[#0A0A0A]" : "from-white to-[#F8FAFC]",
    accent: "#5A374F",
    gold: "#B28912"
  };

  const exportToExcel = () => {
    try {
      const reportDate = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      
      // Prepare data for Excel
      const excelData = [
        ["DAILY SALES CLOSING REPORT"],
        ["Report Date:", reportDate],
        ["Generated On:", new Date().toLocaleString('en-IN')],
        [],
        ["SUMMARY"],
        ["Total Invoices", totalInvoices || 0],
        ["Total Sale (Gross)", totalSale || 0],
        ["Total GST", gst || 0],
        [],
        ["PAYMENT BREAKDOWN"],
        ["Cash", payments.cash || 0],
        ["UPI", payments.upi || 0],
        ["Card", payments.card || 0],
        ["Bank", payments.bank || 0],
        [],
        ["TAXATION SUMMARY"],
        ["SGST", gstSummary.sgst || 0],
        ["CGST", gstSummary.cgst || 0]
      ];

      // Create Worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Style columns (optional, basic width)
      ws["!cols"] = [{ wch: 25 }, { wch: 20 }];

      // Create Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Daily_Closing");

      // Download
      XLSX.writeFile(wb, `Daily_Closing_${date}.xlsx`);
    } catch (error) {
      console.error("Excel Export Error:", error);
      alert("Failed to export Excel file");
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} py-10 px-4 md:px-8 selection:bg-[#5A374F]/10 font-sans 
    print:bg-white print:py-4 print:px-0 print:min-h-0`}>
      
      {/* Print-only Style Tag to force single page */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: auto; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; background: white !important; }
          .print-compact { gap: 10px !important; margin-bottom: 15px !important; }
          .print-no-shadow { shadow: none !important; border: 1px solid #eee !important; }
          h1 { font-size: 20px !important; margin-bottom: 10px !important; }
          .metric-card { padding: 15px !important; border-radius: 15px !important; margin-bottom: 0 !important; }
          .metric-value { font-size: 24px !important; margin-bottom: 5px !important; }
          .payment-tile { padding: 10px !important; border-radius: 12px !important; gap: 10px !important; }
          .payment-value { font-size: 16px !important; }
          .section-header { margin-bottom: 8px !important; margin-top: 15px !important; }
          .footer-print { margin-top: 20px !important; padding-top: 10px !important; }
        }
      `}} />

      <div className="max-w-6xl mx-auto">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 print:mb-4 print:gap-2">
          <div>
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 ${theme.text} print:text-xl`}>
              Daily Sales <span className="text-[#5A374F]">Closing</span>
            </h1>
            <p className={`text-sm font-medium ${theme.muted} print:text-[10px]`}>
              Overview of transactions and revenue for the selected period
            </p>
          </div>
          
          <div className="flex items-center gap-3 print:hidden">
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-sm border transition-all hover:shadow-md group ${theme.card}`}>
              <Calendar size={18} className="text-[#5A374F] group-hover:scale-110 transition-transform" />
              <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className={`bg-transparent font-bold outline-none cursor-pointer text-sm ${theme.text}`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
                title="Export to Excel"
              >
                <FileSpreadsheet size={18} />
                <span className="hidden sm:inline">Excel</span>
              </button>
              
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-[#5A374F] text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-[#5A374F]/20 hover:bg-[#4A2D41] transition-all active:scale-95"
              >
                <Printer size={18} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Print-only Date Display */}
          <div className="hidden print:block text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report Date</p>
            <p className="text-sm font-bold text-[#5A374F]">{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* ================= TOP METRICS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 print:grid-cols-3 print:gap-3 print:mb-4">
          <MetricCard 
            label="TOTAL INVOICES" 
            value={totalInvoices || 0} 
            icon={<Receipt className="text-[#5A374F]" />}
            footer="Generated today"
            isDark={isDark}
            theme={theme}
          />
          <MetricCard 
            label="NET REVENUE" 
            value={formatCurrency(totalSale)} 
            icon={<TrendingUp className="text-emerald-500" />}
            footer="Total bill amount"
            isDark={isDark}
            theme={theme}
          />
          <MetricCard 
            label="GST COLLECTED" 
            value={formatCurrency(gst)} 
            icon={<PieChart className="text-indigo-500" />}
            footer="Total tax contribution"
            isDark={isDark}
            theme={theme}
          />
        </div>

        {/* ================= PAYMENT METHODS ================= */}
        <div className="mb-12 print:mb-4">
          <SectionHeader title="Payment Breakdown" icon={<Wallet size={18}/>} theme={theme} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-2">
            <PaymentTile 
              icon={<Banknote />} 
              label="CASH" 
              value={payments.cash} 
              color="text-emerald-500 bg-emerald-500/10"
              theme={theme}
            />
            <PaymentTile 
              icon={<QrCode />} 
              label="UPI" 
              value={payments.upi} 
              color="text-blue-500 bg-blue-500/10"
              theme={theme}
            />
            <PaymentTile 
              icon={<CreditCard />} 
              label="CARD" 
              value={payments.card} 
              color="text-indigo-500 bg-indigo-500/10"
              theme={theme}
            />
            <PaymentTile 
              icon={<Landmark />} 
              label="BANK" 
              value={payments.bank} 
              color="text-amber-500 bg-amber-500/10"
              theme={theme}
            />
          </div>
        </div>

        {/* ================= GST DETAILED ================= */}
        <div className="mb-14 print:mb-4">
          <SectionHeader title="Taxation Summary" icon={<Info size={18}/>} theme={theme} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
            <GstHighlightCard 
              label="SGST (STATE)" 
              value={gstSummary.sgst} 
              accentColor="bg-blue-500"
              theme={theme}
            />
            <GstHighlightCard 
              label="CGST (CENTRAL)" 
              value={gstSummary.cgst} 
              accentColor="bg-purple-500"
              theme={theme}
            />
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="text-center opacity-40 border-t pt-8 print:mt-4 print:pt-4 footer-print">
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.text}`}>
            Nazara Jewellery ERP • Automated Daily Closing Report
          </p>
          <p className={`text-[10px] mt-1 ${theme.text}`}>
            Generated on {new Date().toLocaleString('en-IN')}
          </p>
        </div>

      </div>
    </div>
  );
}

/* ================= STYLED SUB-COMPONENTS ================= */

function SectionHeader({ icon, title, theme }) {
  return (
    <div className="flex items-center gap-3 mb-6 text-zinc-400 font-black text-[11px] tracking-[0.15em] uppercase section-header">
      <span className={`p-2 rounded-lg shadow-sm border ${theme.card} print:p-1`}>{icon}</span>
      <span className={theme.muted}>{title}</span>
    </div>
  );
}

function MetricCard({ label, value, icon, footer, theme }) {
  return (
    <div className={`p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500 hover:shadow-xl group relative overflow-hidden ${theme.card} metric-card print:border-gray-100`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.02] -mr-16 -mt-16 rounded-full transition-transform group-hover:scale-110 print:hidden" />
      
      <div className="flex justify-between items-start mb-6 print:mb-2">
        <p className={`text-[11px] font-black tracking-widest uppercase transition-colors group-hover:text-[#5A374F] ${theme.muted} print:text-[8px]`}>{label}</p>
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl group-hover:scale-110 transition-transform print:p-1">
          {React.cloneElement(icon, { size: 16 })}
        </div>
      </div>
      
      <p className={`text-4xl font-bold mb-4 tracking-tight ${theme.text} metric-value print:text-2xl print:mb-1`}>{value}</p>
      
      <div className={`flex items-center gap-2 text-xs font-semibold ${theme.muted} print:hidden`}>
        <ChevronRight size={14} className="text-[#5A374F]" />
        {footer}
      </div>
    </div>
  );
}

function PaymentTile({ icon, label, value, color, theme }) {
  return (
    <div className={`p-6 rounded-[2rem] border shadow-sm flex items-center gap-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${theme.card} payment-tile print:border-gray-100`}>
      <div className={`${color} p-4 rounded-2xl print:p-2`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div>
        <p className={`text-[10px] font-black tracking-widest mb-1 ${theme.muted} print:text-[7px]`}>{label}</p>
        <p className={`text-2xl font-bold ${theme.text} payment-value print:text-lg`}>₹{(Number(value) || 0).toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}

function GstHighlightCard({ label, value, accentColor, theme }) {
  return (
    <div className={`p-8 rounded-[2.8rem] border shadow-sm relative overflow-hidden group ${theme.card} metric-card print:border-gray-100`}>
      <div className={`absolute left-0 top-0 h-full w-1.5 ${accentColor}`} />
      <div className="absolute top-6 right-8 print:hidden">
        <ArrowUpRight className={`${theme.muted} opacity-20 group-hover:opacity-100 transition-opacity`} size={32} />
      </div>
      <p className={`text-[11px] font-black tracking-widest mb-3 uppercase ${theme.muted} print:text-[8px]`}>{label}</p>
      <p className={`text-4xl font-bold tracking-tight ${theme.text} metric-value print:text-2xl`}>₹{(Number(value) || 0).toLocaleString("en-IN")}</p>
    </div>
  );
}
