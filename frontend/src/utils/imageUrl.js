import { API_BASE_URL } from '../config/api';

// Image URL resolver with static fallback support
export function getProductImageUrl(productOrUrl) {
  if (!productOrUrl) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  const raw = typeof productOrUrl === 'string' ? productOrUrl : (productOrUrl.imageUrl || productOrUrl.image || '');
  if (!raw) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('/uploads/')) return `${API_BASE_URL}${raw}`;
  return raw;
}

export function handleImageErrorFallback(e, productOrUrl) {
  const raw = typeof productOrUrl === 'string' ? productOrUrl : (productOrUrl?.imageUrl || productOrUrl?.image || '');
  if (raw && raw.includes('/ecommerce products/')) {
    e.target.src = raw.replace(API_BASE_URL, '').replace('http://localhost:5000', '').replace('/uploads', '');
  }
}
