import chalk from "chalk";
import * as cheerio from "cheerio";
import path from "path";

function isExcludedFile(pathname) {
  const excludedExtensions = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "zip",
    "rar",
  ];
  const fileExtension = path.extname(pathname).slice(1).toLowerCase();
  return excludedExtensions.includes(fileExtension);
}
const skippedLinks = new Set();
const invalidUrls = new Set();

export default function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = new Set();

  const baseHostname = new URL(baseUrl).hostname;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#")) return;
    try {
      const fullUrl = new URL(href, baseUrl);

      if (isExcludedFile(fullUrl.pathname)) {
        if (!skippedLinks.has(fullUrl.href)) {
          skippedLinks.add(fullUrl.href);
          console.warn(
            chalk.yellow(`🔒 Skipping document file: ${fullUrl.href}`)
          );
        }

        return;
      }

      if (fullUrl.hostname === baseHostname) {
        links.add(fullUrl.href.split("#")[0]);
      }
    } catch (error) {
      if (!invalidUrls.has(href)) {
        invalidUrls.add(href);
        console.error(chalk.red(`🚫 Invalid URL: ${href}`));
      }
    }
  });

  return Array.from(links);
}
