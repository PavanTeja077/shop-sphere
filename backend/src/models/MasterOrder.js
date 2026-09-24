import mongoose from 'mongoose';

const masterOrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  totalPrice: { type: Number, required: true, default: 0.0 }, // INR
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('MasterOrder', masterOrderSchema);
