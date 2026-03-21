import os
import time
import random
import google.generativeai as genai
from dotenv import load_dotenv
from django.utils import timezone

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=API_KEY)

# ✅ List models in order of priority (Highest Quota First)
MODELS_TO_TRY = [
    "models/gemini-2.5-flash-lite", # Best for Free Tier (15 RPM)
    "models/gemini-2.5-flash",      # High Intelligence (10 RPM)
    "models/gemini-2.0-flash",      # Very Fast
    "models/gemini-1.5-flash"       # Reliable Fallback
]

def get_gen_model(model_name):
    """Initializes a specific model with system instructions."""
    return genai.GenerativeModel(
        model_name=model_name,
        system_instruction=(
            "You are the CyberGuide AI Mentor. "
            "Provide technical, concise, and safe cybersecurity advice. "
            "Keep responses under 200 words and use Markdown formatting."
        )
    )

def ask_gemini(prompt: str):
    """
    Tries multiple models sequentially. If one hits a rate limit,
    it immediately tries the next one in the list.
    """
    last_error = ""

    for model_id in MODELS_TO_TRY:
        try:
            print(f"[{timezone.now()}] Attempting with: {model_id}")
            current_model = get_gen_model(model_id)
            
            response = current_model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 350
                }
            )

            if response.candidates and response.text:
                return response.text.strip()
            
            return "Safety filters blocked this response. Try rephrasing."

        except Exception as e:
            error_msg = str(e).lower()
            last_error = error_msg
            
            # If it's a Rate Limit (429), don't wait—just try the NEXT model
            if "429" in error_msg or "quota" in error_msg:
                print(f"[{timezone.now()}] {model_id} Quota hit. Trying fallback...")
                continue 
            
            # If it's a different error, log it and move on
            print(f"Error with {model_id}: {e}")
            continue

    # If all models in the list fail
    return f"All models are currently busy. Please wait 60 seconds. (Last Error: {last_error})"