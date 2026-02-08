
import React, { useState, useMemo } from 'react';
import { CreditPackage, User } from '../types';
import { dbService } from '../services/dbService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  theme: 'dark' | 'light';
  onCreditsUpdated: (newBalance: number) => void;
}

const PACKAGES: CreditPackage[] = [
  { id: 'p1', name: 'Starter', price: 5, credits: 50, features: ['50 Script Credits', 'Basic AI Models', 'Standard Formatting'] },
  { id: 'p2', name: 'Producer', price: 15, credits: 200, badge: 'Popular', features: ['200 Script Credits', 'Advanced AI Models', 'Viral Toolkit Access', 'Priority Support'] },
  { id: 'p3', name: 'Cinematic', price: 40, credits: 1000, features: ['1000 Script Credits', 'Ultra AI Models', 'All Viral Features', 'Dedicated Manager', 'API Access'] },
];

const Pricing: React.FC<Props> = ({ isOpen, onClose, user, theme, onCreditsUpdated }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState<CreditPackage | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'card' | 'success'>('card');
  const [processingStatus, setProcessingStatus] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  
  // Stripe Elements States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const isDark = theme === 'dark';

  const cardBrand = useMemo(() => {
    if (cardNumber.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
    if (/^3[47]/.test(cardNumber)) return 'amex';
    return 'generic';
  }, [cardNumber]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    return value
      .replace(/[^0-9]/g, '')
      .replace(/^([2-9])/, '0$1')
      .replace(/^(1[3-9])/, '01')
      .replace(/^([0-1][0-9])([0-9])/, '$1/$2')
      .substring(0, 5);
  };

  const handleStripePayment = async (pkg: CreditPackage) => {
    if (!user) return;
    setIsProcessing(true);
    
    // Simulate real Stripe PaymentIntent flow
    const steps = [
      'Creating payment intent...',
      'Confirming card details...',
      'Contacting bank gateway...',
      'Finalizing payment...'
    ];

    for (const step of steps) {
      setProcessingStatus(step);
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
    }

    try {
      const mockRef = `ch_${Math.random().toString(36).substring(2, 15)}`;
      setTransactionRef(mockRef);
      const newBalance = await dbService.addCredits(user.id, pkg.credits);
      await dbService.recordActivity(user.id, 'PURCHASE', `Stripe Payment Successful: ${pkg.name}`, { stripeRef: mockRef, price: pkg.price });
      onCreditsUpdated(newBalance);
      setCheckoutStep('success');
    } catch (e) {
      alert("Stripe failed to process the request. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setShowCheckout(null);
    setCheckoutStep('card');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className={`absolute inset-0 backdrop-blur-xl ${isDark ? 'bg-slate-950/80' : 'bg-slate-50/80'}`} onClick={isProcessing ? undefined : resetAndClose}></div>
      
      <div className={`relative w-full max-w-4xl glass-card rounded-[3rem] p-8 md:p-12 border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'border-white/10' : 'border-black/5'}`}>
        {!showCheckout ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black font-outfit mb-4 tracking-tighter">Power Your <span className="text-indigo-500">Masterpieces</span></h2>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Integrated with secure Stripe payments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PACKAGES.map((pkg) => (
                <div key={pkg.id} className={`p-8 rounded-[2.5rem] border flex flex-col transition-all hover:scale-[1.02] ${pkg.badge ? 'border-indigo-500 bg-indigo-500/5' : (isDark ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5')}`}>
                  {pkg.badge && <span className="self-start px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">{pkg.badge}</span>}
                  <h3 className="text-xl font-black font-outfit mb-1">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black font-outfit">${pkg.price}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">/ one-time</span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-400">
                        <svg className="mt-0.5 text-indigo-500" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setShowCheckout(pkg)} className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${pkg.badge ? 'bg-indigo-500 text-white hover:bg-indigo-600' : (isDark ? 'bg-white text-slate-900 hover:bg-slate-200 shadow-xl shadow-white/5' : 'bg-slate-900 text-white hover:bg-slate-800')}`}>
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : checkoutStep === 'card' ? (
          <div className="max-w-xl mx-auto">
            <button onClick={() => setShowCheckout(null)} className={`absolute top-8 left-8 text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back
            </button>

            <div className="text-center mb-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest mb-6">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                 Stripe Test Mode
               </div>
               <h3 className="text-3xl font-black mb-2 font-outfit">Confirm Upgrade</h3>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{showCheckout.name} • {showCheckout.credits} Credits • ${showCheckout.price}.00</p>
            </div>

            <div className="space-y-5">
              <div className="p-1 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-2 flex items-center justify-between">
                <span className="text-[9px] font-black text-amber-600 uppercase">Test Card:</span>
                <span className="text-[10px] font-mono font-bold text-amber-700">4242 4242 4242 4242</span>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cardholder Name</label>
                  <input type="text" placeholder="J. DOE" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} className={`w-full rounded-2xl px-6 py-4 text-xs font-bold border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-black/5 border-black/5 text-slate-900 focus:border-indigo-500'}`} />
                </div>

                <div className="relative">
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Card Information</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      maxLength={19}
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      className={`w-full rounded-t-2xl px-6 py-4 text-xs font-bold border outline-none transition-all pr-12 ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-black/5 border-black/5 text-slate-900 focus:border-indigo-500'}`} 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60">
                      {cardBrand === 'visa' && <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" />}
                      {cardBrand === 'mastercard' && <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5" />}
                      {cardBrand === 'amex' && <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" className="h-4" />}
                      {cardBrand === 'generic' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-0 border-t-0">
                    <input type="text" placeholder="MM/YY" maxLength={5} value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} className={`w-full border-t-0 rounded-bl-2xl px-6 py-4 text-xs font-bold border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-black/5 border-black/5 text-slate-900 focus:border-indigo-500'}`} />
                    <input type="password" placeholder="CVC" maxLength={3} value={cvv} onChange={e => setCvv(e.target.value.replace(/[^0-9]/g, ''))} className={`w-full border-t-0 border-l-0 rounded-br-2xl px-6 py-4 text-xs font-bold border outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-black/5 border-black/5 text-slate-900 focus:border-indigo-500'}`} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 opacity-50 justify-center">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4" />
                 <div className="h-3 w-px bg-slate-500"></div>
                 <div className="flex items-center gap-1">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 5v11c0 5.25 4.75 10 8 12 3.25-2 8-6.75 8-12V5l-8-3z"/></svg>
                   <span className="text-[9px] font-black uppercase tracking-tighter">Verified Secure</span>
                 </div>
              </div>

              <button 
                disabled={isProcessing || !cardNumber || !expiry || !cvv || !cardName}
                onClick={() => handleStripePayment(showCheckout)}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.01] transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-[8px] animate-pulse tracking-[0.2em]">{processingStatus}</span>
                   </div>
                ) : `Pay $${showCheckout.price}.00`}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
              <svg className="text-emerald-500 relative z-10" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="text-4xl font-black mb-4 font-outfit">Purchase Complete</h3>
            <p className={`text-base font-medium mb-10 max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Your credits are ready. Start crafting your next viral script.
            </p>

            <div className={`max-w-xs mx-auto p-6 rounded-3xl border mb-10 text-left ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
               <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-4">Stripe Receipt</p>
               <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="opacity-50">Reference</span>
                    <span className="font-mono text-[9px]">{transactionRef}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="opacity-50">Settled Date</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="opacity-50">Amount Paid</span>
                    <span className="text-indigo-500 font-outfit">${showCheckout.price}.00</span>
                  </div>
               </div>
            </div>

            <button onClick={resetAndClose} className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all">
              Return to Studio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
