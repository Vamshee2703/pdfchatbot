from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from .models import Document
import fitz


def clean_text(text):
    return text.replace("\x00", "").strip()


def extract_images_from_pdf(file):
    file.seek(0)  # 🔥 IMPORTANT (reset pointer)
    doc = fitz.open(stream=file.read(), filetype="pdf")

    images = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        image_list = page.get_images(full=True)

        for img in image_list:
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            images.append(image_bytes)

    return images


def process_pdfs(files, session_id, analyze_chart_fn=None):
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    for file in files:
        _process_text_content(file, session_id, splitter, embeddings)
        if analyze_chart_fn:
            _process_chart_images(file, session_id, analyze_chart_fn, embeddings)

    print("✅ PDFs stored with text + chart insights")


def _process_text_content(file, session_id, splitter, embeddings):
    reader = PdfReader(file)
    for page_number, page in enumerate(reader.pages, start=1):
        content = page.extract_text()
        if not content:
            continue
        _save_page_chunks(content, page_number, file, session_id, splitter, embeddings)


def _save_page_chunks(content, page_number, file, session_id, splitter, embeddings):
    clean_page_text = clean_text(content)
    chunks = splitter.split_text(clean_page_text)
    for chunk in chunks:
        clean_chunk = clean_text(chunk)
        if len(clean_chunk) < 5:
            continue
        vector = embeddings.embed_query(clean_chunk)
        Document.objects.create(
            content=clean_chunk,
            embedding=vector,
            session_id=session_id,
            file_name=file.name,
            page_number=page_number
        )


def _process_chart_images(file, session_id, analyze_chart_fn, embeddings):
    try:
        images = extract_images_from_pdf(file)
        for img in images:
            insight = analyze_chart_fn(img)
            if insight and len(insight) > 10:
                Document.objects.create(
                    content=insight,
                    embedding=embeddings.embed_query(insight),
                    session_id=session_id,
                    file_name=file.name,
                    page_number=0
                )
    except Exception as e:
        print("Image processing error:", e)