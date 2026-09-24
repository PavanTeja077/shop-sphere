import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, default: 'Product' },
  customerName: { type: String, default: 'Customer' },
  reason: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED'], default: 'PENDING' },
  refundAmount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('ReturnRequest', returnRequestSchema);

