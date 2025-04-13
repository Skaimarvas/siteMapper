import fs from "fs";
import chalk from "chalk";
import { create } from "xmlbuilder2";
import { sitemapDir } from "../shared/libs/constants.js";
import path from "path";

export default function generateSitemap(urls, filename) {
  const root = create({ version: "1.0" }).ele("urlset", {
    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
  });

  for (const url of urls) {
    root.ele("url").ele("loc").txt(url).ele("priority").txt("0.5").up().up();
  }

  const xml = root.end({ prettyPrint: true });
  const fullPath = path.join(sitemapDir, filename);
  fs.writeFileSync(fullPath, xml, "utf8");
  console.log(chalk.green(`✅ ${filename} created with ${urls.size} URLs!`));
}
