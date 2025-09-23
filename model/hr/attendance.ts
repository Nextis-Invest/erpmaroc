const mongoose = require("mongoose");

let Attendance;

if (mongoose.models.Attendance) {
  Attendance = mongoose.model("Attendance");
} else {
  const attendanceSchema = new mongoose.Schema({
    // Employee Reference
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

    // Project and Team Context
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'BRANCH', required: true },

    // Date and Shift Information
    date: { type: Date, required: true },
    shiftPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ShiftPattern' },

    // Schedule Information
    scheduledStartTime: String, // HH:MM format
    scheduledEndTime: String,   // HH:MM format
    scheduledHours: { type: Number, default: 8 },

    // Actual Time Records
    checkIn: {
      time: Date,
      location: {
        type: { type: String, enum: ['office', 'remote', 'client-site'], default: 'office' },
        address: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      method: { type: String, enum: ['manual', 'biometric', 'card', 'mobile', 'web'], default: 'manual' },
      deviceId: String,
      ipAddress: String
    },

    checkOut: {
      time: Date,
      location: {
        type: { type: String, enum: ['office', 'remote', 'client-site'], default: 'office' },
        address: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      method: { type: String, enum: ['manual', 'biometric', 'card', 'mobile', 'web'], default: 'manual' },
      deviceId: String,
      ipAddress: String
    },

    // Break Records
    breaks: [{
      startTime: Date,
      endTime: Date,
      duration: Number, // minutes
      type: { type: String, enum: ['lunch', 'tea', 'prayer', 'other'], default: 'other' },
      notes: String
    }],

    // Calculated Hours
    actualHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    underTimeHours: { type: Number, default: 0 },
    breakHours: { type: Number, default: 0 },

    // Attendance Status
    status: {
      type: String,
      enum: [
        'present',     // Normal attendance
        'absent',      // No attendance
        'late',        // Late arrival
        'early-out',   // Early departure
        'half-day',    // Half day work
        'holiday',     // Public holiday
        'leave',       // On approved leave
        'sick-leave',  // Sick leave
        'work-from-home', // Remote work
        'business-trip',  // Business travel
        'training',    // Training/Conference
        'suspended',   // Disciplinary suspension
        'no-show'      // Scheduled but didn't show up
      ],
      required: true,
      default: 'absent'
    },

    // Leave Information (if applicable)
    leaveRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest' },
    leaveType: { type: String },

    // Work Details
    workType: {
      type: String,
      enum: ['regular', 'overtime', 'holiday', 'night-shift', 'weekend'],
      default: 'regular'
    },

    workLocation: {
      type: String,
      enum: ['office', 'remote', 'client-site', 'field-work'],
      default: 'office'
    },

    // Performance and Productivity
    productivity: {
      tasksCompleted: Number,
      tasksAssigned: Number,
      hoursProductive: Number,
      qualityScore: Number // 1-10 scale
    },

    // Approval and Management
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    approvedAt: Date,

    needsApproval: { type: Boolean, default: false },
    approvalReason: String,

    // Additional Information
    notes: String,
    managerNotes: String,

    // Flags
    isHoliday: { type: Boolean, default: false },
    isWeekend: { type: Boolean, default: false },
    isOvertime: { type: Boolean, default: false },
    isLate: { type: Boolean, default: false },
    isEarlyOut: { type: Boolean, default: false },

    // System Fields
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN' },

    // Data Quality
    dataSource: { type: String, enum: ['system', 'manual', 'import', 'api'], default: 'system' },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    verifiedAt: Date
  });

  // Indexes for performance
  attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
  attendanceSchema.index({ date: 1 });
  attendanceSchema.index({ branch: 1, date: 1 });
  attendanceSchema.index({ project: 1, date: 1 });
  attendanceSchema.index({ team: 1, date: 1 });
  attendanceSchema.index({ status: 1 });
  attendanceSchema.index({ 'checkIn.time': 1 });
  attendanceSchema.index({ 'checkOut.time': 1 });

  // Compound indexes for reporting
  attendanceSchema.index({ branch: 1, project: 1, date: 1 });
  attendanceSchema.index({ employee: 1, status: 1, date: 1 });
  attendanceSchema.index({ project: 1, team: 1, date: 1 });

  // Pre-save middleware to calculate hours and flags
  attendanceSchema.pre('save', function(next) {
    this.updatedAt = new Date();

    // Calculate actual hours if both check-in and check-out exist
    if (this.checkIn?.time && this.checkOut?.time) {
      const checkInTime = new Date(this.checkIn.time);
      const checkOutTime = new Date(this.checkOut.time);
      const diffMs = checkOutTime - checkInTime;
      const hours = diffMs / (1000 * 60 * 60);

      // Subtract break time
      const totalBreakMinutes = this.breaks.reduce((total, breakRecord) => {
        if (breakRecord.startTime && breakRecord.endTime) {
          const breakDuration = (new Date(breakRecord.endTime) - new Date(breakRecord.startTime)) / (1000 * 60);
          return total + breakDuration;
        }
        return total;
      }, 0);

      this.actualHours = Math.max(0, hours - (totalBreakMinutes / 60));
      this.breakHours = totalBreakMinutes / 60;

      // Calculate overtime
      this.overtimeHours = Math.max(0, this.actualHours - this.scheduledHours);

      // Calculate undertime
      this.underTimeHours = Math.max(0, this.scheduledHours - this.actualHours);

      // Set flags
      this.isOvertime = this.overtimeHours > 0;
    }

    // Set late flag (if scheduled start time exists)
    if (this.scheduledStartTime && this.checkIn?.time) {
      const [scheduleHour, scheduleMinute] = this.scheduledStartTime.split(':').map(Number);
      const scheduledStart = new Date(this.date);
      scheduledStart.setHours(scheduleHour, scheduleMinute, 0, 0);

      this.isLate = new Date(this.checkIn.time) > scheduledStart;

      if (this.isLate && this.status === 'present') {
        this.status = 'late';
      }
    }

    // Set early out flag
    if (this.scheduledEndTime && this.checkOut?.time) {
      const [scheduleHour, scheduleMinute] = this.scheduledEndTime.split(':').map(Number);
      const scheduledEnd = new Date(this.date);
      scheduledEnd.setHours(scheduleHour, scheduleMinute, 0, 0);

      this.isEarlyOut = new Date(this.checkOut.time) < scheduledEnd;

      if (this.isEarlyOut && this.status === 'present') {
        this.status = 'early-out';
      }
    }

    next();
  });

  // Virtual for total break duration
  attendanceSchema.virtual('totalBreakDuration').get(function() {
    return this.breaks.reduce((total, breakRecord) => {
      if (breakRecord.duration) return total + breakRecord.duration;
      if (breakRecord.startTime && breakRecord.endTime) {
        return total + ((new Date(breakRecord.endTime) - new Date(breakRecord.startTime)) / (1000 * 60));
      }
      return total;
    }, 0);
  });

  // Method to mark check-in
  attendanceSchema.methods.checkIn = function(location, method = 'manual', deviceId = null, ipAddress = null) {
    this.checkIn = {
      time: new Date(),
      location: location,
      method: method,
      deviceId: deviceId,
      ipAddress: ipAddress
    };

    if (this.status === 'absent') {
      this.status = 'present';
    }

    return this.save();
  };

  // Method to mark check-out
  attendanceSchema.methods.checkOut = function(location, method = 'manual', deviceId = null, ipAddress = null) {
    this.checkOut = {
      time: new Date(),
      location: location,
      method: method,
      deviceId: deviceId,
      ipAddress: ipAddress
    };

    return this.save();
  };

  // Method to add break
  attendanceSchema.methods.addBreak = function(type = 'other', notes = '') {
    const newBreak = {
      startTime: new Date(),
      type: type,
      notes: notes
    };

    this.breaks.push(newBreak);
    return this.save();
  };

  // Method to end current break
  attendanceSchema.methods.endBreak = function() {
    const currentBreak = this.breaks.find(b => b.startTime && !b.endTime);
    if (currentBreak) {
      currentBreak.endTime = new Date();
      currentBreak.duration = (currentBreak.endTime - currentBreak.startTime) / (1000 * 60);
    }
    return this.save();
  };

  // Static method to get attendance by date range
  attendanceSchema.statics.findByDateRange = function(startDate, endDate, filters = {}) {
    const query = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      ...filters
    };

    return this.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('project', 'name code')
      .populate('team', 'name code')
      .sort({ date: -1, 'checkIn.time': 1 });
  };

  // Static method to get attendance statistics
  attendanceSchema.statics.getStatistics = function(startDate, endDate, filters = {}) {
    const matchQuery = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      ...filters
    };

    return this.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $eq: ['$status', 'leave'] }, 1, 0] } },
          remote: { $sum: { $cond: [{ $eq: ['$workLocation', 'remote'] }, 1, 0] } },
          totalHours: { $sum: '$actualHours' },
          totalOvertimeHours: { $sum: '$overtimeHours' },
          avgHours: { $avg: '$actualHours' }
        }
      }
    ]);
  };

  // Static method to find attendance by project and team
  attendanceSchema.statics.findByProjectAndTeam = function(projectId, teamId, startDate, endDate) {
    const query = {
      project: projectId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (teamId) {
      query.team = teamId;
    }

    return this.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('team', 'name code')
      .sort({ date: -1, 'employee.firstName': 1 });
  };

  Attendance = mongoose.model("Attendance", attendanceSchema);
}

module.exports = Attendance;