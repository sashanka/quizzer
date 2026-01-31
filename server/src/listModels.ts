import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly since this is a standalone script
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY not found in .env');
  process.exit(1);
}

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('API Error:', JSON.stringify(data.error, null, 2));
    } else {
      console.log('Available Models:');
      if (data.models) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.models.forEach((m: any) => {
          if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
            console.log(`- ${m.name}`);
          }
        });
      } else {
        console.log('No models found in response:', data);
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

listModels();
