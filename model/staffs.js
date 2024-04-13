const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    id: {
    type: String,
    required: true,
    unique: true // Assuming IDs should be unique
  },
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  }
});

const STAFF = mongoose.model('STAFF', staffSchema);

module.exports = STAFF;
