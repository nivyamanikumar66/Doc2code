import { GoogleGenAI } from "@google/genai";

/**
 * Generates an API analysis using OpenAI based on scraped documentation text, use case, and selected language.
 * Falls back to mock data if the API key is not present or if an error occurs.
 * 
 * @param {string} url - The documentation URL
 * @param {string} scrapedText - The scraped text from the documentation page
 * @param {string} language - 'python' | 'javascript'
 * @param {string} useCase - User's description of what they want to accomplish
 * @returns {Promise<object>} Parsed JSON analysis results
 */
export async function analyzeDocumentation(url, scrapedText, language, useCase) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    console.log('OpenAI API key not set or invalid. Falling back to mock analysis.');
    return generateMockAnalysis(url, language, useCase);
  }

  const ai = new GoogleGenAI({
  apiKey,
});

  const systemPrompt = `You are an expert developer assistant specialized in understanding API documentation, writing clean client libraries, and explaining API integrations.
Your task is to analyze the provided API documentation text and generate a structured JSON analysis.
You must focus specifically on fulfilling the developer's requested use case: "${useCase}".

You must output a JSON object containing the following schema:
{
  "auth": {
    "type": "API Key | OAuth2 | JWT | Basic Auth | None | Other",
    "details": "Explanation of how authentication is structured (e.g. Header name, Query parameter, token exchange flow).",
    "exampleHeader": "Authorization: Bearer <YOUR_API_KEY>"
  },
  "endpoints": [
    {
      "path": "/v1/charges (the path of the endpoint)",
      "method": "GET | POST | PUT | DELETE",
      "purpose": "A brief explanation of why this endpoint is used in the context of the user's use case.",
      "parameters": [
        {
          "name": "parameter name",
          "type": "string | integer | boolean | object | array",
          "required": true/false,
          "description": "Short explanation of the parameter."
        }
      ],
      "sampleResponse": "JSON string showing a typical success response"
    }
  ],
  "explanation": {
    "authSummary": "Concise summary of how authentication works.",
    "endpointLogic": "Explanation of why these specific endpoints were selected to achieve the use case.",
    "methodGuide": "Beginner-friendly explanation of why GET was used vs POST (or other methods) for these specific actions.",
    "integrationSteps": [
      "Step 1 details...",
      "Step 2 details...",
      "Step 3 details..."
    ]
  },
  "wrapperCode": "A ready-to-use, well-commented, complete code snippet containing a clean wrapper class in the requested language (either Python or JavaScript). It should set up authentication and include client wrapper functions for each endpoint listed in the 'endpoints' array."
}

Rules for wrapperCode:
- If language is 'python': generate a class using 'requests' library. Implement '__init__(self, api_key, ...)' and wrapper methods matching each endpoint. Handle URL path variables and query/body params cleanly.
- If language is 'javascript': generate a class using 'fetch' or 'axios' (standard ES Modules or CommonJS, standard modern JavaScript). Implement a constructor that takes the API key/credentials, and wrapper methods for each endpoint.
- Make the code complete, robust, and copy-pasteable. Do not use placeholders or shortened snippets. Add comments describing parameters and returns.

Ensure that the output is VALID JSON. Do not prefix the output with markdown backticks or any other text; output ONLY the JSON object.`;

  const userPrompt = `Target API URL: ${url}
Selected Language: ${language}
Use Case: ${useCase}

Here is the scraped API documentation content:
---
${scrapedText}
---`;

  try {
    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${systemPrompt}\n\n${userPrompt}`,
    });

  const resultText = response.text;
  return JSON.parse(resultText);
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    console.log('Falling back to mock analysis due to OpenAI API error.');
    return generateMockAnalysis(url, language, useCase);
  }
}

/**
 * Generates a realistic mock analysis based on the input URL and usecase
 */
function generateMockAnalysis(url, language, useCase) {
  const isStripe = url.toLowerCase().includes('stripe');
  const isGithub = url.toLowerCase().includes('github');
  const isJsonPlaceholder = url.toLowerCase().includes('placeholder');
  
  let apiName = 'Generic REST API';
  let authType = 'API Key';
  let authDetails = 'Pass the secret API key in the Authorization header as a Bearer token.';
  let authHeader = 'Authorization: Bearer <API_KEY>';
  let endpoints = [];
  let steps = [];
  let code = '';

  if (isStripe || useCase.toLowerCase().includes('charge') || useCase.toLowerCase().includes('payment')) {
    apiName = 'Stripe API';
    authType = 'API Key';
    authDetails = 'Authenticate requests by providing your secret API key in the Authorization header using Bearer auth. Use your test key for development.';
    authHeader = 'Authorization: Bearer sk_test_...';
    
    endpoints = [
      {
        path: '/v3/customers',
        method: 'POST',
        purpose: 'Creates a new customer profile to save billing details and attach payment methods.',
        parameters: [
          { name: 'email', type: 'string', required: true, description: 'The customer\'s email address.' },
          { name: 'name', type: 'string', required: false, description: 'The customer\'s full name.' },
          { name: 'description', type: 'string', required: false, description: 'An arbitrary string attached to the customer object.' }
        ],
        sampleResponse: JSON.stringify({
          id: 'cus_Q9jM2o39FasL',
          object: 'customer',
          email: 'developer@example.com',
          name: 'Jane Doe',
          created: 1719172000
        }, null, 2)
      },
      {
        path: '/v3/payment_intents',
        method: 'POST',
        purpose: 'Creates a payment intent object to track the lifecycle of a charge and authorize transactions.',
        parameters: [
          { name: 'amount', type: 'integer', required: true, description: 'Amount in cents (e.g. 1000 for $10.00).' },
          { name: 'currency', type: 'string', required: true, description: 'Three-letter ISO currency code (e.g., usd, eur).' },
          { name: 'customer', type: 'string', required: false, description: 'The ID of the Customer this PaymentIntent is for.' },
          { name: 'payment_method_types[]', type: 'array', required: false, description: 'List of payment method types (e.g. ["card"]).' }
        ],
        sampleResponse: JSON.stringify({
          id: 'pi_3M7n7aLkdIwHu7ix2Ad92s',
          object: 'payment_intent',
          amount: 2000,
          currency: 'usd',
          status: 'requires_payment_method',
          customer: 'cus_Q9jM2o39FasL',
          client_secret: 'pi_3M7n7aLkdIwHu7ix2Ad92s_secret_xyz'
        }, null, 2)
      }
    ];

    steps = [
      'Obtain your secret API Key (starts with sk_test_) from the Stripe Developer Dashboard under the API Keys tab.',
      'Create a Customer profile using their email address. Save the returned customer ID.',
      'Create a Payment Intent specifying the charge amount, currency, and the customer ID.',
      'Pass the client_secret returned from the Payment Intent to your frontend to complete the payment authentication process securely.'
    ];
  } else if (isGithub || useCase.toLowerCase().includes('repo') || useCase.toLowerCase().includes('github')) {
    apiName = 'GitHub API';
    authType = 'JWT / Personal Access Token';
    authDetails = 'Access tokens are sent in the Authorization header as a token (e.g., Authorization: Bearer <TOKEN> or token <TOKEN>).';
    authHeader = 'Authorization: token ghp_...';

    endpoints = [
      {
        path: '/user/repos',
        method: 'POST',
        purpose: 'Creates a new repository for the authenticated user.',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'The name of the repository.' },
          { name: 'description', type: 'string', required: false, description: 'A short description of the repository.' },
          { name: 'private', type: 'boolean', required: false, description: 'Whether the repository is private. Default: false.' }
        ],
        sampleResponse: JSON.stringify({
          id: 1296269,
          name: 'hello-world',
          full_name: 'octocat/hello-world',
          private: false,
          owner: { login: 'octocat', id: 1 },
          html_url: 'https://github.com/octocat/hello-world'
        }, null, 2)
      },
      {
        path: '/repos/{owner}/{repo}/issues',
        method: 'POST',
        purpose: 'Creates an issue in the specified repository.',
        parameters: [
          { name: 'title', type: 'string', required: true, description: 'The title of the issue.' },
          { name: 'body', type: 'string', required: false, description: 'The contents of the issue.' },
          { name: 'labels', type: 'array', required: false, description: 'Labels to associate with this issue.' }
        ],
        sampleResponse: JSON.stringify({
          id: 1347,
          number: 1,
          title: 'Found a bug',
          body: 'I am having a problem with this.',
          state: 'open'
        }, null, 2)
      }
    ];

    steps = [
      'Create a GitHub Personal Access Token (PAT) with appropriate scopes ("repo" scope required for creating repositories and issues).',
      'Initialize the client using your token.',
      'Make a POST request to /user/repos with the name of the repository to create it.',
      'Make a POST request to /repos/{owner}/{repo}/issues to log tracking items for your application.'
    ];
  } else {
    // Generic API Fallback (useful for JSONPlaceholder or random URLs)
    apiName = isJsonPlaceholder ? 'JSONPlaceholder API' : 'REST API';
    authType = isJsonPlaceholder ? 'None' : 'API Key';
    authDetails = isJsonPlaceholder ? 'No authentication is required for public testing endpoints.' : 'Send your API token in the Authorization header.';
    authHeader = isJsonPlaceholder ? 'None' : 'Authorization: Bearer <API_KEY>';

    endpoints = [
      {
        path: '/posts',
        method: 'POST',
        purpose: 'Creates a new post resource.',
        parameters: [
          { name: 'title', type: 'string', required: true, description: 'The title of the post.' },
          { name: 'body', type: 'string', required: true, description: 'The body content of the post.' },
          { name: 'userId', type: 'integer', required: true, description: 'The user ID associated with the post.' }
        ],
        sampleResponse: JSON.stringify({
          id: 101,
          title: 'Learning API Integration',
          body: 'This tool simplifies documentation analysis.',
          userId: 1
        }, null, 2)
      },
      {
        path: '/posts/{id}',
        method: 'GET',
        purpose: 'Fetches details of a specific post resource by its unique identifier.',
        parameters: [
          { name: 'id', type: 'integer', required: true, description: 'The ID of the post to retrieve.' }
        ],
        sampleResponse: JSON.stringify({
          id: 1,
          title: 'sunt aut facere repellat provident',
          body: 'quia et suscipit\nsuscipit recusandae...',
          userId: 1
        }, null, 2)
      }
    ];

    steps = [
      'Confirm the endpoint URL and whether authentication is needed (none required for JSONPlaceholder).',
      'To create content, use a POST request containing JSON formatted data matching the parameters.',
      'To read content, perform a GET request appending the ID of the resource to the URL.'
    ];
  }

  // Generate wrapper code
  if (language === 'python') {
    if (isStripe || useCase.toLowerCase().includes('charge') || useCase.toLowerCase().includes('payment')) {
      code = `import requests

class StripeAPIWrapper:
    """
    Python wrapper client for the Stripe API.
    Handles Customer creation and Payment Intent setups.
    """
    def __init__(self, api_key, base_url="https://api.stripe.com"):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/x-www-form-urlencoded"
        }

    def create_customer(self, email, name=None, description=None):
        """
        Creates a Stripe customer.
        
        :param email: Customer's email address
        :param name: Customer's name
        :param description: Optional description
        :return: Decoded JSON response
        """
        url = f"{self.base_url}/v3/customers"
        data = {"email": email}
        if name:
            data["name"] = name
        if description:
            data["description"] = description
            
        response = requests.post(url, headers=self.headers, data=data)
        response.raise_for_status()
        return response.json()

    def create_payment_intent(self, amount, currency="usd", customer_id=None):
        """
        Creates a Payment Intent to process payments.
        
        :param amount: Amount in cents (e.g. 1000 is $10.00)
        :param currency: Three letter currency code (default: usd)
        :param customer_id: Optional ID of Stripe customer
        :return: Decoded JSON response
        """
        url = f"{self.base_url}/v3/payment_intents"
        data = {
            "amount": amount,
            "currency": currency
        }
        if customer_id:
            data["customer"] = customer_id
            
        response = requests.post(url, headers=self.headers, data=data)
        response.raise_for_status()
        return response.json()

