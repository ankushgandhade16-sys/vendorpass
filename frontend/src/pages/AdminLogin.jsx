import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      if (res.data.role !== 'admin') {
        alert('Not authorized as admin');
        return;
      }
      localStorage.setItem('token', res.data.token);
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.msg || 'Error logging in');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500/20 p-4 rounded-full mb-4">
            <ShieldCheck className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-black text-white">Admin Portal</h2>
          <p className="text-slate-400 mt-2">Sign in to manage the platform</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-400 font-bold mb-2">Admin Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl text-white outline-none focus:border-blue-500" required />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl text-white outline-none focus:border-blue-500" required />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition">
            Access Command Center
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
