// import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";

// export default function DashboardStats({ stats }) {
//   const cards = [
//     {
//       title: "Total Revenue",
//       value: `₹${stats?.totalRevenue?.toLocaleString() || "0"}`,
//       icon: <DollarSign size={24} />,
//       bg: "bg-purple-100",
//       text: "text-purple-700",
//       trend: "+12.5% vs last month"
//     },
//     {
//       title: "Total Orders",
//       value: stats?.totalOrders || "0",
//       icon: <ShoppingBag size={24} />,
//       bg: "bg-blue-100",
//       text: "text-blue-700",
//       trend: "+8.2% vs last month"
//     },
//     {
//       title: "Inventory Items",
//       value: stats?.inventoryItems || "0",
//       icon: <Package size={24} />,
//       bg: "bg-yellow-100",
//       text: "text-yellow-700",
//       trend: "-3.1% vs last month"
//     },
//     {
//       title: "Avg. Order Value",
//       value: `₹${Math.round(stats?.avgOrderValue || 0).toLocaleString()}`,
//       icon: <TrendingUp size={24} />,
//       bg: "bg-green-100",
//       text: "text-green-700",
//       trend: "+15.3% vs last month"
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//       {cards.map((card, index) => (
//         <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
//           <div className="flex justify-between items-start mb-4">
//             <div>
//               <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
//               <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
//             </div>
//             <div className={`p-3 rounded-xl ${card.bg} ${card.text}`}>
//               {card.icon}
//             </div>
//           </div>
//           <p className={`text-xs font-medium ${card.trend.includes("+") ? "text-green-600" : "text-red-500"}`}>
//             {card.trend}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }


import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

export default function DashboardStats({ stats }) {
  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || "0"}`,
      change: '+12.5%', // Placeholder trend
      isPositive: true,
      icon: DollarSign,
      iconBgColor: 'bg-purple-600', // Adjusted to your theme
      iconColor: 'text-white'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || "0",
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      iconBgColor: 'bg-blue-600',
      iconColor: 'text-white'
    },
    {
      title: 'Inventory Items',
      value: stats?.inventoryItems || "0",
      change: '-3.1%',
      isPositive: false,
      icon: Package,
      iconBgColor: 'bg-yellow-500',
      iconColor: 'text-white'
    },
    {
      title: 'Avg. Order Value',
      value: `₹${Math.round(stats?.avgOrderValue || 0).toLocaleString()}`,
      change: '+15.3%',
      isPositive: true,
      icon: TrendingUp,
      iconBgColor: 'bg-green-600',
      iconColor: 'text-white'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? '↑' : '↓'} {stat.change}
                </span>
                <span className="text-xs text-gray-400">vs last month</span>
              </div>
            </div>
            <div className={`${stat.iconBgColor} w-12 h-12 rounded-xl flex items-center justify-center shadow-md`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}