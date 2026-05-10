import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Star, Phone, Clock, Users,
  ThumbsUp, CheckCircle2, Zap, Wind, Snowflake,
  Trophy, RotateCcw, Heart, ExternalLink
} from 'lucide-react';

// ── Circular Progress SVG ──────────────────────────────────────────────────
function CircularProgress({ score, size = 72, strokeWidth = 6 }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 85 ? '#059669' : score >= 70 ? '#d97706' : '#6366f1';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400 leading-none">match</span>
      </div>
    </div>
  );
}

// ── Tag Pill ───────────────────────────────────────────────────────────────
const tagStyleMap = {
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

function Tag({ label, color = 'green' }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${tagStyleMap[color] || tagStyleMap.green}`}>
      {label}
    </span>
  );
}

// ── Mock Map ───────────────────────────────────────────────────────────────
function MockMap({ ngos, topNgo }) {
  const pathRef = useRef(null);

  return (
    <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-emerald-50 border border-slate-200">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        {[20, 40, 60, 80].map((y) => (
          <line key={`h${y}`} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#94a3b8" strokeWidth="1" />
        ))}
        {[20, 40, 60, 80].map((x) => (
          <line key={`v${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#94a3b8" strokeWidth="1" />
        ))}
      </svg>

      {/* Route line */}
      <svg className="absolute inset-0 w-full h-full">
        {topNgo && (
          <motion.path
            d={`M 15% 80% Q 30% 20% ${topNgo.coordinates.x}% ${topNgo.coordinates.y}%`}
            stroke="url(#routeGrad)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="6 3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: 'easeInOut' }}
          />
        )}
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
      </svg>

      {/* Your location pin */}
      <motion.div
        className="absolute flex flex-col items-center"
        style={{ left: '15%', bottom: '20%', transform: 'translateX(-50%)' }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 border-3 border-white shadow-lg flex items-center justify-center">
          <span className="text-xs">📍</span>
        </div>
        <span className="text-xs font-semibold text-blue-700 mt-1 bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm">You</span>
      </motion.div>

      {/* NGO pins */}
      {ngos.slice(0, 4).map((ngo, i) => (
        <motion.div
          key={ngo.id}
          className="absolute flex flex-col items-center"
          style={{
            left: `${ngo.coordinates.x}%`,
            top: `${ngo.coordinates.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.12, type: 'spring' }}
        >
          <div
            className={`w-7 h-7 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs ${i === 0 ? 'bg-emerald-500' : 'bg-slate-500'}`}
          >
            {i === 0 ? '⭐' : '📌'}
          </div>
          {i === 0 && (
            <span className="text-xs font-bold text-emerald-700 mt-1 bg-white/90 px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap max-w-[80px] truncate">
              {ngo.name.split(' ')[0]}
            </span>
          )}
        </motion.div>
      ))}

      {/* Map label */}
      <div className="absolute bottom-2 right-3 text-xs text-slate-400 bg-white/70 backdrop-blur-sm px-2 py-1 rounded-lg">
        Simulated Route Map
      </div>
    </div>
  );
}

// ── NGO Card ───────────────────────────────────────────────────────────────
function NgoCard({ ngo, rank, delay }) {
  const [contacted, setContacted] = useState(false);

  return (
    <motion.div
      className={`glass-card rounded-2xl p-5 ${rank === 0 ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(5,150,105,0.12)' }}
    >
      {rank === 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy size={14} className="text-amber-500" />
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Best Match</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Score ring */}
        <CircularProgress score={ngo.matchScore} size={70} strokeWidth={6} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-bold text-slate-800 leading-tight">{ngo.name}</h2>
            <div className="flex items-center gap-1 flex-shrink-0 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <Star size={11} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-600">{ngo.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-emerald-500" />
              {ngo.distanceLabel}
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} className="text-blue-400" />
              {ngo.totalDonations.toLocaleString()} donations
            </span>
            {ngo.refrigeration && (
              <span className="flex items-center gap-1 text-blue-500">
                <Snowflake size={11} />
                Cold Storage
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">{ngo.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {ngo.tags.map((tag) => (
              <Tag key={tag} label={tag} color={ngo.tagColors[tag]} />
            ))}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {ngo.operatingHours}
            </span>
            <span className="flex items-center gap-1">
              <Zap size={11} className={ngo.currentNeed === 'High' ? 'text-orange-500' : 'text-slate-300'} />
              Need: <span className={`font-semibold ml-0.5 ${ngo.currentNeed === 'High' ? 'text-orange-600' : ngo.currentNeed === 'Medium' ? 'text-amber-600' : 'text-slate-500'}`}>{ngo.currentNeed}</span>
            </span>
            {/* Capacity bar */}
            <div className="flex items-center gap-1.5 flex-1">
              <span>Capacity</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${ngo.capacity}%` }}
                  transition={{ duration: 0.8, delay: delay + 0.3 }}
                />
              </div>
              <span className="font-semibold text-slate-600">{ngo.capacity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        <motion.button
          id={`contact-ngo-${ngo.id}`}
          onClick={() => setContacted(true)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            contacted
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'btn-primary'
          }`}
          whileHover={!contacted ? { scale: 1.02 } : {}}
          whileTap={!contacted ? { scale: 0.97 } : {}}
        >
          {contacted ? (
            <><CheckCircle2 size={15} /> Request Sent!</>
          ) : (
            <><Heart size={15} /> Donate Here</>
          )}
        </motion.button>
        <a
          href={`tel:${ngo.phone}`}
          id={`call-ngo-${ngo.id}`}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
        >
          <Phone size={14} />
          Call
        </a>
      </div>
    </motion.div>
  );
}

// ── Loading Overlay ────────────────────────────────────────────────────────
function LoadingState() {
  const steps = [
    'Analyzing food from photo…',
    'Scanning 48 partner NGOs…',
    'Calculating match scores…',
    'Optimizing route…',
  ];
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
      setProgress((p) => Math.min(p + 26, 100));
    }, 550);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <motion.div
        className="glass-card rounded-3xl p-10 w-full max-w-sm text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Spinning ring */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
            <motion.circle
              cx="48" cy="48" r="40"
              stroke="url(#loadGrad)" strokeWidth="8" fill="none"
              strokeLinecap="round"
              strokeDasharray={251}
              animate={{ strokeDashoffset: [251, 0] }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="loadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">AI Analysis</h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            className="text-sm text-slate-500 mb-6"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">{Math.min(progress, 100)}% complete</p>
      </motion.div>
    </div>
  );
}

// ── Main Results View ──────────────────────────────────────────────────────
export default function ResultsView({ matchedNgos, formData, onReset }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingState />;

  const top = matchedNgos[0];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                <span className="gradient-text">{matchedNgos.length} NGOs</span> Matched
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">Ranked by AI compatibility score</p>
            </div>
            <motion.button
              id="start-over-btn"
              onClick={onReset}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <RotateCcw size={14} />
              Start Over
            </motion.button>
          </div>

          {/* Summary pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: `🥗 ${formData.foodType === 'veg' ? 'Vegetarian' : 'Non-Veg'}` },
              { label: `${formData.foodState === 'cooked' ? '🍛 Cooked' : '🥦 Raw'}` },
              { label: `📦 ${formData.quantity.charAt(0).toUpperCase() + formData.quantity.slice(1)} quantity` },
              ...(formData.foodState === 'cooked' ? [{ label: `⏱ ${formData.hoursSinceCooked}h ago` }] : []),
            ].map(({ label }) => (
              <span key={label} className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-600 shadow-sm">
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <MockMap ngos={matchedNgos} topNgo={top} />
        </motion.div>

        {/* NGO Cards */}
        <div className="space-y-4">
          {matchedNgos.map((ngo, i) => (
            <NgoCard key={ngo.id} ngo={ngo} rank={i} delay={0.1 + i * 0.1} />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          className="text-center text-xs text-slate-400 mt-8 pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Match scores are AI-generated estimates based on proximity, capacity, and food compatibility.
        </motion.p>
      </div>
    </div>
  );
}
