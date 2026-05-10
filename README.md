# Food Waste Matchmaker (AI Decision Engine Demo)

This is an AI-powered food redistribution optimization engine designed for the hackathon demo. It intelligently matches restaurant leftover food with nearby NGOs/shelters by prioritizing urgency, quantity, distance, and fairness.

## 🚀 Features

- **Restaurant Input**: Capture details about leftover food (type, quantity, prep time, expiry, location).
- **AI Matching Engine**: Uses a proprietary scoring algorithm and Google Gemini API to analyze urgency and recommend the best NGO.
- **Explainable AI**: The system provides clear reasoning for why a specific NGO was chosen.
- **Impact Metrics**: Displays simulated real-time impact, such as meals saved, CO₂ waste reduced, and people impacted.
- **Fairness Optimization**: Automatically avoids overloading saturated NGOs to ensure ethical distribution.

## 💻 Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Data**: Local JSON dataset for NGOs and restaurants

## 📂 Project Structure

```
src/
 ├── data/
 │    ├── ngos.js              # Mock data for NGOs
 │    └── restaurants.js       # Mock data for restaurants
 │
 ├── components/
 │    ├── FoodForm.jsx         # Input form for food details
 │    ├── MatchCard.jsx        # Displays AI match and reasoning
 │    └── Metrics.jsx          # Route and Rescue impact scores
 │
 ├── App.jsx                   # Main application layout
 │
 └── utils/
      └── matchEngine.js       # Scoring logic and Gemini explanation generator
```

## 🛠️ Setup & Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Add your Gemini API key to the `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

## 🎯 Demo Flow
1. **Restaurant Input**: Enter details (e.g., "50 veg meals", expires in 3 hours).
2. **Optimize Distribution**: Click to trigger the AI decision engine.
3. **View Results**: The dashboard presents the urgency score, the recommended NGO, the AI reasoning, and overall impact metrics.
