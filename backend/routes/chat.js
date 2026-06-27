import { Router } from 'express';
import { GoogleGenAI } from "@google/genai";

const router = Router();

router.post('/', async (req, res) => {
  const { message, history, analysis, url, useCase } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Sandbox Mode: Check if key is missing or set to placeholder
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    console.log('[Chat API] No OpenAI API key found. Running local chatbot fallback.');
    const reply = generateLocalChatResponse(message, analysis, url, useCase);
    return res.json({ reply });
  }

  const ai = new GoogleGenAI({
  apiKey,
});
  // System prompt detailing the API documentation context
  const systemPrompt = `You are a helpful AI Documentation Assistant for the Doc2Code / Smart DevTool platform.
You are helping a developer understand the following API documentation they just analyzed:

Original Target URL: ${url || 'Not provided'}
Use Case Requested: ${useCase || 'Not provided'}

Analyzed API Information:
1. Authentication:
   - Type: ${analysis?.auth?.type || 'None'}
   - Details: ${analysis?.auth?.details || 'N/A'}
   - Header Example: ${analysis?.auth?.exampleHeader || 'N/A'}

2. Endpoints:
${(analysis?.endpoints || []).map(ep => `   - [${ep.method}] ${ep.path}: ${ep.purpose}\n     Parameters: ${JSON.stringify(ep.parameters)}\n     Sample Response: ${ep.sampleResponse || 'N/A'}`).join('\n')}

3. SDK Wrapper Code:
\`\`\`
${analysis?.wrapperCode || 'N/A'}
\`\`\`

4. Integration steps:
${(analysis?.explanation?.integrationSteps || []).map((step, idx) => `   - Step ${idx + 1}: ${step}`).join('\n')}

Your goal is to answer any questions the user has about this API. Use simple, direct language.
- Explain endpoints, authentication, query/body parameters, and sample responses.
- Explain common API errors (like 401 Unauthorized, 403 Forbidden, 400 Bad Request, 404 Not Found, 429 Too Many Requests) and how to resolve them for this specific API.
- Suggest next integration steps or code edits.
- Keep your answers developer-friendly, clear, and structured. Use Markdown formatting.`;

  try {
   const conversation = `
${systemPrompt}

Previous Conversation:
${history
  .map(msg => `${msg.sender}: ${msg.text}`)
  .join("\n")}

User:
${message}
`;

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: conversation,
});

const reply = response.text;
    return res.json({ reply });
  } catch (error) {
   console.error('[Chat API] Gemini Error:', error.message);
    const fallbackReply = generateLocalChatResponse(message, analysis, url, useCase);
    return res.json({ 
      reply: fallbackReply, 
      warning: 'Gemini API call failed. Showing automated keyword response.' 
    });
  }
});

/**
 * Intelligent local fallback responder for Chatbot Sandbox mode.
 * Matches keywords and parses details directly from the analyzed context.
 */
function generateLocalChatResponse(userMsg, analysis, url, useCase) {
  const query = userMsg.toLowerCase().trim();

  // 1. Check for Authentication Keywords
  if (query.includes('auth') || query.includes('key') || query.includes('token') || query.includes('security') || query.includes('login') || query.includes('credential')) {
    const authType = analysis?.auth?.type || 'API Key';
    const authDetails = analysis?.auth?.details || 'Access token passed in the Authorization header.';
    const authHeader = analysis?.auth?.exampleHeader || 'Authorization: Bearer <YOUR_API_KEY>';
    
    return `### Authentication Guide

This API uses **${authType}** for secure requests.

* **How it works:** ${authDetails}
* **HTTP Header format:**
  \`\`\`http
  ${authHeader}
  \`\`\`

**Developer Best Practices:**
Never hardcode your credentials inside your codebase. Instead, load them from an environment variable (like \`process.env.API_KEY\` or \`os.getenv('API_KEY')\`).`;
  }

  // 2. Check for GET vs POST differences
  if (query.includes('get vs post') || query.includes('difference between get and') || (query.includes('get') && query.includes('post') && query.includes('diff'))) {
    return `### What is the difference between GET and POST?

In REST APIs, HTTP methods indicate what operation is being run:

* 🗺️ **GET**: Used to **read or fetch** data. It should be safe and idempotent, meaning it does not modify database state on the server. (e.g., retrieving a profile or listing records).
* 📝 **POST**: Used to **write, create, or submit** data. It adds new records to the database. (e.g., creating a customer account, charging a credit card, or sending a message).

**For this integration:**
${(analysis?.endpoints || []).map(ep => `* The endpoint \`${ep.path}\` uses **${ep.method}** because its purpose is to *${ep.purpose.toLowerCase().replace(/\.$/, '')}*.`).join('\n')}`;
  }

  // 3. Explain endpoints
  if (query.includes('endpoint') || query.includes('path') || query.includes('route') || query.includes('url') || query.includes('method') || query.includes('uri')) {
    const endpointsList = analysis?.endpoints || [];
    if (endpointsList.length === 0) {
      return `### API Endpoints
