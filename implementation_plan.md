# Chatbot Integration Plan

## Goal Description
The objective is to connect your local ML chatbot (FastAPI) to the existing mental health support website (React frontend). Currently, the React frontend is mapped to an older external server URL, and your local FastAPI server does not accept requests from other origins (CORS). We will fix these issues so they can communicate locally.

## Proposed Changes

### Backend (Local API)
- Add `CORSMiddleware` to allow the React frontend to make requests to the FastAPI backend without being blocked by the browser. 
#### [MODIFY] [main.py](file:///c:/prasad/student-wellness-chatbot/chatbot/main.py)

### Frontend (React UI)
- Update the API URL in the chat component to point to your local FastAPI server running on `http://localhost:8000/chat`.
#### [MODIFY] [ChatBot.jsx](file:///c:/prasad/student-wellness-chatbot/website/capstone/frontend/src/pages/ChatBot.jsx)

## Verification Plan

### Automated Tests
None are currently available for the frontend-backend integration.

### Manual Verification
1. Open a terminal, navigate to `c:\prasad\student-wellness-chatbot\website\capstone\frontend`, run `npm install`, then `npm run dev` to start the website.
2. In another terminal, navigate to `c:\prasad\student-wellness-chatbot\chatbot` and run `uvicorn main:app --reload` to start the chatbot server.
3. Open the website in the browser (usually `http://localhost:5173`), navigate to the AI chat interface, and send a test message (e.g., "Hello").
4. Verify that the chatbot responds successfully and the message is displayed directly in the UI.
