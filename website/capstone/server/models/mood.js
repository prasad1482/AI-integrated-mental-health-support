import mongoose from "mongoose";

const MoodSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true },
  mood: { type: Number, required: true },
  note: { type: String, default: "" },
}, { timestamps: true });   // ⭐ FIXED — adds createdAt & updatedAt automatically

export default mongoose.model("Mood", MoodSchema);
