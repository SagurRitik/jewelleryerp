import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function SalesReportPage({ graphData, analytics }) {
  const { salesGraph = [] } = graphData || {};
  const { topProducts = [], categorySales = [] } = analytics || {};

  return (
    <div className="space-y-8 p-6">

      <h2 className="text-2xl font-bold text-gray-800">
        Sales Report
      </h2>

      {/* 🔹 SALES TREND */}
      <div className="bg-white p-5 rounded-xl border h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={salesGraph}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#5A374F"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 TOP PRODUCTS */}
      <div className="bg-white p-5 rounded-xl border">
        <h3 className="font-semibold mb-4">Top Products</h3>

        {topProducts.map((p, i) => (
          <div key={i} className="flex justify-between py-2 border-b">
            <span>{p._id}</span>
            <span>{p.sales} pcs</span>
          </div>
        ))}
      </div>

      {/* 🔹 CATEGORY */}
      <div className="bg-white p-5 rounded-xl border">
        <h3 className="font-semibold mb-4">Category Sales</h3>

        {categorySales.map((c, i) => (
          <div key={i} className="flex justify-between py-2 border-b">
            <span>{c._id}</span>
            <span>{c.sales}</span>
          </div>
        ))}
      </div>
    </div>
  );
}