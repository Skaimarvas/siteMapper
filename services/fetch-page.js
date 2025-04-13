import axios from 'axios';
import chalk from 'chalk';
import { MAX_RETRIES, TIMEOUT } from "../shared/libs/constants.js" 
import { HEADERS } from "../shared/libs/strings.js";
import handleFetchError from './handle-fetch-error.js';
export default async function fetchPage(url) {
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
  