import express from 'express';
import { getSellerAnalytics } from '../controllers/apiController.js';

const router = express.Router();

// Mock analytics data for a seller
router.get('/:sellerId', async (req, res) => {
  const mock = {
    totalRevenue: 124500,
    activeOrders: 12,
    pendingReturns: 1
  };
  res.json(mock);
});

export default router;
