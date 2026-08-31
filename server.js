import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// 🔍 Live Request Logger: Prints every incoming HTTP call
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Serve frontend files
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// AI Leaf Pathology Diagnosis Route
app.post('/api/diagnose', async (req, res) => {
    const { 
        imageBase64, 
        language = 'English', 
        farmerName = 'Unregistered Farmer', 
        farmerPhone = 'N/A' 
    } = req.body;

    console.log("==========================================");
    console.log(`👨‍🌾 Diagnosis Request from: ${farmerName} (${farmerPhone})`);
    console.log(`🌐 Target Language: ${language}`);
    console.log(`📦 Specimen Payload: ${imageBase64 ? `${(imageBase64.length / 1024).toFixed(1)} KB` : "0 KB"}`);

    if (!imageBase64) {
        console.warn("⚠️ Request rejected: No image base64 provided.");
        return res.status(400).json({ error: 'Image base64 data is required.' });
    }

    try {
        console.log("🤖 Processing pathology with Gemini 2.5 Flash...");
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: { responseMimeType: 'application/json' }
        });

        const prompt = `You are an expert plant pathologist and agronomist. Analyze this leaf specimen.
Identify the crop/plant species and diagnose if it is healthy or has an infection.
Provide ALL explanations, labels, and text values in ${language}.
Return ONLY a valid JSON object matching this schema:
{
  "crop": "Crop Name in ${language}",
  "status": "Disease Name or Healthy in ${language}",
  "action": "Immediate treatment/pruning step in ${language}",
  "organic": "Organic remedy/spray in ${language}",
  "prevention": "Long-term prevention in ${language}",
  "speech": "2-sentence clear spoken summary in ${language}"
}`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const rawText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);

        console.log("✅ Diagnosis Finished:");
        console.log(`🌱 Crop: ${parsed.crop} | 🩺 Status: ${parsed.status}`);
        console.log("==========================================");

        res.json(parsed);
    } catch (error) {
        console.error("❌ Diagnosis Backend Error:", error);
        res.status(500).json({ error: error.message || 'AI diagnosis failed' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Render' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AgroAI Server running on port ${PORT}`);
});
