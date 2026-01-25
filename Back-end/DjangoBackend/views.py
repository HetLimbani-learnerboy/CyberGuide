import random
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated  # ✅ fixed spelling
from .models import Profile


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    profile = request.user.profile

    if not profile.is_verified:
        return JsonResponse({"message": "Email not verified. Access denied."}, status=403)

    return JsonResponse({"message": "Access granted"}, status=200)


@api_view(["POST"])
def signup(request):
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not all([name, email, password]):
        return JsonResponse({"message": "All fields are required"}, status=400)

    if User.objects.filter(username=email).exists():
        return JsonResponse({"message": "Email already registered"}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=name
            )
            Profile.objects.create(user=user, useremail=email, is_verified=False)
        return JsonResponse({"message": "Account created successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"message": f"Database error: {str(e)}"}, status=500)


@api_view(["POST"])
def send_otp(request):
    email = request.data.get("email")

    if not email:
        return JsonResponse({"message": "Email is required"}, status=400)

    try:
        profile = Profile.objects.get(useremail=email)

        otp = str(random.randint(100000, 999999))

        profile.otp = otp
        profile.otp_created_at = timezone.now()
        profile.is_verified = False
        profile.save(update_fields=["otp", "otp_created_at", "is_verified"])

        send_mail(
                "CyberGuide - Security OTP",
                f"Your verification code is: {otp}. Valid for 5 minutes.",
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
        )
        return JsonResponse({"message": "OTP sent successfully"}, status=200)
    except Profile.DoesNotExist:
        return JsonResponse({"message": "Email not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": "Mail server error"}, status=500)


@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return JsonResponse({"message": "Email and OTP are required"}, status=400)

    try:
        profile = Profile.objects.get(useremail=email)
    except Profile.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)

    if profile.otp_is_expired():
        profile.clear_otp()
        return JsonResponse({"message": "OTP expired. Please request again."}, status=400)
    if str(profile.otp) == str(otp):
        profile.is_verified = True
        profile.clear_otp()
        profile.save(update_fields=["is_verified"])
        return JsonResponse({"message": "OTP verified successfully"}, status=200)

    return JsonResponse({"message": "Invalid OTP"}, status=400)
