import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Building2, ChevronRight, ShieldCheck, Wallet, ArrowRightLeft } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col justify-center items-center p-6">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Store className="text-blue-600 w-8 h-8" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">VendorPass</h1>
        </div>
      </div>

      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center mt-12">
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Hackathon MVP Version
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Digital Identity & <br/> <span className="text-blue-600">Wallet for All.</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto md:mx-0">
            Empowering street vendors and wholesalers with verified digital identities, dummy transaction tracking, and dynamic credit scoring.
          </p>
          
          <div className="grid grid-cols-1 gap-4 pt-4">
            <button 
              onClick={() => navigate('/vendor/login')}
              className="group relative w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <Store className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-lg">Login as Vendor</h3>
                  <p className="text-sm text-slate-500">Street vendors & local businesses</p>
                </div>
              </div>
              <ChevronRight className="relative w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>

            <button 
              onClick={() => navigate('/wholesaler/login')}
              className="group relative w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-emerald-50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-lg">Login as Wholesaler</h3>
                  <p className="text-sm text-slate-500">Suppliers & distributors</p>
                </div>
              </div>
              <ChevronRight className="relative w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>
        </div>

        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[3rem] rotate-3 opacity-20 blur-xl"></div>
          <div className="glass-panel rounded-[2rem] p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            
            <h3 className="text-2xl font-bold mb-6 text-slate-800">Why VendorPass?</h3>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1"><ShieldCheck className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-semibold text-slate-800">Verified Identity</h4>
                  <p className="text-sm text-slate-600">Instant QR-based digital identity for unbanked vendors.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mt-1"><Wallet className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-semibold text-slate-800">Virtual Wallet</h4>
                  <p className="text-sm text-slate-600">Seamless dummy transactions to track business flow.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 mt-1"><ArrowRightLeft className="w-5 h-5"/></div>
                <div>
                  <h4 className="font-semibold text-slate-800">Micro-Credit System</h4>
                  <p className="text-sm text-slate-600">Build trust scores to access inventory on credit.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
