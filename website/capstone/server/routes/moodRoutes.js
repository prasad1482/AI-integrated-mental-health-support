// backend/routes/moodRoutes.js
import express from 'express';
import Mood from '../models/Mood.js';

const router = express.Router();

/* ---------------------------------------------------
   SAVE / UPDATE MOOD
---------------------------------------------------- */
router.post('/save', async (req, res) => {
  try {
    const { email, date, mood, note } = req.body;

    if (!email || !date || !mood) {
      return res.status(400).json({
        success: false,
        message: 'Missing fields (email, date, mood required)',
      });
    }

    // Format date to YYYY-MM-DD
    const d = new Date(date).toISOString().split('T')[0];

    const existing = await Mood.findOne({ email, date: d });

    if (existing) {
      existing.mood = mood;
      existing.note = note || existing.note;
      await existing.save();
    } else {
      await Mood.create({ email, date: d, mood, note: note || '' });
    }

    return res.json({ success: true });

  } catch (err) {
    console.error('Save Mood Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ---------------------------------------------------
   GET HISTORY — FIXED (uses exact date list)
---------------------------------------------------- */
router.get('/history', async (req, res) => {
  try {
    const { email, days } = req.query;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    const limit = Number(days) || 7;

    // Generate exact dates list: ["2025-02-19", "2025-02-18", ...]
    const lastNDates = [];
    for (let i = 0; i < limit; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const formatted = d.toISOString().split("T")[0];
      lastNDates.push(formatted);
    }

    // Fetch EXACT matches only (fixes your problem)
    const entries = await Mood.find({
      email,
      date: { $in: lastNDates }
    }).lean();

    // Sort by date logically
    entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.json({ success: true, moodEntries: entries });
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ---------------------------------------------------
   GET STATS (avg, daysTracked, topMood)
---------------------------------------------------- */
router.get('/stats', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ success: false, message: 'email required' });

    const entries = await Mood.find({ email }).lean();

    if (!entries || entries.length === 0) {
      return res.json({
        success: true,
        stats: { avgMood: 'N/A', daysTracked: 0, topMood: 'N/A' },
      });
    }

    // Average mood
    const avgMood =
      entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    const avgRounded = Math.round(avgMood * 10) / 10;

    // Frequent mood
    const freq = {};
    entries.forEach((e) => {
      freq[e.mood] = (freq[e.mood] || 0) + 1;
    });

    const topMoodNum = Object.keys(freq).reduce((a, b) =>
      freq[a] > freq[b] ? a : b
    );

    const moodMap = {
      1: 'Very Sad',
      2: 'Sad',
      3: 'Okay',
      4: 'Good',
      5: 'Great',
    };

    const topMoodLabel = moodMap[topMoodNum] || topMoodNum;

    return res.json({
      success: true,
      stats: {
        avgMood: avgRounded,
        daysTracked: entries.length,
        topMood: topMoodLabel,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
