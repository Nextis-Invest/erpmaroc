import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
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

const ADMIN = mongoose.models.ADMIN || mongoose.model('ADMIN', adminSchema);

export default ADMIN;