import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, CreditCard, LogOut, Package, Wallet, Building2 } from 'lucide-react';

const WholesalerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('vendors');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');

      const res = await axios.get('/api/auth/me', {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);

      const venRes = await axios.get('/api/vendors', {
        headers: { 'x-auth-token': token }
      });
      setVendors(venRes.data);

      const reqRes = await axios.get('/api/credit', {
        headers: { 'x-auth-token': token }
      });
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
      navigate('/wholesaler/login');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/credit/${id}`, { status }, {
        headers: { 'x-auth-token': token }
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating status');
    }
  };

  if (!user || !user.wholesalerProfile) return <div className="p-8 text-center">Loading...</div>;

  const wholesaler = user.wholesalerProfile;
  const wallet = user.wallet;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-emerald-600 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Building2 className="w-40 h-40" /></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-emerald-100 text-sm">Dashboard</p>
            <h1 className="text-2xl font-bold">{wholesaler.businessName}</h1>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="mt-6 bg-emerald-700/50 p-4 rounded-xl flex items-center justify-between border border-emerald-500">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-emerald-200" />
            <span className="text-emerald-50">Wallet Balance</span>
          </div>
          <span className="text-2xl font-bold">₹{wallet?.balance || 0}</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 mt-4">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <button onClick={() => setActiveTab('vendors')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${activeTab === 'vendors' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>Vendors</button>
          <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${activeTab === 'requests' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>Credit Requests</button>
        </div>

        {activeTab === 'vendors' && (
          <div className="grid md:grid-cols-2 gap-4">
            {vendors.map(v => (
              <div key={v._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {v.personalPhoto ? (
                    <img src={`/${v.personalPhoto.replace(/\\/g, '/')}`} className="w-full h-full object-cover" alt="Vendor" />
                  ) : <Users className="w-8 h-8 m-4 text-slate-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{v.fullName}</h3>
                  <p className="text-sm text-slate-500 mb-2">{v.businessType}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.trustTier === 'Platinum' ? 'bg-slate-800 text-white' : v.trustTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : v.trustTier === 'Silver' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'}`}>
                      {v.trustTier} Trust
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{r.vendor.fullName}</h3>
                    <p className="text-sm text-slate-500">Requested Amount: <span className="font-bold text-slate-700">₹{r.amount}</span></p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold h-fit ${r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : r.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status}
                  </span>
                </div>
                {r.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusUpdate(r._id, 'Approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-medium transition">Approve</button>
                    <button onClick={() => handleStatusUpdate(r._id, 'Rejected')} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl font-medium transition">Reject</button>
                  </div>
                )}
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center p-8 bg-white rounded-3xl border border-slate-200">
                <p className="text-slate-500">No incoming credit requests.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WholesalerDashboard;
