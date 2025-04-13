import axios from "axios";
import chalk from "chalk";
import * as cheerio from "cheerio";
import fs from "fs";
import { URL } from "url";
import xlsx from "xlsx";
import { create } from "xmlbuilder2";
import readline from "readline";

const TIMEOUT = 10000;
const MAX_RETRIES = 2;
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9",
};
const visited = new Set();
const sitemapUrls = new Set();
const error500Urls = [];
const error404Urls = [];

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function fetchPage(url) {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.get(url, {
        timeout: TIMEOUT,
        headers: HEADERS,
      });
      console.log(chalk.green(`✅ Fetched ${url}`, response.status));
      return response.status === 200 ? response.data : null;
    } catch (err) {
      attempt++;
      handleFetchError(err, url, attempt);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

function handleFetchError(err, url, attempt) {
  if (err.response?.status === 500) {
    error500Urls.push(url);
    console.error(chalk.red(`🚫 500 Error: ${url}`));
  } else if (err.response?.status === 404) {
    error404Urls.push(url);
    console.error(chalk.red(`🚫 404 Error: ${url}`));
  } else {
    console.error(
      chalk.red(
        `‼️ Error fetching ${url}: ${err.message}. Attempt ${attempt} of ${MAX_RETRIES}.`
      )
    );
    if (attempt >= MAX_RETRIES) {
      console.error(
        chalk.red(`🚳 Failed to fetch ${url} after ${MAX_RETRIES} attempts.`)
      );
    }
  }
}

function extractLinks(html, baseUrl) {
  const $ = cheerio.load(html);
  const links = new Set();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    try {
      const fullUrl = new URL(href, baseUrl);

      if (isExcludedFile(fullUrl.pathname)) {
        console.warn(
          chalk.yellow(`🔒 Skipping document file: ${fullUrl.href}`)
        );
        return;
      }

      if (fullUrl.hostname === new URL(baseUrl).hostname) {
        links.add(fullUrl.href.split("#")[0]);
      }
    } catch (error) {
      console.error(chalk.red(`🚫 Invalid URL: ${href}`));
    }
  });

  return Array.from(links);
}

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
  const fileExtension = pathname.split(".").pop().toLowerCase();
  return excludedExtensions.includes(fileExtension);
}

async function crawl(url) {
  if (visited.has(url)) {
    return;
  }
  visited.add(url);

  const html = await fetchPage(url);
  if (!html) {
    return;
  }

  sitemapUrls.add(url);

  const links = extractLinks(html, url);
  for (const link of links) {
    if (!visited.has(link)) {
      await crawl(link);
    }
  }
}

function generateSitemap(urls, filename) {
  const root = create({ version: "1.0" }).ele("urlset", {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
  });

  for (const url of urls) {
    root.ele("url").ele("loc").txt(url).ele("priority").txt("0.5").up().up();
  }

  const xml = root.end({ prettyPrint: true });
  fs.writeFileSync(filename, xml, "utf8");
  console.log(chalk.green(`✅ ${filename} created with ${urls.size} URLs!`));
}
function save500ErrorsToExcel() {
  const ws = xlsx.utils.aoa_to_sheet([
    ["URL", "Status"],
    ...error500Urls.map((url) => [url, "500"]),
  ]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "500 Errors");

  const outputFileName = "500_errors.xlsx";
  xlsx.writeFile(wb, outputFileName);
  console.log(chalk.green(`✅ 500 error URLs saved to ${outputFileName}`));
}

function save404ErrorsToExcel() {
  const ws = xlsx.utils.aoa_to_sheet([
    ["URL", "Status"],
    ...error404Urls.map((url) => [url, "404"]),
  ]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "404 Errors");

  const outputFileName = "404_errors.xlsx";
  xlsx.writeFile(wb, outputFileName);
  console.log(chalk.green(`✅ 404 error URLs saved to ${outputFileName}`));
}

(async () => {
  const rawUrl = await askQuestion("🔗 Enter your starting URL: ");
  let validUrl;

  try {
    validUrl = new URL(rawUrl);
  } catch (err) {
    console.error(chalk.red("❌ Invalid URL. Exiting."));
    process.exit(1);
  }

  const confirm = await askQuestion(
    `✅ Confirm URL "${validUrl.href}"? (y/n): `
  );
  if (confirm.toLowerCase() !== "y") {
    console.log(chalk.blue("🫥 Cancelled by user."));
    process.exit(0);
  }

  const filename = await askQuestion(
    "📄 Enter output XML filename (e.g. sitemap.xml): "
  );

  console.log(chalk.bgCyan(`🌐 Crawling started: ${validUrl.href}`));
  await crawl(validUrl.href);
  generateSitemap(sitemapUrls, filename);
  save500ErrorsToExcel();
  save404ErrorsToExcel();
})();
