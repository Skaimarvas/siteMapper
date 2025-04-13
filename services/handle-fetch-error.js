import chalk from 'chalk';
import { MAX_RETRIES } from '../shared/libs/constants.js';
export const error500Urls = [];
export const error404Urls = [];

export default function handleFetchError(err, url, attempt) {
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