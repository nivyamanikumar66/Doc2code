import { scrapeDocumentation } from './services/scraper.js';

async function runTest() {
  const url = 'https://jsonplaceholder.typicode.com/';
  console.log(`Testing scraper with URL: ${url}`);
  try {
    const text = await scrapeDocumentation(url);
    console.log('\n--- Scraped Output Sample ---');
    console.log(text.substring(0, 800));
    console.log('------------------------------');
    console.log(`\nSuccess! Extracted ${text.length} characters.`);
  } catch (error) {
    console.error('Scraper test failed:', error.message);
  }
}

runTest();
