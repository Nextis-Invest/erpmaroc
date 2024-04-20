const mongoose = require('mongoose');
const BRANCH = require('./branchData'); // Import the Branch schema
const PRODUCT = require('./product')

const RecordSchema = new mongoose.Schema({
  PRODUCT: {
    type: mongoose.Schema.Types.ObjectId,
    ref: PRODUCT,
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: BRANCH, // Reference to the Branch model
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const RECORD = mongoose.model('RECORD', RecordSchema);

module.exports = RECORD;
