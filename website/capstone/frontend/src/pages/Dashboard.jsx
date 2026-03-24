import { motion } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import {
  TrendingUp,
  Activity,
  MessageCircle,
  BookOpen,
  Sparkles,
  Settings
} from "lucide-react";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { getActivityStats } from "../api/activityApi";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getEmoji = (m) => {
    if (m >= 4.5) return "😄";
    if (m >= 3.5) return "😊";
    if (m >= 2.5) return "😐";
    if (m >= 1.5) return "☹️";
    return "😢";
  };

  const [showSettings, setShowSettings] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [reportName, setReportName] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [reportType, setReportType] = useState("");
  const [reportMsg, setReportMsg] = useState("");
  const [reportError, setReportError] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactError, setContactError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [moodHistory, setMoodHistory] = useState([]);

  const [stats, setStats] = useState({
    avgMood: 0,
    daysTracked: 0,
    moodName: "Neutral",
    emoji: "😐",
    quote: "Every day is a fresh start!"
  });

  const [activityStats, setActivityStats] = useState({
    chatbot: 0,
    mood_tracking: 0,
    resources: 0,
    meditation: 0,
    exercises: 0
  });

  const loadLocalMoodData = () => {
    const stored = JSON.parse(localStorage.getItem("moodData")) || [];
    const userData = stored.filter((e) => e.email === user?.email);

    setMoodHistory(userData);
    calculateStats(userData);
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({
        avgMood: "N/A",
        daysTracked: 0,
        moodName: "No Data",
        emoji: "😐",
        quote: "Start tracking to see insights!"
      });
      return;
    }

    const avg = (
      data.reduce((s, e) => s + e.mood, 0) / data.length
    ).toFixed(1);

    const freq = {};
    data.forEach((e) => {
      freq[e.mood] = (freq[e.mood] || 0) + 1;
    });

    const top = Object.keys(freq).reduce((a, b) => (freq[a] > freq[b] ? a : b));

    const moodNames = {
      1: "Very Sad",
      2: "Sad",
      3: "Okay",
      4: "Good",
      5: "Great"
    };

    setStats({
      avgMood: avg,
      daysTracked: data.length,
      moodName: moodNames[top],
      emoji: getEmoji(avg),
      quote: "Keep going, you're doing great!"
    });
  };

  useEffect(() => {
    if (user?.email) loadLocalMoodData();

    (async () => {
      try {
        const a = await getActivityStats(7, user?.email);

        if (a?.data?.success && a?.data?.activities) {
          setActivityStats(a.data.activities);
        }
      } catch (err) {
        console.log("Activity stats error", err);
      }

      setLoading(false);
    })();
  }, [user]);

  const getWeeklyTrendData = () => {
    const last7 = [];
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const dStr = d.toISOString().split("T")[0];
      last7.push(dStr);

      labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
    }

    const moodValues = last7.map((date) => {
      const entry = moodHistory.find((e) => e.date === date);
      return entry ? entry.mood : null;
    });

    return {
      labels,
      datasets: [
        {
          label: "Mood Level",
          data: moodValues,
          borderColor: "rgb(147, 51, 234)",
          backgroundColor: "rgba(147, 51, 234, 0.2)",
          fill: true,
          tension: 0.4,
          pointRadius: 5
        }
      ]
    };
  };

  const activityData = {
    labels: ["Chatbot", "Mood", "Resources", "Meditation", "Exercises"],
    datasets: [
      {
        label: "Weekly Activity",
        data: [
          activityStats?.chatbot || 0,
          activityStats?.mood_tracking || 0,
          activityStats?.resources || 0,
          activityStats?.meditation || 0,
          activityStats?.exercises || 0
        ],
        backgroundColor: [
          "rgba(147, 51, 234, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(236, 72, 153, 0.8)"
        ],
        borderRadius: 14
      }
    ]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#e0f7fa] to-[#fce7f3] p-6">
      <motion.div className="max-w-7xl mx-auto relative">

        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
              Welcome Back{user?.name ? `, ${user.name}` : ""}!
            </h1>
            <p className="text-gray-700 mt-1">Here’s your wellness summary</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            onClick={() => setShowSettings(true)}
            className="p-4 bg-white/40 backdrop-blur-lg rounded-3xl shadow-xl"
          >
            <Settings className="w-7 h-7 text-gray-700" />
          </motion.button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">

          <div className="bg-blue-50 p-6 rounded-3xl shadow">
            <div className="text-4xl font-bold text-blue-700 mb-1">{stats.avgMood}</div>
            <p className="text-gray-600 font-semibold">Average Mood</p>
          </div>

          <div className="bg-green-50 p-6 rounded-3xl shadow">
            <div className="text-4xl font-bold text-green-700 mb-1">{stats.daysTracked}</div>
            <p className="text-gray-600 font-semibold">Days Tracked</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-3xl shadow">
            <div className="text-5xl">{stats.emoji}</div>
            <p className="text-gray-600 font-semibold">{stats.moodName}</p>
            <p className="text-sm italic text-gray-500">{stats.quote}</p>
          </div>

        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {[
            { icon: MessageCircle, label: "Chat Now", color: "from-purple-500 to-blue-500", path: "/chatbot" },
            { icon: Activity, label: "Track Mood", color: "from-blue-500 to-green-500", path: "/mood-tracker" },
            { icon: BookOpen, label: "Resources", color: "from-green-500 to-teal-500", path: "/resources" }
          ].map((a) => (
            <motion.button
              key={a.label}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(a.path)}
              className={`bg-gradient-to-r ${a.color} p-7 rounded-3xl text-white shadow-xl`}
            >
              <a.icon className="w-10 h-10 mb-2" />
              <h3 className="text-xl font-bold">{a.label}</h3>
            </motion.button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">

          <motion.div className="bg-white/40 p-6 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-purple-500" /> Weekly Mood Trend
            </h2>

            <div style={{ height: "260px" }}>
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin h-12 w-12 border-b-2 border-purple-500 rounded-full"></div>
                </div>
              ) : (
                <Line data={getWeeklyTrendData()} options={chartOptions} />
              )}
            </div>

          </motion.div>

          <motion.div className="bg-white/40 p-6 rounded-3xl shadow-xl">

            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Activity className="text-blue-500" /> Activity Breakdown
            </h2>

            <div style={{ height: "260px" }}>
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
                </div>
              ) : (
                <Bar data={activityData} options={chartOptions} />
              )}
            </div>

          </motion.div>

        </div>

      </motion.div>
    </div>
  );
}