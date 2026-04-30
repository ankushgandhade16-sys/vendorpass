import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Store, User, Lock as LockIcon, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const VendorLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      if (res.data.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        setError('Invalid role. Use Wholesaler login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FBF7] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="absolute top-10 left-10 flex items-center gap-6 z-20">
        <Link to="/" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition-all hover:-translate-x-1">
          <ArrowLeft className="w-5 h-5" /> {t('back') || 'Back'}
        </Link>
        <LanguageSelector />
      </div>
      
      <div className="card w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          {/* Animated icon box */}
          <div className="relative inline-block mb-6">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Store className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-[8px]">✦</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('vendor')} {t('login')}</h2>
          <p className="text-slate-400 mt-3 font-medium">{t('welcome')} to VendorPass</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold text-center mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-indigo-700 mb-2 px-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> {t('username')}
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
              <input 
                type="text" 
                required
                className="input-username w-full pl-12 pr-4 py-4 rounded-2xl font-medium"
                placeholder={t('username')}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-700 mb-2 px-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> {t('password')}
            </label>
            <div className="relative group">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input 
                type="password" 
                required
                className="input-password w-full pl-12 pr-4 py-4 rounded-2xl font-medium"
                placeholder={t('password')}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-crazy mt-2">
            <span className="btn-text">
              {loading ? '🔒 ...' : t('login')}
            </span>
          </button>
        </form>

        <p className="text-center mt-10 text-sm text-slate-500 font-medium">
          {t('dontHaveAccount')} <Link to="/vendor/register" className="text-indigo-600 font-bold hover:underline">{t('register')} →</Link>
        </p>
      </div>
    </div>
  );
};

export default VendorLogin;
