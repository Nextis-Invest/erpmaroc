const mongoose = require("mongoose");
const ADMIN = require("./admin"); // Assuming adminSchema.js is in the same directory
const STAFF = require("./staffs"); // Assuming staffSchema.js is in the same directory

let BRANCH;

if (mongoose.models.BRANCH) {
  BRANCH = mongoose.model("BRANCH");
} else {
  const BranchSchema = new mongoose.Schema({
    cityName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    countryName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    stateName: {
      type: String,
      required: true,
    },
    streetName: {
      type: String,
      required: true,
    },
    websiteUrl: {
      type: String,
      required: true,
    },
    manager: {
      type: String,
      required: true,
    },
    // manager: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: ADMIN, // Reference to the Admin model
    // },
    staff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: STAFF, // Reference to the Staff model
      },
    ],
    data: {
      type: String, // Assuming you want to store the Excel file path or data
      required: false,
    },
    keys: {
      type: [String], // Assuming keys are stored as an array of strings
      required: false,
    },
    parentBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BRANCH", // Reference to the BRANCH model for the parent branch
      required: false,
    },
    childBranch: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BRANCH", // Reference to the BRANCH model for child branch
      },
    ],
  });

  BRANCH = mongoose.model("BRANCH", BranchSchema);
}

module.exports = BRANCH;
