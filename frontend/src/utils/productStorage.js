// frontend/src/utils/productStorage.js

const STORAGE_KEY = 'shopsphere_seller_custom_products';

// Default initial custom seller products so the seller immediately has active products
const INITIAL_SELLER_PRODUCTS = [
  {
    _id: 'seller_prod_101',
    code: 'SP-SELLER-101',
    name: 'Quantum Sound Studio Wireless Headphones',
    category: 'Electronics',
    price: 14999,
    originalPrice: 18999,
    stock: 18,
    inventory: 18,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    description: 'Ultra-low latency studio monitor headphones with active noise cancellation, custom titanium drivers, and 40-hour battery life.',
    trustScore: 99.4,
    trustFactors: {
      verifiedReviewsCount: 64,
      fulfillmentRate: 99.2,
      returnRate: 0.8,
      listingCompleteness: 100
    },
    sustainability: {
      ecoPackaging: true,
      carbonNeutral: true,
      materials: 'Recycled Aluminum & Vegan Leather'
    },
    sellerName: 'Apex Merchant Store',
    isCustomSellerProduct: true,
    soldCount: 42,
    dateAdded: '2026-10-01'
  },
  {
    _id: 'seller_prod_102',
    code: 'SP-SELLER-102',
    name: 'Nordic Emerald Velvet Ergonomic Armchair',
    category: 'Furniture',
    price: 24500,
    originalPrice: 28900,
    stock: 7,
    inventory: 7,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    description: 'Handcrafted Scandinavian accent lounge armchair with solid oak frame, high-density ergonomic foam, and stain-resistant velvet.',
    trustScore: 99.1,
    trustFactors: {
      verifiedReviewsCount: 38,
      fulfillmentRate: 98.7,
      returnRate: 1.2,
      listingCompleteness: 100
    },
    sustainability: {
      ecoPackaging: true,
      carbonNeutral: false,
      materials: 'FSC Certified Solid Oak & Velvet'
    },
    sellerName: 'Apex Merchant Store',
    isCustomSellerProduct: true,
    soldCount: 19,
    dateAdded: '2026-10-03'
  },
  {
    _id: 'seller_prod_103',
    code: 'SP-SELLER-103',
    name: 'Retro Mechanical Hot-Swappable Keyboard',
    category: 'Electronics',
    price: 8999,
    originalPrice: 10499,
    stock: 15,
    inventory: 15,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    description: 'Custom CNC aluminum mechanical keyboard with pre-lubed Gateron switches, RGB per-key backlighting, and hot-swap PCB.',
    trustScore: 98.9,
    trustFactors: {
      verifiedReviewsCount: 52,
      fulfillmentRate: 99.0,
      returnRate: 0.5,
      listingCompleteness: 98
    },
    sustainability: {
      ecoPackaging: true,
      carbonNeutral: true,
      materials: 'Anodized 6063 Aluminum'
    },
    sellerName: 'Apex Merchant Store',
    isCustomSellerProduct: true,
    soldCount: 31,
    dateAdded: '2026-10-05'
  }
];

export function getSavedCustomSellerProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial custom products into localStorage so they are available immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SELLER_PRODUCTS));
      return INITIAL_SELLER_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SELLER_PRODUCTS;
  } catch (e) {
    console.warn('Failed reading custom products from localStorage:', e);
    return INITIAL_SELLER_PRODUCTS;
  }
}

export function saveCustomSellerProduct(product) {
  try {
    const current = getSavedCustomSellerProducts();
    const updated = [product, ...current.filter(p => p._id !== product._id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed saving custom product to localStorage:', e);
    return [];
  }
}

export function updateCustomSellerProduct(productId, updates) {
  try {
    const current = getSavedCustomSellerProducts();
    const updated = current.map(p => {
      if (p._id === productId) {
        return {
          ...p,
          ...updates,
          stock: updates.stock !== undefined ? Number(updates.stock) : p.stock,
          inventory: updates.stock !== undefined ? Number(updates.stock) : (updates.inventory !== undefined ? Number(updates.inventory) : p.inventory),
          price: updates.price !== undefined ? Number(updates.price) : p.price
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed updating custom product in localStorage:', e);
    return [];
  }
}

export function deleteCustomSellerProduct(productId) {
  try {
    const current = getSavedCustomSellerProducts();
    const updated = current.filter(p => p._id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed deleting custom product from localStorage:', e);
    return [];
  }
}

export function restockCustomSellerProduct(productId, delta = 5) {
  try {
    const current = getSavedCustomSellerProducts();
    const updated = current.map(p => {
      if (p._id === productId) {
        const newStock = Math.max(0, (p.stock || p.inventory || 0) + delta);
        return {
          ...p,
          stock: newStock,
          inventory: newStock
        };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed restocking custom product in localStorage:', e);
    return [];
  }
}
