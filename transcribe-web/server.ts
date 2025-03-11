import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';
import cors from 'cors';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable CORS for Vite frontend
app.use(cors({ origin: 'http://localhost:5173' }));

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const systemPrompt = `
You are a helpful assistant for the company TrustCare. Your task is 
to add speaker labels to the transcript of a conversation between a patient
and a doctor. Make sure to determine who is speaking at each turn. Add semicolons
when the speaker changes. Do not change the original text.
`;

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    try {
        const audioData = fs.createReadStream("./rec/PatientA.m4a");

        const transcription = await openai.audio.transcriptions.create({
            file: audioData,
            model: "whisper-1",
        });

        const completion = await openai.chat.completions.create({
            temperature: 0,
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: transcription.text
                }
            ],
            store: true,
        });

        const conversation = completion.choices[0].message.content;

        fs.unlinkSync(file.path); // Clean up temp file
        res.status(200).json({ transcription: conversation });
    } catch (error: any) {
        console.error('Error in Whisper API:', error);
        res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
