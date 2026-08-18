import express from 'express';
import { getProducts, getProductBySlug } from './db/repositories/productRepository.js';

export const publicRouter = express.Router();

publicRouter.get('/products', async (req, res) => {
  try {
    const products = await getProducts(false); // only ACTIVE products
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

publicRouter.get('/products/:slug', async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug, false);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});
