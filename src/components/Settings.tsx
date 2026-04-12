import React from 'react';
import { Moon, Sun, Bell, Volume2, Shield, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsProps {
  sensitivity: number;
  setSensitivity: (val: number) => void;
  isSleepMode: boolean;
  setIsSleepMode: (val: boolean) => void;
}

export default function Settings({ sensitivity, setSensitivity, isSleepMode, setIsSleepMode }: SettingsProps) {
  return (
    <div className="flex flex-col space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500">Customize your experience</p>
      </header>

      <div className="space-y-6">
        {/* Sensitivity Section */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-android-primary/10 text-android-primary rounded-xl">
              <Volume2 size={20} />
            </div>
            <h3 className="font-bold text-lg">Sound Sensitivity</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-500">Threshold</span>
              <span className="text-xl font-black text-android-primary">{sensitivity} dB</span>
            </div>
            <input 
              type="range" 
              min="20" 
              max="100" 
              value={sensitivity}
              onChange={(e) => setSensitivity(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-android-primary"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Whisper (20)</span>
              <span>Loud (100)</span>
            </div>
          </div>
        </section>

        {/* Sleep Mode Section */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isSleepMode ? "bg-indigo-100 text-indigo-600" : "bg-orange-100 text-orange-600"
              )}>
                {isSleepMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-lg">Sleep Mode</h3>
                <p className="text-xs text-slate-400">Only critical alerts</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSleepMode(!isSleepMode)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-300",
                isSleepMode ? "bg-indigo-600" : "bg-slate-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                isSleepMode ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </section>

        {/* Other Settings */}
        <div className="space-y-3">
          <button className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-slate-400 group-hover:text-android-primary" />
              <span className="font-medium text-slate-700">Notification Types</span>
            </div>
            <span className="text-xs text-slate-400">Vibrate, Flash</span>
          </button>
          
          <button className="w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group">
            <div className="flex items-center space-x-3">
              <Shield size={20} className="text-slate-400 group-hover:text-android-primary" />
              <span className="font-medium text-slate-700">Privacy & Permissions</span>
            </div>
            <Info size={16} className="text-slate-300" />
          </button>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">SmartHear v1.0.0</p>
          <p className="text-[10px] text-slate-300 mt-1">Technovation Project 2026</p>
        </div>
      </div>
    </div>
  );
}
