const API_BASE_URL = "/api";

let currentVoiceText = "";
let currentLangCode = "en-US";
let currentGlobalLang = "English";
let base64Image = null;
let cameraStreamTrack = null;
let showAllMandiPrices = false;

let isSpeaking = false;
let isPaused = false;
let activeUtterance = null;

// ==========================================
// 1. Multilingual Dictionary
// ==========================================
const TRANSLATIONS = {
    "English": {
        navDashboard: "Dashboard",
        navProfile: "Farmer Profile",
        navClinic: "Disease Doctor",
        btnLogout: "Logout",
        authLoginTitle: "Farmer Sign In",
        authLoginSub: "Access your personalised farm records & AI diagnostics",
        authSignupTitle: "Create Farmer Account",
        authSignupSub: "Register your landholding and cultivated crops",
        tabSignIn: "Sign In",
        tabSignUp: "New Farmer (Sign Up)",
        lblPassword: "Password",
        btnSignIn: "Sign In to Dashboard",
        btnSignUp: "Create Farmer Account",
        dashHeroTitle: "🌾 Kisan Smart Farm Portal",
        dashWelcome: "Welcome back",
        dashBriefing: "Here is your daily field briefing.",
        lblLocation: "Location",
        lblTotalLand: "Total Land",
        lblIrrigation: "Irrigation",
        lblSoil: "Soil",
        hdrLandAlloc: "🌾 Cultivated Land Allocation",
        hdrWeather: "⛅ Real-Time Farm Weather",
        btnRefresh: "Refresh",
        msgWeatherLoading: "Fetching location weather...",
        lblHumidity: "Humidity",
        lblWind: "Wind",
        lblGps: "GPS",
        hdrInstantDiag: "🩺 Instant Leaf Diagnosis",
        txtInstantDiagDesc: "Detect early blight, mildew, or viral leaf curl tailored to your active crop acreage.",
        badgeInstantDiag: "Zero-Shot Multilingual Diagnosis",
        btnLaunchDoc: "Launch AI Doctor",
        hdrMandi: "📈 Mandi Commodity Prices",
        txtFilteredCrops: "Filtered to crops in your farm profile",
        txtAllCrops: "Showing all regional market prices",
        btnSeeMore: "See All Crops",
        btnSeeLess: "Show My Crops Only",
        thCrop: "Crop",
        thMarket: "Market / Mandi",
        thPrice: "Modal Price (₹/Quintal)",
        thTrend: "Trend",
        hdrAdvisory: "📢 Agronomist Seasonal Alert",
        txtAdvisory: "High humidity and intermittent cloud cover increase fungal spore dispersion. Inspect leaf undersides across your active crops and maintain weed-free drainage canals.",
        profHeroTitle: "👨‍🌾 Farmer & Crop Land Distribution",
        profHeroSub: "Specify exactly how many acres or hectares are allocated to each individual crop",
        hdrEditFarm: "📝 Personal & Landholding Info",
        lblFarmerName: "Farmer Full Name",
        lblPhone: "Contact Number",
        lblLocationField: "Village / District / State",
        lblLandAcres: "Total Farm Land Size (Acres)",
        lblSoilType: "Predominant Soil Type",
        lblIrrigSource: "Primary Irrigation Source",
        hdrLandPerCrop: "🌱 Land Allocated For Each Crop",
        btnAddCrop: "Add Another Crop",
        lblAllocated: "Allocated",
        lblUnallocated: "Unallocated / Fallow",
        btnSaveFarm: "Save All Farm Details",
        hdrRecordCard: "📋 Farm Record Card",
        lblContact: "Contact",
        hdrDistList: "🌾 Crop-Wise Land Distribution:",
        clinicHeroTitle: "🌿 AgroAI Crop Pathology Doctor",
        clinicHeroSub: "Multilingual zero-shot leaf infection diagnostics with native speech guidance",
        hdrSpecimen: "📸 1. Specimen Input",
        lblInputMode: "Input Mode",
        btnUploadMode: "Upload File",
        btnCameraMode: "Live Camera",
        lblSelectPhoto: "🍃 Select Leaf Photo",
        btnCapture: "Capture Snapshot",
        btnDiagnose: "Diagnose Pathology",
        hdrReport: "🩺 2. Pathology Report",
        msgAnalyzing: "🔬 Analyzing leaf pathology with Gemini Vision...",
        lblDetectedCrop: "DETECTED CROP",
        lblDiagnosis: "DIAGNOSIS",
        badgeImmediate: "Immediate Action",
        badgeOrganic: "Organic Remedy",
        badgePrevention: "Long-Term Prevention",
        btnPlayVoice: "Play Voice Prescription",
        btnStopVoice: "Stop"
    },
    "Telugu (తెలుగు)": {
        navDashboard: "డాష్‌బోర్డ్",
        navProfile: "రైతు ప్రొఫైల్",
        navClinic: "వ్యాధి నిపుణుడు",
        btnLogout: "లాగౌట్",
        authLoginTitle: "రైతు లాగిన్ (Sign In)",
        authLoginSub: "మీ పంట వివరాలు మరియు AI నిర్ధారణలను పొందండి",
        authSignupTitle: "కొత్త రైతు ఖాతా నమోదు",
        authSignupSub: "మీ భూమి మరియు సాగు వివరాలను నమోదు చేయండి",
        tabSignIn: "లాగిన్ (Sign In)",
        tabSignUp: "కొత్త ఖాతా (Sign Up)",
        lblPassword: "పాస్‌వర్డ్",
        btnSignIn: "డాష్‌బోర్డ్‌లోకి ప్రవేశించండి",
        btnSignUp: "ఖాతాను సృష్టించండి",
        dashHeroTitle: "🌾 కిసాన్ స్మార్ట్ వ్యవసాయ పోర్టల్",
        dashWelcome: "తిరిగి స్వాగతం",
        dashBriefing: "ఇది మీ రోజువారీ వ్యవసాయ సమాచారం.",
        lblLocation: "ప్రాంతం",
        lblTotalLand: "మొత్తం భూమి",
        lblIrrigation: "నీటిపారుదల",
        lblSoil: "నేల రకం",
        hdrLandAlloc: "🌾 సాగు భూమి కేటాయింపు",
        hdrWeather: "⛅ నిజ-సమయ వ్యవసాయ వాతావరణం",
        btnRefresh: "రిఫ్రెష్",
        msgWeatherLoading: "వాతావరణ వివరాలు లోడ్ అవుతున్నాయి...",
        lblHumidity: "తేమ",
        lblWind: "గాలి వేగం",
        lblGps: "జీపీఎస్",
        hdrInstantDiag: "🩺 తక్షణ ఆకు వ్యాధి నిర్ధారణ",
        txtInstantDiagDesc: "మీ పంటలపై తెగుళ్లు మరియు వైరల్ వ్యాధులను తక్షణమే గుర్తించండి.",
        badgeInstantDiag: "బహుభాషా AI నిర్ధారణ",
        btnLaunchDoc: "AI డాక్టర్‌ని ప్రారంభించండి",
        hdrMandi: "📈 మార్కెట్ / మండి ధరలు",
        txtFilteredCrops: "మీ ప్రొఫైల్‌లోని పంటల ధరలు మాత్రమే",
        txtAllCrops: "అన్ని ప్రాంతీయ మార్కెట్ ధరలు",
        btnSeeMore: "అన్ని పంటల ధరలు చూడండి",
        btnSeeLess: "నా పంటల ధరలు మాత్రమే",
        thCrop: "పంట",
        thMarket: "మార్కెట్ / మండి",
        thPrice: "సగటు ధర (₹/క్వింటాల్)",
        thTrend: "ధోరణి",
        hdrAdvisory: "📢 వ్యవసాయ శాస్త్రవేత్తల సూచన",
        txtAdvisory: "అధిక తేమ వల్ల శిలీంధ్ర వ్యాధులు వ్యాపించే అవకాశం ఉంది. ఆకుల కింద భాగాన్ని క్రమం తప్పకుండా పరిశీలించండి.",
        profHeroTitle: "👨‍🌾 రైతు & పంటల భూమి వివరాలు",
        profHeroSub: "ప్రతి పంటకు ఎన్ని ఎకరాల భూమి కేటాయించారో నమోదు చేయండి",
        hdrEditFarm: "📝 వ్యక్తిగత & భూమి వివరాలు",
        lblFarmerName: "రైతు పూర్తి పేరు",
        lblPhone: "సంప్రదింపు నంబర్",
        lblLocationField: "గ్రామం / జిల్లా / రాష్ట్రం",
        lblLandAcres: "మొత్తం భూమి పరిమాణం (ఎకరాలు)",
        lblSoilType: "ప్రధాన నేల రకం",
        lblIrrigSource: "ప్రధాన నీటి వనరు",
        hdrLandPerCrop: "🌱 ప్రతి పంటకు కేటాయించిన భూమి",
        btnAddCrop: "మరొక పంటను జోడించండి",
        lblAllocated: "కేటాయించినది",
        lblUnallocated: "మిగిలిన / ఖాళీ భూమి",
        btnSaveFarm: "వివరాలను సేవ్ చేయండి",
        hdrRecordCard: "📋 రైతు రికార్డు కార్డు",
        lblContact: "ఫోన్",
        hdrDistList: "🌾 పంటల వారీగా భూమి కేటాయింపు:",
        clinicHeroTitle: "🌿 ఆగ్రో AI పంట వ్యాధి డాక్టర్",
        clinicHeroSub: "వ్యాధి నిర్ధారణ మరియు మీ మాతృభాషలో వాయిస్ సూచనలు",
        hdrSpecimen: "📸 1. ఆకు నమూనా సమర్పించండి",
        lblInputMode: "ఇన్‌పుట్ విధానం",
        btnUploadMode: "ఫోటో అప్‌లోడ్",
        btnCameraMode: "లైవ్ కెమెరా",
        lblSelectPhoto: "🍃 ఆకు ఫోటో ఎంచుకోండి",
        btnCapture: "ఫోటో తీయండి",
        btnDiagnose: "వ్యాధిని నిర్ధారించండి",
        hdrReport: "🩺 2. వ్యాధి నిర్ధారణ నివేదిక",
        msgAnalyzing: "🔬 ఆకు వ్యాధిని విశ్లేషిస్తోంది...",
        lblDetectedCrop: "గుర్తించిన పంట",
        lblDiagnosis: "వ్యాధి నిర్ధారణ",
        badgeImmediate: "తక్షణ చర్య",
        badgeOrganic: "సేంద్రీయ చికిత్స",
        badgePrevention: "దీర్ఘకాలిక నివారణ",
        btnPlayVoice: "వాయిస్ సూచనలు వినండి",
        btnStopVoice: "ఆపివేయి"
    },
    "Hindi (हिन्दी)": {
        navDashboard: "डैशबोर्ड",
        navProfile: "किसान प्रोफ़ाइल",
        navClinic: "रोग डॉक्टर",
        btnLogout: "लॉगआउट",
        authLoginTitle: "किसान साइन इन (Sign In)",
        authLoginSub: "अपने खेत के रिकॉर्ड और AI रोग निदान तक पहुंचें",
        authSignupTitle: "नया किसान खाता बनाएं",
        authSignupSub: "अपनी कृषि भूमि और फसलों का विवरण दर्ज करें",
        tabSignIn: "साइन इन (Sign In)",
        tabSignUp: "नया खाता (Sign Up)",
        lblPassword: "पासवर्ड",
        btnSignIn: "डैशबोर्ड में प्रवेश करें",
        btnSignUp: "खाता बनाएं",
        dashHeroTitle: "🌾 किसान स्मार्ट फार्म पोर्टल",
        dashWelcome: "वापसी पर स्वागत है",
        dashBriefing: "यह आपकी दैनिक कृषि रिपोर्ट है।",
        lblLocation: "स्थान",
        lblTotalLand: "कुल भूमि",
        lblIrrigation: "सिंचाई स्रोत",
        lblSoil: "मिट्टी का प्रकार",
        hdrLandAlloc: "🌾 बोई गई भूमि का आवंटन",
        hdrWeather: "⛅ खेत का मौसम",
        btnRefresh: "रिफ्रेश",
        msgWeatherLoading: "मौसम की जानकारी लोड हो रही है...",
        lblHumidity: "नमी",
        lblWind: "हवा की गति",
        lblGps: "जीपीएस",
        hdrInstantDiag: "🩺 तत्काल पत्ती रोग निदान",
        txtInstantDiagDesc: "अपनी फसलों पर झुलसा, फफूंद और वायरस रोगों की तुरंत जांच करें।",
        badgeInstantDiag: "बहुभाषी AI निदान",
        btnLaunchDoc: "AI डॉक्टर शुरू करें",
        hdrMandi: "📈 मंडी भाव एवं जिंस दरें",
        txtFilteredCrops: "केवल आपकी बोई गई फसलों के भाव",
        txtAllCrops: "सभी क्षेत्रीय मंडी भाव",
        btnSeeMore: "सभी फसलों के भाव देखें",
        btnSeeLess: "केवल मेरी फसलें दिखाएं",
        thCrop: "फसल",
        thMarket: "मंडी",
        thPrice: "औसत भाव (₹/क्विंटल)",
        thTrend: "रुझान",
        hdrAdvisory: "📢 कृषि वैज्ञानिक सलाह",
        txtAdvisory: "अधिक नमी से फफूंद जनित रोगों का खतरा बढ़ता है। पत्तियों की निचली सतह की नियमित जांच करें।",
        profHeroTitle: "👨‍🌾 किसान एवं फसल भूमि विवरण",
        profHeroSub: "प्रत्येक फसल के लिए आवंटित भूमि एकड़ में दर्ज करें",
        hdrEditFarm: "📝 व्यक्तिगत एवं कृषि विवरण",
        lblFarmerName: "किसान का पूरा नाम",
        lblPhone: "मोबाइल नंबर",
        lblLocationField: "गाँव / ज़िला / राज्य",
        lblLandAcres: "कुल भूमि का आकार (एकड़)",
        lblSoilType: "मिट्टी का प्रकार",
        lblIrrigSource: "सिंचाई का साधन",
        hdrLandPerCrop: "🌱 प्रत्येक फसल के लिए आवंटित भूमि",
        btnAddCrop: "अन्य फसल जोड़ें",
        lblAllocated: "आवंटित भूमि",
        lblUnallocated: "शेष / परती भूमि",
        btnSaveFarm: "विवरण सुरक्षित करें",
        hdrRecordCard: "📋 किसान रिकॉर्ड कार्ड",
        lblContact: "संपर्क",
        hdrDistList: "🌾 फसल-वार भूमि वितरण:",
        clinicHeroTitle: "🌿 एग्रो AI फसल रोग डॉक्टर",
        clinicHeroSub: "रोग पहचान और अपनी भाषा में ऑडियो परामर्श",
        hdrSpecimen: "📸 1. पत्ती का नमूना दें",
        lblInputMode: "इनपुट मोड",
        btnUploadMode: "फ़ोटो अपलोड",
        btnCameraMode: "लाइव कैमरा",
        lblSelectPhoto: "🍃 पत्ती की फ़ोटो चुनें",
        btnCapture: "फ़ोटो खींचें",
        btnDiagnose: "रोग की जांच करें",
        hdrReport: "🩺 2. रोग निदान रिपोर्ट",
        msgAnalyzing: "🔬 पत्ती के नमूने का विश्लेषण जारी है...",
        lblDetectedCrop: "पहचानी गई फसल",
        lblDiagnosis: "रोग का नाम",
        badgeImmediate: "त्वरित कदम",
        badgeOrganic: "जैविक उपचार",
        badgePrevention: "रोकथाम के उपाय",
        btnPlayVoice: "ऑडियो सलाह सुनें",
        btnStopVoice: "रोकें"
    }
};

