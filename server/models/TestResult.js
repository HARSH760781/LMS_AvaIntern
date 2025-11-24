import mongoose from "mongoose";

const userResultsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  tests: [
    {
      test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
        required: true,
      },
      answers: { type: Object }, // e.g., {0: "OptionA", 1: "OptionC"}
      score: { type: Number, required: true },
      total: { type: Number, required: true },
      submittedAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("UserResults", userResultsSchema);
