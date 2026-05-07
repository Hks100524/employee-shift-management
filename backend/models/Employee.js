const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },
    createdBy: {
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

employeeSchema.index({
  name: "text",
  email: "text",
  department: "text",
  branch: "text",
  designation: "text",
});

employeeSchema.index({ department: 1, branch: 1, status: 1 });
employeeSchema.index({ manager: 1, status: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
