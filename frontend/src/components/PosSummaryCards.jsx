import React from 'react';

export default function PosSummaryCards({ summary = {} }) {
  // Safe helper functions
  const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return "0.00";
    return value.toFixed(2);
  };

  const safeTotalSale = summary.totalSale || 0;
  const safeGst = summary.gst || 0;
  const safeTotalInvoices = summary.totalInvoices || 0;
  const safeCash = summary.cash || 0;
  const safeUpi = summary.upi || 0;
  const safeCard = summary.card || 0;
  const safeBank = summary.bank || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Sale Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Total Sale</p>
            <p className="text-2xl font-bold mt-2">
              ₹{formatCurrency(safeTotalSale)}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-sm mt-4 opacity-90">
          {safeTotalInvoices} invoices
        </p>
      </div>

      {/* Payment Modes Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Modes</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cash</span>
            <span className="font-medium">₹{formatCurrency(safeCash)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">UPI</span>
            <span className="font-medium">₹{formatCurrency(safeUpi)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Card</span>
            <span className="font-medium">₹{formatCurrency(safeCard)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Bank</span>
            <span className="font-medium">₹{formatCurrency(safeBank)}</span>
          </div>
        </div>
      </div>

      {/* GST Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total GST</span>
            <span className="font-medium text-red-600">
              ₹{formatCurrency(safeGst)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">SGST (1.5%)</span>
            <span className="font-medium">
              ₹{formatCurrency(safeGst / 2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">CGST (1.5%)</span>
            <span className="font-medium">
              ₹{formatCurrency(safeGst / 2)}
            </span>
          </div>
          <div className="flex justify-between items-center border-t pt-3 mt-3">
            <span className="font-medium text-gray-800">Net Sale</span>
            <span className="font-bold text-green-600">
              ₹{formatCurrency(safeTotalSale - safeGst)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Net Profit</p>
            <p className="text-2xl font-bold mt-2">
              ₹{formatCurrency(safeTotalSale - safeGst)}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-sm opacity-90">
            Average per invoice: ₹{formatCurrency(safeTotalSale / (safeTotalInvoices || 1))}
          </p>
        </div>
      </div>
    </div>
  );
}