

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function DashboardCharts({ salesData = [], categoryData = [] }) {
  
  // 1️⃣ Format Sales Data
  const formattedSalesData = salesData.map(item => {
    // Backend se data ab dynamic format mein aa raha hai based on filter
    // Hum bas display logic rakhenge
    let label = item._id; 
    
    // Auto-detect format if needed, or rely on backend string
    // E.g. "2026-01-29" -> "29 Jan"
    if (label.includes("-") && label.length === 10) {
        const date = new Date(label);
        label = date.toLocaleString('default', { day: 'numeric', month: 'short' });
    } else if (label.includes("-") && label.length === 7) {
        const [y, m] = label.split("-");
        const date = new Date(y, m - 1);
        label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    }

    return { name: label, revenue: item.revenue };
  });

  // 2️⃣ Format Category Data
  const COLORS = ['#501b46', '#703e66', '#9d6b8e', '#cbb0c2', '#e8dce4'];
  const formattedCategoryData = categoryData.map((item, index) => ({
    category: item._id,
    sales: item.sales,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* SALES CHART */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Sales Overview</h3>
          <p className="text-sm text-gray-500">Revenue trends for selected period</p>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedSalesData.length ? formattedSalesData : [{name:'No Data', revenue:0}]}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#501b46" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#501b46" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6b7280'}} dy={10} minTickGap={20} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#6b7280'}} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#501b46" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CATEGORY CHART */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Top Categories</h3>
          <p className="text-sm text-gray-500">Sales by product category</p>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedCategoryData.length ? formattedCategoryData : [{category:'No Data', sales:0}]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#374151'}} width={100} />
              <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px' }} />
              <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={30}>
                {formattedCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}