import { Router } from 'express';
import { scrapeDocumentation } from '../services/scraper.js';
import { analyzeDocumentation } from '../services/openai.js';

const router = Router();

router.post('/', async (req, res) => {

  const {
    inputType,
    url,
    docText,
    language,
    useCase
  } = req.body;

  // Validate common fields
  if (!language || !useCase) {
    return res.status(400).json({
      error: 'Language and Use Case are required.'
    });
  }

  // URL Mode
  if (inputType === 'url') {
    if (!url) {
      return res.status(400).json({
        error: 'Please provide an API documentation URL.'
      });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        error: 'Invalid URL.'
      });
    }
  }

  // Documentation Mode
  if (inputType === 'text') {
    if (!docText || docText.trim() === '') {
      return res.status(400).json({
        error: 'Please paste API documentation.'
      });
    }
  }

  try {

    let scrapedText = '';
    let scrapeError = null;

    try {

      if (inputType === 'url') {
        console.log(`[API Analyze] Scraping URL: ${url}`);
        scrapedText = await scrapeDocumentation(url);
      } else {
        console.log('[API Analyze] Using pasted documentation');
        scrapedText = docText;
      }

      console.log('[API Analyze] Scraped Text:', scrapedText);
      console.log('[API Analyze] Type:', typeof scrapedText);
      console.log('[API Analyze] Length:', scrapedText?.length);

    } catch (err) {

      console.warn(`[API Analyze] ${err.message}`);
      scrapeError = err.message;

    }

    const analysis = await analyzeDocumentation(
      inputType === 'url' ? url : 'Documentation Input',
      scrapedText,
      language,
      useCase
    );
if (scrapeError) {
  analysis.warning = scrapeError;
}

// 👇 ADD THESE 3 LINES
analysis.url = inputType === "url" ? url : "Documentation Input";
analysis.useCase = useCase;
analysis.language = language;

return res.json(analysis);

  } catch (error) {

    console.error('[API Analyze]', error);

    return res.status(500).json({
      error:
        error.message ||
        'An internal server error occurred during documentation analysis.'
    });

  }

});

export default router;