const ALL_MANDI_DATA = [
    { cropKey: "cotton", crop: "⚪ Cotton (Medium Staple)", market: "Regional APMC Mandi", price: "₹7,150 - ₹7,400", trend: "▲ +1.1%", trendClass: "trend-up" },
    { cropKey: "paddy", crop: "🌾 Paddy (Basmati/Common)", market: "Local Mandi", price: "₹2,280 - ₹3,600", trend: "▲ +2.4%", trendClass: "trend-up" },
    { cropKey: "chili", crop: "🌶️ Red Chili (Guntur)", market: "Guntur Mandi", price: "₹18,500 - ₹21,000", trend: "▼ -0.8%", trendClass: "trend-down" },
    { cropKey: "tomato", crop: "🍅 Tomato (Hybrid)", market: "Madanapalle / Kolar", price: "₹1,800 - ₹2,400", trend: "▲ +4.2%", trendClass: "trend-up" },
    { cropKey: "potato", crop: "🥔 Potato (Jyoti)", market: "Central Wholesale", price: "₹1,450 - ₹1,680", trend: "● Stable", trendClass: "trend-neutral" },
    { cropKey: "maize", crop: "🌽 Maize / Corn", market: "State Grain Mandi", price: "₹2,100 - ₹2,250", trend: "▲ +0.6%", trendClass: "trend-up" },
    { cropKey: "wheat", crop: "🌾 Wheat (Sharbati)", market: "North Agricultural Mandi", price: "₹2,350 - ₹2,700", trend: "● Stable", trendClass: "trend-neutral" },
    { cropKey: "sugarcane", crop: "🎋 Sugarcane (FRP)", market: "Cooperative Sugar Mill", price: "₹340 / Quintal", trend: "● Official FRP", trendClass: "trend-neutral" }
];

