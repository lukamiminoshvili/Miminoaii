import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden transform transition-all scale-100">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="bg-green-500/10 text-green-400 p-1.5 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            Purchase Credits
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="mb-6 bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700/50 flex items-center justify-between shadow-inner">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Standard Pack</p>
            <p className="text-white font-bold text-lg">5 Video Generations</p>
          </div>
          <div className="text-right">
             <p className="text-green-400 font-bold text-2xl tracking-tight">$4.99</p>
             <p className="text-gray-500 text-xs">One-time payment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5 font-medium">Card Number</label>
            <div className="relative">
                <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-950/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-gray-600 font-mono" />
                <svg className="w-5 h-5 text-gray-500 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5 font-medium">Expiry Date</label>
                <input required type="text" placeholder="MM/YY" className="w-full bg-gray-950/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-gray-600 font-mono text-center" />
             </div>
             <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1.5 font-medium">CVC</label>
                <input required type="text" placeholder="123" maxLength={3} className="w-full bg-gray-950/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all placeholder-gray-600 font-mono text-center" />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={processing}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-900/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 group"
          >
            {processing ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Processing Securely...
               </>
            ) : (
                <>
                Pay $4.99
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
            )}
          </button>
        </form>
        
        <p className="text-center text-gray-500 text-[10px] mt-4 flex items-center justify-center gap-1.5 opacity-70">
           <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
           256-bit SSL Encrypted Connection
        </p>
      </div>
    </div>
  );
};