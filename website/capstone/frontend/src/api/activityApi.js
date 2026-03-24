import axios from "axios";

const ACTIVITY_API = axios.create({
  baseURL: "http://localhost:5000/api/activity",
  withCredentials: true,
});

export const logActivity = (activityType, duration = 0) => 
  ACTIVITY_API.post("/log", { activityType, duration });

export const getActivityStats = (days = 7, email) => {
  let query = `?days=${days}`;
  if (email) query += `&email=${encodeURIComponent(email)}`;
  return ACTIVITY_API.get(`/stats${query}`);
};

export default ACTIVITY_API;