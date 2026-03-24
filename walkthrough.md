# Integration Complete! 🚀

I've successfully integrated your local AI Chatbot (FastAPI) with the Mental Health Website (React). 

## What changed?
1. **Backend Integration**: Added `CORSMiddleware` to the FastAPI backend ([chatbot/main.py](file:///c:/prasad/student-wellness-chatbot/chatbot/main.py)) so the React app running on a different port can communicate with it securely without browser Cross-Origin (CORS) errors.
2. **Frontend UI Integration**: Updated the AI Chat fetch request in the React website UI ([ChatBot.jsx](file:///c:/prasad/student-wellness-chatbot/website/capstone/frontend/src/pages/ChatBot.jsx)) to point directly to your local instance at `http://localhost:8000/chat` instead of to the previous externally deployed server.

## How to Run & Test It

Since your project consists of two different servers (one for frontend, one for backend), you'll need to run both at the same time in two separate terminal windows.

### Let's start the Backend API:
1. Open a terminal and run your backend code. Notice that the actual file is in the `chatbot` folder, so you need to point to it specifically:
```bash
cd c:\prasad\student-wellness-chatbot\chatbot
uvicorn main:app --reload
```
_(You should see output saying the app is running on `http://127.0.0.1:8000`)_

### Let's start the Frontend Website:
1. Open a **new, second terminal window**.
2. Navigate into the folder containing your frontend React code and start the development server:
```bash
cd c:\prasad\student-wellness-chatbot\website\capstone\frontend
npm run dev
```
_(Your website will start up, usually on `http://localhost:5173`)_

### Let's Test It!
- Open your browser and go to the link given by the frontend terminal (mostly `http://localhost:5173`).
- Go to the Chatbot page and type a generic message (e.g. "Hi, I feel a bit stressed today").
- The page will say "Bot is typing" and successfully query your local python model!

> [!NOTE] 
> I have already executed `npm install` for you in the frontend folder, so you don't need to do that manually!
