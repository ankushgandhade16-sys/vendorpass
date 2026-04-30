import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Store, Upload, ArrowLeft } from 'lucide-react';

const VendorRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', fullName: '', phone: '', password: '', email: '', homeAddress: '', businessAddress: '', businessType: '', aadhaar: ''
  });
  const [files, setFiles] = useState({ personalPhoto: null, businessPhoto: null });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('role', 'vendor');
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (files.personalPhoto) data.append('personalPhoto', files.personalPhoto);
    if (files.businessPhoto) data.append('businessPhoto', files.businessPhoto);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 relative">
      <Link to="/vendor/login" className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 flex items-center gap-2">
        <ArrowLeft className="w-5 h-5" /> Back
      </Link>
      
      <div className="card w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Vendor Registration</h2>
          <p className="text-slate-500 mt-2">Create your digital identity to get started</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input type="text" required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input type="tel" required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (Optional)</label>
              <input type="email" className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Home Address</label>
              <input type="text" required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, homeAddress: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
              <input type="text" required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, businessAddress: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
              <input type="text" required placeholder="e.g. Vegetables, Clothing" className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, businessType: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar / Gov ID</label>
              <input type="text" required className="w-full px-4 py-2 border rounded-xl" onChange={e => setFormData({...formData, aadhaar: e.target.value})} />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFiles({...files, personalPhoto: e.target.files[0]})} />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">{files.personalPhoto ? files.personalPhoto.name : 'Upload Personal Photo'}</p>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors relative">
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFiles({...files, businessPhoto: e.target.files[0]})} />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">{files.businessPhoto ? files.businessPhoto.name : 'Upload Business Photo'}</p>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-8">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default VendorRegister;
