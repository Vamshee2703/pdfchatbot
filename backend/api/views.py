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

    docs, best_file = _retrieve_documents(query, session_id)

    if not docs:
        return Response({
            "answer": "No data found",
            "sources": [],
            "file_used": None
        })

    name_response = _check_applicant_name(query, docs, best_file)
    if name_response:
        return name_response

    sources = _build_sources(docs, query)
    context = _build_context(sources)
    chat_history = _build_chat_history(history)
    answer = _get_ai_response(query, context, chat_history)

    return Response({
        "answer": answer,
        "sources": sources,
        "file_used": best_file
    })


def _retrieve_documents(query, session_id):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    query_vector = embeddings.embed_query(query)

    results = Document.objects.filter(
        session_id=session_id
    ).annotate(
        distance=CosineDistance("embedding", query_vector)
    ).order_by("distance")[:20]

    if not results:
        return None, None

    file_groups = {}
    for doc in results:
        file_groups.setdefault(doc.file_name, []).append(doc)

    best_file, best_docs = max(
        file_groups.items(),
        key=lambda item: sum(d.distance for d in item[1]) / len(item[1])
    )
    return best_docs, best_file


def _check_applicant_name(query, docs, best_file):
    if "name" in query.lower() or "applicant" in query.lower():
        for doc in docs:
            if "M/s" in doc.content:
                return Response({
                    "answer": f"Applicant name is {doc.content.strip()} (Page {doc.page_number})",
                    "sources": [],
                    "file_used": best_file
                })
    return None


def _build_sources(docs, query):
    stitched_chunks = [
        docs[i].content + " " + docs[i + 1].content
        for i in range(len(docs) - 1)
    ]

    all_chunks = docs + [
        type("obj", (object,), {"content": chunk, "page_number": 0})
        for chunk in stitched_chunks
    ]

    seen = set()
    sources = []
    for doc in all_chunks:
        text = doc.content.strip()
        page = getattr(doc, "page_number", 0)
        key = (text, page)
        if key not in seen:
            seen.add(key)
            sources.append({
                "content": text,
                "page": page,
                "highlight": extract_best_sentence(text, query)
            })
    return sources[:5]


def _build_context(sources):
    return "\n\n".join(f"(Page {s['page']}): {s['content']}" for s in sources)


def _build_chat_history(history):
    lines = []
    for msg in history[-6:]:
        role = msg.get("role")
        content = msg.get("content")
        prefix = "User" if role == "user" else "Assistant"
        lines.append(f"{prefix}: {content}\n")
    return "".join(lines)


def _get_ai_response(query, context, chat_history):
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
    return response.choices[0].message.content