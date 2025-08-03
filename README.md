## Setup instructions
- Install the <b>packages</b> with run `npm install`
- <b>Copy</b> file `.env.example` to `.env`
- <b>Adjust</b> file `.env` with following:
  - <b>PORT</b> = Fill in the port to be used (default: 3000)
  - <b>API_BASE_URL</b> = REST API URL address to receive product details (default: http://localhost:3000)
  - <b>PROXY_HOST</b> = Fill Hostname for proxy to be used (the value appears in the video and body email)
  - <b>PROXY_PORT</b> = Fill Port for proxy to be used (the value appears in the video and body email)
  - <b>PROXY_USERNAME</b> = Fill Username for proxy to be used (the value appears in the video and body email)
  - <b>PROXY_PASSWORD</b> = Fill Password for proxy to be used (the value appears in the video and body email)

## Run/test instructions
### Local
- Running <b>API</b> with run `npm start`
- Add/open new terminal and running for the <b>Test Success Criteria</b> with run `npm start:testing`
### Production
- Adjust <b>API_BASE_URL</b> variable in <b>.env</b> with `http://13.215.161.186:5000`
- Running for the <b>Test Success Criteria</b> with run `npm run start:testing`

## Scraper explanation
This scraper is designed to extract JSON data from the <b>`__PRELOADED_STATE__`</b> global variable on shopping.naver.com detail product pages. This domain was chosen after investigations showed that the original target (smartstore.naver.com) was no longer serving relevant product detail pages.
### Evasion Strategies
- Proxy Usage: All requests are routed through an external proxy service to rotate IP addresses and disguise the source of the traffic. The scraper supports authenticated proxies and disables SSL validation for compatibility.
- User-Agent Rotation: The User-Agent header is randomly changed for each request, mimicking traffic from different browsers and operating systems.
- Smart Retry Mechanism: If a request fails, the system will retry up to three times with increasing fallback times. Retries will be skipped if a fatal error is detected.
### Hosting
This API is deployed and runs on Amazon EC2 (AWS) instances to ensure 24/7 availability and stability, suitable for continuous testing.

## API usage example
[GET] http://13.215.161.186:5000/naver?productUrl=<b>YOUR_DETAIL_PRODUCT_URL</b>
- Example: 
http://13.215.161.186:5000/naver?productUrl=https://shopping.naver.com/window-products/style/7743753825

## Project Structure
```
/
├── `datas/` # Folder to store URL detail & search products
│   ├── `product-detail-urls.json` # File to store URL product details and URL for testing scraping
│   ├── `product-search-urls.json` # File to store URL product search and for to getting many product detail URLs
── `src/` # The main folder for all TS source code
│   ├── `utils/` # Folder for reusable modules
│   │   └── `scraper.ts` # The core logic for scraping
│   ├── `api.ts` # The main entry point for the API Express Server
│   ├── `scraping-product-detail.ts` # Script for to getting the global variable __PRELOADED_STATE__ from the product details page
│   ├── `scraping-product-search.ts` # Script for to getting link detail product from the product search page and store to product-search-urls.json file
│   ├── `testing.ts` # The core logic for scraping testing
├── `.env.example` # File to store environment variables
├── `package.json` # Stores project metadata and dependency lists
├── `tsconfig.json` # Configuration file for TypeScript compiler
```
