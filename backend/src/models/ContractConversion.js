import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Records a token → mock-asset conversion with a fake on-chain hash.
 */
const contractConversionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fromToken: { type: String, default: 'TWD' },
    toAsset: { type: String, enum: ['MOCK_USDT', 'MOCK_ETH'], required: true },
    amount: { type: Number, required: true, min: 1 },
    exchangeRate: { type: Number, required: true },
    amountOut: { type: Number, required: true },
    txHashMock: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: true },
);

contractConversionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ContractConversion', contractConversionSchema);
