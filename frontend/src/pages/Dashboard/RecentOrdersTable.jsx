// import { Eye } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function RecentOrdersTable({ orders }) {
//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
//         <Link to="/orders" className="text-sm font-medium text-[#501b46] hover:underline">View All</Link>
//       </div>
      
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm text-left">
//           <thead className="text-gray-500 border-b border-gray-100">
//             <tr>
//               <th className="pb-3 font-medium">Invoice No</th>
//               <th className="pb-3 font-medium">Customer</th>
//               <th className="pb-3 font-medium">Amount</th>
//               <th className="pb-3 font-medium">Status</th>
//               <th className="pb-3 font-medium text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             {orders?.map((order) => (
//               <tr key={order._id} className="group hover:bg-gray-50 transition-colors">
//                 <td className="py-4 font-mono text-gray-600">{order.invoiceNo}</td>
//                 <td className="py-4 font-medium text-gray-800">{order.customer?.name}</td>
//                 <td className="py-4 font-bold text-gray-800">₹{order.totals?.grandTotal?.toLocaleString()}</td>
//                 <td className="py-4">
//                   <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
//                     order.payment?.status === "PAID" 
//                       ? "bg-green-50 text-green-600" 
//                       : "bg-yellow-50 text-yellow-600"
//                   }`}>
//                     {order.payment?.status}
//                   </span>
//                 </td>
//                 <td className="py-4 text-right">
//                   <Link 
//                     to={`/invoice/${order._id}`}
//                     className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-[#501b46] hover:bg-purple-50 rounded-lg transition-all"
//                   >
//                     <Eye size={18} />
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {(!orders || orders.length === 0) && (
//             <div className="p-6 text-center text-gray-400">No recent orders found</div>
//         )}
//       </div>
//     </div>
//   );
// }


import { Eye, MoreVertical } from 'lucide-react';
import { Link } from "react-router-dom";

export default function RecentOrdersTable({ orders }) {
  
  const statusColors = {
    'PAID': 'bg-green-100 text-green-700 border-green-200',
    'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'FAILED': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Recent Purchase</h3>
          <p className="text-sm text-gray-500">Latest customer purchases</p>
        </div>
        <Link to="/sales-invoices" className="text-[#501b46] font-medium hover:text-purple-800 transition-colors text-sm">
          View All
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice ID</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders?.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                <td className="py-4 px-4">
                  <span className="font-mono text-sm text-gray-900 font-medium">{order.invoiceNo}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{order.customer?.name}</span>
                    <span className="text-xs text-gray-500">Sales</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm font-bold text-gray-900">₹{order.totals?.grandTotal?.toLocaleString()}</span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.payment?.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.payment?.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-500">{new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/invoice/${order._id}`} className="p-2 hover:bg-purple-50 text-gray-400 hover:text-[#501b46] rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
            <div className="p-8 text-center text-gray-400 text-sm">No recent orders found</div>
        )}
      </div>
    </div>
  );
}