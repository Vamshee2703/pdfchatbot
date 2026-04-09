from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch, MagicMock
import json


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
