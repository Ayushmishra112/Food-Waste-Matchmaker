import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Thermometer, Package, Leaf, Drumstick, ChefHat, Sprout, Clock, Info, Sparkles } from 'lucide-react';

const FOOD_TYPES = [
  { id: 'veg', label: 'Vegetarian', icon: Leaf, color: 'emerald' },
  { id: 'non-veg', label: 'Non-Vegetarian', icon: Drumstick, color: 'orange' },
];

const FOOD_STATES = [
  { id: 'cooked', label: 'Cooked / Prepared', icon: ChefHat, desc: 'Ready-to-eat meals' },
  { id: 'raw', label: 'Raw / Uncooked', icon: Sprout, desc: 'Uncooked ingredients' },
];

const QUANTITY_OPTIONS = [
  { id: 'small', label: 'Small', desc: '1–5 servings', icon: Package },
  { id: 'medium', label: 'Medium', desc: '6–20 servings', icon: Package },
  { id: 'large', label: 'Large', desc: '21–50 servings', icon: Package },
  { id: 'bulk', label: 'Bulk', desc: '50+ servings', icon: Package },
];

function OptionCard({ selected, onClick, children, id }) {
  return (
    <motion.button
      id={id}
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border cursor-pointer transition-all duration-200 text-left ${
        selected
          ? 'border-[#0071e3] bg-[#f2f8ff] shadow-sm'
          : 'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-slate-50/50'
      }`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
    >
      {selected && (
        <motion.div
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0071e3] flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
      {children}
    </motion.button>
  );
}

export default function FormView({ imagePreview, initialData, onBack, onSubmit }) {
  const [foodType, setFoodType] = useState(initialData?.foodType || '');
  const [foodState, setFoodState] = useState(initialData?.foodState || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || '');
  const [hoursSinceCooked, setHoursSinceCooked] = useState(initialData?.hoursSinceCooked || 2);

  const isValid = foodType && foodState && quantity;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ foodType, foodState, quantity, hoursSinceCooked });
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            id="form-back-btn"
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-medium mb-6 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Upload
          </button>

          <div className="flex gap-4 items-start">
            {/* Image thumb */}
            {imagePreview && (
              <motion.div
                className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <img src={imagePreview} alt="Food" className="w-full h-full object-cover" />
              </motion.div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Tell us about<br /><span className="gradient-text">your food</span></h1>
              {initialData?.description ? (
                <p className="text-[#0071e3] text-sm mt-2 font-medium bg-[#f2f8ff] px-3 py-1.5 rounded-lg inline-block border border-[#d6eaff]">
                  <Sparkles size={14} className="inline mr-1.5 -mt-0.5" />
                  AI saw: "{initialData.description}"
                </p>
              ) : (
                <p className="text-slate-400 text-sm mt-1">Help us find the perfect NGO match</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="glass-card rounded-3xl p-6 space-y-7"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >

          {/* Food Type */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Food Type</h2>
            <div className="grid grid-cols-2 gap-3">
              {FOOD_TYPES.map((type) => (
                <OptionCard
                  key={type.id}
                  id={`food-type-${type.id}`}
                  selected={foodType === type.id}
                  onClick={() => setFoodType(type.id)}
                >
                  <div className={`p-2 rounded-full ${foodType === type.id ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-slate-100 text-slate-500'}`}>
                    <type.icon size={24} />
                  </div>
                  <span className={`text-sm font-semibold ${foodType === type.id ? 'text-[#0071e3]' : 'text-slate-700'}`}>
                    {type.label}
                  </span>
                </OptionCard>
              ))}
            </div>
          </section>

          {/* Food State */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Food State</h2>
            <div className="grid grid-cols-2 gap-3">
              {FOOD_STATES.map((state) => (
                <OptionCard
                  key={state.id}
                  id={`food-state-${state.id}`}
                  selected={foodState === state.id}
                  onClick={() => setFoodState(state.id)}
                >
                  <div className={`p-2 rounded-full ${foodState === state.id ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-slate-100 text-slate-500'}`}>
                    <state.icon size={24} />
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${foodState === state.id ? 'text-[#0071e3]' : 'text-slate-700'}`}>
                      {state.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{state.desc}</p>
                  </div>
                </OptionCard>
              ))}
            </div>
          </section>

          {/* Hours Since Cooked — conditional */}
          <AnimatePresence>
            {foodState === 'cooked' && (
              <motion.section
                key="hours-slider"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 28 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="bg-[#f2f8ff] border border-[#d6eaff] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#0071e3]" />
                      <h2 className="text-sm font-semibold text-[#0071e3]">Hours Since Cooked</h2>
                    </div>
                    <motion.span
                      key={hoursSinceCooked}
                      className="text-2xl font-bold text-[#0071e3]"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      {hoursSinceCooked}h
                    </motion.span>
                  </div>
                  <input
                    id="hours-since-cooked-slider"
                    type="range"
                    min={0}
                    max={12}
                    step={1}
                    value={hoursSinceCooked}
                    onChange={(e) => setHoursSinceCooked(Number(e.target.value))}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, #0071e3 0%, #0071e3 ${(hoursSinceCooked / 12) * 100}%, #d6eaff ${(hoursSinceCooked / 12) * 100}%, #d6eaff 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-[#4ea8de] mt-1.5 font-medium">
                    <span>Just cooked</span>
                    <span>12+ hours</span>
                  </div>
                  {hoursSinceCooked >= 6 && (
                    <div className="flex items-start gap-2 mt-3 bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm">
                      <Info size={14} className="text-slate-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600">Food cooked {hoursSinceCooked}h ago — we'll prioritize NGOs with cold storage and fast pickup.</p>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Quantity */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Quantity</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {QUANTITY_OPTIONS.map((q) => (
                <OptionCard
                  key={q.id}
                  id={`quantity-${q.id}`}
                  selected={quantity === q.id}
                  onClick={() => setQuantity(q.id)}
                >
                  <div className={`p-2 rounded-full ${quantity === q.id ? 'bg-[#0071e3]/10 text-[#0071e3]' : 'bg-slate-100 text-slate-500'}`}>
                    <q.icon size={20} />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-bold ${quantity === q.id ? 'text-[#0071e3]' : 'text-slate-700'}`}>{q.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{q.desc}</p>
                  </div>
                </OptionCard>
              ))}
            </div>
          </section>
        </motion.div>

        {/* Submit */}
        <motion.button
          id="find-ngo-btn"
          onClick={handleSubmit}
          disabled={!isValid}
          className={`btn-primary w-full mt-5 py-4 rounded-2xl text-base flex items-center justify-center gap-2.5 ${!isValid ? 'opacity-40 cursor-not-allowed' : ''}`}
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Find Matching NGOs
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}
