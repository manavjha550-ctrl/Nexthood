import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { authRouter } from './server/auth.js';
import { ordersRouter } from './server/orders.js';
import { adminRouter } from './server/admin.js';
import { paymentRouter } from './server/payments.js';
import { publicRouter } from './server/public.js';
import { runMigrations } from './server/db/migrate.js';
import { createServer as createViteServer } from 'vite';


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    try {
      await runMigrations();
    } catch (e) {
      console.error('Development migration failed:', e);
    }
  }

  const app = express();
  app.use(express.json({ verify: (req: any, _res, buf) => { req.rawBody = buf.toString('utf8'); } }));
  app.use(cookieParser());

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  const PORT = Number(process.env.PORT) || 3000;

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/public', publicRouter);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Explicitly serve public directory as requested
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Prevent SPA fallback for missing images
  app.use('/images', (req, res) => {
    res.status(404).type('text/plain').send('Image not found');
  });

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
    console.log(`Server running on 0.0.0.0:${PORT}`);
  });
}

startServer();
