from pyexpat import model
import random
import json
import subprocess
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, logout
from django.utils.html import strip_tags
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from allauth.account.models import EmailAddress
from rest_framework.response import Response
from .gemini_service import ask_gemini
from .models import Note
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
                first_name=name,    
            )
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
        if EmailAddress.objects.filter(email=email, verified=True).exists():
            return JsonResponse({"message": "Email registered via Google OAuth. Please use Google Sign-In."}, status=400)
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
    
@api_view(["POST"])
def forgotpassword(request):
    email = request.data.get("email")
    if not email:
        return JsonResponse({"message": "Email is required"}, status=400)
    if EmailAddress.objects.filter(email=email, verified=True).exists():
        return JsonResponse({"message": "Email registered via Google OAuth. Please use Google Sign-In."}, status=400)
    try:
        user = User.objects.get(username=email)
        profile = user.profile
        otp = str(random.randint(100000, 999999))
        
        profile.otp = otp
        profile.otp_created_at = timezone.now()
        profile.save(update_fields=["otp", "otp_created_at"])
        subject = "🛡️ CyberGuide - Password Reset Code"
        html_message = f"""
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; background-color: #020408; font-family: Arial, sans-serif; color: #ffffff;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020408; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <table width="400" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a1022; border: 1px solid #38bdf8; border-radius: 15px; padding: 40px; text-align: center;">
                            <tr>
                                <td style="padding-bottom: 20px;">
                                    <h1 style="color: #38bdf8; margin: 0; font-size: 24px; letter-spacing: 2px;">CYBER GUIDE</h1>
                                    <p style="color: #94a3b8; font-size: 14px;">Security Protocol: Password Reset</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 0;">
                                    <div style="background: rgba(56, 189, 248, 0.1); border: 1px dashed #38bdf8; border-radius: 10px; padding: 20px; font-size: 32px; font-weight: bold; color: #38bdf8; letter-spacing: 5px;">
                                        {otp}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="color: #cbd5e1; font-size: 14px; line-height: 1.5; padding-top: 20px;">
                                    This code is valid for <strong>5 minutes</strong>. <br>
                                    If you did not request this reset, please secure your account immediately.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )
        return JsonResponse({"message": "OTP sent successfully"}, status=200)
        
    except User.DoesNotExist:
        return JsonResponse({"message": "Check email and try again"}, status=404)
    except Exception as e:
        return JsonResponse({"message": f"Mail service error: {str(e)}"}, status=500)
    
@api_view(["POST"])
def verifyotp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return JsonResponse({"message": "Email and OTP are required"}, status=400)

    try:
        user = User.objects.get(username=email)  
        profile = user.profile
        if profile.otp_is_expired():
            return JsonResponse({"message": "OTP expired"}, status=400)
        if profile.otp and str(profile.otp) == str(otp):
            return JsonResponse({"message": "OTP verified successfully"}, status=200)

        return JsonResponse({"message": "Invalid OTP"}, status=400)

    except User.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)

@api_view(["POST"])
def resetpassword(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    new_password = request.data.get("new_password")

    if not all([email, otp, new_password]):
        return JsonResponse({"message": "All fields are required"}, status=400)

    try:
        user = User.objects.get(username=email)
        profile = user.profile
        print(f"Current Time: {timezone.now()}")
        print(f"OTP Created At: {profile.otp_created_at}")
        profile.clear_otp()
        user.set_password(new_password)
        user.save() 
        return JsonResponse({"message": "Password reset successful"}, status=200)
    
    except User.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)
    

@api_view(["POST"])
def gemini_chat(request):
    prompt = request.data.get("prompt")
    if not prompt or not prompt.strip():
        return JsonResponse(
            {"message": "Please enter a question for the AI mentor."},
            status=400
        )
    try:
        response_text = ask_gemini(prompt.strip())
        if "AI is currently busy" in response_text:
            return JsonResponse({"response": response_text}, status=429)

        return JsonResponse({"response": response_text}, status=200)

    except Exception as e:
        return JsonResponse(
            {"message": "Gemini connection error", "error": str(e)},
            status=500
        )
        
     

# def current_user(request):

#     print("Request user:", request.user)
#     print("Authenticated:", request.user.is_authenticated)

    # Case 1: Authenticated user
    # if request.user.is_authenticated:
    #     email = request.user.email

    #     try:
    #         profile = Profile.objects.get(useremail=email)

    #         return JsonResponse({
    #             "name": profile.name,
    #             "email": profile.useremail,
    #             "status": "login_success"
    #         })

    #     except Profile.DoesNotExist:
    #         return JsonResponse({
    #             "name": request.user.first_name or request.user.username,
    #             "email": email,
    #             "status": "profile_not_found"
    #         })
    # email= request.user.email
    # profile=Profile.objects.get(useremail=email)
    # return JsonResponse({
    #     "name": profile.name,
    #     "email": profile.useremail,
    #     "message": "User is authenticated",
    #     # "status": "not_authenticated"
    # })


CURRENT_NAME = None
CURRENT_EMAIL = None

def current_user(request):
    global CURRENT_NAME, CURRENT_EMAIL

    email = request.user.email
    profile = Profile.objects.get(useremail=email)

    CURRENT_NAME = profile.name
    CURRENT_EMAIL = profile.useremail

    return JsonResponse({
        "name": CURRENT_NAME,
        "email": CURRENT_EMAIL,
        "message": "User is authenticated"
    })
    
def getuserdata(request):
    global CURRENT_NAME, CURRENT_EMAIL

    return JsonResponse({
        "name": CURRENT_NAME,
        "email": CURRENT_EMAIL
    })   

def logout_view(request):
    global CURRENT_NAME, CURRENT_EMAIL

    logout(request)

    CURRENT_NAME = None
    CURRENT_EMAIL = None

    return JsonResponse({
        "message": "Logged out successfully"
    })


@api_view(['GET'])
def get_notes(request, email):
    notes = Note.objects.filter(email=email).order_by('-created_at')

    data = [
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "created_at": note.created_at
        }
        for note in notes
    ]
    return Response(data)


# ADDNOTE
@api_view(['POST'])
def add_note(request):
    email = request.data.get("email")
    title = request.data.get("title", "")
    content = request.data.get("content", "")

    if not email:
        return Response({"error": "Email required"}, status=400)

    note = Note.objects.create(
        email=email,
        title=title,
        content=content
    )

    return Response({
        "status": "success",
        "message": "Note created",
        "id": note.id
    }, status=201)


# DELETENOTE
@api_view(['DELETE'])
def delete_note(request, note_id):
    try:
        email = request.data.get("email")

        note = Note.objects.get(id=note_id, email=email)
        note.delete()

        return Response({
            "status": "success",
            "message": "Note deleted"
        })

    except Note.DoesNotExist:
        return Response({"error": "Note not found"}, status=404)


# UPDATENOTE
@api_view(['PUT'])
def update_note(request, note_id):
    try:
        email = request.data.get("email")

        note = Note.objects.get(id=note_id, email=email)

        note.title = request.data.get("title", note.title)
        note.content = request.data.get("content", note.content)
        note.save()

        return Response({
            "status": "success",
            "message": "Note updated"
        })

    except Note.DoesNotExist:
        return Response({"error": "Note not found"}, status=404)