import PosCreditNote from "../models/PosCreditNote.js";

export const generateCreditNoteNo = async () => {
  const fy = (() => {
    const d = new Date();
    const y = d.getFullYear();
    return d.getMonth() + 1 < 4 ? `${y - 1}-${y}` : `${y}-${y + 1}`;
  })();

  const last = await PosCreditNote.findOne({
    creditNoteNo: new RegExp(`CN/${fy}/`)
  }).sort({ createdAt: -1 });

  const lastNo = last
    ? Number(last.creditNoteNo.split("/").pop())
    : 0;

  return `CN/${fy}/${String(lastNo + 1).padStart(5, "0")}`;
};
