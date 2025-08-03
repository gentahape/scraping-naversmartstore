import { load } from "cheerio"
import { scraper } from './utils/scraper';

/**
 * Scrapes the product detail from a given URL.
 *
 * @param {string} url The URL of the product to scrape.
 *
 * @returns {Promise<object>} The scraped product detail data.
 *
 * @throws {Error} If the URL is not from shopping.naver.com.
 * @throws {Error} If the scraper fails to retrieve data after 3 attempts.
 * @throws {Error} If the variable __PRELOADED_STATE__ is not found.
 */
export async function scrappingProductDetail(url: string) {
  try {
    const response = await scraper(url);
    const $ = load(response)
    const firstScriptEl = $('script').first().text();
    const preloadState = "window.__PRELOADED_STATE__=";
    
    const findPreloadState = firstScriptEl.indexOf(preloadState);
    if (findPreloadState === -1) {
      throw new Error("Variable __PRELOADED_STATE__ is not found!");
    }

    const preloadStateJson = firstScriptEl.replace(preloadState, '');
    const result = JSON.parse(preloadStateJson);

    return result;

  } catch (error) {
    console.error(`Error when processing data: ${error}`);
    throw error;
  }
}