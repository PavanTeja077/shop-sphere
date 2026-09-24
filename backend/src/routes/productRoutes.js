import express from 'express';
import { getProducts, createProduct, semanticSearch } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/semantic-search', semanticSearch);

export default router;
