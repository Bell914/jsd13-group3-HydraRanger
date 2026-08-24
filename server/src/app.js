import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { requestLogger, notFoundHandler, errorHandler } from './middleware/index.js';

const app = express();

// Global Middlewares
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🛡️ Welcome to HydraRanger API (Group 3 - Sprint 2)',
    docs: '/api/health',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api', apiRouter);

// 404 & Error Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
