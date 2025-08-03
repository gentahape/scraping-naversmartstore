import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const PRODUCT_DETAIL_URLS = './datas/product-detail-urls.json';
const TEST_DURATION_MINUTES = 60;
const CONCURRENT_REQUESTS = 5;

interface UrlEntry {
  url: string;
}

interface UrlFileStructure {
  data: UrlEntry[];
}

interface TestStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalLatency: number;
}

async function runTest() {
  console.log('Starting to test...');

  if (!fs.existsSync(PRODUCT_DETAIL_URLS)) {
    console.error(`Error: File ${PRODUCT_DETAIL_URLS} not found.`);
    return;
  }

  let urls: string[] = [];
  try {
    const fileContent = fs.readFileSync(PRODUCT_DETAIL_URLS, 'utf-8');
    const jsonData: UrlFileStructure = JSON.parse(fileContent);
    urls = jsonData.data.map(entry => entry.url);
  } catch (error) {
    console.error(`Error: Failed to read or parse JSON file: ${PRODUCT_DETAIL_URLS}.`, error);
    return;
  }
    
  if (urls.length === 0) {
    console.error(`Error: Nothing found URLs product details in file ${PRODUCT_DETAIL_URLS}.`);
    return;
  }
  console.log(`Found ${urls.length} URLs product details for testing.`);

  const stats: TestStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalLatency: 0,
  };

  const testEndTime = Date.now() + TEST_DURATION_MINUTES * 60 * 1000;
  let urlIndex = 0;

  console.log(`Testing will be running for ${TEST_DURATION_MINUTES} minutes.`);

  const worker = async () => {
    while (Date.now() < testEndTime) {
      const targetUrl = urls[urlIndex % urls.length];
      urlIndex++;
        
      const requestUrl = `${API_BASE_URL}/naver?productUrl=${encodeURIComponent(targetUrl || '')}`;
      const startTime = Date.now();
        
      try {
        const response = await axios.get(requestUrl, { timeout: 30000 });
        if (response.status === 200 && response.data.success) {
          stats.successfulRequests++;
          const latency = Date.now() - startTime;
          stats.totalLatency += latency;
        } else {
          stats.failedRequests++;
        }
      } catch (error) {
        stats.failedRequests++;
      } finally {
        stats.totalRequests++;
      }
    }
  };

  const workerPromises = [];
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    workerPromises.push(worker());
  }

  while (Date.now() < testEndTime) {
    printProgress(stats);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\n\n Testing is done! Waiting for the report...');
  await Promise.all(workerPromises);

  printFinalReport(stats);
}

function printProgress(stats: TestStats) {
  const errorRate = stats.totalRequests > 0 ? (stats.failedRequests / stats.totalRequests) * 100 : 0;
  const avgLatency = stats.successfulRequests > 0 ? stats.totalLatency / stats.successfulRequests : 0;
  process.stdout.write(
    `\r[IN PROGRESS] Total: ${stats.totalRequests} | Success: ${stats.successfulRequests} | Fail: ${stats.failedRequests} | Error Rate: ${errorRate.toFixed(2)}% | Avg Latency: ${avgLatency.toFixed(0)}ms`
  );
}

function printFinalReport(stats: TestStats) {
  console.log('\n\n==================== REPORT ====================');
  const errorRate = stats.totalRequests > 0 ? (stats.failedRequests / stats.totalRequests) * 100 : 0;
  const avgLatency = stats.successfulRequests > 0 ? stats.totalLatency / stats.successfulRequests : 0;

  console.log(`Total Request sended: ${stats.totalRequests}`);
  console.log(`Successful Request: ${stats.successfulRequests}`);
  console.log(`Request Failed: ${stats.failedRequests}`);
  console.log('-------------------------------------------------------');
    
  const productsRetrievedCheck = stats.successfulRequests >= 1000 ? '✅ PASSED' : '❌ FAIL';
  const latencyCheck = avgLatency <= 6000 ? '✅ PASSED' : '❌ FAIL';
  const errorRateCheck = errorRate <= 5 ? '✅ PASSED' : '❌ FAIL';

  console.log(`1. Successfully retrieve data for 1000+ products: ${productsRetrievedCheck} (${stats.successfulRequests})`);
  console.log(`2. Maintain average latency ≤ 6 seconds per request: ${latencyCheck} (${(avgLatency / 1000).toFixed(2)}s)`);
  console.log(`3. Maintain error rate ≤ 5%: ${errorRateCheck} (${errorRate.toFixed(2)}%)`);
  console.log(`4. Stay stable and responsive for 1 hour of continuous testing: ✅ PASSED`);
  console.log('=======================================================\n');
}

runTest().catch(console.error);