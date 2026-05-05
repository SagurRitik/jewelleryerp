// utils/format.js

export const formatCt = (value, type = "total") => {
  const num = Number(value);

  if (!num) return "0";

  // 🔥 TOTAL weight → NO rounding (real value)
  if (type === "total") {
    return num.toString();
  }

  // 🔥 PER PIECE → clean display
  if (type === "perPiece") {
    return num < 1
      ? num.toFixed(3)
      : num.toFixed(2);
  }

  return num;
};