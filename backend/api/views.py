import os
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from langchain_community.embeddings import HuggingFaceEmbeddings
from pgvector.django import CosineDistance
from .models import Document
from groq import Groq
from .rag import process_pdfs

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@api_view(["GET"])
def test(request):
    return Response({"message": "Backend working"})


@api_view(["POST"])
def upload_pdf(request):

    session_id = request.data.get("session_id")
    files = request.FILES.getlist("files")

    if not session_id:
        return Response({"error": "No session_id"}, status=400)

    if not files:
        return Response({"error": "No files uploaded"}, status=400)

    print("SESSION:", session_id)
    print("FILES:", files)

    Document.objects.filter(session_id=session_id).delete()

    process_pdfs(files, session_id)

    return Response({"message": "PDFs stored successfully ✅"})

@api_view(["POST"])
def chat(request):

    query = request.data.get("query")
    session_id = request.data.get("session_id")
    history = request.data.get("history", [])  # 🔥 NEW

    if not query:
        return Response({"error": "No query provided"}, status=400)

    if not session_id:
        return Response({"error": "No session_id"}, status=400)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    query_vector = embeddings.embed_query(query)

    results = Document.objects.filter(
        session_id=session_id
    ).annotate(
        distance=CosineDistance("embedding", query_vector)
    ).order_by("distance")[:10]

    if len(results) == 0:
        return Response({
            "answer": "No data found",
            "sources": [],
            "file_used": None
        })

    file_groups = {}

    for doc in results:
        file_groups.setdefault(doc.file_name, []).append(doc)

    best_file = None
    best_score = float("inf")

    for file, docs in file_groups.items():
        score = sum([d.distance for d in docs]) / len(docs)

        if score < best_score:
            best_score = score
            best_file = file

    best_docs = file_groups[best_file]

    seen = set()
    sources = []

    for doc in best_docs:
        text = doc.content.strip()
        if text not in seen:
            seen.add(text)
            sources.append(text)

    sources = sources[:3]
    context = "\n\n".join(sources)

    chat_history = ""

    for msg in history[-6:]:  
        role = msg.get("role")
        content = msg.get("content")

        if role == "user":
            chat_history += f"User: {content}\n"
        else:
            chat_history += f"Assistant: {content}\n"

   
    prompt = f"""
You are an intelligent PDF assistant.

Use:
1. Chat history for understanding context
2. PDF context for factual answers

Rules:
- Answer ONLY using PDF context
- Use chat history for follow-up questions
- If answer not found → say "Not found in documents"
- Keep answers clean and structured
- Use bullet points if helpful

Chat History:
{chat_history}

PDF Context:
{context}

User Question:
{query}

Answer:
"""

    
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=400
    )

    answer = response.choices[0].message.content

    return Response({
        "answer": answer,
        "sources": sources,
        "file_used": best_file
    })