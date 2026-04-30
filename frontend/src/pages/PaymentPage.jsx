import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Store, Send, ShieldCheck, ArrowLeft, IndianRupee } from 'lucide-react';

const PaymentPage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    
    setStatus('loading');
    try {
      await axios.post(`/api/transactions/pay/${vendorId}`, { amount: Number(amount) });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.msg || 'Payment failed');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#F6FBF7] flex flex-col justify-center items-center p-6 text-center relative overflow-hidden">
        {/* Success Background Blobs */}
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

        <div className="card max-w-sm w-full relative z-10 border-emerald-50 scale-110">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-inner">
            <CheckCircle className="w-16 h-16" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Success!</h2>
          <p className="text-slate-600 font-medium mb-8">Successfully transferred <span className="text-emerald-600 font-bold">₹{amount}</span> to the vendor's wallet.</p>
          <button onClick={() => navigate('/')} className="btn-primary flex items-center justify-center gap-2">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FBF7] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

      <button onClick={() => navigate(-1)} className="absolute top-10 left-10 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition-all hover:-translate-x-1">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <div className="card w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 rotate-3 shadow-sm border border-blue-100">
            <Store className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Secure Payment</h2>
          <div className="mt-3 inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recipient ID</span>
            <span className="text-sm font-black text-blue-600 font-mono">{vendorId}</span>
          </div>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold text-center mb-8 animate-shake">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-8">
          <div>
            <label className="block text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Enter Amount to Transfer</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-300 group-focus-within:text-blue-500 transition-colors">₹</span>
              <input 
                type="number" 
                required
                min="1"
                className="w-full pl-16 pr-8 py-8 text-5xl font-black text-slate-900 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-8 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all text-center placeholder:text-slate-200"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={status === 'loading' || !amount}
            className="btn-primary flex items-center justify-center gap-3 py-5 text-xl"
          >
            {status === 'loading' ? 'Encrypting & Sending...' : (
              <>
                <Send className="w-6 h-6" /> Complete Payment
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Powered by VendorPass Secure
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
