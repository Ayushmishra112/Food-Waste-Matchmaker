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
                "unit": "string (MUST be one of: 'kgs', 'lbs', or 'servings')",
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
      const foodData = JSON.parse(text);
      
      // If latitude and longitude are provided in the form-data, perform matching seamlessly!
      if (req.body.lat && req.body.lng) {
        const lat = parseFloat(req.body.lat);
        const lng = parseFloat(req.body.lng);
        
        // Map 'raw'/'cooked' to 'dry'/'perishable' for the algorithm
        const category = foodData.type === 'cooked' ? 'perishable' : 'dry';
        const isCooked = foodData.type === 'cooked';
        
        const analyzedType = isCooked ? 'Cooked / Highly Perishable' : 'Stable / Dry';
        const currentHour = new Date().getHours();
        const isLateNight = currentHour >= 20 || currentHour < 6;

        const matches = NGOs.map(ngo => {
          const distance = haversine(lat, lng, ngo.lat, ngo.lng);
          let score = 100;
          let reasoning = '';

          if (isCooked) {
            score -= distance * 15;
            reasoning = 'Prioritized for immediate proximity to prevent spoilage.';
            
            if (isLateNight && ngo.open24h) {
              score += 50;
              reasoning += ' Selected due to 24/7 availability for late-night donation.';
            } else if (isLateNight && !ngo.open24h) {
              score -= 40;
              reasoning += ' Discouraged as NGO might be closed.';
            }

            if (ngo.type === 'perishable' || ngo.type === 'any') {
              score += 20;
            } else {
              score -= 50;
              reasoning = 'Low compatibility: NGO usually handles dry goods.';
            }
          } else {
            score -= distance * 2;
            score += ngo.needLevel * 10;
            reasoning = `Selected for high community impact (Need Level: ${ngo.needLevel}). Distance is secondary for stable goods.`;

            if (ngo.type === 'dry' || ngo.type === 'any') {
              score += 20;
            }
          }

          return {
            ...ngo,
            distance: distance.toFixed(2),
            score,
            reasoning,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${ngo.lat},${ngo.lng}`
          };
        });

        const sortedMatches = matches.sort((a, b) => b.score - a.score);

        return res.json({
          analysis: foodData,
          matchResults: {
            analyzed_type: analyzedType,
            matches: sortedMatches
          }
        });
      }

      // If no location provided, just return the AI analysis
      res.json(foodData);
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

// --- NGO MATCHING LOGIC ---

const NGOs = [
  { 
    name: 'Colaba Community Kitchen', 
    lat: 18.9220, 
    lng: 72.8347, 
    type: 'perishable', 
    needLevel: 9, 
    open24h: true,
    address: 'Prescot Rd, Fort, Mumbai, MH 400001',
    phone: '+91 22 2262 0123',
    email: 'contact@colabakitchen.org',
    contactPerson: 'Arjun Mehra',
    website: 'https://colabakitchen.org',
    serviceDescription: 'Provides hot meals to daily wage workers and homeless individuals in South Mumbai.'
  },
  { 
    name: 'Bandra Food Bank', 
    lat: 19.0596, 
    lng: 72.8295, 
    type: 'any', 
    needLevel: 7, 
    open24h: false,
    address: 'Hill Road, Bandra West, Mumbai, MH 400050',
    phone: '+91 22 2640 1234',
    email: 'info@bandrafoodbank.com',
    contactPerson: 'Sarah Fernandes',
    website: 'https://bandrafoodbank.com',
    serviceDescription: 'A community-driven food pantry supporting local low-income families with essential groceries and surplus food.'
  },
  { 
    name: 'Andheri Seva Foundation', 
    lat: 19.1136, 
    lng: 72.8697, 
    type: 'dry', 
    needLevel: 8, 
    open24h: false,
    address: 'SV Road, Andheri East, Mumbai, MH 400069',
    phone: '+91 22 2830 5678',
    email: 'support@andheriseva.org',
    contactPerson: 'Rajesh Sharma',
    website: 'https://andheriseva.org',
    serviceDescription: 'Focuses on long-term food security by distributing dry ration kits and educational materials to slum clusters.'
  },
  { 
    name: 'Powai Care Hub', 
    lat: 19.1176, 
    lng: 72.9060, 
    type: 'perishable', 
    needLevel: 6, 
    open24h: true,
    address: 'Hiranandani Gardens, Powai, Mumbai, MH 400076',
    phone: '+91 22 2570 9999',
    email: 'powai@carehub.in',
    contactPerson: 'Priya Iyer',
    website: 'https://powaicare.org',
    serviceDescription: 'Modern kitchen facility that redistributes party surplus and hotel excess food to nearby orphanages.'
  },
  { 
    name: 'Mulund Charity Trust', 
    lat: 19.1726, 
    lng: 72.9425, 
    type: 'any', 
    needLevel: 5, 
    open24h: false,
    address: 'MG Road, Mulund West, Mumbai, MH 400080',
    phone: '+91 22 2560 1111',
    email: 'hello@mulundcharity.in',
    contactPerson: 'Vikram Singh',
    website: 'https://mulundcharity.in',
    serviceDescription: 'Multi-service NGO that manages a community fridge and provides dry stock to local schools for mid-day meals.'
  },
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post('/api/match-ngo', (req, res) => {
  const { description, lat, lng, category } = req.body;

  if (!description || lat === undefined || lng === undefined || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const descLower = description.toLowerCase();
  const isPerishable = category === 'perishable';
  const isCooked = isPerishable || /\b(hot|cooked|meal|biryani|roti|curry|food box)\b/.test(descLower);
  
  const analyzedType = isCooked ? 'Cooked / Highly Perishable' : 'Stable / Dry';
  const currentHour = new Date().getHours();
  const isLateNight = currentHour >= 20 || currentHour < 6;

  const matches = NGOs.map(ngo => {
    const distance = haversine(lat, lng, ngo.lat, ngo.lng);
    let score = 100;
    let reasoning = '';

    if (isCooked) {
      score -= distance * 15;
      reasoning = 'Prioritized for immediate proximity to prevent spoilage.';
      
      if (isLateNight && ngo.open24h) {
        score += 50;
        reasoning += ' Selected due to 24/7 availability for late-night donation.';
      } else if (isLateNight && !ngo.open24h) {
        score -= 40;
        reasoning += ' Discouraged as NGO might be closed.';
      }

      if (ngo.type === 'perishable' || ngo.type === 'any') {
        score += 20;
      } else {
        score -= 50;
        reasoning = 'Low compatibility: NGO usually handles dry goods.';
      }
    } else {
      score -= distance * 2;
      score += ngo.needLevel * 10;
      reasoning = `Selected for high community impact (Need Level: ${ngo.needLevel}). Distance is secondary for stable goods.`;

      if (ngo.type === 'dry' || ngo.type === 'any') {
        score += 20;
      }
    }

    return {
      ...ngo,
      distance: distance.toFixed(2),
      score,
      reasoning,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${ngo.lat},${ngo.lng}`
    };
  });

  const sortedMatches = matches.sort((a, b) => b.score - a.score);

  res.json({
    analyzed_type: analyzedType,
    matches: sortedMatches
  });
});

app.listen(port, () => {
  console.log(`Food Waste Matchmaker API is running on http://localhost:${port}`);
  console.log(`Using Groq for processing...`);
  console.log(`Endpoint ready: POST http://localhost:${port}/api/analyze-food`);
});
