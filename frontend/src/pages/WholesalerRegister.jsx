import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, ArrowLeft, ShieldCheck, User, Lock as LockIcon, Phone, Mail, MapPin, Briefcase, FileText, Package } from 'lucide-react';

const WholesalerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', fullName: '', phone: '', password: '', email: '', businessName: '', address: '', productCategories: '', gst: '', upiPin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('role', 'wholesaler');
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      const res = await axios.post('/api/auth/register', data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate('/wholesaler/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FBF7] py-16 px-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-teal-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

      <Link to="/wholesaler/login" className="absolute top-10 left-10 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition-all hover:-translate-x-1">
        <ArrowLeft className="w-5 h-5" /> Back to Login
      </Link>
      
      <div className="card w-full max-w-4xl mx-auto relative z-10 border-emerald-50">
        <div className="text-center mb-12">
          <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600 rotate-3 shadow-sm border border-emerald-100">
            <Building2 className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Wholesaler Registration</h2>
          <p className="text-slate-500 mt-3 font-medium">Register your distribution business to reach more vendors</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold text-center mb-8 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">1</span>
                Account Information
              </h3>
              
              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Choose a username" onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Your legal name" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="10-digit mobile number" onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Create a strong password" onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Set UPI PIN (4-Digit)</label>
                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                    <input type="password" maxLength="4" pattern="\d{4}" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-100 focus:bg-white focus:border-teal-500 outline-none transition-all font-medium" placeholder="Enter 4-digit PIN" onChange={e => setFormData({...formData, upiPin: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm">2</span>
                Business Profile
              </h3>

              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Business Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Official Business Name" onChange={e => setFormData({...formData, businessName: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Business Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Distribution Center / Office Address" onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Product Categories</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required placeholder="e.g. Grains, Electronics, FMCG" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" onChange={e => setFormData({...formData, productCategories: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">GST Number (Optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium" placeholder="Your GSTIN number" onChange={e => setFormData({...formData, gst: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-[2rem] shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? 'Processing Registration...' : 'Join Wholesaler Network'}
              {!loading && <ShieldCheck className="w-6 h-6" />}
            </button>
            <p className="text-center text-slate-400 text-xs mt-6 font-medium">
              Join the network of thousands of wholesalers powering local commerce.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WholesalerRegister;
