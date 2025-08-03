import axios from "axios"
import https from 'https';

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

const proxyHost = 'unblock.oxylabs.io';
const proxyPort = 60000;
const proxyUsername = 'naversmartstore_HlyFd';
const proxyPassword = 'naverSmartStoreScraper_123';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function scraper(url: string) {
  const MAX_RETRIES = 3;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {

      if (attempt > 1) {
        const randomDelay = Math.random() * 1000 + 500;
        await delay(randomDelay);
      }

      const productUrl = new URL(url);
      if (productUrl.hostname !== 'shopping.naver.com') {
        throw new Error('Invalid product URL. URL must be from "shopping.naver.com".');
      }

      const response = await axios.get(url, {
        proxy: {
          protocol: 'https',
          host: proxyHost,
          port: proxyPort,
          auth: {
            username: proxyUsername,
            password: proxyPassword,
          },
        },
        httpsAgent: httpsAgent,
        headers: {
          'User-Agent': getRandomUserAgent(),
          rejectUnauthorized: false,
        },
        timeout: 15000,
      });
      
      return response.data;
    } catch (error) {
      console.warn(`[SCRAPER] Trying ${attempt} for ${url} failed. Error: ${error}`);
      if (attempt === MAX_RETRIES) {
          console.error(`[SCRAPER] Failed after ${MAX_RETRIES} attempts for ${url}.`);
          throw error;
      }
      const backoffTime = Math.pow(2, attempt) * 1000;
      await delay(backoffTime);
    }
  }
  throw new Error(`Failed to retrieve data for ${url}`);
}