// Current Logged-in User Data State
let currentUser = null;

// ==========================================
// 2. Authentication Operations (API-Backed)
// ==========================================
function switchAuthTab(mode) {
    const signInBtn = document.getElementById('tabSignInBtn');
    const signUpBtn = document.getElementById('tabSignUpBtn');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const titleEl = document.getElementById('authTitle');
    const subEl = document.getElementById('authSubtitle');
    const dict = TRANSLATIONS[currentGlobalLang] || TRANSLATIONS["English"];

    if (mode === 'signin') {
        signInBtn.classList.add('active');
        signUpBtn.classList.remove('active');
        signInForm.style.display = 'block';
        signUpForm.style.display = 'none';
        titleEl.innerText = dict.authLoginTitle;
        subEl.innerText = dict.authLoginSub;
    } else {
        signUpBtn.classList.add('active');
        signInBtn.classList.remove('active');
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
        titleEl.innerText = dict.authSignupTitle;
        subEl.innerText = dict.authSignupSub;
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('regName').value.trim(),
        phone: document.getElementById('regPhone').value.trim(),
        location: document.getElementById('regLocation').value.trim(),
        totalLand: parseFloat(document.getElementById('regLandSize').value) || 2.0,
        password: document.getElementById('regPass').value.trim(),
        soil: "Black Cotton Soil",
        irrigation: "Drip / Micro-Irrigation",
        cropAllocations: [
            { crop: "Cotton", acres: (parseFloat(document.getElementById('regLandSize').value || 2.0) * 0.6).toFixed(1) },
            { crop: "Paddy", acres: (parseFloat(document.getElementById('regLandSize').value || 2.0) * 0.4).toFixed(1) }
        ]
    };

    try {
        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Sign up failed");

        localStorage.setItem('agroai_logged_phone', payload.phone);
        alert(`✅ Account created! Welcome, ${payload.name}`);
        loadAndDisplayUser(payload.phone);
    } catch (err) {
        alert("Sign Up Error: " + err.message);
    }
}

