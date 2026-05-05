// export function normalizeMetal(pd = {}) {
//   const rawType = String(pd.metalType || "").trim().toLowerCase();
//   const rawPurity = String(pd.metalPurity || "").trim().toUpperCase();

//   let type = null;
//   let purity = null;

//   /* ================= TYPE ================= */
//   if (rawType === "gold") type = "gold";
//   else if (rawType === "silver") type = "silver";
//   else if (rawType === "platinum") type = "platinum";

//   if (!type || !rawPurity) return { type, purity: null };

//   /* ================= PURITY ================= */

//   // GOLD (already correct)
//   if (type === "gold") {
//     const allowed = ["9KT", "10KT", "14KT", "18KT", "22KT", "24KT"];
//     purity = allowed.includes(rawPurity) ? rawPurity : null;
//   }

//   // SILVER
//   if (type === "silver") {
//     const allowed = ["999", "925"];
//     purity = allowed.includes(rawPurity) ? rawPurity : null;
//   }

//   // PLATINUM 🔥 MAIN FIX
//   if (type === "platinum") {
//     if (rawPurity === "950") purity = "PT950";
//     if (rawPurity === "900") purity = "PT900";
//   }

//   return { type, purity };
// }

// export const normalizeMetal = (pd = {}) => {
//   const type = (pd.metalType || "").toLowerCase().trim();
//   const purity = String(pd.metalPurity || "").trim();

//   if (!type || !purity) return { type: null, purity: null };

//   return { type, purity };
// };

export const normalizeMetal = (pd = {}) => {
  const rawType = (pd.metalType || "").toLowerCase().trim();
  const rawPurity = String(pd.metalPurity || "").toUpperCase().replace(/\s/g, "");

  let type = null;
  let purity = null;

  if (rawType.includes("gold")) type = "gold";
  if (rawType.includes("silver")) type = "silver";
  if (rawType.includes("platinum")) type = "platinum";

  if (rawPurity.includes("24")) purity = "24KT";
  else if (rawPurity.includes("22")) purity = "22KT";
  else if (rawPurity.includes("18")) purity = "18KT";
  else if (rawPurity.includes("925")) purity = "925";
  else if (rawPurity.includes("999")) purity = "999";
  else if (rawPurity.includes("950")) purity = "950";

  return { type, purity };
};
