import express, { Request, Response } from 'express';
import { scrapping } from './scraper';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/naver', async (req: Request, res: Response) => {
    const productUrl = req.query.productUrl as string;

    if (!productUrl) {
        return res.status(400).json({
            error: 'Query parameter of "productUrl" is required.',
            example: `/naver?productUrl=https://smartstore.naver.com/minibeans/products/8768399445`
        });
    }

    try {
        const startTime = Date.now();
        const data = await scrapping(productUrl);
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

app.listen(PORT, () => {
    console.log(`Server API running on http://localhost:${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/naver?productUrl=YOUR_DETAIL_PRODUCT_URL`);
});
