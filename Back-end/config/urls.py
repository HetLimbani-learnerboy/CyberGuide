from django.contrib import admin
from django.urls import path
from DjangoBackend.views import signin, signup, send_otp, verify_otp, protected_view, resetpassword, forgotpassword, verifyotp, gemini_chat

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/signup/", signup, name="signup"),
    path("api/send-otp/", send_otp, name="send_otp"),
    path("api/verify-otp/", verify_otp, name="verify_otp"),
    path("api/protected/", protected_view, name="protected_view"),
    path("api/signin/", signin, name="signin"),
    path("api/forgot-password/", forgotpassword, name="forgot_password"),
    path("api/verify-otp/", verifyotp, name="verifyotp"),
    path("api/reset-password/", resetpassword, name="reset_password"),
    path("api/chatbot/", gemini_chat, name="gemini_chat"),
]
