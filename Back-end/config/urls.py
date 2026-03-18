from django.contrib import admin
from django.urls import include, path
from terminal.views import control_lab
from DjangoBackend.views import (
    signin,
    signup,
    send_otp,
    verify_otp,
    protected_view,
    resetpassword,
    forgotpassword,
    gemini_chat,
)

urlpatterns = [
    # Admin Panel
    path("admin/", admin.site.urls),

    # Google OAuth (django-allauth)
    path("accounts/", include("allauth.urls")),

    # DjangoBackend extra routes (logout, current user)
    path("auth/", include("DjangoBackend.urls")),
    # ---------------- API ROUTES ----------------
    path("api/signup/", signup, name="signup"),
    path("api/signin/", signin, name="signin"),
    path("api/send-otp/", send_otp, name="send_otp"),
    path("api/verify-otp/", verify_otp, name="verify_otp"),
    path("api/protected/", protected_view, name="protected"),
    path("api/forgot-password/", forgotpassword, name="forgot_password"),
    path("api/reset-password/", resetpassword, name="reset_password"),
    path("api/chatbot/", gemini_chat, name="chatbot"),
    path('api/lab/control/', control_lab, name='control_lab'),
]