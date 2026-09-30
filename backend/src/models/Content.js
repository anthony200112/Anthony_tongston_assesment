import mongoose from 'mongoose';

const { Schema } = mongoose;

const contentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    body: { type: String, required: true, minlength: 10 },
    tags: [{ type: String, trim: true, lowercase: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

contentSchema.index({ title: 'text', body: 'text' });
contentSchema.index({ tags: 1 });
contentSchema.index({ createdAt: -1 });

export default mongoose.model('Content', contentSchema);
