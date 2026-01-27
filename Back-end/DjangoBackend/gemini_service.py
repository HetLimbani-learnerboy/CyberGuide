import os
import time
import google.generativeai as genai
from dotenv import load_dotenv
from django.utils import timezone

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=API_KEY)

model = genai.GenerativeModel(
    model_name="models/gemini-2.5-flash-lite", 
    system_instruction=(
        "You are the CyberGuide AI Mentor. "
        "Provide technical, concise, and safe cybersecurity advice. "
        "Keep responses under 200 words and use Markdown formatting."
    )
)

def ask_gemini(prompt: str, retries=3):
    """
    Sends a prompt to Gemini with exponential backoff for 429 errors.
    """
    for i in range(retries):
        try:
            response = model.generate_content(prompt)
            if response.text:
                return response.text.strip()
            return "The AI generated an empty response. Please try rephrasing."

        except Exception as e:
            error_msg = str(e).lower()
            if "429" in error_msg or "quota" in error_msg:
                wait_time = (2 ** i) + 3  
                print(f"[{timezone.now()}] Quota exceeded. Retrying in {wait_time}s...")
                time.sleep(wait_time)
                continue
            print(f"Gemini API Error: {e}")
            return f"System Error: {error_msg}"

    return "The AI is currently overloaded. Please wait a minute before trying again."