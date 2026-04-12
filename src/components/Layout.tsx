import React from 'react';
import { LayoutDashboard, History, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

type Tab = 'dashboard' | 'history' | 'communication' | 'analytics' | 'settings';

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
  isAlerting: boolean;
}

export default function Layout({ activeTab, setActiveTab, children, isAlerting }: LayoutProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'communication', label: 'Comm', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className={cn(
      "flex flex-col h-screen w-full max-w-md mx-auto bg-android-background relative overflow-hidden",
      isAlerting && "alert-pulse"
    )}>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 pt-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex justify-around items-center h-16 safe-area-bottom z-50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-android-primary" : "text-slate-400"
              )}
            >
              <Icon size={24} className={cn(isActive && "animate-in zoom-in-90 duration-200")} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
