const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  notes: String,
  category: {
    type: [String],
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'Quantity must be a non-negative number'
    }
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: BRANCH,
    required: true,
  },
  Timestamp: true,
});

const PRODUCT = mongoose.model("PRODUCT", ProductSchema);

module.exports = PRODUCT;
