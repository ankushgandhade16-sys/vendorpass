import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Store, Send, ShieldCheck } from 'lucide-react';

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
      <div className="min-h-screen bg-emerald-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
          <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Payment Sent!</h2>
          <p className="text-slate-500 mb-8">Successfully paid ₹{amount} to vendor.</p>
          <button onClick={() => navigate('/')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Pay Vendor</h2>
          <p className="text-slate-500 font-mono mt-1 text-sm bg-slate-100 inline-block px-2 py-1 rounded">ID: {vendorId}</p>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6">{errorMsg}</div>
        )}

        <form onSubmit={handlePayment} className="space-y-6">
          <div>
            <label className="block text-center text-sm font-medium text-slate-500 mb-4">Enter Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
              <input 
                type="number" 
                required
                min="1"
                className="w-full pl-12 pr-4 py-4 text-3xl font-bold text-slate-800 bg-white border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-center"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl shadow-lg flex justify-center items-center gap-2 transition"
          >
            {status === 'loading' ? 'Processing...' : (
              <>
                <Send className="w-5 h-5" /> Pay Securely
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4" /> Secure Sandbox Payment
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
