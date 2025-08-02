import axios from "axios"
import { load } from "cheerio"
import fs from 'fs';

interface UrlEntry {
  url: string;
}

interface JsonStructure {
  data: UrlEntry[];
}

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.81",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/109.0.0.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux i686; rv:124.0) Gecko/20100101 Firefox/124.0",
];
function getRandomUserAgent() {
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  return userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
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
    console.error('Failed to read or parse JSON file. A new file will be created. Error:', error);
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
  }
}

async function scrapingProductSearch(url: string) {
  try {
  
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        rejectUnauthorized: false,
      },
    });
    const data = response.data;
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
  }
}

async function main() {
  const productSearchUrls = require('./datas/product-search-urls.json')
  const urls = productSearchUrls.data.map((item: any) => item);
  
  for (const result of urls) {
    await scrapingProductSearch(result.url);
  }

  console.log("Done!");

}
main();