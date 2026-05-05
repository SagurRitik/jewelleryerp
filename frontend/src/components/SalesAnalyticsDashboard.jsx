import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "react-router-dom";


/**
 * Expected data structure
 * data = {
 *   summary: { posSale, orderSale },
 *   daily: [{ date, pos, orders }],
 *   paymentModes: {
 *     pos: { Cash, UPI, Card, Bank },
 *     orders: { Online, COD }
 *   }
 * }
 */

export default function SalesAnalyticsDashboard({ data }) {
  if (!data) return null;

  /* ---------- SAFETY DEFAULTS ---------- */
  const dailyData = data.daily || [];
  const summary = data.summary || { posSale: 0, orderSale: 0 };
  const posPayments = data.paymentModes?.pos || {};
  const orderPayments = data.paymentModes?.orders || {};

  /* ---------- PIE DATA ---------- */
  const salesSplitData = [
    { name: "POS Sales", value: summary.posSale || 0 },
    { name: "Order Sales", value: summary.orderSale || 0 },
  ];

  /* ---------- BAR DATA ---------- */
  const paymentModeData = [
    { name: "Cash", value: posPayments.Cash || 0 },
    { name: "UPI", value: posPayments.UPI || 0 },
    { name: "Card", value: posPayments.Card || 0 },
    { name: "Bank", value: posPayments.Bank || 0 },
    { name: "Online", value: orderPayments.Online || 0 },
    { name: "COD", value: orderPayments.COD || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* ================= DAILY SALES LINE CHART ================= */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-3">Daily Sales Trend</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pos" strokeWidth={2} />
            <Line type="monotone" dataKey="orders" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ================= PIE + BAR GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---------- SALES CONTRIBUTION PIE ---------- */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Sales Contribution</h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={salesSplitData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ---------- PAYMENT MODE BAR ---------- */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Payment Mode Split</h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={paymentModeData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
         <Link
                  to="/pos-closing-report"
                  className="
                    px-5 py-2.5 rounded-md
                    bg-[#5A374F] text-white
                    text-sm font-semibold
                    hover:bg-[#4a2d42]
                    transition
                    whitespace-nowrap
                  "
                >
                  POS Closing Report
                </Link>
    </div>
  );
}
