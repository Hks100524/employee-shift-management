const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["casual", "sick", "annual", "maternity", "paternity", "unpaid", "other"],
      default: "casual",
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actionedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    totalDays: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

leaveSchema.index({ employee: 1, status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
