import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

export const TIMEOUT = 10000;
export const MAX_RETRIES = 2;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const excelDir = path.join(__dirname, "../../public/excel");
export const sitemapDir = path.join(__dirname, "../../public/seo");

[excelDir, sitemapDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
