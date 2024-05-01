const mongoose = require('mongoose');
const BRANCH = require("./branchData"); // Import the Branch schema

let ActivityLog;

if (mongoose.models && mongoose.models.ActivityLog) {
  ActivityLog = mongoose.models.ActivityLog;
} else {
  const activityLogSchema = new mongoose.Schema({
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BRANCH', // Reference to the Branch model
      required: true
    },
    process: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  });

  ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
}

module.exports = ActivityLog;
