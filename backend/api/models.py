from django.db import models
from pgvector.django import VectorField


class Document(models.Model):
    content = models.TextField()
    embedding = VectorField(dimensions=384)
    session_id = models.CharField(max_length=255, default="")
    file_name = models.CharField(max_length=255, default="")
    page_number = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)