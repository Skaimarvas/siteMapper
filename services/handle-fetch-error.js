import chalk from "chalk";
import { MAX_RETRIES } from "../shared/libs/constants.js";
export const error500Urls = new Set();
export const error404Urls = new Set();
export const redirectUrls = new Set();

export default function handleFetchError(err, url, attempt) {
  if (err.response?.status === 500 && !error500Urls.has(url)) {
    error500Urls.add(url);
    console.error(chalk.red(`🚫 500 Error: ${url}`));
  } else if (err.response?.status === 404 && !error404Urls.has(url)) {
    error404Urls.add(url);
    console.error(chalk.red(`🚫 404 Error: ${url}`));
  } else if (
    err.esponse?.status >= 300 &&
    err.response.status < 400 &&
    !redirectUrls.has(url)
  ) {
    redirectUrls.add({
      url,
      status: response.status,
      location: response.headers.get("location") || "N/A",
    });
  } else if (
    error404Urls.has(url) ||
    error500Urls.has(url) ||
    redirectUrls.has(url)
  ) {
    return;
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
