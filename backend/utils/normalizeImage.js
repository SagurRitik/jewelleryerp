


// export const normalizeImage = (img) => {
//   if (!img) return null;

//   // remove domain if accidentally stored
//   img = img.replace(/^https?:\/\/[^/]+/, "");

//   // remove leading slashes
//   img = img.replace(/^\/+/, "");

//   // remove duplicate uploads
//   if (img.startsWith("uploads/uploads/")) {
//     img = img.replace("uploads/uploads/", "uploads/");
//   }

//   // ensure uploads prefix
//   if (!img.startsWith("uploads/")) {
//     img = `uploads/${img}`;
//   }

//   // FINAL SNAPSHOT FORMAT
//   return `/${img}`;
// };


// export const normalizeImage = (img) => {
//   if (!img) return null;

//   // ✅ already full URL → return as is
//   if (img.startsWith("http")) return img;

//   const BASE_URL = process.env.BASE_URL||"http://122.176.216.225:5000";
//   // || "http://localhost:5000";

//   img = img.replace(/^https?:\/\/[^/]+/, "");
//   img = img.replace(/^\/+/, "");

//   if (img.startsWith("uploads/uploads/")) {
//     img = img.replace("uploads/uploads/", "uploads/");
//   }

//   if (!img.startsWith("uploads/")) {
//     img = `uploads/${img}`;
//   }

//   return `${BASE_URL}/${img}`;
// };


export const normalizeImage = (img) => {
  if (!img) return null;

  const BASE_URL =
    process.env.IMAGE_BASE_URL ||
    process.env.BASE_URL ||
    "https://devjewelerp.nazaradiamonds.com";

  // 🔥 REMOVE DOMAIN ALWAYS (IMPORTANT FIX)
  if (img.startsWith("http")) {
    img = img.replace(/^https?:\/\/[^/]+/, "");
  }

  img = img.replace(/^\/+/, "");

  if (img.startsWith("uploads/uploads/")) {
    img = img.replace("uploads/uploads/", "uploads/");
  }

  if (!img.startsWith("uploads/")) {
    img = `uploads/${img}`;
  }

  return `${BASE_URL}/${img}`;
};