# FeedForward Project Documentation

## Project Overview
**FeedForward** is an agentic decision engine designed to solve the logistical challenge of food distribution for social good. Instead of simple proximity matching, it uses a multi-weighted scoring algorithm to intelligently match food donors with NGOs based on the nature of the food (perishable vs. stable) and real-time NGO capacity.

---

## Technical Stack
- **Frontend**: React (with Vite), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.
- **Runtime**: TypeScript (tsx).

---

## File Structure & Codebase

### 1. Root Configuration Files

#### `package.json`
```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "tsx server.ts",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^1.29.0",
    "@tailwindcss/vite": "^4.1.14",
    "@types/cors": "^2.8.19",
    "@vitejs/plugin-react": "^5.0.4",
    "cors": "^2.8.6",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

#### `vite.config.ts`
```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
```

#### `metadata.json`
```json
{
  "name": "FeedForward",
  "description": "An agentic decision engine matching food donors with NGOs based on food stability and urgency.",
  "requestFramePermissions": ["geolocation"],
  "majorCapabilities": []
}
```

#### `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FeedForward - NGO Decision Engine</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 2. Backend Logic: `server.ts`
The core engine of the application. It hosts the API and the scoring logic.

```typescript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface NGO {
  name: string;
  lat: number;
  lng: number;
  type: 'perishable' | 'dry' | 'any';
  needLevel: number; // 1-10
  open24h: boolean;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  website: string;
  serviceDescription: string;
}

const NGOs: NGO[] = [
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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

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

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
```

---

### 3. Frontend Source Code

#### `src/main.tsx`
```typescript
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

#### `src/App.tsx`
```typescript
import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Utensils, 
  Package, 
  Search, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Brain,
  ExternalLink,
  Phone,
  Globe
} from 'lucide-react';
import { NGO, MatchResponse } from './types';

export default function App() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'perishable' | 'dry'>('perishable');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [results, setResults] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setIsLocating(false);
        },
        () => {
          setLat(19.0760);
          setLng(72.8777);
          setIsLocating(false);
        }
      );
    }
  }, []);

  const handleMatch = async (e: FormEvent) => {
    e.preventDefault();
    if (!lat || !lng) {
      setError('Please provide your location.');
      return;
    }
    if (!description.trim()) {
      setError('Please describe the food you want to donate.');
      return;
    }

    setIsMatching(true);
    setError(null);

    try {
      const response = await fetch('/api/match-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, lat, lng, category }),
      });

      if (!response.ok) throw new Error('Failed to fetch matches');

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsMatching(false);
    }
  };

  const getUserLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        setError('Location access denied. Using Mumbai default.');
        setLat(19.0760);
        setLng(72.8777);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-emerald-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Utensils className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">FeedForward</span>
          </div>
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest hidden sm:block">
            NGO Decision Engine
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          >
            Where should your <span className="text-emerald-600">food</span> go?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Our Decision Engine analyzes your food's shelf life, location, and real-time NGO needs to find the most impactful match.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 mb-12"
        >
          <form onSubmit={handleMatch} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-500" />
                  What are you donating?
                </label>
                <input 
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., 200 boxes of hot Biryani"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Category</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCategory('perishable')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      category === 'perishable' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
                    }`}
                  >
                    Perishable
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('dry')}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      category === 'dry' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
                    }`}
                  >
                    Dry / Stable
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Your Location
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm flex items-center justify-between">
                  {isLocating ? (
                    <span className="flex items-center gap-2 italic">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                      Locating...
                    </span>
                  ) : (
                    <span>{lat ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}` : 'Location unknown'}</span>
                  )}
                  <button 
                    type="button"
                    onClick={getUserLocation}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <button
              id="match-button"
              type="submit"
              disabled={isMatching}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
            >
              {isMatching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Intelligence...
                </>
              ) : (
                <>
                  Run Decision Engine
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div id="analysis-banner" className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                  <Brain className="text-white w-6 h-6" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Decision Intelligence Analysis</div>
                  <p className="text-slate-700 italic">
                    "Identified food as <span className="font-bold text-indigo-600">{results.analyzed_type}</span>. Adjusting weights for {results.analyzed_type === 'Cooked / Highly Perishable' ? 'speed and immediate deployment' : 'social impact and need level'}."
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {results.matches.map((ngo, idx) => (
                  <motion.div
                    key={ngo.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative overflow-hidden bg-white p-6 rounded-2xl border ${idx === 0 ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-100'} shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:shadow-md transition-all`}
                  >
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                        AI Recommended
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{ngo.name}</h3>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          ngo.type === 'perishable' ? 'bg-orange-100 text-orange-600' : 
                          ngo.type === 'dry' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ngo.type === 'any' ? 'Mixed Goods' : ngo.type}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-2 font-medium">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {ngo.distance} KM away
                        </span>
                        {ngo.open24h && (
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <Clock className="w-4 h-4" />
                            Open 24/7
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          Need Level: {ngo.needLevel}/10
                        </span>
                      </div>

                      <div className="text-sm text-slate-600 mb-4 space-y-2">
                        <p className="text-slate-500 italic text-xs leading-relaxed border-l-2 border-emerald-100 pl-3 py-1">
                          "{ngo.serviceDescription}"
                        </p>
                        
                        <div className="pt-1">
                          <p className="flex items-start gap-2">
                            <span className="font-bold whitespace-nowrap text-slate-800">Address:</span> 
                            {ngo.address}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">Contact:</span>
                            {ngo.contactPerson}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 border-t border-slate-50 mt-2">
                          <a href={`tel:${ngo.phone}`} className="flex items-center gap-1.5 text-emerald-600 hover:underline font-semibold">
                            <Phone className="w-3.5 h-3.5" />
                            {ngo.phone}
                          </a>
                          <a href={`mailto:${ngo.email}`} className="flex items-center gap-1.5 text-slate-500 hover:underline font-semibold">
                            <Globe className="w-3.5 h-3.5" />
                            {ngo.email}
                          </a>
                          <a href={ngo.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline font-semibold">
                            <ExternalLink className="w-3.5 h-3.5" />
                            View on Maps
                          </a>
                          <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-600 hover:underline font-semibold">
                            <Globe className="w-3.5 h-3.5" />
                            Website
                          </a>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-bold text-slate-800">Reasoning:</span> {ngo.reasoning}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-2xl min-w-[100px] border border-emerald-100 self-stretch sm:self-center">
                      <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">AI Match Score</div>
                      <div className="text-3xl font-black text-emerald-700">
                        {Math.max(0, Math.round(ngo.score))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-20 text-center text-slate-400 text-[10px] font-medium tracking-tight uppercase">
          Empowering social good through prioritized distribution logic
        </div>
      </main>
    </div>
  );
}
```

#### `src/types.ts`
```typescript
export interface NGO {
  name: string;
  lat: number;
  lng: number;
  type: 'perishable' | 'dry' | 'any';
  needLevel: number;
  open24h: boolean;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  website: string;
  serviceDescription: string;
  distance: string;
  score: number;
  reasoning: string;
  googleMapsUrl: string;
}

export interface MatchResponse {
  analyzed_type: string;
  matches: NGO[];
}
```

#### `src/index.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
}
```

