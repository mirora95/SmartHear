import React from 'react';
import { motion } from 'motion/react';
import { Clock, Volume2, Trash2 } from 'lucide-react';
import { SoundEvent } from '../types';
import { cn } from '../lib/utils';

interface HistoryProps {
  events: SoundEvent[];
  clearHistory: () => void;
}

export default function History({ events, clearHistory }: HistoryProps) {
  return (
    <div className="flex flex-col space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event History</h1>
          <p className="text-slate-500">{events.length} sounds detected</p>
        </div>
        {events.length > 0 && (
          <button 
            onClick={clearHistory}
            className="p-2 text-slate-400 hover:text-android-error transition-colors"
          >
            <Trash2 size={20} />
          </button>
        )}
      </header>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <Clock size={48} strokeWidth={1.5} />
            <p className="font-medium">No events recorded yet</p>
          </div>
        ) : (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4"
            >
              <div className={cn(
                "p-3 rounded-xl",
                event.type === 'danger' ? "bg-android-error/10 text-android-error" :
                event.type === 'warning' ? "bg-android-warning/10 text-android-warning" :
                "bg-android-success/10 text-android-success"
              )}>
                <Volume2 size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg capitalize">{event.name}</h3>
                  <span className="text-xs font-medium text-slate-400">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-bold text-slate-600">{event.decibels} dB</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">{new Date(event.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
