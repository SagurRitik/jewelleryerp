

export const normalizeMetal = (pd = {}) => {
  const rawType = (pd.metalType || "").toLowerCase().trim();
  const rawPurity = String(pd.metalPurity || "").toUpperCase().replace(/\s/g, "");

  let type = null;
  let purity = null;

  if (rawType.includes("gold")) type = "gold";
  if (rawType.includes("silver")) type = "silver";
  if (rawType.includes("platinum")) type = "platinum";

  // if (rawPurity.includes("24")) purity = "24KT";
  // else if (rawPurity.includes("22")) purity = "22KT";
  // else if (rawPurity.includes("18")) purity = "18KT";
  // else if (rawPurity.includes("925")) purity = "925";
  // else if (rawPurity.includes("999")) purity = "999";
  // else if (rawPurity.includes("950")) purity = "950";

//   if (rawPurity.includes("24")) purity = "24KT";
// else if (rawPurity.includes("22")) purity = "22KT";
// else if (rawPurity.includes("18")) purity = "18KT";
// else if (rawPurity.includes("14")) purity = "14KT";
// else if (rawPurity.includes("10")) purity = "10KT";
// else if (rawPurity.includes("9"))  purity = "9KT";
// else if (rawPurity.includes("925")) purity = "925";
// else if (rawPurity.includes("999")) purity = "999";
// else if (rawPurity.includes("835")) purity = "835";
// else if (rawPurity.includes("800")) purity = "800";
// else if (rawPurity.includes("950")) purity = "950";

if (rawPurity.includes("24")) purity = "24KT";
else if (rawPurity.includes("22")) purity = "22KT";
else if (rawPurity.includes("18")) purity = "18KT";
else if (rawPurity.includes("14")) purity = "14KT";
else if (rawPurity === "9" || rawPurity.includes("9KT")) purity = "9KT";
else if (rawPurity.includes("999")) purity = "999";
else if (rawPurity.includes("925")) purity = "925";
else if (rawPurity.includes("835")) purity = "835";
else if (rawPurity.includes("800")) purity = "800";
else if (rawPurity.includes("950")) purity = "950";



  return { type, purity };
};


