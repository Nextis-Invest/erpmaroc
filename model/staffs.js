const mongoose = require("mongoose");

let STAFF;

if (mongoose.models.STAFF) {
  STAFF = mongoose.model("STAFF");
} else {
  const staffSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
  });

  STAFF = mongoose.model("STAFF", staffSchema);
}

module.exports = STAFF;
