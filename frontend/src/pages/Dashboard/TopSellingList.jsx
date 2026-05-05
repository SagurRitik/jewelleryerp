// import { TrendingUp } from "lucide-react";

// export default function TopSellingList({ products }) {
//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-bold text-gray-800">Top Selling Products</h3>
//         <button className="text-sm font-medium text-[#501b46] hover:underline">View All</button>
//       </div>

//       <div className="space-y-4">
//         {products?.map((item, index) => (
//           <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 font-bold text-sm">
//                 #{index + 1}
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{item._id}</h4>
//                 <p className="text-xs text-gray-500">{item.sales} Sales</p>
//               </div>
//             </div>
            
//             <div className="text-right">
//               <p className="font-bold text-gray-800 text-sm">₹{item.revenue?.toLocaleString()}</p>
//               <div className="flex items-center justify-end gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded mt-1">
//                 <TrendingUp size={12} />
//                 <span>Popular</span>
//               </div>
//             </div>
//           </div>
//         ))}
//         {(!products || products.length === 0) && (
//             <div className="text-center text-gray-400 text-sm py-4">No data available</div>
//         )}
//       </div>
//     </div>
//   );
// }


import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TopSellingList({ products }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Top Selling Products</h3>
          <p className="text-sm text-gray-500">Best performers this month</p>
        </div>
        <button className="text-[#501b46] font-medium hover:text-purple-800 transition-colors text-sm">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {products?.map((product, index) => (
          <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
            
            {/* Rank Badge */}
            <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg font-bold text-[#501b46] text-sm">
              #{index + 1}
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">{product._id}</h4>
              <p className="text-xs text-gray-500">{product.sales} sales</p>
            </div>
            
            {/* Revenue */}
            <div className="text-right">
              <p className="font-bold text-gray-900 text-sm">₹{product.revenue?.toLocaleString()}</p>
            </div>
            
            {/* Trend Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-bold">Hot</span>
            </div>

          </div>
        ))}

        {(!products || products.length === 0) && (
            <div className="p-8 text-center text-gray-400 text-sm">No sales data available</div>
        )}
      </div>
    </div>
  );
}