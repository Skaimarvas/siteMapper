import fetchPage from "./fetch-page.js";
import extractLinks from "./extract-links.js";

export const visited = new Set();
export const sitemapUrls = new Set();

export default async function crawl(url) {
 const decodedUrl = decodeURIComponent(url);
  if (visited.has(decodedUrl)) {
    return;
  }
  visited.add(decodedUrl);

  const html = await fetchPage(decodedUrl);
  if (!html) {
    return;
  }

  sitemapUrls.add(decodedUrl);

  const links = extractLinks(html, decodedUrl);
  for (const link of links) {
    if (!visited.has(link)) {
      await crawl(link);
    }
  }
}
