import express from 'express';
import multer from 'multer';
import { generateQuiz } from './services/gemini';
import { createGoogleForm } from './services/googleForms';
import { DEFAULT_SYSTEM_PROMPT } from './config/defaultPrompt';
import pdfParse from 'pdf-parse';
import fs from 'fs';

import { google } from 'googleapis';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// OAuth2 Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

router.get('/config', (req, res) => {
  res.json({ defaultPrompt: DEFAULT_SYSTEM_PROMPT });
});

router.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Critical for refresh token
    scope: [
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/drive.file'
    ],
    prompt: 'consent' // Force prompts to ensure we get a refresh token
  });
  res.redirect(url);
});

router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('✅ REFRESH TOKEN RECEIVED:', tokens.refresh_token);

    res.send(`
      <h1>Authentication Successful</h1>
      <p>Please add the following to your <code>server/.env</code> file:</p>
      <pre>GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
      <p>After adding it, restart your server.</p>
    `);
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Authentication failed');
  }
});

router.post('/generate-quiz', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { prompt } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let content = '';

    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      content = data.text;
    } else {
      content = fs.readFileSync(file.path, 'utf-8');
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    // 1. Generate Quiz JSON
    const quizJson = await generateQuiz(content, prompt);
    console.log('Quiz JSON generated successfully');

    // Save JSON to file
    try {
      const outputDir = 'output';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safeTitle = (quizJson.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${outputDir}/${safeTitle}_${timestamp}.json`;

      fs.writeFileSync(filename, JSON.stringify(quizJson, null, 2));
      console.log(`Quiz JSON saved to ${filename}`);
    } catch (fsError) {
      console.error('Failed to save JSON file:', fsError);
      // Don't block the response, just log the error
    }

    // 2. Create Google Form
    const formUrl = await createGoogleForm(quizJson);
    console.log('Google Form created:', formUrl);

    res.json({ success: true, formUrl });

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
