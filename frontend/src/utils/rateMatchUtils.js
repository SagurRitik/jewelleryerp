import { DIAMOND_COLORS, DIAMOND_CLARITIES } from "./diamondConstants";

const COLOR_GROUPS = {
  "D-F": ["D", "E", "F"],
  "G-H": ["G", "H"],
  "I-J": ["I", "J"],
  "K-L": ["K", "L"],
  "M-N": ["M", "N"],
  "O-P": ["O", "P"],
};

const CLARITY_GROUPS = {
  "VVS-VS": ["VVS1", "VVS2", "VS1", "VS2"],
  "SI-I": ["SI1", "SI2", "I1", "I2"],
};

const getIndexRange = (value, list, groupMap = {}) => {
  if (!value) return [-1, -1];
  if (groupMap[value]) {
    const indexes = groupMap[value].map((v) => list.indexOf(v));
    return [Math.min(...indexes), Math.max(...indexes)];
  }
  const idx = list.indexOf(value);
  return [idx, idx];
};

export const findMatchingDiamondRate = (diamond, diamondRates = []) => {
  if (!diamondRates.length) return null;

  const weight = parseFloat(diamond.weight) || 0;
  if (!weight) return null;

  const [colorFromIdx, colorToIdx] = getIndexRange(diamond.color, DIAMOND_COLORS, COLOR_GROUPS);
  const [clarityFromIdx, clarityToIdx] = getIndexRange(diamond.clarity, DIAMOND_CLARITIES, CLARITY_GROUPS);

  // If a valid selection was not made, cannot match
  if (colorFromIdx === -1 || clarityFromIdx === -1 || !diamond.shape) return null;

  const match = diamondRates.find((rate) => {
    if (!rate.active) return false;
    // Basic Shape and Weight matching
    if (rate.shape?.toLowerCase() !== diamond.shape?.toLowerCase()) return false;
    if (weight < rate.weightFrom || weight > rate.weightTo) return false;

    // Overlap checks for Color and Clarity.
    // The admin's recorded ranges: rate.colorFromIndex to rate.colorToIndex.
    // Overlaps if (A starts before B ends) AND (A ends after B starts)
    const colorOverlap = colorFromIdx <= rate.colorToIndex && colorToIdx >= rate.colorFromIndex;
    if (!colorOverlap) return false;

    const clarityOverlap = clarityFromIdx <= rate.clarityToIndex && clarityToIdx >= rate.clarityFromIndex;
    if (!clarityOverlap) return false;

    return true;
  });

  return match ? parseFloat(match.rate) : null;
};

export const findMatchingStoneRate = (stone, stoneRates = []) => {
  if (!stoneRates.length) return null;

  const weight = parseFloat(stone.weight) || 0;
  if (!weight) return null;
  // If required props are missing
  if (!stone.type) return null;

  const match = stoneRates.find((rate) => {
    if (!rate.active) return false;
    
    // Type and Shape match (Case-insensitive)
    if (rate.stoneType?.toLowerCase() !== stone.type?.toLowerCase()) return false;
    // DB shape might be empty if it applies to all shapes. If not empty, it must match.
    if (rate.shape && rate.shape?.toLowerCase() !== stone.shape?.toLowerCase()) return false;

    // Weight Match
    if (weight < (rate.weightFrom || 0) || weight > (rate.weightTo || 999)) return false;

    return true;
  });

  return match ? parseFloat(match.rate) : null;
};
