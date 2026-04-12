/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Communication from './components/Communication';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import { AudioMonitor } from './lib/audio';
import { classifySound } from './lib/gemini';
import { SoundEvent, SoundType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'communication' | 'analytics' | 'settings'>('dashboard');
  const [db, setDb] = useState(0);
  const [detectedSound, setDetectedSound] = useState<SoundType>('quiet');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [sensitivity, setSensitivity] = useState(65);
  const [isSleepMode, setIsSleepMode] = useState(false);
  const [history, setHistory] = useState<SoundEvent[]>([]);
  const [isAlerting, setIsAlerting] = useState(false);

  const audioMonitor = useRef<AudioMonitor>(new AudioMonitor());
  const lastClassificationRef = useRef<number>(0);
  const isClassifyingRef = useRef(false);

  const triggerAlert = useCallback((soundName: string, level: number) => {
    // Vibrate phone
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Visual alert
    setIsAlerting(true);
    setTimeout(() => setIsAlerting(false), 2000);

    // Toast notification
    toast.error(`ALERT: ${soundName.toUpperCase()} detected!`, {
      description: `${level} dB recorded at ${new Date().toLocaleTimeString()}`,
      duration: 5000,
    });

    // Add to history
    const newEvent: SoundEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: soundName,
      decibels: level,
      timestamp: Date.now(),
      type: level > 85 ? 'danger' : 'warning',
    };
    setHistory(prev => [newEvent, ...prev]);
  }, []);

  const handleAudioData = useCallback(async (currentDb: number, freq: number[]) => {
    setDb(currentDb);

    // Check threshold
    if (currentDb >= sensitivity) {
      const now = Date.now();
      // Rate limit classification to once every 3 seconds
      if (now - lastClassificationRef.current > 3000 && !isClassifyingRef.current) {
        isClassifyingRef.current = true;
        lastClassificationRef.current = now;

        const sound = await classifySound(currentDb, freq);
        setDetectedSound(sound);
        isClassifyingRef.current = false;

        // Critical sounds for sleep mode
        const criticalSounds = ['baby crying', 'siren', 'alarm', 'door knock'];
        const isCritical = criticalSounds.includes(sound);

        if (!isSleepMode || isCritical) {
          if (sound !== 'quiet' && sound !== 'human speech') {
            triggerAlert(sound, currentDb);
          }
        }
      }
    } else {
      if (currentDb < sensitivity * 0.5) {
        setDetectedSound('quiet');
      }
    }
  }, [sensitivity, isSleepMode, triggerAlert]);

  const toggleMonitoring = () => {
    if (isMonitoring) {
      audioMonitor.current.stop();
      setIsMonitoring(false);
      setDb(0);
      setDetectedSound('quiet');
    } else {
      audioMonitor.current.start(handleAudioData)
        .then(() => setIsMonitoring(true))
        .catch(() => toast.error("Microphone access denied"));
    }
  };

  useEffect(() => {
    return () => audioMonitor.current.stop();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            db={db} 
            detectedSound={detectedSound} 
            threshold={sensitivity}
            isMonitoring={isMonitoring}
            toggleMonitoring={toggleMonitoring}
          />
        );
      case 'history':
        return <History events={history} clearHistory={() => setHistory([])} />;
      case 'communication':
        return <Communication />;
      case 'analytics':
        return <Analytics events={history} />;
      case 'settings':
        return (
          <Settings 
            sensitivity={sensitivity} 
            setSensitivity={setSensitivity}
            isSleepMode={isSleepMode}
            setIsSleepMode={setIsSleepMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} isAlerting={isAlerting}>
        {renderContent()}
      </Layout>
      <Toaster position="top-center" expand={true} richColors />
    </>
  );
}
