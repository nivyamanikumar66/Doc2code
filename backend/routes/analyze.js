import { Router } from 'express';
import { scrapeDocumentation } from '../services/scraper.js';
import { analyzeDocumentation } from '../services/openai.js';

const router = Router();

router.post('/', async (req, res) => {
  const { url, language, useCase } = req.body;

  // Validate request parameters
  if (!url || !language || !useCase) {
    return res.status(400).json({ 
      error: 'Missing required parameters. Please provide "url", "language", and "useCase".' 
    });
  }

  // Validate URL syntax
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ 
      error: 'The provided URL is invalid. Please make sure it starts with http:// or https://' 
    });
  }

  try {
    console.log(`[API Analyze] Received request to analyze: ${url} (Language: ${language})`);
    
    let scrapedText = '';
    let scrapeError = null;

    try {
      scrapedText = await scrapeDocumentation(url);
      console.log(`[API Analyze] Successfully scraped ${scrapedText.length} characters.`);
    } catch (err) {
      console.warn(`[API Analyze] Scraping failed: ${err.message}. Proceeding with fallback.`);
      scrapeError = err.message;
    }

    // Run analysis ( OpenAI analysis falls back to mock internally if key is missing )
    const analysis = await analyzeDocumentation(url, scrapedText, language, useCase);

    // Attach contextual warning information if scrape failed
    if (scrapeError) {
      const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '' && !process.env.OPENAI_API_KEY.startsWith('your_');
      if (hasApiKey) {
        analysis.warning = `Scraping failed: ${scrapeError}. The AI generated these details based on its offline knowledge of this service/URL.`;
      } else {
        analysis.warning = `Scraping failed: ${scrapeError}. Generated simulated results based on your use case for demo purposes.`;
      }
    }

    return res.json(analysis);
  } catch (error) {
    console.error('[API Analyze] Route handler exception:', error);
    return res.status(500).json({ 
      error: error.message || 'An internal server error occurred during documentation analysis.' 
    });
  }
});

export default router;
