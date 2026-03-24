import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MoodTracker() {
  const { user } = useAuth();

  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNote, setMoodNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [stats, setStats] = useState({ avgMood: 'N/A', daysTracked: 0, topMood: 'N/A' });

  const moods = [
    { emoji: '😢', label: 'Very Sad', value: 1, color: 'from-red-400 to-red-300' },
    { emoji: '😔', label: 'Sad', value: 2, color: 'from-orange-400 to-orange-300' },
    { emoji: '😐', label: 'Okay', value: 3, color: 'from-yellow-400 to-yellow-300' },
    { emoji: '😊', label: 'Good', value: 4, color: 'from-green-400 to-green-300' },
    { emoji: '😄', label: 'Great', value: 5, color: 'from-blue-400 to-blue-300' }
  ];

  /* -------------------------
        FETCH LOCAL STORAGE
  ----------------------------*/
  const fetchMoodData = () => {
    const stored = JSON.parse(localStorage.getItem("moodData")) || [];
    const userData = stored.filter(e => e.email === user?.email);
    setMoodHistory(userData);
    calculateStats(userData);
  };

  useEffect(() => {
    if (user?.email) {
      fetchMoodData();
    }
  }, [user]);

  /* -------------------------
         CALCULATE STATS
  ----------------------------*/
  const calculateStats = (data) => {
    if (!data.length) {
      setStats({ avgMood: 'N/A', daysTracked: 0, topMood: 'N/A' });
      return;
    }

    const avg = (data.reduce((sum, e) => sum + e.mood, 0) / data.length).toFixed(1);

    const freq = {};
    data.forEach(e => freq[e.mood] = (freq[e.mood] || 0) + 1);

    const topMood = Object.keys(freq).reduce((a, b) =>
      freq[a] > freq[b] ? a : b
    );

    const labels = {
      1: "Very Sad",
      2: "Sad",
      3: "Okay",
      4: "Good",
      5: "Great"
    };

    setStats({
      avgMood: avg,
      daysTracked: data.length,
      topMood: labels[topMood]
    });
  };

  /* -------------------------
         SAVE MOOD
  ----------------------------*/
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedMood) {
      setMessage("Please select a mood");
      return;
    }

    setLoading(true);

    const newEntry = {
      email: user.email,
      date: selectedDate,
      mood: selectedMood,
      note: moodNote
    };

    let stored = JSON.parse(localStorage.getItem("moodData")) || [];

    const index = stored.findIndex(
      e => e.email === user.email && e.date === selectedDate
    );

    if (index >= 0) stored[index] = newEntry;
    else stored.push(newEntry);

    localStorage.setItem("moodData", JSON.stringify(stored));

    fetchMoodData();

    setMessage("✅ Mood saved!");
    setSelectedMood(null);
    setMoodNote("");

    setTimeout(() => setMessage(""), 1200);
    setLoading(false);
  };

  /* -------------------------
         CHART DATA (FIXED)
  ----------------------------*/

  const getDayLabel = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getChartData = () => {
    const last7Dates = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Dates.push(d.toISOString().split("T")[0]);
    }

    const dayLabels = last7Dates.map(d => getDayLabel(d)); // FIXED day-of-week correctly

    const moodData = last7Dates.map(date => {
      const entry = moodHistory.find(e => e.date === date);
      return entry ? entry.mood : null;
    });

    return {
      labels: dayLabels,
      datasets: [
        {
          label: "Mood Level",
          data: moodData,
          backgroundColor: "rgba(147, 51, 234, 0.1)",
          borderColor: "rgb(147, 51, 234)",
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: value => ['', '😢', '😔', '😐', '😊', '😄'][value]
        }
      }
    }
  };

  /* -------------------------
         UI
  ----------------------------*/

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Mood Tracker
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT FORM */}
          <motion.div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-500" />
              Daily Check-In
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 rounded-xl"
              />

              <div className="grid grid-cols-5 gap-3">
                {moods.map(m => (
                  <motion.button
                    key={m.value}
                    type="button"
                    onClick={() => setSelectedMood(m.value)}
                    className={`p-4 rounded-2xl ${selectedMood === m.value ? `bg-gradient-to-br ${m.color}` : "bg-gray-100"}`}
                  >
                    <div className="text-4xl">{m.emoji}</div>
                    <div className={selectedMood === m.value ? "text-white" : "text-gray-600"}>
                      {m.label}
                    </div>
                  </motion.button>
                ))}
              </div>

              <textarea
                rows="4"
                value={moodNote}
                onChange={e => setMoodNote(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl"
              />

              {message && (
                <div className={`p-3 rounded-xl ${message.includes("✅") ? "bg-green-100" : "bg-red-100"}`}>
                  {message}
                </div>
              )}

              <button disabled={loading || !selectedMood}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl">
                {loading ? "Saving..." : "Save Mood Entry"}
              </button>

            </form>
          </motion.div>

          {/* RIGHT: CHART */}
          <motion.div className="bg-white rounded-3xl shadow-xl p-8">

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              Your Mood Journey
            </h2>

            <div style={{ height: 300 }}>
              <Line data={getChartData()} options={chartOptions} />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="p-4 bg-blue-100 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.avgMood}</div>
                Avg Mood
              </div>

              <div className="p-4 bg-green-100 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-600">{stats.daysTracked}</div>
                Days Tracked
              </div>

              <div className="p-4 bg-purple-100 rounded-xl text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.topMood}</div>
                Top Mood
              </div>
            </div>

          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
