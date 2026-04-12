import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Type, Eraser } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Communication() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setTranscript(prev => prev + ' ' + final);
        setInterimTranscript(interim);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comm Mode</h1>
          <p className="text-slate-500">Speech to Text</p>
        </div>
        <button 
          onClick={() => setTranscript('')}
          className="p-2 text-slate-400 hover:text-android-primary transition-colors"
        >
          <Eraser size={20} />
        </button>
      </header>

      <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {transcript || interimTranscript ? (
            <div className="space-y-4">
              <p className="text-2xl font-medium leading-relaxed text-slate-800">
                {transcript}
                <span className="text-slate-400">{interimTranscript}</span>
              </p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
              <Type size={64} strokeWidth={1} />
              <p className="text-center font-medium px-10">
                Tap the microphone to start converting speech to text
              </p>
            </div>
          )}
        </div>

        {isListening && (
          <div className="absolute top-4 right-4">
            <div className="flex space-x-1">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                  className="w-1 bg-android-primary rounded-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pb-4">
        <button
          onClick={toggleListening}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90",
            isListening ? "bg-android-error text-white" : "bg-android-primary text-white"
          )}
        >
          {isListening ? <MicOff size={32} /> : <Mic size={32} />}
        </button>
      </div>
    </div>
  );
}
