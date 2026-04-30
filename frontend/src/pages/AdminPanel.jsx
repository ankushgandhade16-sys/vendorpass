import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Users, List, Ban } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [activeTab, setActiveTab] = useState('vendors');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // In a real app we'd verify admin role, but this is a hackathon MVP
      const vRes = await axios.get('/api/vendors', { headers: { 'x-auth-token': token } });
      setVendors(vRes.data);
      const wRes = await axios.get('/api/wholesalers', { headers: { 'x-auth-token': token } });
      setWholesalers(wRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const blockUser = (id) => {
    alert(`User ${id} blocked! (Simulated)`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">Admin Control Panel</h1>
            <p className="text-slate-400">Manage users and monitor system</p>
          </div>
        </header>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('vendors')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition ${activeTab === 'vendors' ? 'bg-blue-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
            <Users className="w-5 h-5" /> Vendors
          </button>
          <button onClick={() => setActiveTab('wholesalers')} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition ${activeTab === 'wholesalers' ? 'bg-emerald-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
            <Users className="w-5 h-5" /> Wholesalers
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="p-4 font-semibold text-slate-300">Name</th>
                <th className="p-4 font-semibold text-slate-300">Contact</th>
                <th className="p-4 font-semibold text-slate-300">Business details</th>
                <th className="p-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'vendors' ? vendors : wholesalers).map(u => (
                <tr key={u._id} className="border-t border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 font-medium">{u.fullName}</td>
                  <td className="p-4 text-slate-400">{u.email || 'N/A'}</td>
                  <td className="p-4 text-slate-400">{u.businessName || u.businessType || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => blockUser(u._id)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium flex items-center gap-2 ml-auto transition">
                      <Ban className="w-4 h-4" /> Block
                    </button>
                  </td>
                </tr>
              ))}
              {(activeTab === 'vendors' ? vendors : wholesalers).length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
