import os
import re
import base64
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


# 🔥 Better sentence extraction
def extract_best_sentence(chunk, query):
    sentences = re.split(r'[.?!]', chunk)

    for s in sentences:
        if query.lower() in s.lower():
            return s.strip()

    return chunk[:200]


# 🔥 Chart analysis
def analyze_chart(image_bytes):
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    prompt = """
Analyze this financial chart.

Explain:
- Trend (increase/decrease)
- Peaks and drops
- Possible business reasons

Keep it short.
"""

    response = client.chat.completions.create(
        model="llama-3.2-90b-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": f"data:image/png;base64,{base64_image}"
                    }
                ],
            }
        ],
        max_tokens=300
    )

    return response.choices[0].message.content


@api_view(["GET"])
def test(request):
    return Response({"message": "Backend working"})


# 🔥 Upload PDF
@api_view(["POST"])
def upload_pdf(request):

    session_id = request.data.get("session_id")
    files = request.FILES.getlist("files")

    if not session_id:
        return Response({"error": "No session_id"}, status=400)

    if not files:
        return Response({"error": "No files uploaded"}, status=400)

    Document.objects.filter(session_id=session_id).delete()

    process_pdfs(files, session_id, analyze_chart)

    return Response({"message": "PDFs stored successfully ✅"})


# 🔥 MAIN CHAT (UPGRADED)
@api_view(["POST"])
def chat(request):

    query = request.data.get("query")
    session_id = request.data.get("session_id")
    history = request.data.get("history", [])

    if not query:
        return Response({"error": "No query provided"}, status=400)

    if not session_id:
        return Response({"error": "No session_id"}, status=400)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    query_vector = embeddings.embed_query(query)

    # 🔥 IMPROVED RETRIEVAL (MORE CONTEXT)
    results = Document.objects.filter(
        session_id=session_id
    ).annotate(
        distance=CosineDistance("embedding", query_vector)
    ).order_by("distance")[:20]   # ⬅️ increased

    if len(results) == 0:
        return Response({
            "answer": "No data found",
            "sources": [],
            "file_used": None
        })

    # 🔥 GROUP BY FILE
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

    # 🔥 SPECIAL HANDLING (IMPORTANT 🔥)
    if "name" in query.lower() or "applicant" in query.lower():
        for doc in best_docs:
            if "M/s" in doc.content:
                return Response({
                    "answer": f"Applicant name is {doc.content.strip()} (Page {doc.page_number})",
                    "sources": [],
                    "file_used": best_file
                })

    # 🔥 CONTEXT STITCHING (VERY IMPORTANT)
    stitched_chunks = []
    for i in range(len(best_docs) - 1):
        combined = best_docs[i].content + " " + best_docs[i + 1].content
        stitched_chunks.append(combined)

    # combine original + stitched
    all_chunks = best_docs + [
        type("obj", (object,), {
            "content": chunk,
            "page_number": 0
        }) for chunk in stitched_chunks
    ]

    seen = set()
    sources = []

    for doc in all_chunks:
        text = doc.content.strip()
        key = (text, getattr(doc, "page_number", 0))

        if key not in seen:
            seen.add(key)

            sources.append({
                "content": text,
                "page": getattr(doc, "page_number", 0),
                "highlight": extract_best_sentence(text, query)
            })

    sources = sources[:5]   # ⬅️ increased

    # 🔥 BUILD CONTEXT
    context = ""
    for s in sources:
        context += f"(Page {s['page']}): {s['content']}\n\n"

    # 🔥 CHAT HISTORY
    chat_history = ""
    for msg in history[-6:]:
        role = msg.get("role")
        content = msg.get("content")

        if role == "user":
            chat_history += f"User: {content}\n"
        else:
            chat_history += f"Assistant: {content}\n"

    # 🔥 FINAL PROMPT (SMARTER)
    prompt = f"""
You are a financial document analyst.

Rules:
- Extract exact answers when possible
- Look across multiple lines (data may be split)
- Do NOT say "not found" if information exists
- Explain reasoning when needed
- Mention page numbers

Context:
{context}

Chat History:
{chat_history}

Question:
{query}

Answer:
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=400
    )

    answer = response.choices[0].message.content

    return Response({
        "answer": answer,
        "sources": sources,
        "file_used": best_file
    })