import { scraper } from './utils/scraper';
import { load } from "cheerio"
import fs from 'fs';

interface UrlEntry {
  url: string;
}

interface JsonStructure {
  data: UrlEntry[];
}

/**
 * Saves new product detail URLs to a JSON file.
 *
 * This function reads an existing JSON file to retrieve current data, adds new URLs to it, 
 * and writes the updated data back to the file. If the file does not exist or is invalid, 
 * a new file will be created with the new URLs.
 *
 * @param {string[]} newUrls - An array of new product detail URLs to be added.
 * @param {string} filePath - The file path where the URLs should be saved.
 *
 * @throws Will throw an error if the file cannot be written.
 */

function saveUrlsToFileJson(newUrls: string[], filePath: string): void {
  let existingData: JsonStructure = { data: [] };
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      if (fileContent) {
        existingData = JSON.parse(fileContent);
      }
    }
  } catch (error) {
    console.error('Failed to read or parse JSON file. Error: ', error);
    console.log('A new file will be created.')
    existingData = { data: [] };
  }

  const formattedUrlsToAdd: UrlEntry[] = newUrls.map(url => ({ url: url }));
  existingData.data.push(...formattedUrlsToAdd);
  const updatedJsonString = JSON.stringify(existingData, null, 2);

  try {
    fs.writeFileSync(filePath, updatedJsonString, 'utf-8');
    console.log(`${newUrls.length} URLs of product details have been saved to ${filePath}`);
  } catch (error) {
    console.error('Failed to write to JSON file. Error: ', error);
    throw error;
  }
}

  /**
   * Scrapes product detail URLs from a product search page.
   *
   * @param {string} url - The URL of the product search page to scrape.
   *
   * @throws Will throw an error if the scraper fails to retrieve data after 3 attempts.
   * @throws Will throw an error if the scraper fails to retrieve data from the page.
   * @throws Will throw an error if the scraper fails to save the URLs to a file.
   */
async function scrapingProductSearch(url: string) {
  try {
  
    const response = await scraper(url);
    const data = response;
    const $ = load(data);
    const scriptEl = $('script#__NEXT_DATA__').first().text();
    const result = JSON.parse(scriptEl);

    const rootQuery = result.props.pageProps.initialApolloState.ROOT_QUERY;
    const keyFromRootQuery = Object.keys(rootQuery);
    const rankBasedProducts = keyFromRootQuery.find(key => key.startsWith('rankBasedProducts'));
    let products = [];
    if (rankBasedProducts) {
      
      let productUrls = [];
      products = rootQuery[rankBasedProducts];

      for (const product of products) {
        const refString = product.__ref;
        const productString = refString.replace('Product:', '');
        const productIdJson = JSON.parse(productString);
        productUrls.push(`https://shopping.naver.com/window-products/style/${productIdJson.id}`);
      }

      const outputFileName = './datas/product-detail-urls.json';
      saveUrlsToFileJson(productUrls, outputFileName);

    } else {
      console.log('Key of rankBasedProducts is not found.');
    }

  } catch (error) {
    console.error('Error when scraping product search: ', error);
    throw error;
  }
}

  /**
   * Main function to scrape product detail URLs from product search pages.
   *
   * This function reads product search URLs from a JSON file, scrapes the product detail URLs from each page,
   * and saves the URLs to a new JSON file.
   *
   * @throws Will throw an error if the scraper fails to retrieve data from any of the pages.
   * @throws Will throw an error if the scraper fails to save the URLs to a file.
   */
async function main() {
  const productSearchUrls = require('../datas/product-search-urls.json')
  const urls = productSearchUrls.data.map((item: any) => item);
  
  for (const result of urls) {
    await scrapingProductSearch(result.url);
  }

  console.log("Done!");

}
main();