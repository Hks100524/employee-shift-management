const mongoose = require("mongoose");

const shiftAssignmentLockSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    shiftDateKey: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

shiftAssignmentLockSchema.index(
  { employee: 1, shiftDateKey: 1 },
  { unique: true, name: "unique_shift_assignment_lock" }
);

module.exports = mongoose.model("ShiftAssignmentLock", shiftAssignmentLockSchema);
