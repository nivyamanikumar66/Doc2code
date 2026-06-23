import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyzeRouter from './routes/analyze.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity; can be tightened later
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart DevTool Backend is running' });
});

// Bind Analysis Routes
app.use('/api/analyze', analyzeRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({
    error: 'An unexpected server error occurred. Please try again later.'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Smart DevTool API Backend running on port ${PORT} `);
  console.log(`  Health check: http://localhost:${PORT}/health     `);
  console.log(`==================================================`);
});
