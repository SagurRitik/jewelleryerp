export const getImageUrl = (img) => {
  if (!img) {
    return "/placeholder.png";
  }

  // 1. Handle File objects (blobs) for local previews
  if (typeof window !== "undefined" && img instanceof File) {
    try {
      return URL.createObjectURL(img);
    } catch (e) {
      console.error("Error creating object URL:", e);
      return "/placeholder.png";
    }
  }

  if (typeof img !== "string") {
    return "/placeholder.png";
  }

  let normalized = img.replace(/\\/g, "/");

  // 2. Strip accidentally stored local domains
  normalized = normalized.replace(/^https?:\/\/(localhost|127\.0\.0\.1):[0-9]+/, "");

  // 3. If it's already a full URL, return it
  if (normalized.startsWith("http") || normalized.startsWith("blob:")) {
    return normalized;
  }

  // 4. Construct base URL
  let IMAGE_BASE =
    import.meta.env.VITE_IMAGE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "";

  if (typeof window !== "undefined") {
    // Fallback if empty, or force to current origin if we are in production but env is stuck on localhost
    if (!IMAGE_BASE || (IMAGE_BASE.includes("localhost") && !window.location.hostname.includes("localhost"))) {
      IMAGE_BASE = window.location.origin;
    }
  }

  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

  return `${IMAGE_BASE}${path}`;
};