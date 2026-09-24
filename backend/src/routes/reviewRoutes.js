import express from 'express';
import { addReview, getProductReviews } from '../controllers/apiController.js';

const router = express.Router();

// Get reviews for a product (mock data)
router.get('/:productId', async (req, res) => {
  // Return static mock reviews
  const mock = [
    { _id: 'r1', user: { name: 'Amit' }, rating: 5, comment: 'Excellent quality!' },
    { _id: 'r2', user: { name: 'Sneha' }, rating: 4, comment: 'Very good, fast shipping.' }
  ];
  res.json(mock);
});

// Add a new review (mock, just echo back)
router.post('/', addReview);

export default router;
