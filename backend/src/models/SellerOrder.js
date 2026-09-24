import mongoose from 'mongoose';

const sellerOrderSchema = new mongoose.Schema({
  masterOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterOrder', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String },
      price: { type: Number, required: true }, // INR
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    }
  ],
  status: { 
    type: String, 
    enum: ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED'], 
    default: 'PLACED' 
  },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String }
    }
  ],
  subTotal: { type: Number, required: true, default: 0.0 }, // INR for this seller
}, { timestamps: true });

export default mongoose.model('SellerOrder', sellerOrderSchema);

