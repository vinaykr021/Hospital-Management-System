import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { errorHandler } from './middleware/auth';
import { getDb } from './database/connection';
import { initDb } from './database/schema';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use(errorHandler);

// Initialize DB and Start Server
const startServer = async () => {
  try {
    const db = await getDb();
    await initDb(db);
    
    app.listen(PORT, () => {
      console.log(`
      🚀 Hospital Management System Backend Running
      📡 Port: ${PORT}
      🏥 Environment: ${process.env.NODE_ENV || 'development'}
      📂 Database: ${process.env.DATABASE_URL || 'hospital.db'}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