async function handleSignIn(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPass').value.trim();

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid credentials");

        localStorage.setItem('agroai_logged_phone', phone);
        currentUser = data.user;
        initAuthenticatedSession(currentUser);
    } catch (err) {
        alert("Sign In Error: " + err.message);
    }
}

function logoutFarmer() {
    localStorage.removeItem('agroai_logged_phone');
    currentUser = null;
    stopVoicePlayback();
    stopCamera();

    document.getElementById('navCenterLinks').style.display = 'none';
    document.getElementById('userBadge').style.display = 'none';
    
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('profilePage').style.display = 'none';
    document.getElementById('clinicPage').style.display = 'none';
    document.getElementById('authPage').style.display = 'block';

    switchAuthTab('signin');
}

async function loadAndDisplayUser(phone) {
    try {
        const res = await fetch(`${API_BASE_URL}/farmer/${phone}`);
        if (!res.ok) throw new Error("Could not load farmer profile");
        currentUser = await res.json();
        initAuthenticatedSession(currentUser);
    } catch (err) {
        logoutFarmer();
    }
}

function initAuthenticatedSession(user) {
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('navCenterLinks').style.display = 'flex';
    document.getElementById('userBadge').style.display = 'flex';
    document.getElementById('navUserName').innerText = `👨‍🌾 ${user.name}`;

    renderProfileData(user);
    fetchLiveWeather();
    navigatePage('home');
}

