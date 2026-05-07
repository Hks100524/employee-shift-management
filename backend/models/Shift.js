const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    shiftDate: {
      type: Date,
      required: true,
      index: true,
    },
    shiftDateKey: {
      type: String,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    startMinutes: {
      type: Number,
      required: true,
    },
    endMinutes: {
      type: Number,
      required: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["assigned", "completed", "cancelled"],
      default: "assigned",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

shiftSchema.index(
  { employee: 1, shiftDateKey: 1, startMinutes: 1, endMinutes: 1 },
  { unique: true, name: "unique_shift_slot_per_employee" }
);
shiftSchema.index({ branch: 1, status: 1, shiftDateKey: 1 });

module.exports = mongoose.model("Shift", shiftSchema);
