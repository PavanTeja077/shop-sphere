import MasterOrder from '../models/MasterOrder.js';
import SellerOrder from '../models/SellerOrder.js';
import Product from '../models/Product.js';
import AuditLog from '../models/AuditLog.js';
import mongoose from 'mongoose';

export const createMultiVendorOrder = async (customerId, cartItems, shippingAddress, paymentMethod, coupon = null) => {
  try {
    // 1. Group items by seller
    const sellerGroups = {};
    let masterTotal = 0;

    for (const item of cartItems) {
      // Check inventory if product exists in MongoDB
      let sellerId = 'seller_general';
      if (mongoose.Types.ObjectId.isValid(item.product)) {
        const product = await Product.findById(item.product);
        if (product) {
          if (product.inventory < item.qty) {
            throw new Error(`Insufficient inventory for product: ${item.name}`);
          }
          sellerId = product.seller ? product.seller.toString() : 'seller_general';
        }
      } else if (item.sellerId) {
        sellerId = item.sellerId;
      }

      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = {
          seller: sellerId,
          items: [],
          subTotal: 0
        };
      }
      
      const itemTotal = item.qty * item.price;
      sellerGroups[sellerId].items.push(item);
      sellerGroups[sellerId].subTotal += itemTotal;
      masterTotal += itemTotal;
    }

    // Apply coupon discount if provided
    let finalTotal = masterTotal;
    if (coupon && coupon.discountAmount) {
      finalTotal = Math.max(0, masterTotal - coupon.discountAmount);
    }

    // 2. Create Master Order in DB if possible, or fallback mock
    const validCustomerId = mongoose.Types.ObjectId.isValid(customerId) 
      ? customerId 
      : new mongoose.Types.ObjectId();

    let masterOrder;
    try {
      masterOrder = await MasterOrder.create({
        customer: validCustomerId,
        shippingAddress,
        paymentMethod,
        totalPrice: finalTotal,
        isPaid: true,
        paidAt: new Date()
      });
    } catch (err) {
      masterOrder = {
        _id: `MO-${Math.floor(100000 + Math.random() * 900000)}`,
        customer: validCustomerId,
        shippingAddress,
        paymentMethod,
        totalPrice: finalTotal,
        isPaid: true,
        createdAt: new Date().toISOString()
      };
    }

    // 3. Create Seller Orders (Order Splitting)
    const sellerOrders = [];
    for (const sellerId in sellerGroups) {
      const group = sellerGroups[sellerId];
      const validSellerId = mongoose.Types.ObjectId.isValid(sellerId)
        ? sellerId
        : new mongoose.Types.ObjectId();

      let sellerOrder;
      try {
        sellerOrder = await SellerOrder.create({
          masterOrder: masterOrder._id,
          seller: validSellerId,
          orderItems: group.items.map(it => ({
            name: it.name,
            qty: it.qty,
            image: it.image,
            price: it.price,
            product: mongoose.Types.ObjectId.isValid(it.product) ? it.product : new mongoose.Types.ObjectId()
          })),
          subTotal: group.subTotal,
          status: 'PLACED',
          statusHistory: [{ status: 'PLACED', note: 'Order created after unified checkout' }]
        });
      } catch (err) {
        sellerOrder = {
          _id: `SO-${Math.floor(10000 + Math.random() * 90000)}`,
          masterOrder: masterOrder._id,
          seller: sellerId,
          orderItems: group.items,
          subTotal: group.subTotal,
          status: 'PLACED',
          statusHistory: [{ status: 'PLACED', note: 'Order created after unified checkout' }]
        };
      }
      sellerOrders.push(sellerOrder);

      // Reduce Inventory (Phase 4)
      for (const item of group.items) {
        if (mongoose.Types.ObjectId.isValid(item.product)) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { inventory: -item.qty }
          }).catch(() => {});
        }
      }
    }

    // 4. Audit Log
    await AuditLog.create({
      action: 'UNIFIED_CHECKOUT_COMPLETED',
      actorRole: 'Customer',
      actorId: String(validCustomerId),
      details: {
        masterOrderId: masterOrder._id,
        sellerOrdersCount: sellerOrders.length,
        total: finalTotal,
        couponApplied: coupon ? coupon.code : null
      }
    }).catch(() => {});

    return { masterOrder, sellerOrders };
  } catch (error) {
    console.error('Order Splitting Error:', error);
    throw error;
  }
};