// ==========================================
// 3. Global Language Switcher
// ==========================================
function changeGlobalLanguage(lang) {
    currentGlobalLang = lang;
    const dict = TRANSLATIONS[lang] || TRANSLATIONS["English"];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });

    if (lang.includes("Telugu")) currentLangCode = "te-IN";
    else if (lang.includes("Hindi")) currentLangCode = "hi-IN";
    else currentLangCode = "en-US";

    if (currentUser) renderMandiPrices();
    localStorage.setItem('agroai_selected_lang', lang);
}

// ==========================================
// 4. Page Navigation
// ==========================================
function navigatePage(page) {
    const homeTab = document.getElementById('tabHome');
    const profileTab = document.getElementById('tabProfile');
    const clinicTab = document.getElementById('tabClinic');
    
    const homeView = document.getElementById('homePage');
    const profileView = document.getElementById('profilePage');
    const clinicView = document.getElementById('clinicPage');

    homeTab.classList.remove('active');
    profileTab.classList.remove('active');
    clinicTab.classList.remove('active');

    homeView.style.display = 'none';
    profileView.style.display = 'none';
    clinicView.style.display = 'none';
    stopCamera();

    if (page === 'home') {
        homeTab.classList.add('active');
        homeView.style.display = 'block';
    } else if (page === 'profile') {
        profileTab.classList.add('active');
        profileView.style.display = 'block';
    } else if (page === 'clinic') {
        clinicTab.classList.add('active');
        clinicView.style.display = 'block';
    }
}

// ==========================================
// 5. Mandi Commodity Engine
// ==========================================
function toggleAllCropPrices() {
    showAllMandiPrices = !showAllMandiPrices;
    renderMandiPrices();
}

