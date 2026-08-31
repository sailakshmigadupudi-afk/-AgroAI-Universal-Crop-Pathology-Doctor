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
    page_title="AgroAI - Universal Plant Doctor", 
    page_icon="🌿", 
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# 1. Custom CSS Theme
# ==========================================
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;600&family=Noto+Sans+Devanagari:wght@400;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', 'Noto Sans Telugu', 'Noto Sans Devanagari', sans-serif;
    }

    .hero-container {
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        border-radius: 18px;
        padding: 2.2rem;
        color: white;
        margin-bottom: 2rem;
        box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.25);
    }
    .hero-title {
        font-size: 2.3rem;
        font-weight: 700;
        margin-bottom: 0.3rem;
    }
    .hero-subtitle {
        font-size: 1.05rem;
        opacity: 0.95;
    }

    .action-badge {
        display: inline-block;
        font-size: 0.82rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.25rem 0.65rem;
        border-radius: 6px;
        margin-bottom: 0.4rem;
    }
    .badge-immediate { background: #fee2e2; color: #dc2626; }
    .badge-organic { background: #dcfce7; color: #15803d; }
    .badge-prevention { background: #e0f2fe; color: #0369a1; }

    .action-box {
        background: #f8fafc;
        border-left: 4px solid #cbd5e1;
        padding: 0.95rem 1.15rem;
        border-radius: 0 10px 10px 0;
        margin-bottom: 0.9rem;
        font-size: 0.96rem;
    }
    .action-box.immediate { border-left-color: #ef4444; }
    .action-box.organic { border-left-color: #22c55e; }
    .action-box.prevention { border-left-color: #0ea5e9; }
</style>
""", unsafe_allow_html=True)

# ==========================================
# 2. Language & API Configuration
# ==========================================
LANGUAGE_CONFIG = {
    "English": {
        "lang_code": "en",
        "title": "🌿 AgroAI Plant Clinic",
        "subtitle": "Zero-shot multi-crop pathology detection and voice prescriptions",
        "input_hdr": "📸 1. Input Leaf Specimen",
        "report_hdr": "🩺 2. Pathology Report",
        "species_label": "Detected Crop",
        "condition_label": "Diagnosis",
        "immediate_lbl": "Immediate Action",
        "organic_lbl": "Organic Remedy",
        "prevention_lbl": "Long-term Prevention",
        "audio_lbl": "🔊 Voice Prescription",
        "healthy_msg": "🌱 **Optimal Condition:** Specimen is healthy with no visible infection.",
        "infected_msg": "⚠️ **Pathology Detected:** Infection identified on specimen.",
        "upload_txt": "Upload Photo",
        "camera_txt": "Live Camera"
    },
    "Telugu (తెలుగు)": {
        "lang_code": "te",
        "title": "🌿 ఆగ్రో AI - పంట వ్యాధి నిపుణుడు",
        "subtitle": "పంట వ్యాధుల గుర్తింపు మరియు వాయిస్ సూచనలు",
        "input_hdr": "📸 1. ఆకు ఫోటోను సమర్పించండి",
        "report_hdr": "🩺 2. వ్యాధి నిర్ధారణ నివేదిక",
        "species_label": "గుర్తించిన పంట",
        "condition_label": "వ్యాధి నిర్ధారణ",
        "immediate_lbl": "తక్షణ చర్య",
        "organic_lbl": "సేంద్రీయ చికిత్స",
        "prevention_lbl": "నివారణ చర్యలు",
        "audio_lbl": "🔊 వాయిస్ సూచనలు (Voice Prescription)",
        "healthy_msg": "🌱 **ఆరోగ్యకరమైన పంట:** పంటలో ఎటువంటి వ్యాధి లక్షణాలు కనిపించలేదు.",
        "infected_msg": "⚠️ **వ్యాధి గుర్తించబడింది:** పంటపై సంక్రమణ కనుగొనబడింది.",
        "upload_txt": "ఫోటో అప్‌లోడ్ చేయండి",
        "camera_txt": "లైవ్ కెమెరా"
    },
    "Hindi (हिन्दी)": {
        "lang_code": "hi",
        "title": "🌿 एग्रो AI - पौधा एवं फसल डॉक्टर",
        "subtitle": "फसल रोग पहचान और ऑडियो उपचार परामर्श",
        "input_hdr": "📸 1. पत्ती की फोटो अपलोड करें",
        "report_hdr": "🩺 2. रोग निदान रिपोर्ट",
        "species_label": "पहचानी गई फसल",
        "condition_label": "रोग का नाम",
        "immediate_lbl": "त्वरित कदम",
        "organic_lbl": "जैविक उपचार",
        "prevention_lbl": "दीर्घकालिक रोकथाम",
        "audio_lbl": "🔊 ऑडियो परामर्श (Voice Prescription)",
        "healthy_msg": "🌱 **उत्कृष्ट स्थिति:** फसल स्वस्थ है, कोई रोग नहीं पाया गया।",
        "infected_msg": "⚠️ **रोग का पता चला:** फसल पर संक्रमण की पहचान की गई है।",
        "upload_txt": "फोटो अपलोड करें",
        "camera_txt": "लाइव कैमरा"
    }
}

# Sidebar settings
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80", use_container_width=True)
    
    selected_language_name = st.selectbox(
        "🌐 Choose Language / భాష / भाषा",
        options=["English", "Telugu (తెలుగు)", "Hindi (हिन्दी)"]
    )
    ui_lang = LANGUAGE_CONFIG[selected_language_name]

    api_key = st.text_input("🔑 Gemini API Key", type="password")
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY", "")

def get_ai_client(key):
    return genai.Client(api_key=key)

@st.cache_data
def generate_audio_cached(text, lang_code):
    tts = gTTS(text=text, lang=lang_code, slow=False)
    audio_bytes = io.BytesIO()
    tts.write_to_fp(audio_bytes)
    audio_bytes.seek(0)
    return audio_bytes.getvalue()

# ==========================================
# 3. Vision Diagnosis with Target Language
# ==========================================
def analyze_crop_with_vlm(image: Image.Image, client: genai.Client, target_language: str):
    system_instruction = (
        f"You are an expert plant pathologist and agronomist. Analyze the provided leaf or plant image. "
        f"Identify the crop/plant species and determine if it is healthy or diseased. "
        f"Generate ALL explanations and values in the requested language: {target_language}. "
        f"Respond strictly with a JSON object matching this schema:\n"
        "{\n"
        '  "crop": "Crop Name in requested language",\n'
        '  "status": "Disease Name or Healthy in requested language",\n'
        '  "is_healthy": true or false,\n'
        '  "confidence": "e.g. 96%",\n'
        '  "action": "Immediate pruning, isolation, or field action required in requested language",\n'
        '  "organic": "Specific organic remedy or treatment in requested language",\n'
        '  "prevention": "Long-term prevention and cultural practices in requested language",\n'
        '  "spoken_summary": "A smooth, natural 2-sentence spoken summary of the diagnosis and treatment in the requested language for text-to-speech audio output"\n'
        "}"
    )

    candidate_models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]
    last_error = None
    
    for model_name in candidate_models:
        for _ in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[image, f"Diagnose this plant leaf in {target_language}. Return strictly JSON."],
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json"
                    )
                )
                return json.loads(response.text)
            except Exception as e:
                last_error = e
                err_str = str(e)
                if "503" in err_str or "429" in err_str or "UNAVAILABLE" in err_str:
                    time.sleep(1.2)
                    continue
                break

    raise last_error

# ==========================================
# 4. Main User Interface
# ==========================================
st.markdown(f"""
<div class="hero-container">
    <div class="hero-title">{ui_lang['title']}</div>
    <div class="hero-subtitle">{ui_lang['subtitle']}</div>
</div>
""", unsafe_allow_html=True)

col1, col2 = st.columns([1, 1.1], gap="large")

with col1:
    st.markdown(f"### {ui_lang['input_hdr']}")
    input_mode = st.segmented_control(
        "Input Method", 
        options=[ui_lang['upload_txt'], ui_lang['camera_txt']], 
        default=ui_lang['upload_txt']
    )
    
    selected_image = None
    if input_mode == ui_lang['upload_txt']:
        uploaded_file = st.file_uploader("Upload leaf image", type=["jpg", "jpeg", "png"], label_visibility="collapsed")
        if uploaded_file:
            selected_image = uploaded_file
    else:
        camera_file = st.camera_input("Capture leaf", label_visibility="collapsed")
        if camera_file:
            selected_image = camera_file

    if selected_image:
        image = Image.open(selected_image).convert("RGB")
        st.image(image, caption="Specimen preview", use_container_width=True)

with col2:
    st.markdown(f"### {ui_lang['report_hdr']}")
    if selected_image:
        if not api_key:
            st.warning("⚠️ Please provide a Gemini API Key in the left sidebar to generate diagnosis.")
        else:
            with st.spinner(f"🔬 Analyzing leaf pathology ({selected_language_name})..."):
                try:
                    client = get_ai_client(api_key)
                    result = analyze_crop_with_vlm(image, client, selected_language_name)

                    crop = result.get("crop", "Plant")
                    status = result.get("status", "Healthy")
                    is_healthy = result.get("is_healthy", False)
                    confidence = result.get("confidence", "95%")
                    action = result.get("action", "")
                    organic = result.get("organic", "")
                    prevention = result.get("prevention", "")
                    spoken_summary = result.get("spoken_summary", f"{crop}. {status}. {action}")

                    # Metric Display Cards
                    m1, m2 = st.columns(2)
                    with m1:
                        st.metric(label=ui_lang['species_label'], value=crop)
                    with m2:
                        st.metric(label=ui_lang['condition_label'], value=status, delta=f"{confidence}")

                    # Status Banner
                    if is_healthy or "healthy" in str(status).lower() or "ఆరోగ్య" in str(status) or "स्वस्थ" in str(status):
                        st.success(ui_lang['healthy_msg'])
                    else:
                        st.error(f"{ui_lang['infected_msg']} — **{status}**")

                    # Structured Action Plan
                    st.markdown("#### 📋 Action Plan")
                    st.markdown(f"""
                    <div class="action-box immediate">
                        <span class="action-badge badge-immediate">{ui_lang['immediate_lbl']}</span><br>
                        {action}
                    </div>
                    <div class="action-box organic">
                        <span class="action-badge badge-organic">{ui_lang['organic_lbl']}</span><br>
                        {organic}
                    </div>
                    <div class="action-box prevention">
                        <span class="action-badge badge-prevention">{ui_lang['prevention_lbl']}</span><br>
                        {prevention}
                    </div>
                    """, unsafe_allow_html=True)

                    # Multi-language Voice Audio
                    st.markdown(f"#### {ui_lang['audio_lbl']}")
                    audio_bytes = generate_audio_cached(spoken_summary, ui_lang['lang_code'])
                    st.audio(audio_bytes, format="audio/mp3")

                except Exception as e:
                    st.error(f"Diagnosis could not be completed: {e}")
    else:
        st.info("👈 Upload or capture a leaf specimen to view the diagnosis.")
