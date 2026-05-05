

/* =========================================================
   Diamond Slab Overlap Validator (SYNC WITH BACKEND)
   ========================================================= */

import { DIAMOND_COLORS, DIAMOND_CLARITIES } from "./diamondConstants";

/* =========================================================
   Diamond Slab Overlap Validator (SYNC WITH BACKEND)
   ========================================================= */

const overlap = (aFrom, aTo, bFrom, bTo) =>
  Math.max(aFrom, bFrom) <= Math.min(aTo, bTo);

export const isOverlappingSlab = (newSlab, existingSlabs = []) => {
  return existingSlabs.some((s) => {
    if (s.shape !== newSlab.shape) return false;
    if (!s.active) return false;

    // Weight Overlap
    const weightOverlap =
      newSlab.weightFrom < s.weightTo &&
      newSlab.weightTo > s.weightFrom;

    // Color Overlap (Index based)
    const colorOverlap =
      newSlab.colorFromIndex <= s.colorToIndex &&
      newSlab.colorToIndex >= s.colorFromIndex;

    // Clarity Overlap (Index based)
    const clarityOverlap =
      newSlab.clarityFromIndex <= s.clarityToIndex &&
      newSlab.clarityToIndex >= s.clarityFromIndex;

    return weightOverlap && colorOverlap && clarityOverlap;
  });
};