function renderMandiPrices() {
    const tableBody = document.getElementById('mandiTableBody');
    const scopeLabel = document.getElementById('mandiScopeLabel');
    const toggleBtn = document.getElementById('toggleMorePricesBtn');
    const dict = TRANSLATIONS[currentGlobalLang] || TRANSLATIONS["English"];

    const farmerCropNames = (currentUser?.cropAllocations || []).map(c => c.crop.toLowerCase());

    tableBody.innerHTML = "";
    let displayedData = ALL_MANDI_DATA;

    if (!showAllMandiPrices) {
        displayedData = ALL_MANDI_DATA.filter(item => {
            return farmerCropNames.some(fc => item.crop.toLowerCase().includes(fc) || item.cropKey.includes(fc) || fc.includes(item.cropKey));
        });

        if (displayedData.length === 0) displayedData = ALL_MANDI_DATA.slice(0, 3);

        scopeLabel.innerText = dict.txtFilteredCrops;
        toggleBtn.innerText = `👁️ ${dict.btnSeeMore}`;
    } else {
        scopeLabel.innerText = dict.txtAllCrops;
        toggleBtn.innerText = `🔙 ${dict.btnSeeLess}`;
    }

    displayedData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${row.crop}</b></td>
            <td>${row.market}</td>
            <td>${row.price}</td>
            <td><span class="${row.trendClass}">${row.trend}</span></td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================
// 6. Crop Land Distribution Form
// ==========================================
function renderCropInputRows(allocations) {
    const container = document.getElementById('cropAllocationList');
    container.innerHTML = "";

    allocations.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = "crop-row-inputs";
        row.innerHTML = `
            <input type="text" placeholder="Crop Name" value="${item.crop}" class="crop-name-input" style="flex: 2;">
            <input type="number" step="0.1" placeholder="Acres" value="${item.acres}" class="crop-acres-input" style="flex: 1;" oninput="updateAllocationSummary()">
            <button type="button" class="btn-remove-crop" onclick="removeCropRow(${index})">✕</button>
        `;
        container.appendChild(row);
    });

    updateAllocationSummary();
}

function addCropRow() {
    const container = document.getElementById('cropAllocationList');
    const row = document.createElement('div');
    row.className = "crop-row-inputs";
    row.innerHTML = `
        <input type="text" placeholder="Crop Name" value="" class="crop-name-input" style="flex: 2;">
        <input type="number" step="0.1" placeholder="Acres" value="1.0" class="crop-acres-input" style="flex: 1;" oninput="updateAllocationSummary()">
        <button type="button" class="btn-remove-crop" onclick="this.parentElement.remove(); updateAllocationSummary();">✕</button>
    `;
    container.appendChild(row);
    updateAllocationSummary();
}

function removeCropRow(index) {
    const rows = document.querySelectorAll('.crop-row-inputs');
    if (rows[index]) rows[index].remove();
    updateAllocationSummary();
}

function updateAllocationSummary() {
    const totalLand = parseFloat(document.getElementById('profLandSize').value) || 0;
    const acreInputs = document.querySelectorAll('.crop-acres-input');
    
    let allocated = 0;
    acreInputs.forEach(input => {
        allocated += parseFloat(input.value) || 0;
    });

    const unallocated = totalLand - allocated;

    document.getElementById('calcTotalLand').innerText = `${totalLand.toFixed(1)} Acres`;
    document.getElementById('calcAllocatedLand').innerText = `${allocated.toFixed(1)} Acres`;
    
    const unallocatedEl = document.getElementById('calcUnallocatedLand');
    unallocatedEl.innerText = `${unallocated.toFixed(1)} Acres`;
    unallocatedEl.style.color = unallocated < 0 ? "#dc2626" : "#059669";
}

