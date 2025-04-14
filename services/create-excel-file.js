import chalk from "chalk";
import path from "path";
import xlsx from "xlsx";
import { excelDir } from "../shared/libs/constants.js";

export function save500ErrorsToExcel(error500Urls) {
  const urls = Array.from(error500Urls);
  if (!urls && !Array.isArray(urls) && !urls.length) {
    console.error(chalk.red("❌ No 500 error URLs found."));
    return;
  }
  const ws = xlsx.utils.aoa_to_sheet([
    ["URL", "Status"],
    ...urls.map((url) => [url, "500"]),
  ]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "500 Errors");

  const outputFileName = path.join(excelDir, "500_errors.xlsx");
  xlsx.writeFile(wb, outputFileName);
  console.log(
    chalk.green(
      `✅  ${urls.length}  500 error URLs saved to  "500_errors.xlsx"`
    )
  );
}

export function save404ErrorsToExcel(error404Urls) {
  const urls = Array.from(error404Urls);
  if (!urls && !Array.isArray(urls) && !urls.length) {
    console.error(chalk.red("❌ No 500 error URLs found."));
    return;
  }
  const ws = xlsx.utils.aoa_to_sheet([
    ["URL", "Status"],
    ...urls.map((url) => [url, "404"]),
  ]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "404 Errors");

  const outputFileName = path.join(excelDir, "404_errors.xlsx");
  xlsx.writeFile(wb, outputFileName);
  console.log(
    chalk.green(
      `✅ ${urls.length} 404 error links found,  404 error URLs saved to 404_errors.xlsx`
    )
  );
}

export function saveRedirectErrorsToExcel(redirectUrls) {
  const urls = Array.from(redirectUrls);
  if (!urls && !Array.isArray(urls) && !urls.length) {
    console.error(chalk.red("❌ No redirect URLs found."));
    return;
  }
  const ws = xlsx.utils.aoa_to_sheet([
    ["URL", "Status", "Redirect Location"],
    ...urls.map((url) => [url, url.status, url.location]),
  ]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Redirects");
  const outputFileName = path.join(excelDir, "redirect_urls.xlsx");
  xlsx.writeFile(wb, outputFileName);
  console.log(
    chalk.green(`✅ ${urls.length} redirect URLs saved to redirect_urls.xlsx`)
  );
}
