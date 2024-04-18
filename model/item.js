const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  category: {
    type: [String],
  },
  price: {
    type: Number,
    required: true,
  },
  Timestamp: true,
});

const ITEM = mongoose.model("ITEM", ItemSchema);

module.exports = ITEM;
