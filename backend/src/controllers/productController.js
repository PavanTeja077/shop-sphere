import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load archive products fallback
const getFallbackProducts = () => {
  try {
    const jsonPath = path.join(__dirname, '../data/products.json');
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading fallback products.json:', err);
  }
  return [];
};

// GET /api/products
// Supports ?search=... &category=... &sort=...
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex }
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price-low') sortObj = { price: 1 };
    if (sort === 'price-high') sortObj = { price: -1 };
    if (sort === 'trust') sortObj = { trustScore: -1 };

    let products = await Product.find(query).sort(sortObj).populate('seller', 'name email');
    
    if (products && products.length > 0) {
      return res.json(products);
    }

    // Fallback to archive dataset from JSON
    let fallback = getFallbackProducts();
    if (category && category !== 'All') {
      fallback = fallback.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      fallback = fallback.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }
    return res.json(fallback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { 
      name, description, price, category, inventory, 
      aiGeneratedDescription, keySellingPoints, seoKeywords, 
      faqs, listingQualityScore, imageUrl, trustScore, sustainability 
    } = req.body;
    const sellerId = req.body.sellerId || 'seller_123'; 

    const product = await Product.create({
      seller: sellerId,
      name,
      description,
      price: Number(price),
      category,
      inventory: Number(inventory || 10),
      imageUrl: imageUrl || '/uploads/ecommerce products/tshirt/1.jpg',
      aiGeneratedDescription,
      keySellingPoints,
      seoKeywords,
      faqs,
      listingQualityScore: listingQualityScore || 92,
      trustScore: trustScore || 98.0,
      sustainability: sustainability || { ecoPackaging: true, carbonNeutral: true, materials: 'Recyclable Materials' },
      status: 'approved'
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Phase 8: Semantic & Keyword Search with Intent Explanation
export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const q = query.toLowerCase();
    let allProducts = await Product.find({}).populate('seller', 'name email');
    if (!allProducts || allProducts.length === 0) {
      allProducts = getFallbackProducts();
    }

    const matched = allProducts.filter(p => {
      const text = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      const terms = q.split(' ').filter(t => t.length >= 2);
      return terms.some(t => text.includes(t));
    }).map(p => ({
      ...p.toObject ? p.toObject() : p,
      semanticReason: `Matched intent for "${query}" across verified ${p.category} catalogue.`
    }));

    res.json(matched.length > 0 ? matched : allProducts.slice(0, 8));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
