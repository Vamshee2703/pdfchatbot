from django.urls import path
from .views import signup, employee_me

urlpatterns = [
    path("signup/", signup),          # ✅ REQUIRED
    path("employee/me/", employee_me),
]
