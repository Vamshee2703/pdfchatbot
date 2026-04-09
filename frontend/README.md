# 📄 AI PDF Chatbot (RAG Based)

An intelligent chatbot that allows users to upload PDFs and ask questions about their content using AI.

Built using **Next.js (Frontend)**, **Django (Backend)**, **Supabase PostgreSQL (pgvector)**, and **Groq LLM**.

---

## 🔥 Features

* 📄 Upload multiple PDFs
* 🔍 Semantic search using embeddings (RAG)
* 🤖 AI-powered answers using LLM
* 🧠 Chat memory (context-aware responses)
* 📌 Source-based answers (from PDF chunks)
* ⚡ Fast vector search with pgvector
* 🎯 Smart document selection (avoids mixing unrelated PDFs)
* 💬 ChatGPT-like UI with typing effect

---

## 🧠 How It Works (RAG Flow)

```
PDF → Text Extraction → Chunking → Embeddings → Stored in DB

User Query → Embedding → Vector Search → Context → LLM → Answer
```

---

## 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

### Backend

* Django + Django REST Framework
* PyPDF2 (PDF parsing)
* LangChain (text splitting & embeddings)

### Database

* Supabase PostgreSQL
* pgvector (vector similarity search)

### AI

* Groq API (LLaMA 3 model)
* HuggingFace Embeddings (`all-MiniLM-L6-v2`)

---

## 📁 Project Structure

```
pdf-chatbot/
│
├── frontend/        # Next.js app
│   └── app/
│       └── chat/
│
├── backend/         # Django API
│   └── api/
│
└── README.md
```

---

## ⚙️ Setup Instructions

---

### 1️⃣ Clone Repository

```
git clone <your-repo-url>
cd pdf-chatbot
```

---

### 2️⃣ Backend Setup (Django)

```
cd backend

python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate (Mac/Linux)

pip install -r requirements.txt
```

---

### 🔐 Environment Variables (Backend)

Create `.env` file inside `backend/`:

```
GROQ_API_KEY=your_api_key_here
```

---

### 🛢️ Database Setup (Supabase)

* Create a Supabase project
* Enable `pgvector` extension
* Update your `DATABASE_URL` in Django settings

---

### ▶️ Run Backend

```
python manage.py migrate
python manage.py runserver
```

---

### 3️⃣ Frontend Setup (Next.js)

```
cd frontend
npm install
```

---

### 🔐 Environment Variables (Frontend)

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

### ▶️ Run Frontend

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 💡 Usage

1. Upload one or more PDFs
2. Click **Upload**
3. Ask questions in chat
4. Get AI answers based on document content

---

## ⚡ API Endpoints

### Upload PDFs

```
POST /api/upload/
```

### Chat Query

```
POST /api/chat/
```

---

## 🧠 Key Concepts Used

* RAG (Retrieval-Augmented Generation)
* Vector Embeddings
* Semantic Search (Cosine Similarity)
* Chunking Strategy
* Chat Memory (context handling)
* Prompt Engineering

---

## 🚀 Deployment

### Frontend

* Deploy on Vercel

### Backend

* Deploy on Render / Railway

### Database

* Supabase (PostgreSQL + pgvector)

---

## 🔐 Security Notes

* `.env` files are ignored in `.gitignore`
* API keys are not exposed to frontend
* Only `NEXT_PUBLIC_` variables are exposed

---

## 📌 Future Improvements

* 🔑 User Authentication (login/signup)
* 💾 Persistent chat history
* 📊 PDF highlighting
* ⚡ Streaming responses (real-time tokens)
* 📁 File management dashboard

---

## 👨‍💻 Author
JEERU VAMSHEE
