const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user performing the activity
    required: true
  },
  process: {
    type: String,
    required: true
  },
  state: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  details: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;

// TODO: add activity functionalities