# Example Usage:
# client = StripeAPIWrapper(api_key="sk_test_mock123")
# customer = client.create_customer(email="user@example.com", name="Jane Doe")
# intent = client.create_payment_intent(amount=2500, customer_id=customer["id"])
# print("Payment Intent Client Secret:", intent["client_secret"])`;
    } else {
      code = `import requests

class APIClientWrapper:
    """
    Python wrapper client for the API.
    Designed for use case: ${useCase}
    """
    def __init__(self, api_key=None, base_url="${url.substring(0, url.indexOf('/', 8)) || 'https://api.example.com'}"):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            self.headers["Authorization"] = f"Bearer {self.api_key}"

    def create_post(self, title, body, user_id):
        """
        Creates a new post.
        """
        url = f"{self.base_url}/posts"
        payload = {
            "title": title,
            "body": body,
            "userId": user_id
        }
        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()

    def get_post(self, post_id):
        """
        Retrieves a post by its ID.
        """
        url = f"{self.base_url}/posts/{post_id}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

# Example Usage:
# client = APIClientWrapper(api_key="your_api_key_here")
# new_post = client.create_post(title="New Test", body="Hello World", user_id=1)
# print(new_post)`;
    }
  } else {
    // JavaScript
    if (isStripe || useCase.toLowerCase().includes('charge') || useCase.toLowerCase().includes('payment')) {
      code = `/**
 * JavaScript client wrapper for the Stripe API.
 * Uses native fetch for making API requests.
 */
class StripeAPIWrapper {
  constructor(apiKey, baseUrl = 'https://api.stripe.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\\/$/, '');
    this.headers = {
      'Authorization': \`Bearer \${this.apiKey}\`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  /**
   * Helper to format URL search parameters for Form UrlEncoded requests
   */
  _encodeParams(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  }

  /**
   * Creates a customer object.
   * @param {Object} data
   * @param {string} data.email
   * @param {string} [data.name]
   * @param {string} [data.description]
   */
  async createCustomer({ email, name, description }) {
    const url = \`\${this.baseUrl}/v3/customers\`;
    const bodyContent = this._encodeParams({ email, name, description });

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: bodyContent
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(\`Stripe API Error (\${response.status}): \${errText}\`);
    }

    return response.json();
  }

  /**
   * Creates a Payment Intent to process transactions.
   * @param {Object} data
   * @param {number} data.amount - In cents
   * @param {string} [data.currency='usd']
   * @param {string} [data.customerId]
   */
  async createPaymentIntent({ amount, currency = 'usd', customerId }) {
    const url = \`\${this.baseUrl}/v3/payment_intents\`;
    const bodyContent = this._encodeParams({
      amount,
      currency,
      customer: customerId
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: bodyContent
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(\`Stripe API Error (\${response.status}): \${errText}\`);
    }

    return response.json();
  }
}

// Example Usage:
// const client = new StripeAPIWrapper('sk_test_mock123');
// client.createCustomer({ email: 'john@example.com', name: 'John Doe' })
//   .then(customer => client.createPaymentIntent({ amount: 1500, customerId: customer.id }))
//   .then(intent => console.log('Payment Intent Created:', intent))
//   .catch(err => console.error(err));`;
    } else {
      code = `/**
 * JavaScript Client Wrapper for the REST API.
 * Uses native fetch.
 * Designed for use case: ${useCase}
 */
class APIClientWrapper {
  constructor(apiKey = null, baseUrl = '${url.substring(0, url.indexOf('/', 8)) || 'https://api.example.com'}') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\\/$/, '');
    this.headers = {
      'Content-Type': 'application/json'
    };
    if (this.apiKey) {
      this.headers['Authorization'] = \`Bearer \${this.apiKey}\`;
    }
  }

  /**
   * Creates a new post.
   */
  async createPost({ title, body, userId }) {
    const url = \`\${this.baseUrl}/posts\`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ title, body, userId })
    });

    if (!response.ok) {
      throw new Error(\`API HTTP error! Status: \${response.status}\`);
    }

    return response.json();
  }

  /**
   * Fetches a post by ID.
   */
  async getPost(id) {
    const url = \`\${this.baseUrl}/posts/\${id}\`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(\`API HTTP error! Status: \${response.status}\`);
    }

    return response.json();
  }
}

// Example Usage:
// const client = new APIClientWrapper('mock_api_key_here');
// client.createPost({ title: 'Dynamic API Test', body: 'Integration wrapper code', userId: 1 })
//   .then(post => console.log('Post Created:', post))
//   .catch(err => console.error(err));`;
    }
  }

  // Return formatted response
  return {
    auth: {
      type: authType,
      details: authDetails,
      exampleHeader: authHeader
    },
    endpoints: endpoints,
    explanation: {
      authSummary: `This endpoint uses ${authType} authentication. ${authDetails}`,
      endpointLogic: `For your usecase ("${useCase}"), we identified ${endpoints.length} key endpoint(s) from ${apiName} to run operations.`,
      methodGuide: 'Use POST when writing, modifying, or creating data on the remote server (e.g. creating records). Use GET to read or query existing resources without modifying state.',
      integrationSteps: steps
    },
    wrapperCode: code,
    beginnerView: {
  authExplanation:
    `Think of ${authType} as your personal pass to use this API. ${authDetails}`,

  endpointsSimplified: endpoints.map(ep => ({
    method: ep.method,
    simpleName: ep.path,
    simpleDescription: ep.purpose,
    whyItIsUsed:
      `This API is used because you want to ${ep.purpose.toLowerCase()}.`
  })),

  whatToDoNext: steps,

  workflowSteps: steps.map((step, index) => ({
    title: `Step ${index + 1}`,
    description: step
  }))
}
  };
}
