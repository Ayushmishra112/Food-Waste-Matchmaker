import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import Logo from './components/Logo';
import UploadView from './components/UploadView';
import FormView from './components/FormView';
import ResultsView from './components/ResultsView';
import { ngoData, computeMatches } from './data/ngos';

// View state machine
const VIEWS = { UPLOAD: 'upload', FORM: 'form', RESULTS: 'results' };

// Page transition variants
const pageVariants = {
  initial: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

const pageTransition = { duration: 0.38, ease: [0.4, 0, 0.2, 1] };

export default function App() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [direction, setDirection] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState(null);
  const [matchedNgos, setMatchedNgos] = useState([]);
  
  const [location, setLocation] = useState(null);
  const [aiData, setAiData] = useState(null);

  const navigateTo = (nextView, dir = 1) => {
    setDirection(dir);
    setView(nextView);
    window.scrollTo(0, 0);
  };

  // Helper to get location
  const getLocation = async () => {
    if (location) return location;
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(loc);
            resolve(loc);
          },
          () => resolve({ lat: 28.4595, lng: 77.0266 }) // fallback to Gurugram
        );
      } else {
        resolve({ lat: 28.4595, lng: 77.0266 });
      }
    });
  };

  // Upload → Form (Calls /api/analyze-food)
  const handleUpload = async ({ preview, file }) => {
    setImagePreview(preview);
    const loadingToast = toast.loading('Analyzing food & finding NGOs...', {
      description: 'Our AI is processing the image.'
    });

    try {
      const loc = await getLocation();
      
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);
      formDataToSend.append('lat', loc.lat.toString());
      formDataToSend.append('lng', loc.lng.toString());

      const response = await fetch('http://localhost:3001/api/analyze-food', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to analyze image');

      const data = await response.json();
      
      // Map Groq output to FormView state
      let mappedQuantity = 'medium';
      if (data.analysis.quantity < 5) mappedQuantity = 'small';
      else if (data.analysis.quantity > 50) mappedQuantity = 'bulk';
      else if (data.analysis.quantity > 20) mappedQuantity = 'large';

      setAiData({
        foodType: data.analysis.dietType === 'veg' ? 'veg' : 'non-veg',
        foodState: data.analysis.type === 'cooked' ? 'cooked' : 'raw',
        quantity: mappedQuantity,
        description: data.analysis.description,
        hoursSinceCooked: 2
      });

      // We could use the matches directly, but let's just go to form for verification
      toast.dismiss(loadingToast);
      toast.success('Analysis complete', {
        description: 'Review the details before confirming.'
      });
      
      navigateTo(VIEWS.FORM, 1);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Analysis failed', {
        description: error.message || 'Could not connect to AI engine.'
      });
      // Fallback: still go to form but empty
      setAiData(null);
      navigateTo(VIEWS.FORM, 1);
    }
  };

  const mapBackendNgoToFrontend = (ngo, index) => {
    // Map backend NGO format to frontend ResultsView format
    return {
      id: index + 1,
      name: ngo.name,
      matchScore: Math.min(Math.round(ngo.score), 99),
      rating: (4 + Math.random()).toFixed(1), // Mock rating
      distanceLabel: `${ngo.distance} km away`,
      distance: parseFloat(ngo.distance),
      totalDonations: Math.floor(Math.random() * 2000) + 500, // Mock
      refrigeration: ngo.type === 'perishable' || ngo.type === 'any',
      tags: [ngo.open24h ? "24/7 Open" : "Standard Hours", "Verified NGO", ngo.type === 'perishable' ? "Cold Storage" : "Dry Storage"],
      tagColors: {
        "24/7 Open": "green",
        "Standard Hours": "blue",
        "Verified NGO": "indigo",
        "Cold Storage": "purple",
        "Dry Storage": "orange"
      },
      operatingHours: ngo.open24h ? "24 Hours" : "9 AM – 8 PM",
      currentNeed: ngo.needLevel >= 8 ? "High" : ngo.needLevel >= 5 ? "Medium" : "Low",
      capacity: Math.floor(Math.random() * 40) + 50,
      description: ngo.serviceDescription,
      phone: ngo.phone,
      coordinates: { 
        // Mock map coordinates between 20-80%
        x: 20 + Math.floor(Math.random() * 60), 
        y: 20 + Math.floor(Math.random() * 60) 
      }
    };
  };

  // Form → Results (Calls /api/match-ngo)
  const handleFormSubmit = async (data) => {
    setFormData(data);
    const loadingToast = toast.loading('Finding the best NGO matches...', {
      description: 'Running multi-weighted scoring algorithm.'
    });

    try {
      const loc = await getLocation();
      const payload = {
        description: aiData?.description || `${data.quantity} ${data.foodState} food`,
        category: data.foodState === 'cooked' ? 'perishable' : 'dry',
        lat: loc.lat,
        lng: loc.lng
      };

      const response = await fetch('http://localhost:3001/api/match-ngo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to find matches');

      const result = await response.json();
      
      const formattedMatches = result.matches.map(mapBackendNgoToFrontend);
      setMatchedNgos(formattedMatches);
      
      toast.dismiss(loadingToast);
      toast.success('Matches found');
      navigateTo(VIEWS.RESULTS, 1);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Matching failed', {
        description: error.message || 'Could not find NGOs.'
      });
    }
  };

  // Any → Upload (reset)
  const handleReset = () => {
    setImagePreview(null);
    setFormData(null);
    setAiData(null);
    setMatchedNgos([]);
    navigateTo(VIEWS.UPLOAD, -1);
  };

  // Back: Results → Form, Form → Upload
  const handleBack = () => {
    if (view === VIEWS.FORM) navigateTo(VIEWS.UPLOAD, -1);
    if (view === VIEWS.RESULTS) navigateTo(VIEWS.FORM, -1);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'var(--bg-app)' }}
    >
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6ee7b7, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #99f6e4, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Sticky Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(229,231,235,0.6)' }}
      >
        <Logo size={30} />

        {/* Step indicator */}
        <div className="flex items-center gap-2" aria-label="Progress steps">
          {[
            { key: VIEWS.UPLOAD, label: 'Upload' },
            { key: VIEWS.FORM, label: 'Details' },
            { key: VIEWS.RESULTS, label: 'Results' },
          ].map((step, i) => {
            const stepIndex = Object.values(VIEWS).indexOf(step.key);
            const currentIndex = Object.values(VIEWS).indexOf(view);
            const done = currentIndex > stepIndex;
            const active = currentIndex === stepIndex;
            return (
              <div key={step.key} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className="w-8 h-px"
                    style={{ background: done ? 'var(--brand-gradient)' : '#e5e7eb' }}
                  />
                )}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? 'text-white shadow-sm'
                      : done
                      ? 'text-[#0071e3] bg-[#f2f8ff] border border-[#d6eaff]'
                      : 'text-slate-400 bg-slate-50 border border-slate-200'
                  }`}
                  style={active ? { background: 'var(--brand-gradient)' } : {}}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-24" /> {/* spacer to center steps */}
      </nav>

      {/* Main content with animated view transitions */}
      <main className="pt-20">
        <AnimatePresence mode="wait" custom={direction}>
          {view === VIEWS.UPLOAD && (
            <motion.div
              key="upload"
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <UploadView onUpload={handleUpload} />
            </motion.div>
          )}

          {view === VIEWS.FORM && (
            <motion.div
              key="form"
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <FormView
                imagePreview={imagePreview}
                initialData={aiData}
                onBack={handleBack}
                onSubmit={handleFormSubmit}
              />
            </motion.div>
          )}

          {view === VIEWS.RESULTS && (
            <motion.div
              key="results"
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <ResultsView
                matchedNgos={matchedNgos}
                formData={formData}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Toast provider */}
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: '14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}
