const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  nickName: {
    type: String,
  },
  profileImg: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  email_verified: {
    type: Boolean,
  },
});


const ADMIN = mongoose.model('ADMIN', adminSchema);

module.exports = ADMIN;