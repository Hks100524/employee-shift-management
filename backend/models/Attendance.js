const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      default: null,
    },
    attendanceDate: {
      type: Date,
      required: true,
      index: true,
    },
    attendanceDateKey: {
      type: String,
      required: true,
      index: true,
    },
    checkInAt: {
      type: Date,
      default: null,
    },
    checkOutAt: {
      type: Date,
      default: null,
    },
    workingMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["present", "partial"],
      default: "partial",
      index: true,
    },
    checkInRequestId: {
      type: String,
      default: null,
      index: true,
    },
    checkOutRequestId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

attendanceSchema.index(
  { employee: 1, attendanceDateKey: 1 },
  { unique: true, name: "unique_attendance_per_day" }
);

attendanceSchema.index({ status: 1, attendanceDateKey: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