// ==========================================
// 7. Profile Rendering & Database Updating
// ==========================================
function renderProfileData(user) {
    document.getElementById('profName').value = user.name || "";
    document.getElementById('profPhone').value = user.phone || "";
    document.getElementById('profLocation').value = user.location || "";
    document.getElementById('profLandSize').value = user.total_land || user.totalLand || 0;
    document.getElementById('profSoil').value = user.soil || "Black Cotton Soil";
    document.getElementById('profIrrigation').value = user.irrigation || "Drip / Micro-Irrigation";

    renderCropInputRows(user.cropAllocations || []);

    document.getElementById('dashFarmerName').innerText = user.name;
    document.getElementById('dashLocation').innerText = user.location;
    document.getElementById('dashLandSize').innerText = `${user.total_land || user.totalLand} Acres`;
    document.getElementById('dashIrrigation').innerText = user.irrigation;
    document.getElementById('dashSoil').innerText = user.soil;

    const dashCropGrid = document.getElementById('dashCropAllocations');
    dashCropGrid.innerHTML = "";
    (user.cropAllocations || []).forEach(c => {
        const card = document.createElement('div');
        card.className = "crop-alloc-card";
        const tot = user.total_land || user.totalLand || 1;
        card.innerHTML = `
            <div class="crop-alloc-name">🌱 ${c.crop}</div>
            <div class="crop-alloc-acres">🚜 ${c.acres} Acres (${((c.acres / tot) * 100).toFixed(0)}%)</div>
        `;
        dashCropGrid.appendChild(card);
    });

    document.getElementById('cardFarmerName').innerText = user.name;
    document.getElementById('cardPhone').innerText = user.phone;
    document.getElementById('cardLocation').innerText = user.location;
    document.getElementById('cardLandSize').innerText = `${user.total_land || user.totalLand} Acres`;
    document.getElementById('cardSoil').innerText = user.soil;
    document.getElementById('cardIrrigation').innerText = user.irrigation;

    const cardCropList = document.getElementById('cardCropList');
    cardCropList.innerHTML = "";
    (user.cropAllocations || []).forEach(c => {
        const badge = document.createElement('span');
        badge.className = "crop-badge";
        badge.innerText = `${c.crop}: ${c.acres} Ac`;
        cardCropList.appendChild(badge);
    });

    renderMandiPrices();
}

async function saveFarmerProfile() {
    if (!currentUser) return alert("Please sign in first.");

    const names = document.querySelectorAll('.crop-name-input');
    const acres = document.querySelectorAll('.crop-acres-input');

    const updatedAllocations = [];
    names.forEach((nameInput, i) => {
        const cropName = nameInput.value.trim();
        const cropAcres = parseFloat(acres[i].value) || 0;
        if (cropName) updatedAllocations.push({ crop: cropName, acres: cropAcres });
    });

    const payload = {
        phone: currentUser.phone,
        name: document.getElementById('profName').value.trim(),
        location: document.getElementById('profLocation').value.trim(),
        totalLand: parseFloat(document.getElementById('profLandSize').value) || 0,
        soil: document.getElementById('profSoil').value,
        irrigation: document.getElementById('profIrrigation').value,
        cropAllocations: updatedAllocations
    };

    try {
        const res = await fetch(`${API_BASE_URL}/farmer/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Could not update profile in database");

        currentUser = { ...currentUser, ...payload, total_land: payload.totalLand };
        renderProfileData(currentUser);
        document.getElementById('navUserName').innerText = `👨‍🌾 ${currentUser.name}`;
        alert("✅ Farm Profile and Crop Land Allocations saved to database!");
    } catch (err) {
        alert("Save Error: " + err.message);
    }
}

// ==========================================
// 8. Live Weather Engine via Open-Meteo
// ==========================================
async function fetchLiveWeather() {
    const loader = document.getElementById('weatherLoader');
    const content = document.getElementById('weatherContent');
    loader.style.display = 'block';
    content.style.display = 'none';

    let lat = 16.5062;
    let lon = 80.6480;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => getWeatherData(pos.coords.latitude, pos.coords.longitude),
            () => getWeatherData(lat, lon)
        );
    } else {
        getWeatherData(lat, lon);
    }
}

async function getWeatherData(latitude, longitude) {
    const loader = document.getElementById('weatherLoader');
    const content = document.getElementById('weatherContent');

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
        const res = await fetch(url);
        const data = await res.json();
        const cur = data.current;

        document.getElementById('weatherTemp').innerText = `${Math.round(cur.temperature_2m)}°C`;
        document.getElementById('weatherHumidity').innerText = `${cur.relative_humidity_2m}%`;
        document.getElementById('weatherWind').innerText = `${cur.wind_speed_10m} km/h`;

        let condition = "Sunny / Clear";
        if (cur.weather_code >= 51 && cur.weather_code <= 67) condition = "Rain / Showers";
        else if (cur.weather_code >= 1 && cur.weather_code <= 3) condition = "Partly Cloudy";
        else if (cur.weather_code >= 95) condition = "Thunderstorm";

        document.getElementById('weatherCondition').innerText = condition;
        document.getElementById('weatherLocation').innerText = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;

        loader.style.display = 'none';
        content.style.display = 'block';
    } catch (e) {
        loader.innerText = "Weather unavailable (check network).";
    }
}

// ==========================================
// 9. Camera & Specimen Handlers
// ==========================================
function switchInputMode(mode) {
    const uploadBtn = document.getElementById('uploadTabBtn');
    const cameraBtn = document.getElementById('cameraTabBtn');
    const uploadBox = document.getElementById('uploadContainer');
    const cameraBox = document.getElementById('cameraContainer');

    if (mode === 'upload') {
        uploadBtn.classList.add('active');
        cameraBtn.classList.remove('active');
        uploadBox.style.display = 'block';
        cameraBox.style.display = 'none';
        stopCamera();
    } else {
        cameraBtn.classList.add('active');
        uploadBtn.classList.remove('active');
        uploadBox.style.display = 'none';
        cameraBox.style.display = 'block';
        startCamera();
    }
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        const videoElement = document.getElementById('cameraStream');
        videoElement.srcObject = stream;
        cameraStreamTrack = stream.getVideoTracks()[0];
    } catch (err) {
        alert("Camera access denied or unavailable: " + err.message);
    }
}

function stopCamera() {
    if (cameraStreamTrack) {
        cameraStreamTrack.stop();
        cameraStreamTrack = null;
    }
}

function capturePhoto() {
    const video = document.getElementById('cameraStream');
    const canvas = document.getElementById('snapshotCanvas');
    const preview = document.getElementById('preview');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    preview.src = dataUrl;
    preview.style.display = 'block';
    base64Image = dataUrl.split(',')[1];
    
    stopCamera();
}

document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const preview = document.getElementById('preview');
            preview.src = evt.target.result;
            preview.style.display = 'block';
            base64Image = evt.target.result.split(',')[1];
        };
        reader.readAsDataURL(file);
    }
});

// ==========================================
// 10. AI Diagnosis via Node.js Backend
// ==========================================
async function analyzeLeaf() {
    const loadingState = document.getElementById('loadingState');
    const resultsContainer = document.getElementById('results');

    if (!base64Image) return alert('Please upload or snap a leaf photo first.');

    stopVoicePlayback();
    loadingState.style.display = 'block';
    resultsContainer.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/diagnose`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                imageBase64: base64Image,
                language: currentGlobalLang
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Diagnosis failed");
        }

        const parsed = await response.json();

        document.getElementById('cropName').innerText = parsed.crop || "Crop";
        document.getElementById('diseaseName').innerText = parsed.status || "Healthy";
        document.getElementById('immediateAction').innerText = parsed.action || "--";
        document.getElementById('organicRemedy').innerText = parsed.organic || "--";
        document.getElementById('preventionStrategy').innerText = parsed.prevention || "--";
        
        currentVoiceText = parsed.speech || `${parsed.crop}. ${parsed.status}. ${parsed.action}`;

        loadingState.style.display = 'none';
        resultsContainer.style.display = 'block';

    } catch (err) {
        loadingState.style.display = 'none';
        alert('Diagnostic failed: ' + err.message);
    }
}

