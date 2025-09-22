import mongoose from "mongoose";

const magicLinkTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  used: {
    type: Boolean,
    default: false,
  },
});

// Ensure index for automatic document deletion
magicLinkTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

const MagicLinkToken = mongoose.models.MagicLinkToken || mongoose.model("MagicLinkToken", magicLinkTokenSchema);

export default MagicLinkToken;