const mongoose = require('mongoose');
const BRANCH = require('./branchData'); // Import the Branch schema
const ITEM = require('./item')

const RecordSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: ITEM,
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
