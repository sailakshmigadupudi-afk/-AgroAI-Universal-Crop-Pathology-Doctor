import io
import json
import os
import time
import streamlit as st
from PIL import Image
from gtts import gTTS
from google import genai
from google.genai import types

st.set_page_config(
    page_title="AgroAI - Universal Crop Doctor", 
    page_icon="🌿", 
    layout="wide"
)

# ==========================================
# 1. API Configuration & Model Setup
# ==========================================
api_key = st.sidebar.text_input("🔑 Enter Gemini API Key:", type="password")

if not api_key:
    api_key = os.getenv("GEMINI_API_KEY", "")

def get_ai_client(key):
    return genai.Client(api_key=key)

# ==========================================
# 2. Audio Generator
# ==========================================
@st.cache_data
def generate_audio_cached(text):
    tts = gTTS(text=text, lang="en", slow=False)
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    return audio_bytes.getvalue()

# ==========================================
# 3. Vision Diagnosis Function (With Backoff & Fallback)
# ==========================================
def analyze_crop_with_vlm(image: Image.Image, client: genai.Client):
    system_instruction = (
        "You are an expert plant pathologist and agronomist. Analyze the provided leaf or plant image. "
        "Identify the crop/plant species and determine if it is healthy or diseased. "
        "Respond ONLY with a valid JSON object matching this schema:\n"
        "{\n"
        '  "crop": "Exact Crop Name (e.g. Cotton, Rice, Tomato, Chili, Mango)",\n'
        '  "status": "Healthy" or "Exact Disease Name (e.g. Bacterial Blight, Leaf Curl Virus)",\n'
        '  "is_healthy": true or false,\n'
        '  "confidence": "e.g. 96%",\n'
        '  "action": "Immediate pruning, isolation, or field action required",\n'
        '  "organic": "Specific organic remedy or treatment (e.g., copper spray, neem oil, bio-fungicide)",\n'
        '  "prevention": "Long-term prevention and cultural practices"\n'
        "}"
    )

    candidate_models = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-2.0-flash"
    ]

    last_error = None
    for model_name in candidate_models:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        image,
                        "Diagnose this plant leaf. Return strictly the requested JSON structure."
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json"
                    )
                )
                return json.loads(response.text)
            except Exception as e:
                last_error = e
                err_str = str(e)
                # If temporary overload or rate limit, wait briefly and retry
                if "503" in err_str or "429" in err_str or "UNAVAILABLE" in err_str:
                    time.sleep(1.5)
                    continue
                break  # If model not found or invalid argument, try next model immediately

    raise last_error

# ==========================================
# 4. Streamlit User Interface
# ==========================================
with st.sidebar:
    st.header("🌿 Universal AgroAI")
    st.markdown("""
    **Zero-Shot Multimodal Vision**
    
    Supports **all agricultural and horticultural crops worldwide**, including:
    * **Cereals:** Rice, Wheat, Corn, Barley, Millets
    * **Cash Crops:** Cotton, Sugarcane, Coffee, Tea, Tobacco
    * **Vegetables:** Tomato, Potato, Chili, Onion, Cabbage
    * **Fruits:** Mango, Banana, Apple, Citrus, Grape, Papaya
    """)

st.title("🌿 AgroAI: Universal Crop & Pathology Doctor")
st.caption("AI-powered crop species recognition, disease pathology, and voice prescriptions for any global plant")

col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("1. Input Leaf Image")
    input_mode = st.radio("Choose Input Mode:", ["Upload Image", "Take Live Photo"], horizontal=True)
    
    selected_image = None
    if input_mode == "Upload Image":
        uploaded_file = st.file_uploader("Upload any crop leaf photo", type=["jpg", "png", "jpeg"])
        if uploaded_file:
            selected_image = uploaded_file
    else:
        camera_file = st.camera_input("Take photo")
        if camera_file:
            selected_image = camera_file

    if selected_image:
        image = Image.open(selected_image).convert("RGB")
        st.image(image, caption="Selected Foliage", use_container_width=True)

with col2:
    st.subheader("2. AI Diagnosis & Prescription")
    if selected_image:
        if not api_key:
            st.warning("⚠️ Please enter your Gemini API Key in the left sidebar to enable universal multi-crop diagnosis.")
        else:
            with st.spinner("Analyzing plant pathology with Gemini Vision..."):
                try:
                    client = get_ai_client(api_key)
                    result = analyze_crop_with_vlm(image, client)

                    crop_name = result.get("crop", "Unknown Plant")
                    disease_name = result.get("status", "Healthy")
                    is_healthy = result.get("is_healthy", False)
                    confidence = result.get("confidence", "95%")
                    action = result.get("action", "Inspect crop regularly.")
                    organic = result.get("organic", "Apply balanced organic compost.")
                    prevention = result.get("prevention", "Maintain proper soil moisture.")

                    metric_col1, metric_col2 = st.columns(2)
                    with metric_col1:
                        st.metric(label="🌱 Detected Crop", value=crop_name)
                    with metric_col2:
                        st.metric(label="🩺 Diagnosis", value=disease_name, delta=confidence)

                    if is_healthy or "healthy" in disease_name.lower():
                        st.success(f"**Status:** {crop_name} is Healthy")
                    else:
                        st.error(f"**Pathology Detected:** {disease_name} on {crop_name}")

                    st.markdown("---")
                    st.markdown("#### 🛠️ Recommended Action Plan")
                    st.markdown(f"**Immediate Action:** {action}")
                    st.markdown(f"**Organic Treatment:** {organic}")
                    st.markdown(f"**Long-term Prevention:** {prevention}")

                    st.markdown("---")
                    st.markdown("#### 🔊 Voice Prescription")
                    spoken_text = (
                        f"Crop identified: {crop_name}. "
                        f"Diagnosis: {disease_name}. "
                        f"Immediate action: {action}. "
                        f"Organic treatment: {organic}."
                    )
                    audio_bytes = generate_audio_cached(spoken_text)
                    st.audio(audio_bytes, format="audio/mp3")

                except Exception as e:
                    st.error(f"Error during diagnosis: {e}")
    else:
        st.info("👈 Upload or snap a leaf photo on the left to diagnose any crop.")