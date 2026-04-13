import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { SoundType } from '../types';

interface DashboardProps {
  db: number;
  detectedSound: SoundType;
  threshold: number;
  isMonitoring: boolean;
  toggleMonitoring: () => void;
}

export default function Dashboard({ db, detectedSound, threshold, isMonitoring, toggleMonitoring }: DashboardProps) {
  const isAboveThreshold = db >= threshold;
  
  const getStatusColor = () => {
    if (db < threshold * 0.7) return 'text-android-success';
    if (db < threshold) return 'text-android-warning';
    return 'text-android-error';
  };

  const getStatusBg = () => {
    if (db < threshold * 0.7) return 'bg-android-success/10';
    if (db < threshold) return 'bg-android-warning/10';
    return 'bg-android-error/10';
  };

  const getStatusIcon = () => {
    if (db < threshold * 0.7) return <CheckCircle2 className="text-android-success" size={24} />;
    if (db < threshold) return <AlertTriangle className="text-android-warning" size={24} />;
    return <ShieldAlert className="text-android-error" size={24} />;
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <header className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="HEARLY logo"
            className="h-14 w-14 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">HEARLY</h1>
            <p className="text-slate-500">Live Sound Monitoring</p>
          </div>
        </div>
        <button 
          onClick={toggleMonitoring}
          className={cn(
            "p-3 rounded-full transition-all shadow-lg",
            isMonitoring ? "bg-android-error text-white" : "bg-android-primary text-white"
          )}
        >
          <Volume2 size={24} className={cn(isMonitoring && "animate-pulse")} />
        </button>
      </header>

      {/* Decibel Meter */}
      <div className="relative flex items-center justify-center w-64 h-64">
        <svg className="w-full h-full -rotate-90 transform">
          <circle
            cx="128"
            cy="128"
            r="110"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-200"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="110"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 110}
            initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 110 * (1 - db / 100) }}
            className={getStatusColor()}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={db}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-black tabular-nums"
          >
            {db}
          </motion.span>
          <span className="text-slate-400 font-medium uppercase tracking-widest text-xs">Decibels</span>
        </div>
      </div>

      {/* Status Card */}
      <div className={cn(
        "w-full p-6 rounded-3xl flex items-center space-x-4 transition-colors duration-300",
        getStatusBg()
      )}>
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          {getStatusIcon()}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Detected Sound</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={detectedSound}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="text-2xl font-bold capitalize"
            >
              {detectedSound || 'Listening...'}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Threshold Indicator */}
      <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Alert Threshold</span>
          <span className="text-lg font-bold text-android-primary">{threshold} dB</span>
        </div>
        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-android-primary transition-all duration-300"
            style={{ width: `${threshold}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-3 italic">
          Alerts will trigger when sound exceeds this level.
        </p>
      </div>
    </div>
  );
}
