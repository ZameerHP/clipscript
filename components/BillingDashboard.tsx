
import React, { useState, useEffect } from 'react';
import { User, CreditPackage, ActivityLog } from '../types';
import { dbService } from '../services/dbService';

interface Props {
  user: User | null;
  theme: 'dark' | 'light';
  onCreditsUpdated: (newBalance: number) => void;
}

const PACKAGES: CreditPackage[] = [
  { id: 'pkg_lite', name: 'Lite Script', price: 9.99, credits: 100, features: ['100 High-Speed Credits', '24/7 Support', 'Standard Models', 'WAV Exports'] },
  { id: 'pkg_pro', name: 'Pro Script', price: 24.99, credits: 350, badge: 'Best Value', features: ['350 Credits', 'Priority Queue', 'Advanced Reasoning Models', 'Viral Metadata Tools', 'Commercial Rights'] },
  { id: 'pkg_studio', name: 'Studio Script', price: 59.99, credits: 1000, features: ['1000 Credits', 'Custom AI Fine-tuning', 'Team Collaboration', 'API Early Access', 'Dedicated Account Manager'] },
];

const BillingDashboard: React.FC<Props> = ({ user, theme, onCreditsUpdated }) => {
  const [history, setHistory] = useState<ActivityLog[]>([]);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (user) {
      dbService.getActivities(user.id).then(logs => {
        setHistory(logs.filter(l => l.action === 'PURCHASE' || l.action === 'GENERATE'));
      });
    }
  }, [user]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl font-bold opacity-50">Please log in to view billing.</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div>
          <h1 className={`text-5xl md:text-6xl font-black font-outfit tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Billing <span className="text-indigo-500">Dashboard</span></h1>
          <p className={`text-base font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stripe-powered transactions and credit audit.</p>
        </div>
        <div className={`glass-card px-8 py-6 rounded-[2rem] border transition-all ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-200 bg-white shadow-sm'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Available Studio Credits</p>
          <p className={`text-4xl font-black tracking-tighter font-outfit ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.credits || 0}</p>
        </div>
      </div>

      <div className={`glass-card p-10 rounded-[3rem] border transition-all ${isDark ? 'border-white/5 bg-slate-900/20' : 'border-slate-100 bg-white shadow-sm'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h2 className={`text-2xl font-black font-outfit tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Transaction Ledger</h2>
          </div>
          <div className="flex items-center gap-4">
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4 opacity-40 grayscale" alt="Stripe" />
             <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
               <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">PCI Level 1</span>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                <th className="pb-6 px-4">Timestamp</th>
                <th className="pb-6 px-4">Event</th>
                <th className="pb-6 px-4">Reference / Item</th>
                <th className="pb-6 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {history.length > 0 ? history.map((log) => (
                <tr key={log.id} className={`text-sm group transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                  <td className={`py-5 px-4 font-mono text-[10px] ${isDark ? 'opacity-50' : 'text-slate-500'}`}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-5 px-4">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${log.action === 'PURCHASE' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-pink-500/10 text-pink-500'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className={`py-5 px-4 font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {log.metadata?.stripeRef ? <span className="font-mono opacity-60 mr-2">{log.metadata.stripeRef}</span> : null}
                    {log.details}
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{log.action === 'PURCHASE' ? 'Succeeded' : 'Applied'}</span>
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-sm font-bold opacity-30 uppercase tracking-widest">No transaction records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
