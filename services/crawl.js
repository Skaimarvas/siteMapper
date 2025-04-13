import fetchPage from "./fetch-page.js";
import extractLinks from "./extract-links.js";

export const visited = new Set();
export const sitemapUrls = new Set();

export default async function crawl(url) {
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
