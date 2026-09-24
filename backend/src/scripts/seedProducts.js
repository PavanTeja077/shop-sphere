// backend/src/scripts/seedProducts.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const CATEGORY_METADATA = {
  jeans: {
    categoryName: 'Jeans',
    displayCategory: 'Jeans',
    priceRange: [1499, 4999],
    styles: [
      'Slim Fit Raw Selvedge Denim',
      'Vintage Washed Indigo Jeans',
      'Distressed Relaxed Straight Jeans',
      'Classic High-Rise Tapered Jeans',
      'Stretch Comfort Everyday Denim',
      'Retro Acid Washed Bootcut Jeans',
      'Japanese Kurabo Indigo Denim',
      'Dark Obsidian Carbon Finish Jeans',
      'Artisan Hand-Stitched Selvedge Jeans',
      'Loose Skater Fit Carpenter Denim'
    ],
    materials: ['100% Organic BCI Cotton', '98% Cotton 2% Elastane', 'Raw Japanese Selvedge', 'Recycled Indigo Denim'],
    sellers: ['Denim Lab Co.', 'Indigo Artisans', 'Heritage Weave Co.', 'Apex Merchant Store']
  },
  sofa: {
    categoryName: 'Sofa',
    displayCategory: 'Sofa',
    priceRange: [18999, 74999],
    styles: [
      'Mid-Century Modern Velvet 3-Seater Sofa',
      'Scandinavian Minimalist Daybed Lounger',
      'Chesterfield Deep-Tufted Genuine Leather Couch',
      'Modular L-Shaped Sectional Cloud Sofa',
      'Japanese Low-Profile Oak Tatami Sofa',
      'Curved Boucle Architectural Lounge Sofa',
      'Natural Linen 2-Seater Studio Loveseat',
      'Ergonomic Multi-Position Recliner Sectional',
      'Italian Aniline Leather Luxury Sofa',
      'Contemporary Reversible Corner Chaise Sofa'
    ],
    materials: ['Solid Kiln-Dried Teak & Velvet', 'Top-Grain Italian Leather', 'Oeko-Tex Certified Linen & Birch', 'Boucle & FSC Pine'],
    sellers: ['Nordic Craft Co', 'Zenith Living Concepts', 'TimberCraft Studio', 'Apex Merchant Store']
  },
  tshirt: {
    categoryName: 'T-Shirt',
    displayCategory: 'T-Shirt',
    priceRange: [699, 2499],
    styles: [
      'Heavyweight 280GSM Boxy Drop-Shoulder Tee',
      'Vintage Pigment Washed Heritage T-Shirt',
      'Supima Cotton Ultra-Soft Crewneck Tee',
      'Minimalist Typography Embroidered T-Shirt',
      'Breathable Organic Bamboo Essential Tee',
      'Japanese Kasuri Woven Relaxed Fit Tee',
      'Ribbed Collar Streetwear Oversized Tee',
      'Thermal Textured Henley Long-Staple Tee',
      'Artisan Hand-Dyed Natural Indigo T-Shirt',
      'Eco-Recycled Graphic Statement Tee'
    ],
    materials: ['100% Supima Organic Cotton', 'Organic Bamboo Fiber', 'Heavyweight Carded Cotton', 'GOTS Certified Bio Cotton'],
    sellers: ['Apex Apparel Studio', 'Urban Threadworks', 'EcoWeave Collective', 'Apex Merchant Store']
  },
  tv: {
    categoryName: 'TV',
    displayCategory: 'TV',
    priceRange: [16999, 129999],
    styles: [
      '55" Ultra HD 4K HDR Smart OLED Cinema TV',
      '65" Quantum Dot QLED 144Hz Gaming TV',
      '43" Frameless Bezel-Less Crystal 4K LED TV',
      '75" Spatial Acoustic Studio Cinema Display',
      '50" Dolby Vision Dolby Atmos Smart Android TV',
      '32" Compact HD Smart Room TV with Voice Control',
      '85" Mini-LED Ultra-Bright Next-Gen Master Display',
      '55" Curved Spatial Surround Cinematic Display',
      '65" Anti-Glare Gallery Design OLED Smart TV',
      '70" Ultra Slim Smart AI Cinema Display'
    ],
    materials: ['Aircraft Grade Aluminum & OLED Panel', 'Zero-Bezel Magnesium Alloy', 'Recyclable Polymer & QLED Matrix'],
    sellers: ['VisionTech Global', 'Apex Acoustics & Visual', 'OmniDisplay Electronics', 'Apex Merchant Store']
  }
};

