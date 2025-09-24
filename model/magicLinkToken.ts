import mongoose, { Document, Schema } from "mongoose";

// Define the interface for MagicLinkToken document
export interface IMagicLinkToken extends Document {
  email: string;
  token: string;
  createdAt: Date;
  used: boolean;
}

const magicLinkTokenSchema = new Schema<IMagicLinkToken>({
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

const MagicLinkToken = mongoose.models.MagicLinkToken || mongoose.model<IMagicLinkToken>("MagicLinkToken", magicLinkTokenSchema);

export default MagicLinkToken;