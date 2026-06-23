import dotenv from 'dotenv';
import { analyzeDocumentation } from './services/openai.js';

dotenv.config();

async function runTest() {
  const url = 'https://api.stripe.com/docs';
  const language = 'python';
  const useCase = 'Create a customer and a payment charge';
  const sampleDocText = `
    [H1] Customers API
    Create a customer by posting to /v3/customers. Parameters include email (string, required) and name (string).
    [H1] Payment Intents API
    Create a payment intent by posting to /v3/payment_intents. Parameters include amount (integer, required) and currency (string, required).
  `;

  console.log(`Testing OpenAI analyzer...`);
  console.log(`OpenAI API Key exists: ${!!process.env.OPENAI_API_KEY}`);

  try {
    const analysis = await analyzeDocumentation(url, sampleDocText, language, useCase);
    console.log('\n--- Analysis Results JSON ---');
    console.log(JSON.stringify(analysis, null, 2));
    console.log('------------------------------');
    console.log('\nSuccess! Analysis runs cleanly.');
  } catch (error) {
    console.error('Analyzer test failed:', error.message);
  }
}

runTest();
