import os
from pyexpat import model
import random
import json
import subprocess
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
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
from .models import Note, Feedback, UserResource, Profile
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    profile = request.user.profile
    if not profile.is_verified:
        return JsonResponse({"message": "Email not verified. Access denied."}, status=403)

    return JsonResponse({"message": "Access granted"}, status=200)


@api_view(["POST"])
def contactus(request):
    name = request.data.get("name")
    email = request.data.get("email")
    subject = request.data.get("subject")
    message = request.data.get("message")

    if not name or not email or not message:
        return Response({"error": "All fields are required"}, status=400)

    try:
        subject_line = f"CyberGuide Contact: {subject}"

        text_content = f"""
New Contact Form Submission

Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}
"""

        html_content = f"""
        <div style="font-family: Arial, sans-serif; background:#020617; padding:30px;">
            <div style="max-width:600px;margin:auto;background:#0f172a;padding:25px;border-radius:12px;border:1px solid #38bdf8;">
                
                <h2 style="color:#38bdf8;text-align:center;">📩 New Contact Message</h2>
                
                <div style="margin-top:20px;color:#e2e8f0;">
                    <p><strong>👤 Name:</strong> {name}</p>
                    <p><strong>📧 Email:</strong> {email}</p>
                    <p><strong>📌 Subject:</strong> {subject}</p>
                </div>

                <div style="margin-top:20px;padding:15px;background:#020617;border-radius:8px;color:#e2e8f0;">
                    <p style="margin:0;"><strong>💬 Message:</strong></p>
                    <p style="margin-top:10px;line-height:1.6;">{message}</p>
                </div>

                <div style="margin-top:25px;text-align:center;">
                    <p style="font-size:12px;color:#94a3b8;">
                        Sent via CyberGuide Contact System
                    </p>
                </div>

            </div>
        </div>
        """

        email_msg = EmailMultiAlternatives(
            subject=subject_line,
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[settings.EMAIL_HOST_USER],
        )

        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()

        return Response({
            "status": "success",
            "message": "Email sent successfully"
        })

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=500)
        
@api_view(["POST"])
def add_feedback(request):
    name = request.data.get("name")
    email = request.data.get("email")
    rating = request.data.get("rating")
    comment = request.data.get("comment")

    if not name or not email or not rating or not comment:
        return Response({"error": "All fields required"}, status=400)

    fb = Feedback.objects.create(
        name=name,
        email=email,
        rating=rating,
        comment=comment
    )

    return Response({"status": "success"})


@api_view(["GET"])
def get_feedbacks(request):
    feedbacks = Feedback.objects.all().order_by("-created_at")

    data = [
        {
            "name": fb.name,
            "email": fb.email,
            "rating": fb.rating,
            "comment": fb.comment
        }
        for fb in feedbacks
    ]

    return Response({
        "status": "success",
        "data": data
    })

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
    

@csrf_exempt 
def gemini_chat(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_prompt = data.get("prompt")
            
            if not user_prompt:
                return JsonResponse({"error": "No prompt provided"}, status=400)
            
            ai_response = ask_gemini(user_prompt)
            
            return JsonResponse({"response": ai_response})
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
            
    return JsonResponse({"error": "Only POST allowed"}, status=405)
        

from django.http import JsonResponse
from django.contrib.auth import logout 
from .models import Profile

CURRENT_NAME = None
CURRENT_EMAIL = None

def current_user(request):
    global CURRENT_NAME, CURRENT_EMAIL
    user = request.user

    email = getattr(user, "email", None)
    username = getattr(user, "username", None)

    if not user.is_authenticated:
        return JsonResponse({
            "name": None,
            "email": None,
            "message": "User not logged in"
        }, status=200)

    profile, _ = Profile.objects.get_or_create(
        user=user,
        defaults={
            "useremail": email,
            "name": username or "User"
        }
    )

    CURRENT_NAME = profile.name
    CURRENT_EMAIL = profile.useremail

    return JsonResponse({
        "name": profile.name,
        "email": profile.useremail,
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
    

PDF_FOLDER = os.path.join(settings.BASE_DIR, "PDF", "Theory")
LABPDF_FOLDER = os.path.join(settings.BASE_DIR, "PDF", "Lab")


def get_files_from_folder(folder_path, url_prefix):
    files = []

    for file in sorted(os.listdir(folder_path), key=lambda x: x.lower()):
        if file.lower().endswith(".pdf"):
            files.append({
                "name": file,
                "url": f"{url_prefix}/{file}"
            })

    return files


@api_view(['GET'])
def get_pdfs(request):
    if not os.path.exists(PDF_FOLDER):
        return Response({"error": "Theory PDF folder not found"}, status=404)

    files = get_files_from_folder(PDF_FOLDER, "/pdfs/theory")

    return Response({
        "status": "success",
        "data": files
    })


@api_view(['GET'])
def get_labpdfs(request):
    if not os.path.exists(LABPDF_FOLDER):
        return Response({"error": "Lab PDF folder not found"}, status=404)

    files = get_files_from_folder(LABPDF_FOLDER, "/pdfs/lab")

    return Response({
        "status": "success",
        "data": files
    })

from .s3_utils import upload_pdf_to_s3

@csrf_exempt
def upload_resource(request):
    if request.method == "POST":
        try:
            # Files are in request.FILES, text data is in request.POST
            email = request.POST.get("email")
            title = request.POST.get("title")
            pdf_file = request.FILES.get("pdf")

            if not pdf_file or not email:
                return JsonResponse({"error": "Missing required fields"}, status=400)

            # 1. Upload to S3
            # We append a timestamp or use unique names to prevent overwriting
            s3_url = upload_pdf_to_s3(pdf_file, f"uploads/{email}/{pdf_file.name}")

            if s3_url:
                new_resource = UserResource.objects.create(
                    useremail=email,
                    title=title,
                    pdf_url=s3_url
                )
                
                return JsonResponse({
                    "message": "Resource uploaded and saved!",
                    "url": s3_url
                }, status=201)
            
            return JsonResponse({"error": "Failed to upload to S3"}, status=500)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only POST allowed"}, status=405)

def get_user_resources(request):
    # Get email from query parameters: /api/get-user-resources/?email=user@example.com
    email = request.GET.get('email')
    
    if not email:
        return JsonResponse({"error": "Email parameter is required"}, status=400)
    
    try:
        # Filter resources by the provided email
        resources = UserResource.objects.filter(useremail=email).values(
            'id', 'title', 'pdf_url', 'uploaded_at'
        ).order_by('-uploaded_at') 
        
        return JsonResponse({
            "status": "success",
            "data": list(resources)
        }, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)