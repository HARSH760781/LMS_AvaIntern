import mongoose from "mongoose";

const TestSchema = new mongoose.Schema(
  {
    college: { type: String, required: true },
    branch: { type: String, required: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    duration: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    file: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },
    createdBy: { type: String },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled", "paused"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Test", TestSchema);

// Virtual for checking if test is currently active
// TestSchema.virtual("isActive").get(function () {
//   const now = new Date();
//   return now >= this.startTime && now <= this.endTime;
// });

// // Virtual for time remaining (in minutes)
// TestSchema.virtual("timeRemaining").get(function () {
//   const now = new Date();
//   if (now > this.endTime) return 0;
//   return Math.ceil((this.endTime - now) / (1000 * 60)); // minutes
// });

// // Method to check if a student can start the test
// TestSchema.methods.canStartTest = function () {
//   const now = new Date();
//   return now >= this.startTime && now <= this.endTime;
// };

// // Pre-save middleware to update status based on times
// TestSchema.pre("save", function (next) {
//   const now = new Date();

//   if (now > this.endTime) {
//     this.status = "completed";
//   } else if (now >= this.startTime && now <= this.endTime) {
//     this.status = "active";
//   } else {
//     this.status = "scheduled";
//   }

//   next();
// });

// export default mongoose.model("Test", TestSchema);
