from django.test import TestCase, Client
from unittest.mock import MagicMock, patch
from types import SimpleNamespace

from . import rag, views


class TestBackend(TestCase):
    def setUp(self):
        self.client = Client()

    def test_test_endpoint(self):
        response = self.client.get("/api/test/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Backend working")

    @patch("api.views.process_pdfs")
    def test_upload_pdf_success(self, mock_process):
        mock_process.return_value = None
        
        from io import BytesIO
        fake_file = BytesIO(b"fake pdf content")
        fake_file.name = "test.pdf"
        
        response = self.client.post("/api/upload/", {
            "session_id": "test-session-123",
            "files": fake_file
        }, format="multipart")
        
        self.assertEqual(response.status_code, 200)
        self.assertIn("successfully", response.json()["message"])

    def test_upload_pdf_no_session_id(self):
        response = self.client.post("/api/upload/", {
            "files": []
        }, format="multipart")
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_upload_pdf_no_files(self):
        response = self.client.post("/api/upload/", {
            "session_id": "test-session-123"
        }, format="multipart")
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_chat_no_query(self):
        response = self.client.post("/api/chat/", {
            "session_id": "test-session"
        }, format="json")
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_chat_no_session_id(self):
        response = self.client.post("/api/chat/", {
            "query": "Test query"
        }, format="json")
        
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    @patch("api.views._retrieve_documents")
    def test_chat_no_documents(self, mock_retrieve):
        mock_retrieve.return_value = (None, None)

        response = self.client.post("/api/chat/", {
            "query": "What is revenue?",
            "session_id": "test-session"
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["answer"], "No data found")

    @patch("api.views._get_ai_response")
    @patch("api.views._retrieve_documents")
    def test_chat_success(self, mock_retrieve, mock_ai):
        docs = [
            SimpleNamespace(content="Revenue was 100 dollars.", page_number=1),
            SimpleNamespace(content="Profit increased.", page_number=2),
        ]
        mock_retrieve.return_value = (docs, "report.pdf")
        mock_ai.return_value = "Revenue was 100 dollars."

        response = self.client.post("/api/chat/", {
            "query": "Revenue",
            "session_id": "test-session",
            "history": [{"role": "user", "content": "Hi"}]
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["answer"], "Revenue was 100 dollars.")
        self.assertEqual(response.json()["file_used"], "report.pdf")
        self.assertTrue(response.json()["sources"])

    @patch("api.views._retrieve_documents")
    def test_chat_applicant_name_branch(self, mock_retrieve):
        docs = [SimpleNamespace(content="M/s Example Industries", page_number=3)]
        mock_retrieve.return_value = (docs, "application.pdf")

        response = self.client.post("/api/chat/", {
            "query": "What is the applicant name?",
            "session_id": "test-session"
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200)
        self.assertIn("M/s Example Industries", response.json()["answer"])
        self.assertEqual(response.json()["file_used"], "application.pdf")


class TestViewHelpers(TestCase):
    def test_extract_best_sentence_returns_matching_sentence(self):
        result = views.extract_best_sentence("Intro. Revenue increased this year. End.", "revenue")
        self.assertEqual(result, "Revenue increased this year")

    def test_extract_best_sentence_falls_back_to_first_200_chars(self):
        text = "A" * 250
        self.assertEqual(views.extract_best_sentence(text, "missing"), "A" * 200)

    def test_build_sources_deduplicates_and_stitches_chunks(self):
        docs = [
            SimpleNamespace(content="Revenue increased.", page_number=1),
            SimpleNamespace(content="Revenue increased.", page_number=1),
            SimpleNamespace(content="Profit improved.", page_number=2),
        ]

        sources = views._build_sources(docs, "profit")

        self.assertEqual(len(sources), 4)
        self.assertEqual(sources[0]["page"], 1)
        self.assertEqual(sources[1]["highlight"], "Profit improved")

    def test_build_context_and_history(self):
        context = views._build_context([
            {"page": 1, "content": "Revenue increased."},
            {"page": 2, "content": "Profit improved."},
        ])
        history = views._build_chat_history([
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi"},
        ])

        self.assertIn("(Page 1): Revenue increased.", context)
        self.assertEqual(history, "User: Hello\nAssistant: Hi\n")

    @patch("api.views.client")
    def test_analyze_chart_returns_model_content(self, mock_client):
        mock_message = SimpleNamespace(content="Chart is increasing.")
        mock_choice = SimpleNamespace(message=mock_message)
        mock_client.chat.completions.create.return_value = SimpleNamespace(choices=[mock_choice])

        result = views.analyze_chart(b"image-bytes")

        self.assertEqual(result, "Chart is increasing.")
        mock_client.chat.completions.create.assert_called_once()

    @patch("api.views.client")
    def test_get_ai_response_returns_model_content(self, mock_client):
        mock_message = SimpleNamespace(content="Final answer.")
        mock_choice = SimpleNamespace(message=mock_message)
        mock_client.chat.completions.create.return_value = SimpleNamespace(choices=[mock_choice])

        result = views._get_ai_response("question", "context", "history")

        self.assertEqual(result, "Final answer.")
        mock_client.chat.completions.create.assert_called_once()

    @patch("api.views.Document")
    @patch("api.views.HuggingFaceEmbeddings")
    def test_retrieve_documents_groups_by_best_file(self, mock_embeddings, mock_document):
        mock_embeddings.return_value.embed_query.return_value = [0.1, 0.2]
        docs = [
            SimpleNamespace(file_name="a.pdf", distance=0.8),
            SimpleNamespace(file_name="b.pdf", distance=0.2),
            SimpleNamespace(file_name="b.pdf", distance=0.4),
        ]
        mock_document.objects.filter.return_value.annotate.return_value.order_by.return_value.__getitem__.return_value = docs

        best_docs, best_file = views._retrieve_documents("query", "session")

        self.assertEqual(best_file, "a.pdf")
        self.assertEqual(best_docs, [docs[0]])

    @patch("api.views.Document")
    @patch("api.views.HuggingFaceEmbeddings")
    def test_retrieve_documents_returns_none_when_empty(self, mock_embeddings, mock_document):
        mock_embeddings.return_value.embed_query.return_value = [0.1, 0.2]
        mock_document.objects.filter.return_value.annotate.return_value.order_by.return_value.__getitem__.return_value = []

        self.assertEqual(views._retrieve_documents("query", "session"), (None, None))


class TestRagHelpers(TestCase):
    def test_clean_text_removes_nulls_and_strips(self):
        self.assertEqual(rag.clean_text("  a\x00b  "), "ab")

    @patch("api.rag.fitz.open")
    def test_extract_images_from_pdf(self, mock_open):
        file_obj = MagicMock()
        file_obj.read.return_value = b"pdf"
        page = MagicMock()
        page.get_images.return_value = [(7,)]
        doc = MagicMock()
        doc.__len__.return_value = 1
        doc.__getitem__.return_value = page
        doc.extract_image.return_value = {"image": b"image"}
        mock_open.return_value = doc

        self.assertEqual(rag.extract_images_from_pdf(file_obj), [(b"image", 1)])

    @patch("api.rag.Document")
    def test_save_page_chunks_skips_short_chunks_and_saves_valid_chunks(self, mock_document):
        splitter = MagicMock()
        splitter.split_text.return_value = ["bad", "valid content"]
        embeddings = MagicMock()
        embeddings.embed_query.return_value = [0.1] * 384
        file_obj = SimpleNamespace(name="report.pdf")

        rag._save_page_chunks(" valid content ", 4, file_obj, "session", splitter, embeddings)

        mock_document.objects.create.assert_called_once_with(
            content="valid content",
            embedding=[0.1] * 384,
            session_id="session",
            file_name="report.pdf",
            page_number=4
        )

    @patch("api.rag._save_page_chunks")
    @patch("api.rag.PdfReader")
    def test_process_text_content_ignores_empty_pages(self, mock_reader, mock_save):
        empty_page = MagicMock()
        empty_page.extract_text.return_value = ""
        text_page = MagicMock()
        text_page.extract_text.return_value = "Page text"
        mock_reader.return_value.pages = [empty_page, text_page]

        rag._process_text_content(SimpleNamespace(name="report.pdf"), "session", "splitter", "embeddings")

        mock_save.assert_called_once()
        self.assertEqual(mock_save.call_args.args[1], 2)

    @patch("api.rag.Document")
    @patch("api.rag.extract_images_from_pdf")
    def test_process_chart_images_saves_long_insights(self, mock_extract, mock_document):
        mock_extract.return_value = [(b"image", 5)]
        embeddings = MagicMock()
        embeddings.embed_query.return_value = [0.2] * 384

        file_obj = SimpleNamespace(name="report.pdf")

        rag._process_chart_images(file_obj, "session", lambda image: "A useful chart insight", embeddings)

        mock_document.objects.create.assert_called_once_with(
            content="A useful chart insight",
            embedding=[0.2] * 384,
            session_id="session",
            file_name="report.pdf",
            page_number=5
        )

    @patch("api.rag.print")
    @patch("api.rag.extract_images_from_pdf")
    def test_process_chart_images_logs_exceptions(self, mock_extract, mock_print):
        mock_extract.side_effect = ValueError("broken")

        rag._process_chart_images("file", "session", lambda image: "insight", MagicMock())

        mock_print.assert_called_once()

    @patch("api.rag._process_chart_images")
    @patch("api.rag._process_text_content")
    @patch("api.rag.print")
    @patch("api.rag.RecursiveCharacterTextSplitter")
    @patch("api.rag.HuggingFaceEmbeddings")
    def test_process_pdfs_processes_text_and_images(
        self,
        mock_embeddings,
        mock_splitter,
        mock_print,
        mock_text,
        mock_images,
    ):
        file_obj = SimpleNamespace(name="report.pdf")

        rag.process_pdfs([file_obj], "session", lambda image: "insight")

        mock_text.assert_called_once_with(
            file_obj,
            "session",
            mock_splitter.return_value,
            mock_embeddings.return_value
        )
        mock_images.assert_called_once()
