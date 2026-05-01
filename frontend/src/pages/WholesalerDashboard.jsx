import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, LogOut, Wallet, Building2, MessageSquare, User, Send, IndianRupee, AlertTriangle, Clock, Percent, ShieldCheck, Check, Edit3, X, History, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const WholesalerDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('vendors');
  const [conversations, setConversations] = useState([]);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatAmount, setChatAmount] = useState('');
  const [showPayInput, setShowPayInput] = useState(false);
  const [loanInputs, setLoanInputs] = useState({});
  const [now, setNow] = useState(new Date());

  const [upiModal, setUpiModal] = useState(null); // { action: 'send_money', payload: {} }
  const [upiPin, setUpiPin] = useState('');
  const [upiError, setUpiError] = useState('');
  const [successScreen, setSuccessScreen] = useState(null);
  const [selectedVendorProfile, setSelectedVendorProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [editProfileData, setEditProfileData] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [simulateModal, setSimulateModal] = useState(null); // 'credit' | 'debit'
  const [simulateAmount, setSimulateAmount] = useState('');

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (activeTab === 'messages') fetchConversations();
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'wallet') fetchTransactions();
  }, [activeTab]);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab !== 'requests') return;
    const interval = setInterval(() => fetchRequests(), 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');
      const res = await axios.get('/api/auth/me', { headers: { 'x-auth-token': token } });
      setUser(res.data);
      const venRes = await axios.get('/api/vendors', { headers: { 'x-auth-token': token } });
      setVendors(venRes.data);
      await fetchRequests();
    } catch (err) { console.error(err); navigate('/wholesaler/login'); }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const reqRes = await axios.get('/api/credit', { headers: { 'x-auth-token': token } });
      setRequests(reqRes.data);
      await axios.post('/api/credit/check-overdue', {}, { headers: { 'x-auth-token': token } });
    } catch (err) { console.error(err); }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/messages/conversations', { headers: { 'x-auth-token': token } });
      setConversations(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/transactions', { headers: { 'x-auth-token': token } });
      setTransactions(res.data);
    } catch (err) { console.error(err); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/wholesalers/profile', editProfileData, { headers: { 'x-auth-token': token } });
      setEditProfileData(null);
      fetchData(); // refresh profile data
    } catch (err) { alert(err.response?.data?.msg || 'Error updating profile'); }
    finally { setIsUpdatingProfile(false); }
  };

  const openChat = async (userId) => {
    setChatUserId(userId);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${userId}`, { headers: { 'x-auth-token': token } });
      setChatMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!chatText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages/send', { receiverId: chatUserId, text: chatText }, { headers: { 'x-auth-token': token } });
      setChatText('');
      openChat(chatUserId);
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const handleSimulate = async (type) => {
    setSimulateAmount('');
    setSimulateModal(type);
  };

  const confirmSimulate = async () => {
    if (!simulateAmount || isNaN(simulateAmount) || Number(simulateAmount) <= 0) return;
    setUpiError('');
    setUpiModal({ action: 'wallet_tx', payload: { type: simulateModal, amount: Number(simulateAmount) } });
    setSimulateModal(null);
  };

  const handleUpiSubmit = async () => {
    // Accept any 4-digit PIN for hackathon demo
    if (upiPin.length !== 4) return;
    try {
      const token = localStorage.getItem('token');
      if (upiModal.action === 'wallet_tx') {
        const { type, amount } = upiModal.payload;
        await axios.post('/api/transactions/simulate', { 
          amount, 
          type, 
          description: type === 'credit' ? `Added ₹${amount}` : 'Transferred to Bank Account'
        }, { headers: { 'x-auth-token': token } });
        
        setSuccessScreen({
          title: type === 'credit' ? 'Wallet Recharged' : 'Withdrawal Successful',
          amount,
          subtitle: type === 'credit' ? 'Money added to your business wallet.' : 'Money sent to your linked bank account.'
        });
        setUpiModal(null);
        setUpiPin('');
        setSimulateAmount('');
        fetchData();
        if (activeTab === 'wallet') fetchTransactions();
      } else {
        const res = await axios.post('/api/transactions/send', { 
          receiverId: upiModal.payload.vendorId || chatUserId, 
          amount: upiModal.payload.amount, 
          note: upiModal.payload.note || 'Manual payment'
        }, { headers: { 'x-auth-token': token } });
        
        setSuccessScreen({
          title: t('paymentSuccessful'),
          amount: upiModal.payload.amount,
          subtitle: `${t('sendMoney')} ${upiModal.payload.vendorName || t('vendor')}`
        });
        setUpiModal(null);
        setUpiPin('');
        fetchData();
        if (chatUserId) openChat(chatUserId);
      }
    } catch (err) {
      setUpiError(err.response?.data?.msg || 'Payment failed');
    }
  };

  const approveLoan = async (loanId) => {
    const inputs = loanInputs[loanId] || {};
    if (!inputs.interestRate || !inputs.duration) return alert('Enter terms');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/credit/approve/${loanId}`, inputs, { headers: { 'x-auth-token': token } });
      fetchRequests();
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/credit/${id}`, { status: 'Rejected' }, { headers: { 'x-auth-token': token } });
      fetchRequests();
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const startChatWithVendor = (vendor) => {
    setActiveTab('messages');
    openChat(vendor._id || vendor.userId);
  };

  const updateLoanInput = (id, field, value) => {
    setLoanInputs(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const getPhotoUrl = (pathStr) => {
    if (!pathStr) return '';
    let filename = pathStr;
    if (filename.includes('\\')) filename = filename.split('\\').pop();
    if (filename.includes('/')) filename = filename.split('/').pop();
    return `/uploads/${filename}`;
  };

  if (!user || !user.wholesalerProfile) return <div className="p-8 text-center">Loading...</div>;
  const wholesaler = user.wholesalerProfile;
  const wallet = user.wallet;

  return (
    <div className="min-h-screen bg-[#F6FBF7] text-slate-900 pb-20 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-emerald-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-teal-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

      <header className="bg-slate-900 text-white p-8 rounded-b-[3rem] shadow-2xl relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Building2 className="w-56 h-56" /></div>
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
             <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl border border-emerald-500/30 overflow-hidden flex items-center justify-center flex-shrink-0">
               {wholesaler.photos && wholesaler.photos[0] ? (
                 <img src={getPhotoUrl(wholesaler.photos[0])} alt="Wholesaler" className="w-full h-full object-cover" />
               ) : (
                 <Building2 className="w-8 h-8 text-emerald-400" />
               )}
             </div>
             <div>
               <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">{t('wholesaler')}</p>
               <div className="flex items-center gap-3">
                 <h1 className="text-3xl font-extrabold tracking-tight">{wholesaler.businessName}</h1>
                 <button onClick={() => setEditProfileData({ ...wholesaler, productCategories: wholesaler.productCategories?.join(', ') || '' })} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors" title="Edit Profile">
                   <Edit3 className="w-5 h-5 text-emerald-300" />
                 </button>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector className="bg-white/10 px-3 py-2 rounded-2xl border border-white/10" />
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all hover:scale-110 active:scale-95 border border-white/10">
              <LogOut className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 mt-4">
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          {['vendors', 'requests', 'history', 'messages', 'wallet'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setChatUserId(null); }}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg font-medium transition text-sm ${activeTab === tab ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              {tab === 'messages' ? t('chat') : tab === 'history' ? t('history') || 'History' : tab === 'requests' ? t('activeLoans') : tab === 'wallet' ? t('wallet') || 'Wallet' : t('vendors')}
            </button>
          ))}
        </div>

        {activeTab === 'wallet' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row justify-between md:items-end gap-6">
              <div className="absolute top-0 right-0 p-8 opacity-20"><Wallet className="w-32 h-32" /></div>
              <div className="relative z-10">
                <p className="text-emerald-100 font-bold tracking-widest uppercase mb-2">Available Balance</p>
                <h3 className="text-6xl font-black tracking-tight drop-shadow-md">₹{wallet?.balance || 0}</h3>
              </div>
              <div className="flex gap-3 relative z-10">
                <button onClick={() => handleSimulate('credit')} className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm transition font-bold shadow-lg shadow-emerald-900/20">
                  <ArrowDownRight className="w-5 h-5" /> Top Up
                </button>
                <button onClick={() => handleSimulate('debit')} className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm transition font-bold shadow-lg shadow-emerald-900/20">
                  <ArrowUpRight className="w-5 h-5" /> Withdraw
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-xl"><History className="w-6 h-6 text-emerald-600" /></div>
                <h3 className="font-bold text-xl text-slate-800">Recent Transactions</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {transactions.map(tx => (
                  <div key={tx._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{tx.description}</p>
                      <p className="text-sm text-slate-500">{new Date(tx.date).toLocaleString()}</p>
                    </div>
                    <div className={`font-black text-xl ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                      <History className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No transactions found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="grid md:grid-cols-2 gap-4">
            {vendors.map(v => (
              <div key={v._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {v.personalPhoto ? <img src={getPhotoUrl(v.personalPhoto)} className="w-full h-full object-cover" alt="Vendor" /> : <Users className="w-8 h-8 m-4 text-slate-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{v.fullName}</h3>
                  <p className="text-sm text-slate-500 mb-2">{v.businessType}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.trustTier === 'Platinum' ? 'bg-slate-800 text-white' : v.trustTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : v.trustTier === 'Silver' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'}`}>
                      {t(v.trustTier.toLowerCase())} {t('trust')}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedVendorProfile(v)} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                        <User className="w-4 h-4" /> View Profile
                      </button>
                      <button onClick={() => startChatWithVendor(v)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4" /> {t('chat')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {vendors.length === 0 && <div className="col-span-2 text-center p-8 bg-white rounded-2xl border"><p className="text-slate-500">{t('noVendors')}</p></div>}
          </div>
        )}

        {(activeTab === 'requests' || activeTab === 'history') && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">{activeTab === 'history' ? t('historyTitle') : t('activeLoans')}</h2>
            {requests
              .filter(r => activeTab === 'history' ? ['Paid', 'Pending'].includes(r.status) : !['Paid', 'Pending'].includes(r.status))
              .map(r => {
              const isOverdue = ['Overdue', 'Defaulted'].includes(r.status);
              const remaining = (r.totalDue || r.amount) - (r.amountPaid || 0);
              const inputs = loanInputs[r._id] || {};
              const diffMs = r.dueDate ? new Date(r.dueDate) - now : 0;
              const totalSecsLeft = Math.max(0, Math.floor(diffMs / 1000));
              const minsLeft = Math.floor(totalSecsLeft / 60);
              const secsLeft = totalSecsLeft % 60;
              const timerStr = `${minsLeft}:${secsLeft.toString().padStart(2, '0')}`;

              return (
                <div key={r._id} className={`bg-white p-5 rounded-2xl shadow-sm border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                  <div className="flex justify-between mb-3">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {r.vendor?.personalPhoto ? (
                          <img src={getPhotoUrl(r.vendor.personalPhoto)} alt="Vendor" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 m-3 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{r.vendor?.fullName || t('vendor')}</h3>
                        <p className="text-sm text-slate-500">{t('requested')}: <span className="font-bold text-slate-700">₹{r.amount}</span></p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold h-fit ${
                      r.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      r.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                      r.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      isOverdue ? 'bg-red-100 text-red-700' :
                      r.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{t(r.status.toLowerCase()) || r.status}</span>
                  </div>

                  {/* Pending — Wholesaler sets interest + duration */}
                  {r.status === 'Pending' && (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-sm text-amber-800 font-medium mb-3">{t('setTerms')}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Percent className="w-3 h-3" /> {t('interestRateLabel')} (%)</label>
                            <input type="number" min="0" placeholder="5" value={inputs.interestRate || ''} onChange={e => updateLoanInput(r._id, 'interestRate', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> {t('tenure')} ({t('min')})</label>
                            <input type="number" min="1" placeholder="5" value={inputs.duration || ''} onChange={e => updateLoanInput(r._id, 'duration', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          {t('totalVendorOwe')}: ₹{(r.amount * (1 + (inputs.interestRate || 5) / 100)).toFixed(2)} • {t('dueIn')} {inputs.duration || 5} {t('min')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => approveLoan(r._id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition">
                          ✅ {t('approveLoan')} & Send ₹{r.amount}
                        </button>
                        <button onClick={() => handleReject(r._id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-xl font-bold transition">
                          {t('rejectLoan')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active / Overdue / Defaulted — Show loan details */}
                  {['Active', 'Overdue', 'Defaulted'].includes(r.status) && (
                    <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
                      <div className="flex justify-between"><span className="text-slate-500">{t('interestRateLabel')}</span><span className={isOverdue ? 'text-red-600 font-bold' : 'font-medium'}>{r.interestRate}%</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">{t('totalDue')}</span><span className="font-bold">₹{(r.totalDue || 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">{t('paidSoFar')}</span><span className="text-emerald-600 font-medium">₹{r.amountPaid || 0}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">{t('remaining')}</span><span className="font-bold text-slate-800">₹{remaining.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">{t('dueDate')}</span><span className={isOverdue ? 'text-red-600 font-bold' : ''}>{new Date(r.dueDate).toLocaleTimeString()}</span></div>
                      {r.dueDate && r.status === 'Active' && (
                        <div className="flex justify-between"><span className="text-slate-500">⏱️ {t('timeLeft')}</span><span className={`font-bold text-lg ${totalSecsLeft <= 120 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>{timerStr}</span></div>
                      )}
                      {isOverdue && (
                        <div className="flex items-center gap-2 text-red-600 mt-2 bg-red-50 p-2 rounded-lg">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">{t('overdueWarning')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Paid */}
                  {r.status === 'Paid' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-medium">
                      ✅ {t('fullyRepaid')} — ₹{r.amountPaid} {t('received') || 'received'}
                    </div>
                  )}
                </div>
              );
            })}
            {requests.filter(r => activeTab === 'history' ? ['Paid', 'Pending'].includes(r.status) : !['Paid', 'Pending'].includes(r.status)).length === 0 && (
              <div className="text-center p-8 bg-white rounded-2xl border"><p className="text-slate-500">No {activeTab === 'history' ? t('records') : t('activeLoansFound')} found.</p></div>
            )}
          </div>
        )}

        {activeTab === 'messages' && !chatUserId && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">{t('messages')}</h2>
            {conversations.map(c => (
              <button key={c.userId} onClick={() => openChat(c.userId)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 transition text-left shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                  {c.photo ? (
                    <img src={getPhotoUrl(c.photo)} className="w-full h-full object-cover" alt="User" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{c.name}</p>
                  <p className="text-sm text-slate-500 truncate">{c.lastMessage}</p>
                </div>
                <p className="text-xs text-slate-400">{new Date(c.lastDate).toLocaleDateString()}</p>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="text-center p-8 bg-white rounded-2xl border"><p className="text-slate-500">{t('noMessages')}. {t('goToVendorsChat')}</p></div>
            )}
          </div>
        )}

        {activeTab === 'messages' && chatUserId && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <button onClick={() => { setChatUserId(null); fetchConversations(); }} className="text-sm text-emerald-600 hover:underline">← {t('back')}</button>
            </div>
            <div className="h-[400px] overflow-y-auto p-4 space-y-3 bg-slate-50">
              {chatMessages.map(msg => (
                <div key={msg._id} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.sender === user._id ? 'bg-emerald-600 text-white' : msg.type === 'payment' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-white border border-slate-200 text-slate-800'
                  }`}>
                    {msg.type === 'payment' && <div className="flex items-center gap-2 mb-1"><IndianRupee className="w-4 h-4" /><span className="font-bold text-lg">₹{msg.amount}</span></div>}
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === user._id ? 'text-white/60' : 'text-slate-400'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 space-y-2">
              {showPayInput && (
                <div className="flex gap-2">
                  <input type="number" placeholder="Amount" value={chatAmount} onChange={e => setChatAmount(e.target.value)} className="flex-1 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
                  <button onClick={sendMoney} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition flex items-center gap-1"><IndianRupee className="w-4 h-4" /> Send</button>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setShowPayInput(!showPayInput)} className={`p-3 rounded-xl transition border ${showPayInput ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}><IndianRupee className="w-5 h-5" /></button>
                <input type="text" placeholder="Type a message..." value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500" />
                <button onClick={sendMessage} className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UPI PIN Modal */}
      {upiModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex flex-col items-center justify-end sm:justify-center p-4 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-slate-50 border-2 border-slate-100 shadow-inner">
                <ShieldCheck className="w-8 h-8 text-slate-800" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">{t('enterPin')}</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">{t('secureProcess')} ₹{upiModal.payload.amount}</p>
              {upiError && <p className="text-red-500 text-sm font-bold mt-2 animate-shake">{upiError}</p>}
            </div>
            <div className="mb-8">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black transition-all ${upiPin.length > i ? 'bg-slate-800 text-white shadow-lg scale-105' : upiError ? 'bg-red-50 border-2 border-red-200 text-red-500' : 'bg-slate-100 text-slate-300 border-2 border-slate-200'}`}>
                    {upiPin.length > i ? '•' : ''}
                  </div>
                ))}
              </div>
              <input
                type="password"
                maxLength="4"
                pattern="\d*"
                autoFocus
                value={upiPin}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setUpiPin(val);
                  if (upiError) setUpiError('');
                  if (val.length === 4) {
                    setTimeout(() => document.getElementById('upi-submit-btn').click(), 100);
                  }
                }}
                className="absolute opacity-0 top-0 left-0 w-full h-full cursor-text"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => { setUpiModal(null); setUpiPin(''); }} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">{t('cancel')}</button>
              <button id="upi-submit-btn" onClick={handleUpiSubmit} disabled={upiPin.length !== 4} className="py-4 rounded-2xl text-white font-bold transition hover:-translate-y-0.5 shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 disabled:opacity-50 disabled:hover:translate-y-0">
                {t('submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Success Screen (PhonePe / GPay style) */}
      {successScreen && (
        <div className="fixed inset-0 bg-emerald-600 z-[200] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-400 rounded-full mix-blend-screen filter blur-[50px] opacity-60 animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-10 zoom-in-50 duration-500 delay-100">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-[0_0_0_8px_rgba(255,255,255,0.2)] relative">
              <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
              <Check className="w-16 h-16 text-emerald-600 animate-in zoom-in duration-500 delay-300" strokeWidth={3} />
            </div>
            
            <h2 className="text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">₹{successScreen.amount}</h2>
            <p className="text-emerald-100 text-2xl font-bold mb-2 tracking-wide">{successScreen.title}</p>
            <p className="text-emerald-50 text-center max-w-xs">{successScreen.subtitle}</p>
            
            <button 
              onClick={() => setSuccessScreen(null)} 
              className="mt-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {/* Vendor Profile Modal */}
      {selectedVendorProfile && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedVendorProfile(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10">
              <LogOut className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6 mt-4 relative">
              <div className="w-24 h-24 rounded-full bg-slate-100 mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg relative z-10">
                {selectedVendorProfile.personalPhoto ? (
                  <img src={getPhotoUrl(selectedVendorProfile.personalPhoto)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 m-6 text-slate-300" />
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-800">{selectedVendorProfile.fullName}</h3>
              <p className="text-emerald-600 font-bold mb-3">{selectedVendorProfile.businessType || 'Retailer'}</p>
              
              <div className="flex justify-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  selectedVendorProfile.trustTier === 'Platinum' ? 'bg-slate-800 text-white' : 
                  selectedVendorProfile.trustTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 
                  selectedVendorProfile.trustTier === 'Silver' ? 'bg-slate-200 text-slate-800' : 
                  'bg-orange-100 text-orange-800'
                }`}>
                  {selectedVendorProfile.trustTier} Tier
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 shadow-sm">
                  Trust Score: {selectedVendorProfile.trustScore || 0}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Business Details</h4>
                <div className="grid gap-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-[11px] text-slate-500 font-bold uppercase">Vendor ID</span>
                    <span className="font-semibold text-slate-800">{selectedVendorProfile.vendorId}</span>
                  </div>
                  {selectedVendorProfile.email && (
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Email</span>
                      <span className="font-semibold text-slate-800">{selectedVendorProfile.email}</span>
                    </div>
                  )}
                  {selectedVendorProfile.aadhaar && (
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Aadhaar/ID</span>
                      <span className="font-bold text-slate-800 font-mono tracking-widest">{selectedVendorProfile.aadhaar}</span>
                    </div>
                  )}
                  {selectedVendorProfile.businessAddress && (
                    <div>
                      <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Business Address</span>
                      <span className="font-semibold text-slate-800 text-sm leading-tight">{selectedVendorProfile.businessAddress}</span>
                    </div>
                  )}
                  {selectedVendorProfile.homeAddress && (
                    <div className="pt-2">
                      <span className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Home Address</span>
                      <span className="font-semibold text-slate-800 text-sm leading-tight">{selectedVendorProfile.homeAddress}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedVendorProfile.businessPhoto && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Business Photo</h4>
                  <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shadow-sm">
                    <img src={getPhotoUrl(selectedVendorProfile.businessPhoto)} alt="Store" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <button 
                  onClick={() => { 
                    const v = selectedVendorProfile;
                    setSelectedVendorProfile(null); 
                    startChatWithVendor(v); 
                  }} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-5 h-5" /> Message Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {editProfileData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Edit Profile</h3>
              <button onClick={() => setEditProfileData(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input type="text" value={editProfileData.fullName} onChange={e => setEditProfileData({...editProfileData, fullName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Name</label>
                <input type="text" value={editProfileData.businessName} onChange={e => setEditProfileData({...editProfileData, businessName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input type="email" value={editProfileData.email} onChange={e => setEditProfileData({...editProfileData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Address</label>
                <input type="text" value={editProfileData.address} onChange={e => setEditProfileData({...editProfileData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GST Number</label>
                  <input type="text" value={editProfileData.gst} onChange={e => setEditProfileData({...editProfileData, gst: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categories (CSV)</label>
                  <input type="text" value={editProfileData.productCategories} onChange={e => setEditProfileData({...editProfileData, productCategories: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium" placeholder="e.g. Electronics, Tools" />
                </div>
              </div>
              <button type="submit" disabled={isUpdatingProfile} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-600/20">
                {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simulate Modal */}
      {simulateModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex items-end sm:items-center justify-center p-4" onClick={() => setSimulateModal(null)}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white ${simulateModal === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
              {simulateModal === 'credit' ? <ArrowDownRight className="w-10 h-10" /> : <ArrowUpRight className="w-10 h-10" />}
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{simulateModal === 'credit' ? 'Add Money' : 'Send to Bank'}</h3>
            <p className="text-slate-500 font-medium mt-2">{simulateModal === 'credit' ? 'Recharge your business wallet' : 'Withdraw to linked bank account'}</p>
            <div className="mt-8">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full text-center text-5xl font-black text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-2xl py-6 outline-none focus:border-emerald-500 focus:bg-white transition"
                  value={simulateAmount}
                  onChange={e => setSimulateAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmSimulate()}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={() => setSimulateModal(null)} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">Cancel</button>
                <button onClick={confirmSimulate} className={`py-4 rounded-2xl text-white font-bold transition hover:-translate-y-0.5 shadow-lg ${simulateModal === 'credit' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}>
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WholesalerDashboard;
