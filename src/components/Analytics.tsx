import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SoundEvent } from '../types';

interface AnalyticsProps {
  events: SoundEvent[];
}

export default function Analytics({ events }: AnalyticsProps) {
  // Process data for charts
  const soundCounts = events.reduce((acc, event) => {
    acc[event.name] = (acc[event.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(soundCounts).map(([name, value]) => ({ name, value }));

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: events.filter(e => new Date(e.timestamp).getHours() === i).length
  }));

  const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6610f2', '#e83e8c'];

  return (
    <div className="flex flex-col space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-slate-500">Sound patterns and insights</p>
      </header>

      {/* Common Sounds Pie Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Most Common Sounds</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-xs font-medium text-slate-600 capitalize">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Activity Bar Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Activity by Hour</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="hour" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#007bff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Events</span>
          <p className="text-3xl font-black text-slate-800 mt-1">{events.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Volume</span>
          <p className="text-3xl font-black text-slate-800 mt-1">
            {events.length > 0 ? Math.round(events.reduce((a, b) => a + b.decibels, 0) / events.length) : 0}
            <span className="text-sm font-normal text-slate-400 ml-1">dB</span>
          </p>
        </div>
      </div>
    </div>
  );
}
