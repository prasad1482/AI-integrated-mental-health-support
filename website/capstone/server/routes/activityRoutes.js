import express from "express";
import Activity from "../models/Activity.js";

const router = express.Router();

// LOG ACTIVITY
router.post("/log", async (req, res) => {
  try {
    const { activityType, duration, email } = req.body;

    if (!email || !activityType)
      return res.json({ success: false, message: "Missing fields" });

    let activity = await Activity.findOne({ email, type: activityType });

    if (activity) {
      activity.count++;
      activity.lastUsed = new Date();
      activity.duration += duration || 0;
      await activity.save();
    } else {
      await Activity.create({
        email,
        type: activityType,
        duration: duration || 0,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Activity log error:", err);
    res.status(500).json({ success: false });
  }
});

// GET ACTIVITY STATS
router.get("/stats", async (req, res) => {
  try {
    const { email, days } = req.query;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - (days || 7));

    const stats = await Activity.find({
      email,
      lastUsed: { $gte: sinceDate },
    });

    res.json({ success: true, stats });
  } catch (err) {
    console.error("Activity stats error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
