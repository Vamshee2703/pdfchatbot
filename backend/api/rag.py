from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from .models import Document


def clean_text(text):
    return text.replace("\x00", "").strip()


def process_pdfs(files, session_id):

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    for file in files:

        reader = PdfReader(file)
        text = ""

        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

        chunks = splitter.split_text(text)

        print(f"{file.name} → CHUNKS: {len(chunks)}")

        for chunk in chunks:
            clean_chunk = clean_text(chunk)

            if len(clean_chunk) < 5:
                continue

            vector = embeddings.embed_query(clean_chunk)

            Document.objects.create(
                content=clean_chunk,
                embedding=vector,
                session_id=session_id,
                file_name=file.name
            )

    print("✅ ALL PDFs STORED")