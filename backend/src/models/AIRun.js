import mongoose from 'mongoose';

const { Schema } = mongoose;

const aiRunSchema = new Schema(
  {
    contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    promptVersion: { type: String, default: 'mock-summarizer-v1' },
    tone: { type: String, enum: ['neutral', 'professional', 'casual', 'academic'], default: 'neutral' },
    length: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
    status: { type: String, enum: ['success', 'failed', 'timeout'], default: 'success' },
    output: { type: String, default: '' },
    latencyMs: { type: Number, default: 0 },
    tokensAwarded: { type: Number, default: 0 },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true },
);

aiRunSchema.index({ userId: 1, createdAt: -1 });
aiRunSchema.index({ contentId: 1 });

export default mongoose.model('AIRun', aiRunSchema);
