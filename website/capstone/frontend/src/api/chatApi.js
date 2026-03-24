import axios from "axios";

// Axios instance can share baseURL if needed; using relative path to backend
const CHAT_API = axios.create({
  baseURL: "/api/chatbot",
});

export const askChatbot = (message) => CHAT_API.post("/", { message });

export default CHAT_API;
