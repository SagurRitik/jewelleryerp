
import Order from "../../models/Order.js";

export const getOrderClosingSummary = async (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;
    let start, end;
    summary.gst = Number(summary.gst.toFixed(2));
summary.totalSale = Number(summary.totalSale.toFixed(2));


    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else if (date) {
      start = new Date(date);
      end = new Date(date);
    } else {
      start = new Date();
      end = new Date();
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // ✅ CORRECT FIELD: createdAt
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    });

    let summary = {
      totalOrders: orders.length,
      totalSale: 0,
      gst: 0,
      online: 0,
      cod: 0,
    };

    orders.forEach((order) => {
      const amount = order.pricingSnapshot?.grandTotal || 0;
      const gst =
        (order.pricingSnapshot?.gst || 0) +
        (order.pricingSnapshot?.gstOnMaking || 0);

      summary.totalSale += amount;
      summary.gst += gst;

      if (order.paymentMode === "COD") {
        summary.cod += amount;
      } else {
        summary.online += amount;
      }
    });

    res.json({
      success: true,
      dateRange: {
        start: start.toLocaleDateString("en-IN"),
        end: end.toLocaleDateString("en-IN"),
      },
      summary: {
        ...summary,
        netSale: summary.totalSale - summary.gst,
      },
    });
  } catch (err) {
    console.error("Order Closing Summary Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
