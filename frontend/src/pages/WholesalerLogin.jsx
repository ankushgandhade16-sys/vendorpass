import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, User, Lock as LockIcon, ArrowLeft } from 'lucide-react';

const WholesalerLogin = () => {
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
      if (res.data.role === 'wholesaler') {
        navigate('/wholesaler/dashboard');
      } else {
        setError('Invalid role. Use Vendor login.');
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
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      <Link to="/" className="absolute top-10 left-10 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition-all hover:-translate-x-1">
        <ArrowLeft className="w-5 h-5" /> Back
      </Link>
      
      <div className="card w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          {/* Animated icon box */}
          <div className="relative inline-block mb-6">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center animate-bounce animation-delay-2000">
              <span className="text-[8px]">⚡</span>
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Wholesaler Login</h2>
          <p className="text-slate-400 mt-3 font-medium">Access your distribution dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold text-center mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-emerald-700 mb-2 px-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Username
            </label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <input 
                type="text" 
                required
                className="input-username-ws w-full pl-12 pr-4 py-4 rounded-2xl font-medium"
                placeholder="Enter your username"
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-amber-700 mb-2 px-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Password
            </label>
            <div className="relative group">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
              <input 
                type="password" 
                required
                className="input-password-ws w-full pl-12 pr-4 py-4 rounded-2xl font-medium"
                placeholder="Enter your password"
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-crazy-ws mt-2">
            <span className="btn-text">
              {loading ? '🔒 Authenticating...' : '⚡ Sign In'}
            </span>
          </button>
        </form>

        <p className="text-center mt-10 text-sm text-slate-500 font-medium">
          New supplier? <Link to="/wholesaler/register" className="text-emerald-600 font-bold hover:underline">Register your business →</Link>
        </p>
      </div>
    </div>
  );
};

export default WholesalerLogin;
