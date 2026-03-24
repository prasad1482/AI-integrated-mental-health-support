

export const saveMoodLocal = (data) => {
  let stored = JSON.parse(localStorage.getItem("moodData")) || [];

  const index = stored.findIndex(
    (e) => e.email === data.email && e.date === data.date
  );

  if (index >= 0) stored[index] = data;
  else stored.push(data);

  localStorage.setItem("moodData", JSON.stringify(stored));
  return { success: true };
};

export const getMoodHistoryLocal = (email, days = 30) => {
  let stored = JSON.parse(localStorage.getItem("moodData")) || [];
  const userData = stored.filter((e) => e.email === email);

  // last N days
  const today = new Date();
  const limitDates = [];

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    limitDates.push(d.toISOString().split("T")[0]);
  }

  const result = userData.filter((e) => limitDates.includes(e.date));
  return { success: true, moodEntries: result };
};

export const getMoodStatsLocal = (email) => {
  let stored = JSON.parse(localStorage.getItem("moodData")) || [];
  const userData = stored.filter((e) => e.email === email);

  if (!userData.length)
    return {
      success: true,
      stats: { avgMood: "N/A", daysTracked: 0, topMood: "N/A" },
    };

  const avg = (
    userData.reduce((sum, e) => sum + e.mood, 0) / userData.length
  ).toFixed(1);

  // top mood
  const freq = {};
  userData.forEach((e) => (freq[e.mood] = (freq[e.mood] || 0) + 1));

  const topMood = Object.keys(freq).reduce((a, b) =>
    freq[a] > freq[b] ? a : b
  );

  const labels = {
    1: "Very Sad",
    2: "Sad",
    3: "Okay",
    4: "Good",
    5: "Great",
  };

  return {
    success: true,
    stats: {
      avgMood: avg,
      daysTracked: userData.length,
      topMood: labels[topMood],
    },
  };
};
