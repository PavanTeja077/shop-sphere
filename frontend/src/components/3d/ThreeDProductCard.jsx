// frontend/src/components/3d/ThreeDProductCard.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Scale, ShoppingBag, Star, Sparkles } from 'lucide-react';

export default function ThreeDProductCard({
  product,
  isCompared,
  onToggleCompare,
  onOpenTrustModal,
  onAddToCart,
  onViewReviews,
  onAddReview,
  globalTiltX = 0,
  globalTiltY = 0
}) {
  const cardRef = useRef(null);
  const [localTilt, setLocalTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize from center [-1, 1]
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    // Max tilt angles: 16 degrees
    const rotateY = normX * 14;
    const rotateX = -normY * 14;

    setLocalTilt({
      x: rotateX,
      y: rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100
    });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setLocalTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  // Combine local hover tilt with ambient global motion sensor tilt
  const finalRotateX = isHovered ? localTilt.x : globalTiltY * 6;
  const finalRotateY = isHovered ? localTilt.y : globalTiltX * 7;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative h-full perspective-1000 select-none cursor-pointer"
    >
      <div
        className="relative w-full h-full rounded-3xl p-3.5 preserve-3d transition-transform duration-200 ease-out glass-panel-3d border border-white/10 hover:border-brand-500/40"
        style={{
          transform: `rotateX(${finalRotateX.toFixed(2)}deg) rotateY(${finalRotateY.toFixed(2)}deg) ${
            isHovered ? 'scale3d(1.025, 1.025, 1.025) translateZ(15px)' : 'scale3d(1, 1, 1)'
          }`,
          boxShadow: isHovered
            ? '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(20, 184, 166, 0.2)'
            : '0 20px 40px -20px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Holographic Reflection Glare (Moves dynamically in 3D) */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300 z-30"
          style={{
            opacity: isHovered ? 0.9 : 0.2,
            background: `radial-gradient(circle at ${localTilt.glareX}% ${localTilt.glareY}%, rgba(255, 255, 255, 0.2) 0%, rgba(45, 212, 191, 0.08) 35%, transparent 70%)`
          }}
        />

        {/* 3D Image & Media Frame */}
        <div 
          className="relative w-full h-56 rounded-2xl overflow-hidden mb-3.5 preserve-3d bg-dark-950/60 border border-white/5"
          style={{ transform: 'translateZ(25px)' }}
        >
          {/* Trust Score Badge (Floating Z-axis) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTrustModal(product);
            }}
            className="absolute top-3 left-3 z-30 glass-panel px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-brand-500/20 transition-all text-white border border-white/15 shadow-lg shadow-black/50"
            style={{ transform: 'translateZ(40px)' }}
            title="View Trust Breakdown & 90-day Price Trend"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>{product.trustScore || 98}% Trust</span>
          </button>

          {/* Compare Toggle Button (Floating Z-axis) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`absolute top-3 right-3 z-30 p-2.5 rounded-xl text-xs font-bold transition-all border shadow-lg ${
              isCompared
                ? 'bg-brand-500 text-white border-brand-300 shadow-brand-500/40 scale-105'
                : 'glass-panel text-gray-300 hover:text-white hover:bg-white/20 border-white/15'
            }`}
            style={{ transform: 'translateZ(40px)' }}
            title={isCompared ? 'Remove from compare' : 'Compare product'}
          >
            <Scale className="w-4 h-4" />
          </button>

          {/* Ambient Image Gradient Veil */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-60 z-10" />

          {/* Main Product Image (Protrudes forward in 3D) */}
          <img
            src={
              product.imageUrl?.startsWith('/uploads/')
                ? `http://localhost:5000${product.imageUrl}`
                : (product.imageUrl || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80')
            }
            alt={product.name}
            onError={(e) => {
              const raw = product.imageUrl || product.image || '';
              if (raw.includes('/ecommerce products/')) {
                e.target.src = raw.replace('/uploads', '');
              }
            }}
            loading="lazy"
            className="w-full h-full object-cover rounded-2xl group-hover:scale-108 transition-transform duration-700 ease-out"
            style={{ transform: 'translateZ(10px)' }}
          />

          {/* Quick Hover Actions (Pops forward on hover) */}
          <div 
            className="absolute bottom-3 left-3 right-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20 space-y-2"
            style={{ transform: 'translateZ(35px)' }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-brand-500 to-teal-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all shadow-[0_4px_20px_rgba(20,184,166,0.4)] text-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewReviews(product);
                }}
                className="py-1.5 bg-dark-900/90 backdrop-blur text-gray-200 text-xs font-medium rounded-lg hover:bg-dark-800 transition-colors border border-white/10"
              >
                Reviews
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddReview(product);
                }}
                className="py-1.5 bg-white/10 backdrop-blur hover:bg-white/20 text-teal-300 text-xs font-bold rounded-lg transition-colors border border-white/10"
              >
                + Review
              </button>
            </div>
          </div>
        </div>

        {/* 3D Details Section */}
        <div 
          className="px-1.5 pb-1 space-y-1.5 preserve-3d"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-brand-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {product.category}
            </span>
            {product.sustainability?.ecoPackaging && (
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Eco-Certified
              </span>
            )}
          </div>

          <h3 className="text-base font-bold truncate text-white group-hover:text-brand-300 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-2 text-xs text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 truncate max-w-[120px] text-right">
              {product.seller?.name || product.sellerName || 'Verified Artisan'}
            </span>
          </div>

          {/* Always Visible 1-Click Add to Cart Action */}
          <div className="pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-500 to-teal-500 hover:brightness-110 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all cursor-pointer border border-teal-400/30"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
