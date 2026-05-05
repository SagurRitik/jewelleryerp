import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use ENV in production, fallback to project root uploads
export const uploadPath =
  process.env.UPLOAD_PATH || path.join(process.cwd(), "uploads");