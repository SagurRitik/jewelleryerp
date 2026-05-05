

import { useEffect, useState } from "react";
import DailySalesClosingUI from "../components/DailySalesClosing";
import { getDailySalesClosing } from "../api/salesInvoiceApi";

export default function DailySalesClosing() {
  const [data, setData] = useState(null);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);
- getDailySalesClosing({ date })
+ getDailySalesClosing(date)
    .then((res) => {
      setData(res.data.summary);
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, [date]);


  if (loading) return <p className="p-6">Loading sales closing...</p>;

  return (
    <DailySalesClosingUI
      data={data}
      date={date}
      onDateChange={setDate}
    />
  );
}