No endpoints were detected for this URL. Double check your API documentation URL.`;
    }

    const lines = endpointsList.map(ep => `* **[${ep.method}]** \`${ep.path}\` - *${ep.purpose}*`);
    return `### Analyzed API Endpoints

I mapped **${endpointsList.length}** core endpoint(s) for your use case (*"${useCase || 'N/A'}"*):

${lines.join('\n')}

To examine any endpoint's required body fields or JSON returns, select it in the **API Endpoints** tab on the left.`;
  }

  // 4. Response JSON Explanation
  if (query.includes('response') || query.includes('json') || query.includes('schema') || query.includes('output') || query.includes('sample')) {
    const firstEp = analysis?.endpoints?.[0];
    if (!firstEp) {
      return `### Response Schema
No endpoint schemas are available. Try selecting a preset like Stripe to see rich JSON responses.`;
    }

    return `### Response JSON Explanation

Here is the sample JSON response template returned by the \`${firstEp.path}\` endpoint:

\`\`\`json
${firstEp.sampleResponse || '{\n  "status": "success"\n}'}
\`\`\`

**Key Properties Explained:**
* **Unique IDs**: Fields like \`id\` contain reference keys (e.g., \`${firstEp.path.includes('customer') ? 'cus_...' : 'pi_...'}\`) returned by the server. You should capture these values in your code to query updates or link related data.
* **Objects**: Type identifiers (like \`"object": "customer"\`) describe the resource model returned.`;
  }

  // 5. Creating a Customer (Stripe preset specific or general)
  if (query.includes('customer') || query.includes('create a customer')) {
    const customerEp = (analysis?.endpoints || []).find(e => e.path.toLowerCase().includes('customer'));
    const path = customerEp ? customerEp.path : '/v3/customers';
    const params = customerEp ? customerEp.parameters : [{ name: 'email', required: true, description: 'Customer email' }];

    return `### Creating a Customer Profile

To register a customer profile on this API:

1. Send a **POST** request to the endpoint: \`${path}\`.
2. Include the required parameters in your request body:
${params.map(p => `   - \`${p.name}\` (${p.required ? 'Required' : 'Optional'}): ${p.description}`).join('\n')}

**Example using SDK Wrapper:**
\`\`\`javascript
// JavaScript client call
const client = new APIClientWrapper("sk_test_token");
const customer = await client.createCustomer({
  email: "developer@example.com",
  name: "Jane Doe"
});
console.log("Created Customer ID:", customer.id);
\`\`\`

Would you like me to write a full Python example instead?`;
  }

  // 6. Common API errors
  if (query.includes('error') || query.includes('status') || query.includes('code') || query.includes('401') || query.includes('400') || query.includes('404') || query.includes('403') || query.includes('429')) {
    return `### Troubleshooting API Errors

Here are the most common HTTP status errors returned by API gateways:

1. ❌ **401 Unauthorized**: Your Authorization header is missing, incorrectly formatted, or uses an invalid API key. Make sure it reads \`Bearer your_secret_key\`.
2. ❌ **403 Forbidden**: Your credentials are correct, but your account doesn't have permissions for this path (e.g., trying to write to live database with a read-only token).
3. ❌ **400 Bad Request**: A required field is missing or contains invalid data formats (e.g., sending text in an integer field).
4. ❌ **404 Not Found**: The endpoint URL is misspelled, or you queried a record ID that does not exist.
5. ❌ **429 Too Many Requests**: You exceeded rate limits. Add delays or use exponentional backoff retry algorithms.`;
  }

  // 7. Next integration steps
  if (query.includes('next') || query.includes('step') || query.includes('todo') || query.includes('start') || query.includes('integrate')) {
    const steps = analysis?.beginnerView?.whatToDoNext || [
      'Locate your API credentials inside your API developer settings.',
      'Copy the SDK wrapper class and paste it into your local project.',
      'Test your wrapper functions with test keys before pushing to production.'
    ];

    return `### Integration Blueprint

Here are the next steps to start coding:

${steps.map((s, i) => `${i + 1}. **${s}**`).join('\n')}

Let me know if you would like me to explain how to install dependencies like \`requests\` (Python) or configure environment files!`;
  }

  // Default reply if no keyword is matched
  return `### Documentation Copilot

I am your local API Assistant. I have read the analyzed results for this API.

You can ask me questions about:
- **Authentication**: *How do I authenticate?*
- **Endpoints**: *What does the first endpoint do?*
- **Method Guides**: *What is the difference between GET and POST?*
- **Parameters**: *How do I create a customer?*
- **Response Format**: *Explain the response JSON.*
- **Troubleshooting**: *Explain common API errors.*

**Target API:** \`${url || 'REST API'}\`
**Selected use case:** *"${useCase || 'N/A'}"*`;
}
export default router;