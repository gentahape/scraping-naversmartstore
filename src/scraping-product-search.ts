import { scraper } from './utils/scraper';
import { load } from "cheerio"
import fs from 'fs';

interface UrlEntry {
  url: string;
}

interface JsonStructure {
  data: UrlEntry[];
}

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

async function main() {
  const productSearchUrls = require('../datas/product-search-urls.json')
  const urls = productSearchUrls.data.map((item: any) => item);
  
  for (const result of urls) {
    await scrapingProductSearch(result.url);
  }

  console.log("Done!");

}
main();