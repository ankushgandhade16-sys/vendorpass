import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Store, Upload, ArrowLeft, ShieldCheck, User, Lock as LockIcon, Phone, Mail, Home, MapPin, Briefcase, FileText } from 'lucide-react';

const VendorRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', fullName: '', phone: '', password: '', email: '', homeAddress: '', businessAddress: '', businessType: '', aadhaar: ''
  });
  const [files, setFiles] = useState({ personalPhoto: null, businessPhoto: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('role', 'vendor');
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files.personalPhoto) data.append('personalPhoto', files.personalPhoto);
    if (files.businessPhoto) data.append('businessPhoto', files.businessPhoto);

    try {
      const res = await axios.post('/api/auth/register', data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FBF7] py-16 px-6 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-emerald-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

      <Link to="/vendor/login" className="absolute top-10 left-10 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-bold transition-all hover:-translate-x-1">
        <ArrowLeft className="w-5 h-5" /> Back to Login
      </Link>
      
      <div className="card w-full max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 rotate-3 shadow-sm border border-blue-100">
            <Store className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Vendor Registration</h2>
          <p className="text-slate-500 mt-3 font-medium">Create your digital identity to start growing your business</p>
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
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="Choose a username" onChange={e => setFormData({...formData, username: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="Your legal name" onChange={e => setFormData({...formData, fullName: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="10-digit mobile number" onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Password</label>
                  <div className="relative">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="password" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="Create a strong password" onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="you@example.com" onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm">2</span>
                Business Details
              </h3>

              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Home Address</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="Complete home address" onChange={e => setFormData({...formData, homeAddress: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Business Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="Where do you sell?" onChange={e => setFormData({...formData, businessAddress: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Business Type</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required placeholder="e.g. Vegetables, Clothing" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" onChange={e => setFormData({...formData, businessType: e.target.value})} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 ml-1">Aadhaar Number</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-500 outline-none transition-all font-medium" placeholder="12-digit Aadhaar number" onChange={e => setFormData({...formData, aadhaar: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">3</span>
              Document Uploads
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all relative overflow-hidden">
                <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFiles({...files, personalPhoto: e.target.files[0]})} />
                <div className="relative z-0">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{files.personalPhoto ? files.personalPhoto.name : 'Personal Photo'}</p>
                  <p className="text-xs text-slate-500 mt-2">Upload a clear photo of your face</p>
                </div>
              </div>
              
              <div className="group border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all relative overflow-hidden">
                <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => setFiles({...files, businessPhoto: e.target.files[0]})} />
                <div className="relative z-0">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                    <Store className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">{files.businessPhoto ? files.businessPhoto.name : 'Business Photo'}</p>
                  <p className="text-xs text-slate-500 mt-2">Upload a photo of your shop/business</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-3">
              {loading ? 'Creating Digital Identity...' : 'Complete Registration'}
              {!loading && <ShieldCheck className="w-6 h-6" />}
            </button>
            <p className="text-center text-slate-400 text-xs mt-6 font-medium">
              By clicking, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegister;
