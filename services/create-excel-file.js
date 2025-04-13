import chalk from "chalk";
import xlsx from "xlsx";
import path from 'path';
import { excelDir } from "../shared/libs/constants.js";



export function save500ErrorsToExcel(error500Urls) {
  const ws = xlsx.utils.aoa_to_sheet([
    ["URL", "Status"],
    ...error500Urls.map((url) => [url, "500"]),
  ]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "500 Errors");
  

  const outputFileName = path.join(excelDir, "500_errors.xlsx");
  xlsx.writeFile(wb, outputFileName);
  console.log(
    chalk.green(
      `✅  ${
        error500Urls && Array.isArray(error500Urls) && error500Urls.length
      }  500 error URLs saved to  "500_errors.xlsx"`
    )
  );
}

export function save404ErrorsToExcel(error404Urls) {
  const ws = xlsx.utils.aoa_to_sheet([
    ["URL", "Status"],
    ...error404Urls.map((url) => [url, "404"]),
  ]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "404 Errors");

  const outputFileName = path.join(excelDir, "404_errors.xlsx");
  xlsx.writeFile(wb, outputFileName);
  console.log(
    chalk.green(
      `✅ ${
        error404Urls && Array.isArray(error404Urls) && error404Urls.length
      } 404 error links found,  404 error URLs saved to 404_errors.xlsx`
    )
  );
}
