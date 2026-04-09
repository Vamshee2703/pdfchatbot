from django.urls import path
from .views import upload_pdf, chat, test

urlpatterns = [
    path("test/", test),
    path("upload/", upload_pdf),
    path("chat/", chat),
]