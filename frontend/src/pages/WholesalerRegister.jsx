import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, ArrowLeft } from 'lucide-react';

const WholesalerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', fullName: '', phone: '', password: '', email: '', businessName: '', address: '', productCategories: '', gst: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 relative">
      <Link to="/wholesaler/login" className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 flex items-center gap-2">
        <ArrowLeft className="w-5 h-5" /> Back
      </Link>
      
      <div className="card w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Wholesaler Registration</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">Username</label><input required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, username: e.target.value})} /></div>
            <div><label className="block text-sm mb-1">Full Name</label><input required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, fullName: e.target.value})} /></div>
            <div><label className="block text-sm mb-1">Phone Number</label><input required type="tel" className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div><label className="block text-sm mb-1">Password</label><input required type="password" className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            <div><label className="block text-sm mb-1">Email</label><input className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div><label className="block text-sm mb-1">Business Name</label><input required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, businessName: e.target.value})} /></div>
            <div><label className="block text-sm mb-1">Address</label><input required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, address: e.target.value})} /></div>
            <div><label className="block text-sm mb-1">Categories (comma separated)</label><input required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, productCategories: e.target.value})} /></div>
            <div><label className="block text-sm mb-1">GST (Optional)</label><input className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, gst: e.target.value})} /></div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-6 transition">Complete Registration</button>
        </form>
      </div>
    </div>
  );
};

export default WholesalerRegister;
