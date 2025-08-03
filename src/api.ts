import express, { Request, Response } from 'express';
import { scrappingProductDetail } from './scraping-product-detail';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * Handles GET requests to the root URL ('/').
 * 
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The outgoing HTTP response.
 * @description Sends a response with a message indicating that the API is scraping Naver Smartstore data.
 */
app.get('/', (req: Request, res: Response) => {
  res.send('Scraping Naver Smartstore API');
});

/**
 * Handles GET requests to the '/naver' endpoint.
 * 
 * @param {Request} req - The incoming HTTP request.
 * @param {Response} res - The outgoing HTTP response.
 * @description Scrapes product details from Naver Smartstore using the provided product URL.
 * 
 * @query {string} productUrl - The URL of the product to scrape (required).
 * @example /naver?productUrl=https://shopping.naver.com/window-products/style/7743753825
 * 
 * @returns {object} JSON response with the scraped data, processing time, and source URL.
 * @throws {Error} If the request fails, returns a JSON error response with a 500 status code.
 */
app.get('/naver', async (req: Request, res: Response) => {
  const productUrl = req.query.productUrl as string;

  if (!productUrl) {
    return res.status(400).json({
      error: '[API] Query parameter of "productUrl" is required.',
      example: `/naver?productUrl=https://shopping.naver.com/window-products/style/7743753825`
    });
  }

  try {
    const startTime = Date.now();
    const data = await scrappingProductDetail(productUrl);
    const duration = Date.now() - startTime;

    res.status(200).json({
      success: true,
      processingTime: `${duration}ms`,
      source: productUrl,
      data: data,
    });
  } catch (error) {
    console.error(`[API] Error when scrapping ${productUrl}:`, error);
    res.status(500).json({
      success: false,
      source: productUrl,
      error: '[API] Failed to process the request.',
    });
  }
});

/**
 * Starts the server and listens on the specified port.
 * 
 * @param {number} PORT - The port number to listen on.
 * 
 * @description Logs a message to the console indicating that the server is running and provides the API endpoint URL.
 */
app.listen(PORT, () => {
  console.log(`Server API running on http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/naver?productUrl=YOUR_DETAIL_PRODUCT_URL`);
});
