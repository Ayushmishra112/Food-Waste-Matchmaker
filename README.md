# Food Waste Matchmaker: AI-Powered Redistribution Engine

A premium, AI-driven platform designed to minimize food waste by intelligently matching surplus food with the most compatible local NGOs in Gurugram. Built with a focus on "Quiet Luxury" aesthetics and sophisticated AI decision-making.

## 🚀 Key Features

- **Computer Vision Analysis**: Powered by **Llama 4 (meta-llama/llama-4-scout-17b-16e-instruct)** on Groq, the platform automatically analyzes food photos to identify type, state, and quantity.
- **Geospatial Optimization**: Real-time Haversine distance calculations ensuring highly perishable cooked food reaches the nearest facility in record time.
- **Intelligent Scoring Engine**: A complex multi-factor ranking system considering food state, distance, NGO capacity, and community need level.
- **Premium User Experience**: Minimalist, Apple-inspired interface featuring glassmorphism, smooth animations (Framer Motion), and a custom-styled Route Map.
- **Automated NGO Matching**: Dynamic simulation of Gurugram-based NGOs (DLF Cyber City, Sector 14, Udyog Vihar) for localized redistribution.

## 💻 Tech Stack

- **Frontend**: React + Vite
- **Styling**: Vanilla CSS (Custom Design System) + Lucide Icons
- **Backend**: Node.js + Express
- **AI Orchestration**: Groq SDK (Llama 4 Vision)
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form

## 📂 Project Structure

```text
├── server.js              # Node.js backend with AI & Matching logic
├── agents.md              # AI Agent definitions & responsibilities
├── skills.md              # Core AI skills & logic documentation
├── src/
│    ├── App.jsx           # Main state & navigation orchestrator
│    ├── components/
│    │    ├── UploadView.jsx   # AI Photo capture & analysis
│    │    ├── FormView.jsx     # Smart form with AI pre-fill
│    │    └── ResultsView.jsx  # Map-based matching dashboard
│    └── index.css         # Apple-inspired premium design system
```

## 🛠️ Setup & Execution

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure AI Access**
   Create a `.env` file and add your Groq API Key:
   ```env
   GROQ_API_KEY=your_groq_key_here
   ```

3. **Start Backend Server**
   ```bash
   node server.js
   ```

4. **Start Frontend Application**
   ```bash
   npm run dev
   ```

## 🎯 Demo Sequence

1. **Upload**: Drag & drop a food image. The AI Analysis Agent identifies the contents.
2. **Review**: Verify the AI-suggested metadata in the smart form. Proximity-based matching is triggered.
3. **Dispatch**: View the suggested route on the map and connect with the top-ranked NGO in Gurugram based on the real-time compatibility score.

---
*Built with ❤️ for Nagarro - Geek Meetup 3.0*
