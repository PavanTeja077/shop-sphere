import MasterOrder from '../models/MasterOrder.js';
import SellerOrder from '../models/SellerOrder.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import ReturnRequest from '../models/ReturnRequest.js';
import SupportTicket from '../models/SupportTicket.js';
import { createMultiVendorOrder } from '../services/orderService.js';
import { getCopilotResponse } from '../services/copilotService.js';

// ---------- Checkout ----------
export const checkout = async (req, res) => {
  const { customerId, cartItems, shippingAddress, paymentMethod } = req.body;
  try {
    const result = await createMultiVendorOrder(customerId, cartItems, shippingAddress, paymentMethod);
    res.status(201).json({ message: 'Checkout successful', data: result });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message || 'Checkout failed' });
  }
};

// ---------- Reviews ----------
export const addReview = async (req, res) => {
  const { productId, userId, rating, comment } = req.body;
  try {
    const review = await Review.create({ product: productId, user: userId, rating, comment });
    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getProductReviews = async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = await Review.find({ product: productId }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---------- Returns ----------
export const requestReturn = async (req, res) => {
  const { orderId, productId, productName, customerName, reason, quantity } = req.body;
  try {
    const ret = await ReturnRequest.create({ 
      orderId: orderId || 'ORD-GEN', 
      productId: productId || 'PROD-GEN',
      productName: productName || 'Purchased Item',
      customerName: customerName || 'Customer',
      reason: reason || 'Return requested',
      quantity: quantity || 1,
      status: 'PENDING',
      refundAmount: 0
    });
    res.status(201).json({ message: 'Return requested', return: ret });
  } catch (err) {
    console.error('Return request error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserReturns = async (req, res) => {
  const { userId } = req.params;
  try {
    const returns = await ReturnRequest.find().sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    console.error('Get returns error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---------- Support ----------
export const getAllTickets = async (req, res) => {
  try {
    let tickets = await SupportTicket.find().sort({ createdAt: -1 });
    if (!tickets || tickets.length === 0) {
      tickets = [
        {
          _id: 'TCK-501',
          user: 'pavan@example.com',
          userName: 'Pavan Teja',
          userEmail: 'pavan@example.com',
          subject: 'Transit question regarding multi-vendor delivery',
          description: 'Hi, I placed an order with two sellers. Will they arrive in separate boxes?',
          priority: 'HIGH',
          status: 'OPEN',
          createdAt: new Date().toISOString(),
          messages: [
            { sender: 'customer', text: 'Hi, I placed an order with two sellers. Will they arrive in separate boxes?', time: '14:30' },
            { sender: 'agent', text: 'Hello Pavan! Yes, ShopSphere splits multi-vendor checkouts so each seller packages their item directly for fastest delivery.', time: '14:45' }
          ]
        },
        {
          _id: 'TCK-502',
          user: 'aditi@example.com',
          userName: 'Aditi Sharma',
          userEmail: 'aditi@example.com',
          subject: 'Return eligibility for electronics',
          description: 'Does the 7-day return policy cover opened electronics with original seal intact?',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          createdAt: new Date().toISOString(),
          messages: [
            { sender: 'customer', text: 'Does the 7-day return policy cover opened electronics with original seal intact?', time: '18:15' },
            { sender: 'agent', text: 'Hi Aditi! Yes, as long as all accessories, manuals, and original box are retained.', time: '18:30' }
          ]
        }
      ];
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTicket = async (req, res) => {
  const { userId, userName, userEmail, subject, description, priority, orderId } = req.body;
  try {
    const ticket = await SupportTicket.create({ 
      user: userId || 'customer',
      userName: userName || 'Verified Customer',
      userEmail: userEmail || 'customer@shopsphere.com',
      subject: subject || 'General Customer Support',
      description: description || 'Inquiry submitted',
      orderId: orderId || '',
      priority: priority || 'MEDIUM',
      messages: [{
        sender: 'customer',
        text: description || 'Inquiry submitted',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]
    });
    res.status(201).json({ message: 'Ticket created', ticket });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const replyTicket = async (req, res) => {
  const { id } = req.params;
  const { sender, text } = req.body;
  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const newMsg = {
      sender: sender || 'agent',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    ticket.messages.push(newMsg);
    if (sender === 'customer' && ticket.status === 'RESOLVED') {
      ticket.status = 'OPEN';
    }
    await ticket.save();
    res.json({ message: 'Reply sent', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.status = status;
    await ticket.save();
    res.json({ message: 'Status updated', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserTickets = async (req, res) => {
  const { userId } = req.params;
  try {
    const tickets = await SupportTicket.find({ user: userId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error('Get tickets error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---------- Seller Analytics ----------
export const getSellerAnalytics = async (req, res) => {
  const { sellerId } = req.params;
  try {
    // Total revenue
    const revenueAgg = await SellerOrder.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: null, totalRevenue: { $sum: '$subTotal' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    // Active orders count (status not DELIVERED)
    const activeOrders = await SellerOrder.countDocuments({ seller: sellerId, status: { $ne: 'DELIVERED' } });
    // Pending returns count
    const pendingReturns = await ReturnRequest.countDocuments({ seller: sellerId, status: { $in: ['REQUESTED', 'APPROVED'] } });
    res.json({ totalRevenue, activeOrders, pendingReturns });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---------- Seller Orders ----------
export const getSellerOrders = async (req, res) => {
  const { sellerId } = req.params;
  try {
    const orders = await SellerOrder.find({ seller: sellerId }).populate('orderItems.product');
    res.json(orders);
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---------- AI Co‑pilot ----------
export const handleAICopilot = async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const reply = await getCopilotResponse(prompt);
    return res.json({ response: reply });
  } catch (err) {
    console.error("AI Copilot Error:", err);
    return res.status(500).json({
      error: "Failed to process AI request",
      response: "I'm having trouble thinking right now. Please try again in a moment!"
    });
  }
};

