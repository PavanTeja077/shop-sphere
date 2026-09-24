import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true }, // Changed to number, represents INR
  category: { type: String, required: true },
  inventory: { type: Number, required: true, default: 0 },
  imageUrl: { type: String, required: true },
  
  // SRS Standout Features (Trust Score, Price Timeline, Sustainability)
  trustScore: { type: Number, default: 98.5 },
  trustFactors: {
    verifiedReviewsCount: { type: Number, default: 48 },
    fulfillmentRate: { type: Number, default: 99.2 },
    returnRate: { type: Number, default: 1.4 },
    listingCompleteness: { type: Number, default: 95 }
  },
  priceHistory: [
    {
      price: { type: Number },
      date: { type: Date, default: Date.now }
    }
  ],
  sustainability: {
    ecoPackaging: { type: Boolean, default: true },
    carbonNeutral: { type: Boolean, default: true },
    materials: { type: String, default: 'Recyclable & Responsibly Sourced' }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
    default: 'approved'
  },

  // AI-generated fields (Phase 8)
  aiGeneratedDescription: { type: String },
  keySellingPoints: [{ type: String }],
  seoKeywords: [{ type: String }],
  faqs: [{ question: String, answer: String }],
  listingQualityScore: { type: Number, default: 90 }, // 1-100

  // Semantic Search Vector Embeddings (Phase 8)
  embedding: { type: [Number] }, // Store vector arrays
}, { timestamps: true });

// Create a compound text index for regular search, wait for Atlas Vector Search for semantic
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);

