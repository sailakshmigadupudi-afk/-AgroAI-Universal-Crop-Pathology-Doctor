import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// SQLite Database in /tmp (Required for Vercel serverless read/write execution)
const db = new sqlite3.Database('/tmp/agroai.db', (err) => {
    if (err) console.error("Database connection error:", err.message);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS farmers (
        phone TEXT PRIMARY KEY,
        name TEXT,
        password TEXT,
        location TEXT,
        total_land REAL,
        soil TEXT,
        irrigation TEXT,
        crop_allocations TEXT
    )`);
});

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ==========================================
// 1. AI Leaf Pathology Diagnosis Endpoint
// ==========================================
app.post('/api/diagnose', async (req, res) => {
    try {
        const { imageBase64, language = 'English' } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Image base64 data is required.' });
        }

        const prompt = `You are an expert plant pathologist and agronomist. Analyze this leaf specimen.
Identify the crop/plant species and diagnose if it is healthy or has an infection.
Provide ALL explanations, labels, and text values in ${language}.
Return ONLY a valid JSON object matching this schema (no markdown formatting, no backticks):
{
  "crop": "Crop Name in ${language}",
  "status": "Disease Name or Healthy in ${language}",
  "action": "Immediate treatment/pruning step in ${language}",
  "organic": "Organic remedy/spray in ${language}",
  "prevention": "Long-term prevention in ${language}",
  "speech": "2-sentence clear spoken summary in ${language}"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64
                    }
                }
            ],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);

        res.json(parsed);
    } catch (error) {
        console.error("Diagnosis error:", error);
        res.status(500).json({ error: error.message || 'AI diagnosis failed' });
    }
});

// ==========================================
// 2. Authentication: Sign Up
// ==========================================
app.post('/api/auth/signup', (req, res) => {
    const { phone, name, password, location, totalLand, soil, irrigation, cropAllocations } = req.body;

    if (!phone || !password || !name) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const allocationsJson = JSON.stringify(cropAllocations || []);
    const query = `INSERT INTO farmers (phone, name, password, location, total_land, soil, irrigation, crop_allocations) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [phone, name, password, location, totalLand, soil, irrigation, allocationsJson], function(err) {
        if (err) {
            if (err.message && err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ error: "An account with this phone number already exists." });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ success: true, message: "Farmer registered successfully.", phone, name });
    });
});

// ==========================================
// 3. Authentication: Sign In
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;

    db.get(`SELECT * FROM farmers WHERE phone = ? AND password = ?`, [phone, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "Invalid phone number or password." });

        user.cropAllocations = JSON.parse(user.crop_allocations || '[]');
        delete user.password;

        res.json({ success: true, user });
    });
});

// ==========================================
// 4. Update Profile
// ==========================================
app.put('/api/farmer/profile', (req, res) => {
    const { phone, name, location, totalLand, soil, irrigation, cropAllocations } = req.body;

    const query = `UPDATE farmers SET 
                   name = ?, location = ?, total_land = ?, soil = ?, irrigation = ?, crop_allocations = ? 
                   WHERE phone = ?`;

    db.run(query, [name, location, totalLand, soil, irrigation, JSON.stringify(cropAllocations), phone], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Farmer not found." });
        res.json({ success: true, message: "Profile updated successfully." });
    });
});

// ==========================================
// 5. Get Profile
// ==========================================
app.get('/api/farmer/:phone', (req, res) => {
    db.get(`SELECT * FROM farmers WHERE phone = ?`, [req.params.phone], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "Farmer not found." });

        user.cropAllocations = JSON.parse(user.crop_allocations || '[]');
        delete user.password;
        res.json(user);
    });
});

export default app;// 1. AI Leaf Pathology Diagnosis Endpoint
// ==========================================
app.post('/api/diagnose', async (req, res) => {
    try {
        const { imageBase64, language = 'English' } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Image base64 data is required.' });
        }

        const prompt = `You are an expert plant pathologist and agronomist. Analyze this leaf specimen.
Identify the crop/plant species and diagnose if it is healthy or has an infection.
Provide ALL explanations, labels, and text values in ${language}.
Return ONLY a valid JSON object matching this schema (no markdown formatting, no backticks):
{
  "crop": "Crop Name in ${language}",
  "status": "Disease Name or Healthy in ${language}",
  "action": "Immediate treatment/pruning step in ${language}",
  "organic": "Organic remedy/spray in ${language}",
  "prevention": "Long-term prevention in ${language}",
  "speech": "2-sentence clear spoken summary in ${language}"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64
                    }
                }
            ],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const rawText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);

        res.json(parsed);
    } catch (error) {
        console.error("Diagnosis error:", error);
        res.status(500).json({ error: error.message || 'AI diagnosis failed' });
    }
});

// ==========================================
// 2. Authentication: Sign Up
// ==========================================
app.post('/api/auth/signup', (req, res) => {
    const { phone, name, password, location, totalLand, soil, irrigation, cropAllocations } = req.body;

    if (!phone || !password || !name) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const allocationsJson = JSON.stringify(cropAllocations || []);
    const query = `INSERT INTO farmers (phone, name, password, location, total_land, soil, irrigation, crop_allocations) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [phone, name, password, location, totalLand, soil, irrigation, allocationsJson], function(err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).json({ error: "An account with this phone number already exists." });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ success: true, message: "Farmer registered successfully.", phone, name });
    });
});

// ==========================================
// 3. Authentication: Sign In
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;

    db.get(`SELECT * FROM farmers WHERE phone = ? AND password = ?`, [phone, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "Invalid phone number or password." });

        user.cropAllocations = JSON.parse(user.crop_allocations || '[]');
        delete user.password;

        res.json({ success: true, user });
    });
});

// ==========================================
// 4. Update Profile
// ==========================================
app.put('/api/farmer/profile', (req, res) => {
    const { phone, name, location, totalLand, soil, irrigation, cropAllocations } = req.body;

    const query = `UPDATE farmers SET 
                   name = ?, location = ?, total_land = ?, soil = ?, irrigation = ?, crop_allocations = ? 
                   WHERE phone = ?`;

    db.run(query, [name, location, totalLand, soil, irrigation, JSON.stringify(cropAllocations), phone], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Farmer not found." });
        res.json({ success: true, message: "Profile updated successfully." });
    });
});

// ==========================================
// 5. Get Farmer Profile
// ==========================================
app.get('/api/farmer/:phone', (req, res) => {
    db.get(`SELECT * FROM farmers WHERE phone = ?`, [req.params.phone], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "Farmer not found." });

        user.cropAllocations = JSON.parse(user.crop_allocations || '[]');
        delete user.password;
        res.json(user);
    });
});

// Crucial: Export the app instead of calling app.listen()
export default app;
