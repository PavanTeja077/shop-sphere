import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  user: { type: String, default: 'guest' },
  userName: { type: String, default: 'Customer' },
  userEmail: { type: String, default: 'customer@shopsphere.com' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  orderId: { type: String, default: '' },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  messages: [{
    sender: { type: String, default: 'customer' },
    text: { type: String, required: true },
    time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('SupportTicket', supportTicketSchema);

