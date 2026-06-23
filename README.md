<<<<<<< HEAD
# Smart DevTool for API Integration

Smart DevTool is a full-stack developer utility that allows developers to paste an API documentation URL and instantly generate an interactive integration dashboard, HTTP method instructions, and a copy-pasteable SDK wrapper client in Python or JavaScript tailored for their specific use case.

## Features

- **DOM Web Scraper**: Fetches target API doc websites and strips styles, headers, and footer components to isolate code examples and parameter tables.
- **AI Analysis & Parser**: Uses OpenAI `gpt-4o-mini` to extract authentication schemas, select relevant endpoints, list parameters, and parse mock response JSON.
- **Copy-Pasteable SDK Wrappers**: Produces modern, class-based wrapper files in **Python (requests)** or **JavaScript (fetch)** mapping function calls directly to parsed endpoints.
- **Sleek Developer UI**: Modern dark theme layout with Postman-style tabbed endpoints, interactive checklists, method badge highlights, and copy actions.
- **Smart Sandbox Mode**: Automatically falls back to high-quality simulated mock analysis if an OpenAI API Key is not configured, allowing local interface testing immediately.

---

## Folder Structure

```
smart-devtool-api-integration/
├── backend/
│   ├── routes/
│   │   └── analyze.js       # Main POST analyze endpoint
│   ├── services/
│   │   ├── scraper.js       # Cheerio HTML parser
│   │   └── openai.js        # OpenAI / Fallback client
│   ├── .env                 # Server env settings
│   ├── server.js            # Express application entry
│   └── package.json         # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.jsx  # Landing form presets
│   │   │   ├── Dashboard.jsx  # Interactive parameters/guides
│   │   │   └── CodeBlock.jsx  # Syntax highlighting panel
│   │   ├── App.jsx          # App root and loading state
│   │   └── index.css        # Tailwind style directives
│   ├── tailwind.config.js   # Custom dark theme configuration
│   ├── postcss.config.js    # PostCSS configs
│   ├── package.json         # Frontend dependencies
│   └── index.html           # Landing page HTML
└── README.md                # System documentation
```

---

## Setup & Running Instructions

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. *(Optional)* Add your OpenAI API Key inside `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your-api-key-here
   ```
   *Note: If left empty, the tool runs in Sandbox Mode and generates detailed mock integrations for Stripe, GitHub, and other APIs.*
4. Start the Express development server (running on port `5000`):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Click the link in your console (usually `http://localhost:5173`) to launch the application.

---

## Verification Tests

You can verify separate backend pieces using helper test commands inside the `backend` directory:

- Run `node test_scraper.js` to verify raw documentation URL extraction.
- Run `node test_openai.js` to check API connector schemas or mock generation.
=======
# Doc2code
AI-powered API documentation analyzer that converts API docs into integration guides and ready-to-use wrapper code.
>>>>>>> 9feea6d38be943c71a71768f067711d1a3e8d492
