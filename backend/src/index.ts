import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import airQualityRoutes from './routes/airQualityRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow frontend development port and production
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use('/api', airQualityRoutes);
app.use('/api', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AIRWISE Backend API',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    cpcbConfigured: !!process.env.DATA_GOV_IN_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler (prevent stack trace leak)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err?.message || err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

// Start server if not running inside test runner
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 AIRWISE Backend running on http://localhost:${PORT}`);
  });
}

export default app;

