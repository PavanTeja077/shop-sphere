import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// Validate and apply coupon
router.post('/validate', async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code required' });

    const upperCode = code.toUpperCase().trim();

    // Default coupons if not seeded in DB
    const validCoupons = {
      'SPHERE10': { discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 500 },
      'WELCOME20': { discountType: 'PERCENTAGE', discountValue: 20, minOrderValue: 1000 },
      'FLAT500': { discountType: 'FIXED', discountValue: 500, minOrderValue: 2000 }
    };

    let coupon = await Coupon.findOne({ code: upperCode, isActive: true });
    
    if (!coupon && validCoupons[upperCode]) {
      const c = validCoupons[upperCode];
      if (cartTotal < c.minOrderValue) {
        return res.status(400).json({ valid: false, message: `Minimum order value ₹${c.minOrderValue} required for this coupon.` });
      }
      const discount = c.discountType === 'PERCENTAGE' ? (cartTotal * c.discountValue) / 100 : c.discountValue;
      return res.json({
        valid: true,
        code: upperCode,
        discountType: c.discountType,
        discountValue: c.discountValue,
        discountAmount: Math.round(discount),
        message: `Coupon ${upperCode} applied! Saved ₹${Math.round(discount)}`
      });
    }

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired coupon code' });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ valid: false, message: `Minimum order value of ₹${coupon.minOrderValue} required.` });
    }

    const discount = coupon.discountType === 'PERCENTAGE' ? (cartTotal * coupon.discountValue) / 100 : coupon.discountValue;
    return res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discount),
      message: `Coupon ${coupon.code} applied! Saved ₹${Math.round(discount)}`
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

// List all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.json(coupons.length > 0 ? coupons : [
      { code: 'SPHERE10', discountType: 'PERCENTAGE', discountValue: 10, minOrderValue: 500, isActive: true },
      { code: 'WELCOME20', discountType: 'PERCENTAGE', discountValue: 20, minOrderValue: 1000, isActive: true },
      { code: 'FLAT500', discountType: 'FIXED', discountValue: 500, minOrderValue: 2000, isActive: true }
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a coupon (admin)
router.post('/', async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

