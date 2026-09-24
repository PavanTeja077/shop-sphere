import express from 'express';
import { checkout, getSellerOrders, getCustomerOrders, updateSellerOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.post('/checkout', checkout);
router.get('/seller/:sellerId', getSellerOrders);
router.get('/customer/:customerId', getCustomerOrders);
router.patch('/seller/:orderId/status', updateSellerOrderStatus);

export default router;

