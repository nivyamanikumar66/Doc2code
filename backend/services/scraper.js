import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes an API documentation URL and extracts clean, relevant text content.
 * Removes navigation headers, footers, scripts, and stylesheets to save tokens.
 * @param {string} url - The documentation page URL
 * @returns {Promise<string>} The parsed clean text content
 */
export async function scrapeDocumentation(url) {
  try {
    // Configure axios with a common User-Agent and a reasonable timeout
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove noise elements
    $('script, style, noscript, nav, footer, header, svg, iframe, link, meta').remove();

    // Extract text from primary structural tags
    let contentParts = [];

    // Let's traverse the remaining body content
    $('body *').each((i, el) => {
      const tagName = el.name;
      const $el = $(el);

      // Check if element has already been processed (avoid duplicate text from nested tags)
      if ($el.children().length > 0) {
        // If it has children, only extract text if it's a code block or table,
        // otherwise let children handle themselves to avoid duplication.
        if (tagName !== 'pre' && tagName !== 'table' && tagName !== 'code') {
          return;
        }
      }

      const text = $el.text().trim();
      if (!text) return;

      if (/^(h1|h2|h3|h4|h5|h6)$/.test(tagName)) {
        contentParts.push(`\n[${tagName.toUpperCase()}] ${text}\n`);
      } else if (tagName === 'pre' || tagName === 'code') {
        // Code blocks are critical for API documentation examples
        contentParts.push(`\n[CODE_START]\n${text}\n[CODE_END]\n`);
      } else if (tagName === 'table') {
        // Tables are critical for parameter descriptions
        contentParts.push(`\n[TABLE_START]\n${text}\n[TABLE_END]\n`);
      } else if (tagName === 'p') {
        contentParts.push(text);
      } else if (tagName === 'li') {
        contentParts.push(`- ${text}`);
      }
    });

    // Fallback: If traversing didn't yield much structured content, just extract basic text
    let cleanText = contentParts.join('\n').trim();
    if (cleanText.length < 200) {
      // Get all text and compress whitespace
      cleanText = $('body').text().replace(/\s+/g, ' ').trim();
    }

    // Limit length to avoid sending excessive tokens to LLM (roughly 15,000 characters)
    const MAX_CHARACTERS = 20000;
    if (cleanText.length > MAX_CHARACTERS) {
      cleanText = cleanText.substring(0, MAX_CHARACTERS) + '\n... [Content Truncated for Length] ...';
    }

    return cleanText;
  } catch (error) {
    console.error(`Error scraping URL ${url}:`, error.message);
    throw new Error(`Failed to retrieve documentation from ${url}: ${error.message}`);
  }
}
