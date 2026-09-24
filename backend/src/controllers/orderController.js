import { createMultiVendorOrder } from '../services/orderService.js';
import SellerOrder from '../models/SellerOrder.js';
import MasterOrder from '../models/MasterOrder.js';

// Phase 4: Unified Checkout
export const checkout = async (req, res) => {
  try {
    const { cartItems, shippingAddress, paymentMethod, customerId, coupon } = req.body;
    
    // Calls the split order logic
    const result = await createMultiVendorOrder(customerId, cartItems, shippingAddress, paymentMethod, coupon);
    
    res.status(201).json({
      message: 'Checkout successful',
      order: result.masterOrder,
      masterOrder: result.masterOrder,
      masterOrderId: result.masterOrder?._id || `ORD-${Date.now().toString().slice(-5)}`,
      sellerOrdersCreated: result.sellerOrders.length,
      sellerOrders: result.sellerOrders
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Phase 5: Seller Fulfillment Dashboard
export const getSellerOrders = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const orders = await SellerOrder.find({ seller: sellerId }).populate('masterOrder');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Customer Master Orders
export const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const masterOrders = await MasterOrder.find({ customer: customerId }).sort({ createdAt: -1 });
    
    // Gather matching seller orders
    const ordersWithSubOrders = await Promise.all(
      masterOrders.map(async (mo) => {
        const subOrders = await SellerOrder.find({ masterOrder: mo._id });
        return {
          ...mo.toObject(),
          sellerOrders: subOrders
        };
      })
    );

    res.json(ordersWithSubOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller status transition: CONFIRMED -> PACKED -> SHIPPED -> DELIVERED
export const updateSellerOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const order = await SellerOrder.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Seller order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || `Seller marked as ${status}` });
    await order.save();

    res.json({ message: `Order updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

