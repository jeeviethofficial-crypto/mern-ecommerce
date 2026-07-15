import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';

import productRoutes from './src/api/routes/productRoutes';
import userRoutes from './src/api/routes/userRoutes';
import orderRoutes from './src/api/routes/orderRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB if URI is provided
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error);
    }
  } else {
    console.warn('MONGO_URI is not set in environment. Running without database connection.');
  }

  // --- CUSTOMER MODULE ROUTES ---
  // API routes go here FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', module: 'customer' });
  });
  
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);

  // --- ADMIN MODULE ROUTES (STUBS) ---
  // Admin routes will be managed by the Admin team
  
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
