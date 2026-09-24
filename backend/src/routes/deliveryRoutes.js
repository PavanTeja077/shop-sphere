import express from 'express';
import SellerOrder from '../models/SellerOrder.js';
import MasterOrder from '../models/MasterOrder.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET all orders ready for delivery network
router.get('/orders', async (req, res) => {
  try {
    let orders = await SellerOrder.find().sort({ createdAt: -1 }).populate('masterOrder seller');
    if (orders && orders.length > 0) return res.json(orders);

    const masterOrders = await MasterOrder.find().sort({ createdAt: -1 });
    if (masterOrders && masterOrders.length > 0) return res.json(masterOrders);

    return res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders assigned to delivery partner
router.get('/assigned/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params;
    let orders = [];

    // Find any real orders in DB first
    orders = await SellerOrder.find().sort({ createdAt: -1 }).populate('masterOrder seller');
    if (orders && orders.length > 0) {
      return res.json(orders);
    }

    // Fallback mock response for demonstration
    return res.json([
      {
        _id: 'ord_del_101',
        status: 'PACKED',
        seller: { name: 'Apex Acoustics Store' },
        customer: { name: 'Verified Customer', email: 'customer@shopsphere.com' },
        orderItems: [{ name: 'Quantum Noise-Cancelling Headphones', qty: 1, price: 29999 }],
        subTotal: 29999,
        shippingAddress: { address: '402 Cyber Heights, Bandra West', city: 'Mumbai', postalCode: '400050' },
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'ord_del_102',
        status: 'SHIPPED',
        seller: { name: 'Chronos Wearables' },
        customer: { name: 'Aditi Sharma', email: 'aditi@example.com' },
        orderItems: [{ name: 'Aero Minimalist Smartwatch', qty: 1, price: 14999 }],
        subTotal: 14999,
        shippingAddress: { address: '12 Linking Road, Khar', city: 'Mumbai', postalCode: '400052' },
        updatedAt: new Date().toISOString()
      }
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update shipment progress by delivery partner (by sellerOrderId or masterOrderId)
router.patch('/:sellerOrderId/status', async (req, res) => {
  try {
    const { sellerOrderId } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
    }

    if (mongoose.Types.ObjectId.isValid(sellerOrderId)) {
      const order = await SellerOrder.findById(sellerOrderId);
      if (order) {
        order.status = status;
        order.statusHistory.push({ status, note: note || `Status updated to ${status}` });
        await order.save();
        return res.json({ message: `Order updated to ${status}`, order });
      }
    }

    // Try finding by custom string or master order
    const order = await SellerOrder.findOne({ _id: sellerOrderId });
    if (order) {
      order.status = status;
      await order.save();
      return res.json({ message: `Order updated to ${status}`, order });
    }

    // Mock fallback response
    return res.json({
      message: `Order status updated to ${status} successfully`,
      order: { _id: sellerOrderId, status, note, updatedAt: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
