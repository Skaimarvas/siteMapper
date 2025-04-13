import chalk from "chalk";
import { URL } from "url";
import crawl from "./services/crawl.js";
import askQuestion  from "./services/ask-questions.js";
import {
  save404ErrorsToExcel,
  save500ErrorsToExcel,
} from "./services/create-excel-file.js";
import generateSitemap from "./services/generate-sitemap.js";
import { error404Urls, error500Urls } from "./services/handle-fetch-error.js";
import { sitemapUrls } from "./services/crawl.js";

(async () => {
  const rawUrl = await askQuestion("🔗🌐 Enter your starting URL 🌐🔗: ");
  let validUrl;

  try {
    validUrl = new URL(rawUrl);
  } catch (err) {
    console.error(chalk.red("❌ Invalid URL. Exiting. ❌"));
    process.exit(1);
  }

  const confirm = await askQuestion(
    `✅ Confirm URL "${validUrl.href}"? (y/n): `
  );
  if (confirm.toLowerCase() !== "y") {
    console.log(chalk.blue("🫥 Cancelled by user. 🫥"));
    process.exit(0);
  }

  const filename = await askQuestion(
    "📄 Enter output XML filename (e.g. sitemap.xml): "
  );

  console.log(chalk.bgCyan(`🌐 Crawling started: ${validUrl.href}`));
  await crawl(validUrl.href);
  generateSitemap(sitemapUrls, filename);
  if(error404Urls && Array.isArray(error404Urls) && error404Urls.length > 0) {
    save404ErrorsToExcel(error404Urls);
  }
  if(error500Urls && Array.isArray(error500Urls) && error500Urls.length > 0) {
    save500ErrorsToExcel(error500Urls);
  }
  console.log(chalk.green("✅ Crawling completed!"));
})();
