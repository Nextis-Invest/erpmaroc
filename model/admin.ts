import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for Admin document
export interface IAdmin extends Document {
  name: string;
  tenant: string;
  connection: string;
  email: string;
  password: string;
  role: string;
  debug: boolean;
  is_signup: boolean;
  usePasskey: boolean;
}

const adminSchema = new Schema<IAdmin>({
  name: {
    type: String,
    required: true,
  },
  tenant: {
    type: String,
    required: true
  },
  connection: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  debug: {
    type: Boolean,
    default: false
  },
  is_signup: {
    type: Boolean,
    default: false
  },
  usePasskey: {
    type: Boolean,
    default: false
  }
});

const ADMIN = mongoose.models.ADMIN || mongoose.model<IAdmin>('ADMIN', adminSchema);

export default ADMIN;