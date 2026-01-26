import random
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils.html import strip_tags
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

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
            # create_user hashes the password using PBKDF2 + SHA256
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=name
            )
            Profile.objects.create(user=user, useremail=email, name=name, is_verified=False)
        return JsonResponse({"message": "Account created successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"message": f"Server Error: {str(e)}"}, status=500)

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
        profile.save(update_fields=["otp", "otp_created_at"])
        subject = "🛡️ CyberGuide - Security Verification Code"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ margin: 0; padding: 0; background-color: #020408; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
                .container {{ width: 100%; padding: 40px 0; background-color: #020408; }}
                .card {{ 
                    max-width: 450px; 
                    margin: 0 auto; 
                    background-color: #0a1022; 
                    border: 1px solid #38bdf8; 
                    border-radius: 16px; 
                    padding: 40px; 
                    text-align: center; 
                    box-shadow: 0 10px 30px rgba(56, 189, 248, 0.15);
                }}
                .header {{ color: #38bdf8; font-size: 28px; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px; }}
                .sub-header {{ color: #ffffff; font-size: 18px; margin-bottom: 30px; opacity: 0.9; }}
                .otp-box {{ 
                    background: rgba(56, 189, 248, 0.1); 
                    border: 2px dashed #38bdf8; 
                    border-radius: 12px; 
                    padding: 20px; 
                    font-size: 36px; 
                    font-weight: bold; 
                    color: #38bdf8; 
                    letter-spacing: 8px; 
                    margin: 20px 0;
                }}
                .info-text {{ color: #94a3b8; font-size: 14px; line-height: 1.6; margin-top: 25px; }}
                .footer {{ color: #64748b; font-size: 11px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <div class="header">CYBER GUIDE</div>
                    <div class="sub-header">Identity Verification</div>
                    <p style="color: #cbd5e1;">Use the following code to secure your session:</p>
                    <div class="otp-box">{otp}</div>
                    <p class="info-text">
                        This code is valid for <b>5 minutes</b>.<br>
                        If you did not request this, please ignore this email or secure your account.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"Your CyberGuide verification code is: {otp}. It is valid for 5 minutes."

        send_mail(
            subject=subject,
            message=text_content,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            html_message=html_content, 
            fail_silently=False,
        )

        return JsonResponse({"message": "OTP sent successfully"}, status=200)

    except Profile.DoesNotExist:
        return JsonResponse({"message": "Email not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Mail service error: {str(e)}"}, status=500)

@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    try:
        profile = Profile.objects.get(useremail=email)
        if profile.otp_is_expired():
            profile.clear_otp()
            return JsonResponse({"message": "OTP expired"}, status=400)

        if str(profile.otp) == str(otp):
            profile.is_verified = True
            profile.clear_otp()
            profile.save(update_fields=["is_verified"])
            return JsonResponse({"message": "Verified"}, status=200)
        return JsonResponse({"message": "Invalid OTP"}, status=400)
    except Profile.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)
    
@api_view(["POST"])
def signin(request):
    email=request.data.get("email")
    password= request.data.get("password")
    if not all([email,password]):
        return JsonResponse({"message":"Email and Password are required"},status=400)
    try:
        user=User.objects.get(username=email)
    except User.DoesNotExist:
        return JsonResponse({"message":"User not found. Please Signup or Verify your email"},status=404)
    auth_user=authenticate(username=email,password=password )
    if auth_user is None:
        return JsonResponse({"message":"Invalid credentials"},status=400)
    profile=user.profile
    if not profile.is_verified:
        auth_user.delete()
        return JsonResponse({"message":"Email not verified. Please Signup Again"},status=403)
    return JsonResponse({
        "message": "Signin successful",
        "user": {
            "name": profile.name,
            "email": profile.useremail,
            "is_verified": profile.is_verified
        }
    }, status=200)