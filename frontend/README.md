<<<<<<< HEAD
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
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> origin/main
