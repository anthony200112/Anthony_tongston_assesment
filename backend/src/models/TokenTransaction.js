import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Immutable ledger of every token movement.
 * One row per credit/debit — never updated, only appended.
 */
const tokenTransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['EARN', 'CONVERT', 'WITHDRAW'], required: true },
    source: { type: String, enum: ['AI_USAGE', 'MANUAL'], default: 'AI_USAGE' },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true, min: 0 },
    referenceId: { type: Schema.Types.ObjectId, refPath: 'referenceModel' },
    referenceModel: { type: String, enum: ['AIRun', 'ContractConversion'] },
  },
  { timestamps: true },
);

tokenTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('TokenTransaction', tokenTransactionSchema);
