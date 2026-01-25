from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    useremail = models.EmailField(unique=True)

    is_verified = models.BooleanField(default=False)

    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def otp_is_expired(self):
        if not self.otp_created_at:
            return True
        return timezone.now() > self.otp_created_at + timedelta(minutes=5)

    def clear_otp(self):
        self.otp = None
        self.otp_created_at = None
        self.save(update_fields=["otp", "otp_created_at"])

    def __str__(self):
        return self.useremail
