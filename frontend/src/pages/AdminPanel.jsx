import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Users, List, Ban, Activity, Lock } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [activeTab, setActiveTab] = useState('vendors');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const vRes = await axios.get('/api/vendors', { headers: { 'x-auth-token': token } });
      setVendors(vRes.data);
      const wRes = await axios.get('/api/wholesalers', { headers: { 'x-auth-token': token } });
      setWholesalers(wRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const blockUser = (id) => {
    alert(`User security lock initiated for ${id}!`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="bg-red-500/20 p-4 rounded-3xl border border-red-500/30">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white">Security Command Center</h1>
              <p className="text-slate-400 font-medium mt-1">Global User Management & System Oversight</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Users</span>
               <span className="text-xl font-black text-white">{vendors.length + wholesalers.length}</span>
             </div>
             <div className="bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20 flex flex-col items-center">
               <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">System Status</span>
               <span className="text-xl font-black text-emerald-400 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Live
               </span>
             </div>
          </div>
        </header>

        <div className="flex gap-3 mb-8 bg-white/5 p-2 rounded-3xl border border-white/10 w-fit">
          <button 
            onClick={() => setActiveTab('vendors')} 
            className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${activeTab === 'vendors' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Users className="w-5 h-5" /> Vendor Network
          </button>
          <button 
            onClick={() => setActiveTab('wholesalers')} 
            className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${activeTab === 'wholesalers' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Building2 className="w-5 h-5" /> Wholesaler Hub
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-8 font-bold text-slate-400 uppercase tracking-widest text-xs">Profile Name</th>
                <th className="p-8 font-bold text-slate-400 uppercase tracking-widest text-xs">Communication</th>
                <th className="p-8 font-bold text-slate-400 uppercase tracking-widest text-xs">Business Model</th>
                <th className="p-8 font-bold text-slate-400 uppercase tracking-widest text-xs text-right">System Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-slate-400 font-bold">Synchronizing Data...</p>
                  </td>
                </tr>
              ) : (activeTab === 'vendors' ? vendors : wholesalers).map(u => (
                <tr key={u._id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-blue-400 border border-white/10">
                        {u.fullName.charAt(0)}
                      </div>
                      <span className="font-bold text-white text-lg tracking-tight">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="p-8 text-slate-400 font-medium">{u.email || 'Encrypted'}</td>
                  <td className="p-8">
                    <span className="bg-white/5 px-4 py-2 rounded-xl text-slate-300 font-bold border border-white/10">
                      {u.businessName || u.businessType || 'Standard'}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <button onClick={() => blockUser(u._id)} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 ml-auto transition-all duration-300 border border-red-500/20 group-hover:scale-105 active:scale-95">
                      <Lock className="w-4 h-4" /> Restrict Access
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && (activeTab === 'vendors' ? vendors : wholesalers).length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <List className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-xl font-bold">Registry Entry Empty</p>
                  </td>
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
