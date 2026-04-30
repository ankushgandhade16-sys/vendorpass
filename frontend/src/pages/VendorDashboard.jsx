import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, Search, CreditCard, Bell, LogOut, ArrowUpRight, ArrowDownRight, User } from 'lucide-react';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');

      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { 'x-auth-token': token }
      });
      setUser(res.data);

      const txRes = await axios.get('http://localhost:5000/api/transactions', {
        headers: { 'x-auth-token': token }
      });
      setTransactions(txRes.data);

      const wsRes = await axios.get('http://localhost:5000/api/wholesalers', {
        headers: { 'x-auth-token': token }
      });
      setWholesalers(wsRes.data);
    } catch (err) {
      console.error(err);
      navigate('/vendor/login');
    }
  };

  const handleSimulate = async (type) => {
    const amount = prompt(`Enter amount to ${type}:`);
    if (!amount || isNaN(amount)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/transactions/simulate', 
        { amount: Number(amount), type, description: `Simulated ${type}` },
        { headers: { 'x-auth-token': token } }
      );
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error');
    }
  };

  const handleRequestCredit = async (wholesalerId) => {
    const amount = prompt('Enter credit amount requested:');
    if (!amount || isNaN(amount)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/credit/request', 
        { wholesalerId, amount: Number(amount) },
        { headers: { 'x-auth-token': token } }
      );
      alert('Credit request sent!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error requesting credit');
    }
  };

  if (!user || !user.vendorProfile) return <div className="p-8 text-center">Loading...</div>;

  const vendor = user.vendorProfile;
  const wallet = user.wallet;
  const photoUrl = vendor.businessPhoto ? `http://localhost:5000/${vendor.businessPhoto.replace(/\\/g, '/')}` : '';

  return (
    <div className="min-h-screen relative bg-slate-900 text-slate-100 font-sans pb-20">
      {/* Dynamic Background */}
      {photoUrl && (
        <div 
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center fixed"
          style={{ backgroundImage: `url(${photoUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900 z-0"></div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 overflow-hidden border-2 border-white/20">
              {vendor.personalPhoto ? (
                <img src={`http://localhost:5000/${vendor.personalPhoto.replace(/\\/g, '/')}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 m-1.5 text-white/80" />
              )}
            </div>
            <div>
              <p className="text-sm text-blue-300 font-medium">Welcome back,</p>
              <h2 className="text-xl font-bold text-white leading-tight">{vendor.fullName}</h2>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
            <LogOut className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 px-4 space-y-6 overflow-y-auto pb-6">
          {activeTab === 'home' && (
            <>
              {/* Trust Card */}
              <div className="glass-panel p-5 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl flex justify-between items-center shadow-2xl">
                <div>
                  <p className="text-sm text-slate-300 mb-1">Trust Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                      {vendor.trustTier}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300 mb-1">Vendor ID</p>
                  <p className="font-mono text-white bg-white/10 px-2 py-1 rounded-lg">{vendor.vendorId}</p>
                </div>
              </div>

              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-2xl shadow-blue-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet className="w-24 h-24" /></div>
                <p className="text-blue-200 font-medium mb-2">Available Balance</p>
                <h3 className="text-4xl font-bold text-white mb-6">₹{wallet?.balance || 0}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleSimulate('credit')} className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm transition">
                    <ArrowDownRight className="w-5 h-5 text-emerald-300" />
                    <span className="font-semibold text-white">Add Money</span>
                  </button>
                  <button onClick={() => handleSimulate('debit')} className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm transition">
                    <ArrowUpRight className="w-5 h-5 text-red-300" />
                    <span className="font-semibold text-white">Send</span>
                  </button>
                </div>
              </div>

              {/* Identity & QR */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center shadow-lg">
                <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">My Receiving QR</p>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                  <QRCodeSVG value={vendor.vendorId} size={160} />
                </div>
                <p className="mt-4 text-slate-300 text-sm">Show this QR to receive payments securely.</p>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 px-2">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx._id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${tx.type === 'credit' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {tx.type === 'credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{tx.description || 'Transaction'}</p>
                          <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'wholesalers' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Find Wholesalers</h2>
              <input type="text" placeholder="Search categories..." className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
              
              <div className="grid gap-4 mt-6">
                {wholesalers.map(ws => (
                  <div key={ws._id} className="bg-white/10 p-5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-lg">{ws.businessName}</h3>
                    <p className="text-sm text-slate-400 mb-3">{ws.productCategories.join(', ')}</p>
                    <button onClick={() => handleRequestCredit(ws._id)} className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-medium transition">Request Credit</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'credit' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Credit Requests</h2>
              <div className="text-center p-8 bg-white/5 border border-white/10 rounded-3xl">
                <p className="text-slate-400">No active credit requests.</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-white/10 z-50">
          <div className="max-w-md mx-auto flex justify-around p-4">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-400' : 'text-slate-500'}`}>
              <Wallet className="w-6 h-6" />
              <span className="text-[10px] font-semibold">Wallet</span>
            </button>
            <button onClick={() => setActiveTab('wholesalers')} className={`flex flex-col items-center gap-1 ${activeTab === 'wholesalers' ? 'text-blue-400' : 'text-slate-500'}`}>
              <Search className="w-6 h-6" />
              <span className="text-[10px] font-semibold">Search</span>
            </button>
            <button onClick={() => setActiveTab('credit')} className={`flex flex-col items-center gap-1 ${activeTab === 'credit' ? 'text-blue-400' : 'text-slate-500'}`}>
              <CreditCard className="w-6 h-6" />
              <span className="text-[10px] font-semibold">Credit</span>
            </button>
            <button className={`flex flex-col items-center gap-1 text-slate-500`}>
              <Bell className="w-6 h-6" />
              <span className="text-[10px] font-semibold">Alerts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
