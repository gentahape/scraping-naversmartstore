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
const proxyUsername = 'ianradja_97yTX';
const proxyPassword = 'ianRadja180_';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function scraper(url: string) {
  try {
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
    });
    return response.data;
  } catch (error) {
    console.error(`Error when scraping: ${error}`);
    throw error;
  }
}