export const generateProductsFromArchive = () => {
  const uploadsDir = path.join(__dirname, '../../uploads/ecommerce products');
  const allProducts = [];

  const categoryFolders = ['jeans', 'sofa', 'tshirt', 'tv'];

  for (const catKey of categoryFolders) {
    const catDir = path.join(uploadsDir, catKey);
    const meta = CATEGORY_METADATA[catKey];
    if (!fs.existsSync(catDir)) {
      console.warn(`[Seed] Directory not found: ${catDir}`);
      continue;
    }

    const files = fs.readdirSync(catDir)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

    files.forEach((file, index) => {
      const itemNum = parseInt(file.replace(/\D/g, '')) || (index + 1);
      const styleTemplate = meta.styles[(itemNum - 1) % meta.styles.length];
      const name = `${styleTemplate} #${itemNum}`;
      
      const priceMin = meta.priceRange[0];
      const priceMax = meta.priceRange[1];
      // Deterministic spread of prices
      const priceStep = Math.round((priceMax - priceMin) / 30);
      const price = priceMin + ((itemNum * 7) % 30) * priceStep;

      const sellerName = meta.sellers[itemNum % meta.sellers.length];
      const material = meta.materials[itemNum % meta.materials.length];

      const trustScore = +(96.0 + ((itemNum * 13) % 38) * 0.1).toFixed(1);
      const rating = +(4.3 + ((itemNum * 7) % 7) * 0.1).toFixed(1);
      const reviewsCount = 20 + ((itemNum * 11) % 150);

      const description = `Premium ${meta.displayCategory.toLowerCase()} handcrafted with ${material}. Engineered for maximum durability, comfort, and verified independent artisan quality. Item model code: SP-${catKey.toUpperCase()}-${itemNum}.`;

      allProducts.push({
        _id: `prod_${catKey}_${itemNum}`,
        code: `SP-${catKey.toUpperCase()}-${itemNum}`,
        name,
        category: meta.displayCategory,
        price,
        rating,
        inventory: 10 + (itemNum % 40),
        imageUrl: `/uploads/ecommerce products/${catKey}/${file}`,
        description,
        trustScore,
        trustFactors: {
          verifiedReviewsCount: reviewsCount,
          fulfillmentRate: +(98.0 + ((itemNum * 3) % 20) * 0.1).toFixed(1),
          returnRate: +(0.5 + ((itemNum * 5) % 18) * 0.1).toFixed(1),
          listingCompleteness: 98
        },
        priceHistory: [
          { price: price + Math.round(price * 0.15), date: '2026-05-10' },
          { price: price + Math.round(price * 0.08), date: '2026-07-01' },
          { price, date: '2026-08-20' }
        ],
        sustainability: {
          ecoPackaging: true,
          carbonNeutral: itemNum % 2 === 0,
          materials: material
        },
        sellerName,
        status: 'approved'
      });
    });
  }

  return allProducts;
};

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsphere';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('[Seed] Connected to MongoDB');
    }

    // Ensure a default seller exists
    let seller = await User.findOne({ email: 'seller@shopsphere.com' });
    if (!seller) {
      seller = await User.create({
        name: 'Apex Merchant Store',
        email: 'seller@shopsphere.com',
        password: 'Seller@123',
        role: 'Seller'
      });
    }

    const productsData = generateProductsFromArchive();
    console.log(`[Seed] Generated ${productsData.length} products from archive dataset.`);

    if (productsData.length === 0) {
      console.warn('[Seed] No products found to seed.');
      return;
    }

    // Upsert into MongoDB
    let inserted = 0;
    let updated = 0;
    for (const p of productsData) {
      const doc = {
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        inventory: p.inventory,
        imageUrl: p.imageUrl,
        trustScore: p.trustScore,
        trustFactors: p.trustFactors,
        priceHistory: p.priceHistory,
        sustainability: p.sustainability,
        status: 'approved',
        seller: seller._id
      };

      const res = await Product.findOneAndUpdate(
        { name: p.name },
        doc,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (res) inserted++;
    }

    console.log(`[Seed] Successfully synchronized ${inserted} products in MongoDB.`);

    // Also persist static JSON copies for fallback and frontend instant local search
    const dataDirBackend = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDirBackend)) fs.mkdirSync(dataDirBackend, { recursive: true });
    fs.writeFileSync(path.join(dataDirBackend, 'products.json'), JSON.stringify(productsData, null, 2));

    const dataDirFrontend = path.join(__dirname, '../../../frontend/src/data');
    if (!fs.existsSync(dataDirFrontend)) fs.mkdirSync(dataDirFrontend, { recursive: true });
    fs.writeFileSync(path.join(dataDirFrontend, 'products.json'), JSON.stringify(productsData, null, 2));

    console.log('[Seed] Successfully generated products.json for backend and frontend.');
    return productsData;
  } catch (err) {
    console.error('[Seed] Error seeding products:', err);
    throw err;
  }
};

// If run directly from command line
if (process.argv[1] && process.argv[1].endsWith('seedProducts.js')) {
  seedDatabase().then(() => {
    console.log('[Seed] Done!');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
