import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { type: String, required: true }, // chatbot, mood, meditation, etc.
  count: { type: Number, default: 1 },
  duration: { type: Number, default: 0 },
  lastUsed: { type: Date, default: Date.now }
});

export default mongoose.model("Activity", ActivitySchema);
