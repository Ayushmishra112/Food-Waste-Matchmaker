import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ImagePlus, Leaf, Sparkles, CheckCircle2 } from 'lucide-react';

export default function UploadView({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [rawFile, setRawFile] = useState(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setRawFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e) => handleFile(e.target.files[0]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles size={14} className="text-emerald-600" />
          <span className="text-emerald-700 text-sm font-medium">AI-Powered Food Matching</span>
        </motion.div>

        <h1 className="text-5xl font-bold text-slate-800 tracking-tight mb-4 leading-tight">
          Turn Surplus Food Into<br />
          <span className="gradient-text">Community Impact</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
          Upload a photo of your leftover food. Our AI will instantly find the best-matched NGOs nearby.
        </p>
      </motion.div>

      {/* Upload Card */}
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.label
              key="dropzone"
              htmlFor="food-image-input"
              className={`flex flex-col items-center justify-center gap-5 w-full h-72 rounded-3xl cursor-pointer border-2 border-dashed transition-all duration-300 select-none ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/80 scale-[1.02]'
                  : 'border-emerald-300 bg-white/70 hover:border-emerald-400 hover:bg-emerald-50/50'
              }`}
              style={{ backdropFilter: 'blur(12px)', boxShadow: isDragging ? '0 0 0 4px rgba(5,150,105,0.15)' : 'var(--shadow-card)' }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              whileHover={{ scale: 1.01 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Bouncing upload icon */}
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--brand-gradient)', boxShadow: 'var(--shadow-emerald)' }}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Upload size={32} color="white" strokeWidth={2} />
              </motion.div>

              <div className="text-center">
                <p className="text-slate-700 font-semibold text-lg">
                  {isDragging ? 'Drop it here!' : 'Drag & drop your food photo'}
                </p>
                <p className="text-slate-400 text-sm mt-1">or <span className="text-emerald-600 font-medium">browse to upload</span></p>
                <p className="text-slate-400 text-xs mt-2">PNG, JPG, WEBP up to 10MB</p>
              </div>

              <div className="flex gap-3">
                {['🍛 Curry', '🥗 Salad', '🍞 Bread', '🍱 Lunch Box'].map((label) => (
                  <span key={label} className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-500 shadow-sm">
                    {label}
                  </span>
                ))}
              </div>

              <input
                id="food-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />
            </motion.label>
          ) : (
            /* Preview State */
            <motion.div
              key="preview"
              className="glass-card rounded-3xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative">
                <img
                  src={preview}
                  alt="Food preview"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="text-white text-sm font-medium truncate max-w-[220px]">{fileName}</span>
                  <button
                    onClick={() => { setPreview(null); setFileName(''); }}
                    className="text-white/80 text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="p-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-800 font-semibold text-sm">Photo uploaded successfully</p>
                  <p className="text-slate-400 text-xs">Ready to analyze your food donation</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <motion.button
          id="upload-continue-btn"
          className={`btn-primary w-full mt-5 py-4 rounded-2xl text-base flex items-center justify-center gap-2.5 ${!preview ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!preview}
          onClick={() => preview && onUpload({ preview, file: rawFile })}
          whileHover={preview ? { scale: 1.02 } : {}}
          whileTap={preview ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ImagePlus size={20} />
          Analyze & Find NGOs
          <Sparkles size={16} />
        </motion.button>

        {/* Trust Badges */}
        <motion.div
          className="flex items-center justify-center gap-6 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { icon: '🔒', label: 'Secure Upload' },
            { icon: '🤖', label: 'AI Powered' },
            { icon: '⚡', label: 'Instant Match' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-slate-400 text-xs">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="flex gap-8 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[
          { value: '6,400+', label: 'Meals Donated' },
          { value: '48', label: 'Partner NGOs' },
          { value: '98%', label: 'Match Accuracy' },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-2xl font-bold gradient-text">{value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
