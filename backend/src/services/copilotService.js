// backend/src/services/copilotService.js
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import mongoose from 'mongoose';
import { GoogleGenAI } from '@google/genai';

// Base catalog fallback with detailed specifications and price history
export const defaultCatalog = [
  {
    _id: 'prod_101',
    name: 'Quantum Noise-Cancelling Headphones',
    price: 29999,
    originalPrice: 32999,
    rating: 4.8,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    description: 'Next-gen active noise cancellation with 40h battery life and spatial audio.',
    trustScore: 99.2,
    trustFactors: { verifiedReviewsCount: 124, fulfillmentRate: 99.5, returnRate: 0.8, listingCompleteness: 98 },
    keySellingPoints: ['40h Playtime', 'Active Noise Cancellation (ANC)', 'Spatial Audio', 'Fast Charge 10min = 4hrs'],
    priceHistory: [
      { price: 32999, date: '2026-06-01' },
      { price: 30999, date: '2026-07-15' },
      { price: 29999, date: '2026-08-20' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: true, materials: '100% Recycled Aluminum & Organic Memory Foam' },
    seller: { name: 'Apex Acoustics Store', rating: 4.9 },
    sellerId: 'seller_apex_1'
  },
  {
    _id: 'prod_102',
    name: 'Aero Minimalist Smartwatch',
    price: 14999,
    originalPrice: 16999,
    rating: 4.6,
    category: 'Wearables',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    description: 'Sleek aerospace aluminum frame with AMOLED display and 24/7 biometric tracking.',
    trustScore: 97.8,
    trustFactors: { verifiedReviewsCount: 88, fulfillmentRate: 98.2, returnRate: 1.2, listingCompleteness: 96 },
    keySellingPoints: ['Always-On AMOLED Display', 'SpO2 & Heart Rate Tracking', '5ATM Water Resistance', '14-Day Battery'],
    priceHistory: [
      { price: 16999, date: '2026-05-10' },
      { price: 15499, date: '2026-07-01' },
      { price: 14999, date: '2026-08-10' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: false, materials: 'Aerospace Grade Recycled Alloy' },
    seller: { name: 'Chronos Wearables', rating: 4.7 },
    sellerId: 'seller_chronos_2'
  },
  {
    _id: 'prod_103',
    name: 'Eco-Crafted Bamboo Desk',
    price: 35000,
    originalPrice: 38000,
    rating: 4.9,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
    description: 'Handcrafted solid bamboo desk featuring built-in wireless charging and cable routing.',
    trustScore: 99.8,
    trustFactors: { verifiedReviewsCount: 62, fulfillmentRate: 100.0, returnRate: 0.2, listingCompleteness: 100 },
    keySellingPoints: ['FSC Certified Organic Bamboo', 'Integrated 15W Qi Wireless Charger', 'Hidden Cable Management Bay', 'Zero VOC Finish'],
    priceHistory: [
      { price: 38000, date: '2026-04-12' },
      { price: 36000, date: '2026-06-25' },
      { price: 35000, date: '2026-08-01' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: true, materials: 'FSC Certified Rapidly Renewable Bamboo' },
    seller: { name: 'Zenith Living Concepts', rating: 5.0 },
    sellerId: 'seller_zenith_3'
  },
  {
    _id: 'prod_104',
    name: 'Aura Studio Wireless Speaker',
    price: 18499,
    originalPrice: 19999,
    rating: 4.7,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    description: 'Room-filling 360 sound with deep bass and ambient LED mood lighting.',
    trustScore: 98.0,
    trustFactors: { verifiedReviewsCount: 45, fulfillmentRate: 97.9, returnRate: 1.5, listingCompleteness: 94 },
    keySellingPoints: ['360° Omnidirectional Audio', 'Subwoofer Bass Reflex', 'Touch Dimming Ambient Light', 'Bluetooth 5.3 + AUX'],
    priceHistory: [
      { price: 19999, date: '2026-05-20' },
      { price: 18499, date: '2026-08-15' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: true, materials: 'Bio-resin & Ocean Bound Plastic' },
    seller: { name: 'Apex Acoustics Store', rating: 4.9 },
    sellerId: 'seller_apex_1'
  },
  {
    _id: 'prod_105',
    name: 'Ergonomic Executive Studio Chair',
    price: 21999,
    originalPrice: 23999,
    rating: 4.8,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800&q=80',
    description: 'Dynamic lumbar support, 4D adjustable armrests and breathable German engineered mesh.',
    trustScore: 98.9,
    trustFactors: { verifiedReviewsCount: 71, fulfillmentRate: 99.0, returnRate: 0.9, listingCompleteness: 97 },
    keySellingPoints: ['Adaptive Lumbar Spine Support', '4D Multi-angle Armrests', 'Breathable German Mesh', 'Class-4 Hydraulic Gas Lift'],
    priceHistory: [
      { price: 23999, date: '2026-06-10' },
      { price: 21999, date: '2026-08-05' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: false, materials: 'Non-toxic Breathable Polymer Mesh' },
    seller: { name: 'Zenith Living Concepts', rating: 5.0 },
    sellerId: 'seller_zenith_3'
  },
  {
    _id: 'prod_106',
    name: 'Emerald Velvet Nordic Sofa',
    price: 48500,
    originalPrice: 52000,
    rating: 4.9,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    description: 'Luxurious high-density velvet upholstery with solid kiln-dried oak framework.',
    trustScore: 99.5,
    trustFactors: { verifiedReviewsCount: 84, fulfillmentRate: 99.6, returnRate: 0.4, listingCompleteness: 99 },
    keySellingPoints: ['Oeko-Tex Certified Velvet', 'Kiln-dried Solid Oak Base', 'High-resilience Feather & Foam Cushions', '10-Year Frame Warranty'],
    priceHistory: [
      { price: 52000, date: '2026-04-10' },
      { price: 49999, date: '2026-06-20' },
      { price: 48500, date: '2026-08-15' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: true, materials: 'Oeko-Tex Certified Velvet & Sustainable Oak' },
    seller: { name: 'Nordic Craft Co', rating: 4.9 },
    sellerId: 'seller_nordic_5'
  },
  {
    _id: 'prod_107',
    name: 'Scandinavian Accent Lounge Chair',
    price: 18999,
    originalPrice: 21000,
    rating: 4.7,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    description: 'Minimalist Scandinavian contour lounge chair with ergonomic deep-seat geometry.',
    trustScore: 98.4,
    trustFactors: { verifiedReviewsCount: 56, fulfillmentRate: 98.8, returnRate: 1.0, listingCompleteness: 96 },
    keySellingPoints: ['Solid European Beechwood', 'Ergonomic Deep Pocket Seating', 'Organic Wool-blend Fabric', 'Hand-stitched Seams'],
    priceHistory: [
      { price: 21000, date: '2026-05-15' },
      { price: 18999, date: '2026-07-28' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: true, materials: 'Natural Beechwood & Organic Wool Blend' },
    seller: { name: 'Nordic Craft Co', rating: 4.9 },
    sellerId: 'seller_nordic_5'
  },
  {
    _id: 'prod_108',
    name: 'Solid Walnut Mid-Century Coffee Table',
    price: 24999,
    originalPrice: 27500,
    rating: 4.8,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
    description: 'Warm natural grain solid American walnut with tapered legs and hidden magazine shelf.',
    trustScore: 99.1,
    trustFactors: { verifiedReviewsCount: 43, fulfillmentRate: 99.2, returnRate: 0.5, listingCompleteness: 98 },
    keySellingPoints: ['100% Solid American Walnut', 'Beveled Soft-radius Edges', 'Hidden Lower Storage Shelf', 'Non-toxic Natural Oil Wax'],
    priceHistory: [
      { price: 27500, date: '2026-04-25' },
      { price: 24999, date: '2026-07-10' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: true, materials: 'FSC Certified American Walnut & Non-VOC Oil' },
    seller: { name: 'TimberCraft Studio', rating: 4.8 },
    sellerId: 'seller_timber_6'
  },
  {
    _id: 'prod_109',
    name: 'Handcrafted Modular Wall Bookshelf',
    price: 18500,
    originalPrice: 20000,
    rating: 4.7,
    category: 'Furniture',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80',
    description: 'Modular floating shelving system crafted with solid pine and matte steel brackets.',
    trustScore: 97.9,
    trustFactors: { verifiedReviewsCount: 38, fulfillmentRate: 98.5, returnRate: 1.1, listingCompleteness: 95 },
    keySellingPoints: ['Modular Expandable Configuration', 'Heavy-duty Matte Carbon Steel', 'Sustainably Harvested Scandinavian Pine', 'Easy Wall Mounting Kit'],
    priceHistory: [
      { price: 20000, date: '2026-05-30' },
      { price: 18500, date: '2026-08-01' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: true, materials: 'Recycled Steel & Responsibly Sourced Pine' },
    seller: { name: 'TimberCraft Studio', rating: 4.8 },
    sellerId: 'seller_timber_6'
  },
  {
    _id: 'prod_110',
    name: 'Pro Ceramic Smart Mug',
    price: 8999,
    originalPrice: 9999,
    rating: 4.5,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    description: 'Keep your coffee or tea at the exact temperature for up to 3 hours.',
    trustScore: 96.5,
    trustFactors: { verifiedReviewsCount: 39, fulfillmentRate: 96.8, returnRate: 2.1, listingCompleteness: 92 },
    keySellingPoints: ['Precision App Temperature Control (48°C - 62°C)', '3-Hour Battery / All-day on Coaster', 'Scratch-resistant Matte Ceramic Coating', 'Auto Sleep/Wake Sensor'],
    priceHistory: [
      { price: 9999, date: '2026-04-01' },
      { price: 8999, date: '2026-07-20' }
    ],
    sustainability: { ecoPackaging: true, carbonNeutral: true, materials: 'Natural Mineral Ceramic & Recycled Core' },
    seller: { name: 'SmartLifestyle Co', rating: 4.6 },
    sellerId: 'seller_lifestyle_4'
  }
];

export const defaultCoupons = [
  { code: 'SPHERE10', discount: '10% OFF', description: '10% instant discount on all orders above ₹500', minOrder: 500 },
  { code: 'WELCOME20', discount: '20% OFF', description: '20% instant discount for new customers on orders above ₹1,000', minOrder: 1000 },
  { code: 'FLAT500', discount: '₹500 FLAT', description: 'Flat ₹500 off on total cart value above ₹2,000', minOrder: 2000 }
];

// Helper: Get active product list from DB or fallback catalog
async function getAllProducts() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const dbProducts = await Product.find({}).populate('seller', 'name email').lean();
      if (dbProducts && dbProducts.length > 0) {
        return dbProducts.map(p => ({
          ...p,
          originalPrice: p.originalPrice || (p.priceHistory && p.priceHistory[0]?.price) || Math.round(p.price * 1.1)
        }));
      }
    }
  } catch (e) {
    // Database connection issue, use fallback catalog
  }
  return defaultCatalog;
}

// Helper: Get active coupons
async function getAllCoupons() {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const dbCoupons = await Coupon.find({ isActive: true }).lean();
      if (dbCoupons && dbCoupons.length > 0) {
        return dbCoupons.map(c => ({
          code: c.code,
          discount: c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`,
          description: `${c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `₹${c.discountValue} off`} on orders above ₹${c.minOrderValue}`,
          minOrder: c.minOrderValue
        }));
      }
    }
  } catch (e) {
    // fallback
  }
  return defaultCoupons;
}

// Intelligent Offline & Grounded Copilot Answer Generator
export function generateSmartAnswer(prompt, products, coupons) {
  const query = (prompt || '').trim();
  const lower = query.toLowerCase();

  // 1. TOP DEALS / OFFERS / DISCOUNTS / SALE / BARGAINS / SAVINGS
  if (
    lower.includes('deal') ||
    lower.includes('discount') ||
    lower.includes('offer') ||
    lower.includes('sale') ||
    lower.includes('bargain') ||
    lower.includes('savings') ||
    lower.includes('price drop') ||
    lower.includes('save money')
  ) {
    const sortedDeals = [...products].map(p => {
      const orig = p.originalPrice || (p.priceHistory && p.priceHistory[0]?.price) || Math.round(p.price * 1.1);
      const savings = Math.max(0, orig - p.price);
      const percent = Math.round((savings / orig) * 100);
      return { ...p, origPrice: orig, savings, percent };
    }).sort((a, b) => b.savings - a.savings);

    let res = "🔥 **Top Deals & Price Drops on ShopSphere Today:**\n\n";
    sortedDeals.slice(0, 5).forEach((p, idx) => {
      res += `${idx + 1}. **${p.name}**\n`;
      res += `   • Price: **₹${p.price.toLocaleString('en-IN')}** ~~(was ₹${p.origPrice.toLocaleString('en-IN')})~~\n`;
      if (p.savings > 0) {
        res += `   • 🏷️ **Save ₹${p.savings.toLocaleString('en-IN')} (${p.percent}% OFF)**\n`;
      }
      res += `   • ${p.description}\n`;
      res += `   • ⭐ Rating: ${p.rating || 4.8}★ | Trust Score: ${p.trustScore || 98}%\n\n`;
    });

    res += "🎟️ **Extra Savings Promo Codes:**\n";
    coupons.forEach(c => {
      res += `• **${c.code}**: ${c.discount} (${c.description})\n`;
    });
    res += "\n👉 *Apply any coupon code in your cart drawer during checkout for instant extra savings!*";
    return res;
  }

  // 2. COUPONS / PROMO CODES / VOUCHERS
  if (
    lower.includes('coupon') ||
    lower.includes('promo code') ||
    lower.includes('voucher') ||
    lower.includes('code')
  ) {
    let res = "🎟️ **Active Promo Codes on ShopSphere:**\n\n";
    coupons.forEach((c, i) => {
      res += `${i + 1}. **\`${c.code}\`** — **${c.discount}**\n`;
      res += `   • ${c.description}\n`;
      res += `   • Min Order: ₹${c.minOrder.toLocaleString('en-IN')}\n\n`;
    });
    res += "💡 **How to Apply:** Click the cart icon on the top right, expand the **Smart Cart Drawer**, enter the code into the coupon field, and click **Apply**.";
    return res;
  }

  // 3. COMPARISON ("compare", "difference between", "vs", "which is better")
  if (
    lower.includes('compare') ||
    lower.includes(' vs ') ||
    lower.includes(' vs. ') ||
    lower.includes('difference between') ||
    lower.includes('which is better') ||
    lower.includes('which one should i buy')
  ) {
    if (lower.includes('headphone') || lower.includes('speaker') || lower.includes('audio')) {
      return (
        "⚖️ **Comparison: Quantum Headphones vs Aura Studio Speaker**\n\n" +
        "1. **Quantum Noise-Cancelling Headphones** (₹29,999)\n" +
        "   • *Best for:* Personal focus, commuting, travel, crystal-clear spatial audio.\n" +
        "   • *Key Features:* Active Noise Cancellation (ANC), 40-hour battery, spatial soundstage.\n" +
        "   • *Trust Score:* 99.2% (124 verified reviews)\n\n" +
        "2. **Aura Studio Wireless Speaker** (₹18,499)\n" +
        "   • *Best for:* Room-filling music, home parties, living room ambiance.\n" +
        "   • *Key Features:* 360° omnidirectional sound, deep bass subwoofer, touch-dim ambient LED lighting.\n" +
        "   • *Trust Score:* 98.0% (45 verified reviews)\n\n" +
        "💡 **Verdict:** Choose the **Headphones** if you need private immersion and travel portability; pick the **Aura Speaker** if you want to elevate your room's sound and aesthetic!"
      );
    }

    if (lower.includes('desk') || lower.includes('chair') || lower.includes('office') || lower.includes('workspace')) {
      return (
        "⚖️ **Comparison: Eco-Crafted Bamboo Desk vs Ergonomic Executive Chair**\n\n" +
        "1. **Eco-Crafted Bamboo Desk** (₹35,000)\n" +
        "   • *Material:* 100% Solid FSC Certified bamboo with zero-VOC organic coating.\n" +
        "   • *Standout Tech:* Built-in 15W Qi wireless phone charger and hidden cable bay.\n" +
        "   • *Trust Score:* 99.8% (Apex satisfaction)\n\n" +
        "2. **Ergonomic Executive Studio Chair** (₹21,999)\n" +
        "   • *Ergonomics:* Dynamic adaptive lumbar support, 4D armrests, breathable German mesh.\n" +
        "   • *Comfort:* Designed for 8-12 hour daily work sessions without fatigue.\n" +
        "   • *Trust Score:* 98.9%\n\n" +
        "💡 **Recommendation:** They are designed to complement each other for an elite, ergonomic home office setup! Together they qualify for free shipping and code **FLAT500**!"
      );
    }

    if (lower.includes('sofa') || lower.includes('lounge') || lower.includes('couch')) {
      return (
        "⚖️ **Comparison: Emerald Velvet Nordic Sofa vs Scandinavian Lounge Chair**\n\n" +
        "1. **Emerald Velvet Nordic Sofa** (₹48,500 ~~(₹52,000)~~)\n" +
        "   • *Seating:* 3-4 Persons | Solid kiln-dried oak frame & Oeko-Tex velvet.\n" +
        "   • *Aesthetic:* Statement luxury piece with plush comfort.\n\n" +
        "2. **Scandinavian Accent Lounge Chair** (₹18,999 ~~(₹21,000)~~)\n" +
        "   • *Seating:* 1 Person | Solid European beechwood with contour deep-seat pocket.\n" +
        "   • *Aesthetic:* Minimalist reading or corner accent chair.\n\n" +
        "💡 **Verdict:** The sofa transforms your main living room; the lounge chair adds an inviting reading corner."
      );
    }
  }

  // 4. INDIVIDUAL PRODUCT INQUIRIES & DETAILED SPECS
  if (lower.includes('headphone') || lower.includes('quantum') || lower.includes('anc') || lower.includes('earphone')) {
    const prod = products.find(p => p.name.toLowerCase().includes('headphone')) || defaultCatalog[0];
    return (
      `🎧 **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 32999).toLocaleString('en-IN')})~~ — **Save ₹3,000**\n` +
      `• **Key Specs:**\n` +
      `  - 40 Hours continuous playback on a single charge\n` +
      `  - Hybrid Active Noise Cancellation (eliminates 98% ambient noise)\n` +
      `  - Ultra-low latency spatial audio for music, movies, and gaming\n` +
      `  - Quick Charge: 10 minutes gives 4 hours of listening\n` +
      `• **Materials:** 100% Recycled aerospace aluminum & organic breathable memory foam\n` +
      `• **Trust Score:** ${prod.trustScore || 99.2}% (Verified seller: Apex Acoustics Store)\n\n` +
      `👉 *Ready to order? Click "Add to Cart" on the home page and use code \`SPHERE10\` for 10% off!*`
    );
  }

  if (lower.includes('watch') || lower.includes('smartwatch') || lower.includes('aero') || lower.includes('wearable')) {
    const prod = products.find(p => p.name.toLowerCase().includes('smartwatch')) || defaultCatalog[1];
    return (
      `⌚ **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 16999).toLocaleString('en-IN')})~~ — **Save ₹2,000 (12% OFF)**\n` +
      `• **Key Features:**\n` +
      `  - 1.43" Ultra-Bright AMOLED Display with Always-On Mode\n` +
      `  - 24/7 Heart Rate, Continuous SpO2 Blood Oxygen, and Sleep Stage Tracking\n` +
      `  - 5ATM Water Resistance (swim-proof up to 50 meters)\n` +
      `  - Long battery life: Up to 14 days on standard usage\n` +
      `• **Design:** Aerospace Grade CNC machined recycled alloy with hypoallergenic fluororubber strap\n` +
      `• **Trust Score:** ${prod.trustScore || 97.8}%\n\n` +
      `👉 *Would you like to add it to your comparison list or proceed to checkout?*`
    );
  }

  if (lower.includes('bamboo') || lower.includes('desk') || (lower.includes('table') && lower.includes('work'))) {
    const prod = products.find(p => p.name.toLowerCase().includes('desk')) || defaultCatalog[2];
    return (
      `🌿 **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 38000).toLocaleString('en-IN')})~~ — **Save ₹3,000**\n` +
      `• **Standout Craftsmanship:**\n` +
      `  - Crafted from 100% FSC Certified rapidly renewable organic bamboo\n` +
      `  - Embedded 15W Qi wireless fast charger flush with tabletop\n` +
      `  - Concealed magnetic under-desk cable routing channel\n` +
      `  - Durable, scratch-resistant zero-VOC natural matte finish\n` +
      `• **Dimensions:** 140cm (L) x 70cm (W) x 75cm (H)\n` +
      `• **Trust Score:** ${prod.trustScore || 99.8}% (Zenith Living Concepts)\n\n` +
      `👉 *Ships carbon-neutral with free white-glove doorstep delivery!*`
    );
  }

  if (lower.includes('speaker') || lower.includes('aura') || lower.includes('sound system')) {
    const prod = products.find(p => p.name.toLowerCase().includes('speaker')) || defaultCatalog[3];
    return (
      `🔊 **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 19999).toLocaleString('en-IN')})~~\n` +
      `• **Highlights:**\n` +
      `  - 360-degree omnidirectional acoustic drivers with downward-firing bass subwoofer\n` +
      `  - Integrated ambient LED lighting with warm candlelight and wave modes\n` +
      `  - Bluetooth 5.3 + 3.5mm AUX + USB-C lossless audio input\n` +
      `  - Made with bio-resin and recycled ocean-bound ocean plastics\n` +
      `• **Trust Score:** ${prod.trustScore || 98.0}%\n\n` +
      `👉 *Perfect companion for living rooms, work desks, and social gatherings!*`
    );
  }

  if (lower.includes('chair') || lower.includes('ergonomic') || lower.includes('executive')) {
    const prod = products.find(p => p.name.toLowerCase().includes('chair')) || defaultCatalog[4];
    return (
      `🪑 **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 23999).toLocaleString('en-IN')})~~\n` +
      `• **Ergonomic Features:**\n` +
      `  - Self-adjusting dynamic lumbar spine support\n` +
      `  - 4D multi-directional armrests (height, angle, depth, width)\n` +
      `  - Breathable high-tensile German engineered mesh prevents heat buildup\n` +
      `  - Class-4 explosion-proof gas lift with 135° tilt-lock recline\n` +
      `• **Trust Score:** ${prod.trustScore || 98.9}%\n\n` +
      `👉 *Pair it with the Bamboo Desk for the ultimate ergonomic workstation!*`
    );
  }

  if (lower.includes('sofa') || lower.includes('couch') || lower.includes('nordic') || lower.includes('velvet')) {
    const prod = products.find(p => p.name.toLowerCase().includes('sofa')) || defaultCatalog[5];
    return (
      `🛋️ **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 52000).toLocaleString('en-IN')})~~ — **Save ₹3,500**\n` +
      `• **Highlights:**\n` +
      `  - Rich emerald green Oeko-Tex certified stain-resistant velvet upholstery\n` +
      `  - Internal structure handcrafted from kiln-dried solid European oak\n` +
      `  - High-resilience memory foam cushions reinforced with pocket springs\n` +
      `  - Comes with a 10-year warranty on frame integrity\n` +
      `• **Trust Score:** ${prod.trustScore || 99.5}%\n\n` +
      `👉 *Eligible for free nationwide delivery and zero-cost assembly!*`
    );
  }

  if (lower.includes('mug') || lower.includes('ceramic') || lower.includes('cup') || lower.includes('coffee') || lower.includes('tea')) {
    const prod = products.find(p => p.name.toLowerCase().includes('mug')) || defaultCatalog[9];
    return (
      `☕ **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 9999).toLocaleString('en-IN')})~~ — **Save ₹1,000**\n` +
      `• **Features:**\n` +
      `  - Keeps your coffee, tea, or cider at your precise desired temperature (48°C - 62°C)\n` +
      `  - 3-hour standalone battery life; lasts all day on the charging coaster\n` +
      `  - Scratch-resistant matte mineral ceramic coating\n` +
      `  - Smart LED indicator and Bluetooth mobile companion app\n` +
      `• **Trust Score:** ${prod.trustScore || 96.5}%\n\n` +
      `👉 *Makes a wonderful gift for remote professionals and coffee enthusiasts!*`
    );
  }

  if (lower.includes('coffee table') || (lower.includes('table') && lower.includes('walnut'))) {
    const prod = products.find(p => p.name.toLowerCase().includes('coffee table')) || defaultCatalog[7];
    return (
      `🪵 **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 27500).toLocaleString('en-IN')})~~\n` +
      `• **Features:** Solid American Walnut, tapered mid-century legs, beveled edges, and lower shelf for magazines/laptops.\n` +
      `• **Finish:** 100% Organic natural oil wax finish with no chemical emissions.\n` +
      `• **Trust Score:** ${prod.trustScore || 99.1}%`
    );
  }

  if (lower.includes('shelf') || lower.includes('bookshelf') || lower.includes('book')) {
    const prod = products.find(p => p.name.toLowerCase().includes('bookshelf')) || defaultCatalog[8];
    return (
      `📚 **${prod.name}**\n\n` +
      `• **Price:** ₹${prod.price.toLocaleString('en-IN')} ~~(was ₹${(prod.originalPrice || 20000).toLocaleString('en-IN')})~~\n` +
      `• **Features:** Solid Scandinavian pine shelves with matte black powder-coated steel modular brackets.\n` +
      `• **Mounting:** Includes heavy-duty drywall/brick anchors, holds up to 60kg total weight.\n` +
      `• **Trust Score:** ${prod.trustScore || 97.9}%`
    );
  }

  // 5. PRICE & BUDGET QUERIES ("under 10000", "under 20000", "budget", "cheapest", etc.)
  const priceMatch = lower.match(/under\s*(?:rs\.?|inr|₹)?\s*(\d+)(?:k)?/i);
  if (priceMatch || lower.includes('budget') || lower.includes('cheap') || lower.includes('affordable') || lower.includes('expensive') || lower.includes('luxury')) {
    let budget = priceMatch ? parseInt(priceMatch[1], 10) : 0;
    if (priceMatch && priceMatch[0].toLowerCase().includes('k')) budget = budget * 1000;
    if (!budget && (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable'))) {
      budget = 20000;
    }

    if (budget > 0) {
      const withinBudget = products.filter(p => p.price <= budget).sort((a, b) => a.price - b.price);
      if (withinBudget.length > 0) {
        let res = `💰 **Best Products Under ₹${budget.toLocaleString('en-IN')}:**\n\n`;
        withinBudget.forEach((p, i) => {
          res += `${i + 1}. **${p.name}** — **₹${p.price.toLocaleString('en-IN')}** (${p.category})\n`;
          res += `   • ${p.description}\n`;
          res += `   • ⭐ Rating: ${p.rating || 4.7}★ | Trust Score: ${p.trustScore}%\n\n`;
        });
        res += `👉 *You can apply coupon \`SPHERE10\` to reduce these prices by another 10%!*`;
        return res;
      } else {
        return `We don't currently have items under ₹${budget.toLocaleString('en-IN')}. Our most affordable item is the **Pro Ceramic Smart Mug** at **₹8,999** (Use code \`SPHERE10\` to get it for ₹8,099)!`;
      }
    } else if (lower.includes('luxury') || lower.includes('expensive') || lower.includes('premium')) {
      const luxuryItems = [...products].sort((a, b) => b.price - a.price).slice(0, 3);
      let res = "👑 **ShopSphere Premium Flagship Collection:**\n\n";
      luxuryItems.forEach((p, i) => {
        res += `${i + 1}. **${p.name}** — **₹${p.price.toLocaleString('en-IN')}**\n`;
        res += `   • ${p.description}\n`;
        res += `   • Crafted with verified carbon-neutral and luxury sustainable materials.\n\n`;
      });
      return res;
    }
  }

  // 6. CATEGORY EXPLORATION ("electronics", "furniture", "wearables", "home", "catalog", "what do you have", "browse")
  if (
    lower.includes('category') ||
    lower.includes('categories') ||
    lower.includes('catalog') ||
    lower.includes('what do you sell') ||
    lower.includes('what products do you have') ||
    lower.includes('browse') ||
    lower.includes('collection') ||
    lower.includes('all products')
  ) {
    const cats = {};
    products.forEach(p => {
      if (!cats[p.category]) cats[p.category] = [];
      cats[p.category].push(p);
    });

    let res = "🛍️ **ShopSphere Product Catalog by Category:**\n\n";
    for (const [category, items] of Object.entries(cats)) {
      res += `📂 **${category}** (${items.length} items):\n`;
      items.forEach(it => {
        res += `   • **${it.name}** — ₹${it.price.toLocaleString('en-IN')} (⭐ ${it.rating || 4.8}★)\n`;
      });
      res += "\n";
    }
    res += "💡 *Tell me which category or product you'd like to explore in detail, or ask me for top deals!*";
    return res;
  }

  // 7. SPECIFIC CATEGORY FILTERING
  if (lower.includes('furniture')) {
    const furn = products.filter(p => p.category.toLowerCase() === 'furniture');
    let res = "🪵 **ShopSphere Handcrafted Solid Wood & Designer Furniture:**\n\n";
    furn.forEach((p, i) => {
      res += `${i + 1}. **${p.name}** — **₹${p.price.toLocaleString('en-IN')}**\n`;
      res += `   • ${p.description}\n`;
      res += `   • ⭐ Rating: ${p.rating || 4.8}★ | Trust Score: ${p.trustScore}%\n\n`;
    });
    res += "👉 *All furniture is crafted from sustainable FSC certified timber and comes with free doorstep delivery!*";
    return res;
  }

  if (lower.includes('electronic') || lower.includes('audio') || lower.includes('gadget')) {
    const elec = products.filter(p => p.category.toLowerCase() === 'electronics');
    let res = "⚡ **ShopSphere Audio & Electronics:**\n\n";
    elec.forEach((p, i) => {
      res += `${i + 1}. **${p.name}** — **₹${p.price.toLocaleString('en-IN')}**\n`;
      res += `   • ${p.description}\n`;
      res += `   • ⭐ Rating: ${p.rating || 4.8}★ | Trust Score: ${p.trustScore}%\n\n`;
    });
    return res;
  }

  // 8. DELIVERY, SHIPPING & TRACKING
  if (
    lower.includes('delivery') ||
    lower.includes('shipping') ||
    lower.includes('track') ||
    lower.includes('when will it arrive') ||
    lower.includes('how long') ||
    lower.includes('courier') ||
    lower.includes('dispatch') ||
    lower.includes('pincode')
  ) {
    return (
      "📦 **ShopSphere Shipping & Delivery Policy:**\n\n" +
      "• **Speed:** Standard delivery takes **2 to 4 business days** across all major cities in India.\n" +
      "• **Free Shipping:** All orders over **₹1,000** qualify for 100% free delivery (otherwise flat ₹99).\n" +
      "• **Live Order Tracking:** Every order has real-time milestone updates (`PACKED` ➔ `SHIPPED` ➔ `OUT FOR DELIVERY` ➔ `DELIVERED`).\n" +
      "• **Where to Track:** Click **Post-Purchase** in the top navigation bar to view live order tracking, download invoices, or initiate returns.\n" +
      "• **Eco-Fulfillment:** 100% plastic-free recycled packaging with carbon-offset delivery."
    );
  }

  // 9. RETURNS, REFUNDS & CANCELLATION
  if (
    lower.includes('return') ||
    lower.includes('refund') ||
    lower.includes('exchange') ||
    lower.includes('replace') ||
    lower.includes('cancel') ||
    lower.includes('warranty') ||
    lower.includes('damaged')
  ) {
    return (
      "🔄 **7-Day Hassle-Free Returns & Refunds:**\n\n" +
      "• **Eligibility:** You can return or exchange any product within **7 days** of delivery if it is defective, damaged, or doesn't meet your expectations.\n" +
      "• **How to Initiate:**\n" +
      "  1. Navigate to the **Post-Purchase Center** from the top header.\n" +
      "  2. Select your order and click **Request Return**.\n" +
      "  3. Choose your reason and submit.\n" +
      "• **Free Pickup:** A courier will inspect and pick up the item from your doorstep at no charge.\n" +
      "• **Refund Timeline:** Full refund is credited directly to your original payment method within **24-48 hours** after pickup."
    );
  }

  // 10. TRUST SCORE & SUSTAINABILITY
  if (
    lower.includes('trust score') ||
    lower.includes('trust') ||
    lower.includes('authentic') ||
    lower.includes('sustainability') ||
    lower.includes('eco') ||
    lower.includes('carbon') ||
    lower.includes('green') ||
    lower.includes('safe')
  ) {
    return (
      "🛡️ **ShopSphere Trust Score & Eco Commitment:**\n\n" +
      "Every product on ShopSphere is rated with an objective **Trust Score (0-100%)** based on 4 verified metrics:\n" +
      "1. **Verified Reviews (40%):** Weighted exclusively from confirmed deliveries.\n" +
      "2. **Fulfillment Rate (25%):** Percentage of on-time, undamaged seller dispatches.\n" +
      "3. **Return Rate (20%):** Low product return ratios boost the score.\n" +
      "4. **Listing Completeness (15%):** Verified specs, authentic imagery, and certifications.\n\n" +
      "🌱 **Sustainability Standards:** Every product carries eco-friendly packaging, sustainably harvested materials (FSC timber, ocean-bound plastic), and carbon-neutral transit."
    );
  }

  // 11. PAYMENT METHODS & CHECKOUT
  if (
    lower.includes('payment') ||
    lower.includes('pay') ||
    lower.includes('upi') ||
    lower.includes('cod') ||
    lower.includes('cash on delivery') ||
    lower.includes('credit card') ||
    lower.includes('checkout')
  ) {
    return (
      "💳 **Payment Methods Accepted on ShopSphere:**\n\n" +
      "• **UPI:** Google Pay, PhonePe, Paytm, BHIM, and QR payment.\n" +
      "• **Cards:** All Visa, MasterCard, RuPay, and American Express Debit & Credit Cards.\n" +
      "• **Net Banking:** Supported across all major Indian banks.\n" +
      "• **Cash on Delivery (COD):** Available for orders up to ₹25,000.\n" +
      "• **Security:** 256-bit SSL end-to-end bank-grade encryption.\n\n" +
      "🛒 **Smart Multi-Vendor Checkout:** Even if you buy from 3 different sellers in one cart, our system automatically splits the order while providing a single checkout payment!"
    );
  }

  // 12. CUSTOMER SUPPORT & TICKETS
  if (
    lower.includes('support') ||
    lower.includes('help') ||
    lower.includes('contact') ||
    lower.includes('ticket') ||
    lower.includes('complaint') ||
    lower.includes('customer care')
  ) {
    return (
      "🎧 **ShopSphere 24/7 Customer Support Desk:**\n\n" +
      "• **Open a Ticket:** Switch to the **Support Desk** view using the top header navigation.\n" +
      "• **Instant Resolution:** Submit a query for missing items, payment verification, or product guidance.\n" +
      "• **Turnaround Time:** Average human response time is **under 2 hours**.\n" +
      "• **AI Copilot:** I am also available right here 24/7 to answer product specs, compare items, and check policies!"
    );
  }

  // 13. SELLER PORTAL & ADMIN HUB
  if (
    lower.includes('seller') ||
    lower.includes('sell') ||
    lower.includes('vendor') ||
    lower.includes('merchant') ||
    lower.includes('add product') ||
    lower.includes('admin')
  ) {
    return (
      "🏪 **Seller & Admin Ecosystem on ShopSphere:**\n\n" +
      "• **Seller Dashboard:** Sellers can manage products, track multi-vendor orders, view revenue metrics, and fulfill shipments.\n" +
      "• **AI Listing Generator:** Sellers can generate professional copy, SEO keywords, and FAQ items automatically powered by AI!\n" +
      "• **Admin Hub:** Platform administrators can approve/reject listings, monitor system audit logs, and manage coupon campaigns.\n" +
      "• **Accessing the Portals:** Use the top header tabs to switch between Customer, Seller, Delivery, and Admin views."
    );
  }

  // 14. GREETINGS & INTRODUCTIONS
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower.startsWith('hi ') ||
    lower.startsWith('hello ') ||
    lower.startsWith('hey ') ||
    lower.includes('who are you') ||
    lower.includes('what can you do') ||
    lower.includes('good morning') ||
    lower.includes('good afternoon') ||
    lower.includes('good evening')
  ) {
    return (
      "👋 **Hello! I am your ShopSphere AI Copilot.**\n\n" +
      "I can help you with anything on the platform, including:\n" +
      "• 🏷️ Finding **Top Deals & Price Drops**\n" +
      "• 🔍 Exploring product specs (Audio, Wearables, Furniture, Home)\n" +
      "• ⚖️ Comparing products side-by-side\n" +
      "• 🎟️ Giving you active discount coupon codes (`SPHERE10`)\n" +
      "• 📦 Explaining shipping, returns, and tracking\n" +
      "• 🛡️ Checking product Trust Scores and eco certifications\n\n" +
      "💡 *Try asking: \"Show top deals\", \"Compare headphones and speaker\", or \"Products under 20000\"!*"
    );
  }

  // 15. THANKS / PRAISE
  if (lower.includes('thank') || lower.includes('awesome') || lower.includes('great') || lower.includes('cool')) {
    return "You're very welcome! 😊 Let me know if you need help finding anything else, checking specs, or securing the best deals on ShopSphere!";
  }

  // 16. DYNAMIC KEYWORD SEARCH & INTENT MATCHING (For ANY message asked!)
  // 16. DYNAMIC KEYWORD SEARCH & INTENT MATCHING (For ANY message asked!)
  const topicMap = {
    audio: ['headphone', 'speaker', 'quantum', 'aura'],
    music: ['headphone', 'speaker', 'quantum', 'aura'],
    song: ['headphone', 'speaker', 'quantum', 'aura'],
    sound: ['headphone', 'speaker', 'quantum', 'aura'],
    gaming: ['headphone', 'quantum', 'chair'],
    game: ['headphone', 'quantum', 'chair'],
    work: ['desk', 'chair', 'bamboo', 'executive'],
    office: ['desk', 'chair', 'bamboo', 'executive'],
    wfh: ['desk', 'chair', 'bamboo', 'executive'],
    study: ['desk', 'chair', 'bamboo', 'bookshelf'],
    reading: ['lounge', 'bookshelf', 'chair', 'accent'],
    living: ['sofa', 'coffee table', 'lounge', 'speaker'],
    decor: ['sofa', 'coffee table', 'bookshelf', 'desk'],
    fitness: ['watch', 'smartwatch', 'aero'],
    health: ['watch', 'smartwatch', 'aero'],
    workout: ['watch', 'smartwatch', 'aero'],
    running: ['watch', 'smartwatch', 'aero'],
    morning: ['mug', 'ceramic', 'coffee'],
    coffee: ['mug', 'ceramic', 'coffee'],
    tea: ['mug', 'ceramic', 'coffee'],
    drink: ['mug', 'ceramic', 'coffee'],
    gift: ['mug', 'watch', 'headphone', 'speaker'],
    storage: ['bookshelf', 'coffee table']
  };

  const searchTerms = lower
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['the', 'and', 'for', 'with', 'about', 'can', 'you', 'show', 'tell', 'give', 'what', 'have', 'are', 'there', 'best', 'thing', 'item', 'buy', 'good'].includes(t));

  // Check topic associations
  const topicKeywords = [];
  searchTerms.forEach(term => {
    for (const [topic, kws] of Object.entries(topicMap)) {
      if (term.includes(topic) || topic.includes(term)) {
        topicKeywords.push(...kws);
      }
    }
  });

  if (searchTerms.length > 0 || topicKeywords.length > 0) {
    const scoredProducts = products.map(p => {
      let score = 0;
      const title = p.name.toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const selling = (p.keySellingPoints || []).join(' ').toLowerCase();

      searchTerms.forEach(term => {
        if (title.includes(term)) score += 6;
        if (cat.includes(term)) score += 4;
        if (selling.includes(term)) score += 3;
        if (desc.includes(term)) score += 2;
      });

      topicKeywords.forEach(kw => {
        if (title.includes(kw)) score += 5;
        if (cat.includes(kw)) score += 3;
        if (desc.includes(kw)) score += 2;
      });

      return { product: p, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);

    if (scoredProducts.length > 0) {
      let res = `✨ **Here are the top recommendations for "${query}" on ShopSphere:**\n\n`;
      scoredProducts.slice(0, 3).forEach((item, i) => {
        const p = item.product;
        res += `${i + 1}. **${p.name}** — **₹${p.price.toLocaleString('en-IN')}**\n`;
        res += `   • Category: ${p.category} | ⭐ ${p.rating || 4.8}★ | Trust Score: ${p.trustScore}%\n`;
        res += `   • ${p.description}\n`;
        if (p.keySellingPoints && p.keySellingPoints.length > 0) {
          res += `   • Highlights: ${p.keySellingPoints.slice(0, 2).join(' • ')}\n`;
        }
        res += "\n";
      });
      res += "👉 *Click on any product card on the main page to add to cart or compare!*";
      return res;
    }
  }

  // 17. CONVERSATIONAL SMART FALLBACK (Always helpful, never an echo!)
  const samplePicks = products.slice(0, 3);
  return (
    `I understand you're asking about **"${query}"**.\n\n` +
    `ShopSphere currently specializes in curated premium collections in **Audio & Electronics**, **Wearables**, **Designer Solid Wood Furniture**, and **Smart Home Innovations**.\n\n` +
    `Here are three of our highest-rated customer favorites right now:\n` +
    samplePicks.map(p => `• **${p.name}** (₹${p.price.toLocaleString('en-IN')}) — ${p.description}`).join('\n') +
    `\n\n💡 *Tip: Ask me to \"Show top deals\", \"Give coupon codes\", or \"Compare headphones and speaker\"!*`
  );
}

// Master Copilot Handler: Tries Gemini with context, seamlessly falls back to smart engine
export async function getCopilotResponse(userPrompt) {
  const products = await getAllProducts();
  const coupons = await getAllCoupons();

  const apiKey = process.env.GEMINI_API_KEY;
  const isRealApiKey = apiKey && apiKey !== 'mock_gemini_api_key_replace_me' && !apiKey.includes('replace_me') && apiKey.length > 20;

  if (isRealApiKey) {
    try {
      const ai = new GoogleGenAI({});
      const systemContext = {
        store: "ShopSphere - Next-Gen E-Commerce Platform",
        availableProducts: products.map(p => ({
          name: p.name,
          price: p.price,
          originalPrice: p.originalPrice,
          category: p.category,
          rating: p.rating,
          trustScore: p.trustScore,
          description: p.description,
          keySellingPoints: p.keySellingPoints
        })),
        activeCoupons: coupons,
        policies: {
          shipping: "Standard 2-4 business days across India. Free shipping on orders over ₹1,000.",
          returns: "7-day hassle-free return and full refund policy via Post-Purchase Center.",
          trustScore: "Objective trust score based on verified reviews, fulfillment, and return rates."
        }
      };

      const prompt = `
        You are the friendly, knowledgeable ShopSphere AI Copilot assistant.
        Always give direct, actionable, accurate answers using the store context provided.
        Format your response cleanly with markdown, bullet points, and bold text.
        Never invent products that do not exist in the context.

        Store Context: ${JSON.stringify(systemContext)}

        Customer Question: "${userPrompt}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (geminiError) {
      console.warn("Gemini API call failed, using intelligent local engine:", geminiError.message);
    }
  }

  // Use robust grounded intelligence engine
  return generateSmartAnswer(userPrompt, products, coupons);
}
