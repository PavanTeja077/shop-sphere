import express from 'express';
import { requestReturn, getUserReturns } from '../controllers/apiController.js';

const router = express.Router();

// Mock GET returns for a user
router.get('/:userId', async (req, res) => {
  const mock = [
    { _id: 'ret1', order: 'ORD-89234', product: 'Quantum Noise-Cancelling Headphones', reason: 'Defective', quantity: 1, status: 'REQUESTED' }
  ];
  res.json(mock);
});

// Mock POST return request (echo back)
router.post('/', requestReturn);

export default router;
