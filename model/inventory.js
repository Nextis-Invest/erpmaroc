const mongoose = require('mongoose');
const ITEM = require('./item')
const RECORD = require('./Record')
const BRANCH = require('./branchData')

const InventorySchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ITEM',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BRANCH',
    required: true
  },
  record: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RECORD',
    required: true
  }
});

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
