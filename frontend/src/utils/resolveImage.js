import { getImageUrl } from "./getImageUrl";

export const resolveImage = (img) => {
  if (!img) return "/placeholder.svg";

  // If array is passed, take the first element
  if (Array.isArray(img)) {
    img = img[0];
  }

  if (typeof img !== "string") return "/placeholder.svg";

  return getImageUrl(img);
};