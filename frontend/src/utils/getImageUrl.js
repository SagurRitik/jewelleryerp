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

  // 2. Strip any domain prefix for uploaded files to ensure we use our configured base URL
  if (normalized.includes("/uploads/") || normalized.includes("uploads/")) {
    normalized = normalized.replace(/^https?:\/\/[^/]+/, "");
  }

  // 3. If it's already a full URL (like external images or blob URLs), return it
  if (normalized.startsWith("http") || normalized.startsWith("blob:")) {
    return normalized;
  }

  // 4. Construct base URL
  let IMAGE_BASE =
    import.meta.env.VITE_IMAGE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "";

  if (typeof window !== "undefined") {
    // If the configured base URL is HTTP but the site is loaded over HTTPS,
    // the browser will block or upgrade it and fail. Fallback to current origin.
    const isHttps = window.location.protocol === "https:";
    if (
      !IMAGE_BASE ||
      (IMAGE_BASE.includes("localhost") && !window.location.hostname.includes("localhost")) ||
      (isHttps && IMAGE_BASE.startsWith("http://")) ||
      (IMAGE_BASE.includes("122.176.216.225") && window.location.hostname !== "122.176.216.225")
    ) {
      IMAGE_BASE = window.location.origin;
    }
  }

  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;

  return `${IMAGE_BASE}${path}`;
};