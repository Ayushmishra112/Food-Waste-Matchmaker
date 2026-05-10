import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post('/api/analyze-food', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Convert image buffer to base64 data URL
    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    // Use Llama 3.2 Vision model on Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image of food. Please return a response strictly in valid JSON format.
              The JSON should have exactly the following structure and data types:
              {
                "description": "string (A short description of the food)",
                "quantity": integer (Number of items or estimated servings, just the number),
                "unit": "string (The unit for the quantity, e.g., 'servings', 'burgers', 'kgs')",
                "dietType": "string ('veg' or 'non-veg')",
                "type": "string ('raw' or 'cooked')"
              }`
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.1,
      response_format: { type: 'json_object' } // Groq supports forced JSON mode
    });

    const text = completion.choices[0].message.content;

    // Return the parsed JSON response
    try {
      res.json(JSON.parse(text));
    } catch (parseError) {
      console.error('Failed to parse Groq response:', text);
      res.status(500).json({ error: 'AI response was not in expected JSON format', raw: text });
    }

  } catch (error) {
    console.error('--- GROQ API ERROR ---');
    console.error('Message:', error.message);
    console.error('------------------------');
    
    res.status(500).json({ 
      error: 'An error occurred while analyzing the image with Groq',
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Food Waste Matchmaker API is running on http://localhost:${port}`);
  console.log(`Using Groq for processing...`);
  console.log(`Endpoint ready: POST http://localhost:${port}/api/analyze-food`);
});
