# Web Copilot – Context-Aware Website Chatbot

A **Web Copilot** system that embeds a chatbot beside a website and answers user queries **contextually based on the website’s content**, using **LLMs** and a **secure backend indexing approach**.

---

## 🚀 Project Overview

Modern websites often require an intelligent assistant to help users understand content quickly.  
This project builds a **website-aware AI copilot** that:

- Runs alongside a website (via iframe)
- Answers questions **based on the website’s content**
- Uses a backend indexing strategy to overcome browser security limitations
- Supports **Employee Login & Signup authentication**

---

## 🎯 Problem Statement

Web-based chatbots cannot directly read iframe content due to browser security (same-origin policy).  
This project solves the problem by:

- Indexing website content in the backend
- Injecting indexed content into LLM prompts
- Providing accurate, context-aware responses

---

## 🧠 Key Features

- Website embedded via iframe
- Chatbot UI beside website
- Backend-powered AI responses
- Context-aware answers (website-specific)
- Employee Login & Signup authentication
- Secure API communication
- Modular & scalable architecture

---

## 🛠 Tech Stack

### Frontend
- Next.js
- React
- CSS (custom styling)
- iframe embedding

### Backend
- Python
- Django
- Django REST Framework
- JWT Authentication (SimpleJWT)

### AI / LLM
- Groq / Hugging Face (LLM provider)
- Prompt engineering
- Error-handled AI calls

### Tools
- Git & GitHub
- Postman (API testing)

---

## 🏗 Project Structure
project-root/
├── frontend/
│ ├── pages/
│ │ ├── login.js
│ │ ├── signup.js
│ │ └── index.js
│ ├── styles/
│ └── public/
│
├── backend/
│ ├── webcopilot/
│ ├── users/
│ ├── manage.py
│
├── README.md
└── .gitignore


---

## 🔐 Authentication Setup (Login & Signup)

### 🔑 Authentication Flow

1. User signs up using email, username, and password
2. Django creates a user record
3. User logs in using credentials
4. Backend returns:
   - Access token
   - Refresh token (JWT)
5. Frontend stores tokens in `localStorage`
6. Protected routes are accessed using access token

---

### 🧩 Backend (Django)

- Custom User model
- JWT authentication using `djangorestframework-simplejwt`
- Endpoints:

POST /api/signup/
POST /api/login/
POST /api/refresh/


- CORS enabled for frontend communication
- CSRF exempted for API endpoints

---

### 🧩 Frontend (Next.js)

- Login & Signup pages
- Fetch API calls to Django backend
- Token storage in `localStorage`
- Redirects after successful authentication

---

## 🟢 8-Week Development Plan

### 🟢 Week 1 – Problem Understanding & Setup
**Goals**
- Understand the problem clearly
- Set up development environment

**Tasks**
- Finalize problem statement
- Study:
- How copilots work
- LLM basics
- iframe & browser security
- Install & configure:
- Python + Django
- Node.js + Next.js
- Git & GitHub
- Create project structure

**Deliverables**
- ✅ Problem statement document
- ✅ GitHub repository
- ✅ Local dev environment working

---

### 🟢 Week 2 – Frontend UI + Website Embedding
**Goals**
- Build the copilot UI
- Embed website beside chatbot

**Tasks**
- Create Next.js pages
- Design layout:
- Left → iframe (website)
- Right → chatbot panel
- Handle iframe loading issues
- Add chatbot UI

**Deliverables**
- ✅ Website embedded using iframe
- ✅ Copilot UI visible and usable

---

### 🟢 Week 3 – Backend API (Django + REST)
**Goals**
- Build backend API for chatbot

**Tasks**
- Create Django project
- Create `webcopilot` app
- Build REST endpoint:

POST /api/ask/

- Enable:
- CORS
- CSRF exemption
- Test API with dummy responses

**Deliverables**
- ✅ Django API working
- ✅ Frontend → Backend communication

---

### 🟢 Week 4 – LLM Integration
**Goals**
- Make chatbot intelligent

**Tasks**
- Study LLM providers (Groq, Hugging Face)
- Integrate LLM
- Handle:
- Timeouts
- Errors
- Deprecation issues
- Add “Thinking…” UI

**Deliverables**
- ✅ AI-generated answers
- ✅ Error-handled LLM calls

---

### 🟢 Week 5 – Website Content Indexing (Core Feature)
**Goals**
- Make answers website-contextual

**Tasks**
- Explain iframe limitation
- Implement backend indexing:
- Manual content file OR
- Auto crawler
- Inject website content into prompts

**Deliverables**
- ✅ Context-aware chatbot
- ✅ Website-specific answers

---

### 🟢 Week 6 – Enhancements & UX Improvements
**Goals**
- Improve accuracy & UX

**Tasks**
- Loading states
- Error messages
- Clear chat history
- Prompt refinement
- Hallucination reduction
- UI improvements

**Deliverables**
- ✅ Better answers
- ✅ Stable UI

---

### 🟢 Week 7 – Testing, Security & Optimization
**Goals**
- Make project review-ready

**Tasks**
- Edge case testing
- Multiple question testing
- Explain security:
- iframe limitations
- backend indexing
- Optimize:
- Prompt size
- Response time

**Deliverables**
- ✅ Stable build
- ✅ Security explanation

---

### 🟢 Week 8 – Documentation & Final Demo
**Goals**
- Prepare for evaluation

**Tasks**
- Architecture diagram
- Sequence diagram
- System flow explanation
- README
- Demo script
- Future scope

**Deliverables**
- ✅ Final demo
- ✅ Complete documentation
- ✅ Confident explanation

---

## 🔒 Security Explanation

### Why iframe content isn’t read?
- Browser **Same-Origin Policy**
- JavaScript cannot access iframe DOM from another origin

### Why backend indexing?
- Backend fetches & stores website content
- Content injected into LLM prompt securely
- Prevents frontend security violations

---

## 🚧 Future Scope

- Vector database (FAISS / Pinecone)
- User role-based access
- Multi-website support
- Conversation memory
- Admin dashboard
- Analytics & logging

---

## 📌 Conclusion

This project demonstrates a **real-world AI copilot system** with strong fundamentals in:
- Web security
- Full-stack development
- LLM integration
- System design & documentation

---

👨‍💻 **Author:** vamshee
📅 **Duration:** 8 Weeks  