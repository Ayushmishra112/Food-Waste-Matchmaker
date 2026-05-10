import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini API
// Use VITE_GEMINI_API_KEY as it's defined in the .env file created earlier
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);

app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare the image part for Gemini
    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype
      }
    };

    // The prompt specifying what we want in JSON format
    const prompt = `Analyze this image of food. Please return a response strictly in valid JSON format without any markdown wrappers (like \`\`\`json).
    The JSON should have exactly the following structure:
    {
      "description": "A short description of what the food seems to be",
      "quantity": "An estimate of how much food is there (e.g., 'about 3 servings', '1 large bowl', '50 meals')",
      "dietType": "veg" or "non-veg" based on visual evidence
    }`;

    // Call the model
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    let jsonResponse;
    try {
      // Remove potential markdown code block formatting if Gemini includes it despite the prompt
      const cleanedText = text.replace(/```json\n?|```\n?/g, '').trim();
      jsonResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', text);
      return res.status(500).json({ 
        error: 'AI response was not in expected JSON format',
        rawResponse: text
      });
    }

    // Return the JSON response to the client
    res.json(jsonResponse);

  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the image' });
  }
});

app.listen(port, () => {
  console.log(`Food Waste Matchmaker API is running on http://localhost:${port}`);
  console.log(`Endpoint ready: POST http://localhost:${port}/api/analyze-food (expects 'image' in form-data)`);
});