// ==========================================
// 11. Speech Synthesis Controller
// ==========================================
function toggleVoicePlayback() {
    const playBtn = document.getElementById('playPauseBtn');
    if (!currentVoiceText) return alert("No prescription audio available. Please run diagnosis first.");

    if (isPaused) {
        window.speechSynthesis.resume();
        isPaused = false;
        isSpeaking = true;
        playBtn.innerText = "⏸️ Pause";
        return;
    }

    if (isSpeaking) {
        window.speechSynthesis.pause();
        isPaused = true;
        isSpeaking = false;
        playBtn.innerText = "▶️ Resume";
        return;
    }

    window.speechSynthesis.cancel();
    activeUtterance = new SpeechSynthesisUtterance(currentVoiceText);
    activeUtterance.lang = currentLangCode;
    activeUtterance.rate = 0.95;

    activeUtterance.onstart = () => {
        isSpeaking = true;
        isPaused = false;
        playBtn.innerText = "⏸️ Pause";
    };

    activeUtterance.onend = activeUtterance.onerror = () => {
        isSpeaking = false;
        isPaused = false;
        const dict = TRANSLATIONS[currentGlobalLang] || TRANSLATIONS["English"];
        playBtn.innerText = `▶️ ${dict.btnPlayVoice}`;
    };

    window.speechSynthesis.speak(activeUtterance);
}

function stopVoicePlayback() {
    window.speechSynthesis.cancel();
    isSpeaking = false;
    isPaused = false;
    const playBtn = document.getElementById('playPauseBtn');
    if (playBtn) {
        const dict = TRANSLATIONS[currentGlobalLang] || TRANSLATIONS["English"];
        playBtn.innerText = `▶️ ${dict.btnPlayVoice}`;
    }
}

// ==========================================
// 12. App Initialization
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('agroai_selected_lang') || "English";
    document.getElementById('globalLanguageSelect').value = savedLang;
    changeGlobalLanguage(savedLang);

    const loggedPhone = localStorage.getItem('agroai_logged_phone');
    if (loggedPhone) {
        loadAndDisplayUser(loggedPhone);
    } else {
        logoutFarmer();
    }
});
