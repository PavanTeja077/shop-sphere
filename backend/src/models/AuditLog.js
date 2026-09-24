import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  actorRole: { type: String, required: true },
  actorId: { type: String, default: 'system' },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);

