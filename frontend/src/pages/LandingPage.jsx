import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Building2, ChevronRight, ShieldCheck, Wallet, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const LandingPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col justify-center items-center p-6">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Store className="text-blue-600 w-8 h-8" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">VendorPass</h1>
        </div>
        <LanguageSelector className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50" />
      </div>

      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center mt-12">
        <div className="space-y-6 text-center md:text-left">
          <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            {t('landingTitle') || 'Digital Identity & Wallet for All.'}
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto md:mx-0 leading-relaxed">
            {t('landingSubtitle') || 'Empowering street vendors and wholesalers with verified digital identities, intelligent transaction tracking, and dynamic credit scoring.'}
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
                  <h3 className="font-bold text-slate-900 text-lg">{t('login')} {t('asVendor') || 'as Vendor'}</h3>
                  <p className="text-sm text-slate-500">{t('vendorDesc') || 'Street vendors & local businesses'}</p>
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
                  <h3 className="font-bold text-slate-900 text-lg">{t('login')} {t('asWholesaler') || 'as Wholesaler'}</h3>
                  <p className="text-sm text-slate-500">{t('wholesalerDesc') || 'Suppliers & distributors'}</p>
                </div>
              </div>
              <ChevronRight className="relative w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </button>

            <button 
              onClick={() => navigate('/admin/login')}
              className="group relative w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-purple-500 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-purple-50 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-lg">System Admin</h3>
                  <p className="text-sm text-slate-500">Security & Command Center</p>
                </div>
              </div>
              <ChevronRight className="relative w-6 h-6 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </button>
          </div>
        </div>

        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 via-teal-500 to-emerald-500 rounded-[3rem] rotate-3 opacity-30 blur-2xl"></div>
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2rem] p-10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            
            <h3 className="text-2xl font-bold mb-8 text-slate-900 tracking-tight">{t('whyVendorPass') || 'Why VendorPass?'}</h3>
            <ul className="space-y-8">
              <li className="flex gap-4 items-start group">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 mt-1 shadow-sm group-hover:scale-110 transition-transform"><ShieldCheck className="w-6 h-6"/></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{t('verifiedIdentity') || 'Verified Identity'}</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t('verifiedIdentityDesc') || 'Instant QR-based digital identity for unbanked vendors, establishing trust in the marketplace.'}</p>
                </div>
              </li>
              <li className="flex gap-4 items-start group">
                <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 mt-1 shadow-sm group-hover:scale-110 transition-transform"><Wallet className="w-6 h-6"/></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{t('virtualWallet') || 'Virtual Wallet'}</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t('virtualWalletDesc') || 'Seamless financial tracking to analyze, manage, and scale your daily business cash flow effortlessly.'}</p>
                </div>
              </li>
              <li className="flex gap-4 items-start group">
                <div className="bg-purple-50 p-3 rounded-2xl text-purple-600 mt-1 shadow-sm group-hover:scale-110 transition-transform"><ArrowRightLeft className="w-6 h-6"/></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{t('microCredit') || 'Micro-Credit System'}</h4>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{t('microCreditDesc') || 'Build intelligent trust scores to dynamically access inventory and micro-loans exactly when you need them.'}</p>
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
