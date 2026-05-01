import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, Search, CreditCard, MessageSquare, LogOut, ArrowUpRight, ArrowDownRight, User, Send, IndianRupee, AlertTriangle, QrCode, History, Home, Bell, TrendingUp, ShieldCheck, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const VendorDashboard = () => {
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', businessAddress: '', businessType: '', language: 'en' });

  const openEditModal = () => {
    setEditForm({
      fullName: vendor.fullName || '',
      email: vendor.email || '',
      businessAddress: vendor.businessAddress || '',
      businessType: vendor.businessType || '',
      language: vendor.language || 'en'
    });
    setShowEditModal(true);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/vendors/profile', editForm, { headers: { 'x-auth-token': token } });
      
      // Update global language state if it changed
      if (editForm.language !== language) {
        changeLanguage(editForm.language);
      }
      
      showToast('Profile updated successfully!', 'success');
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      showToast(err.response?.data?.msg || 'Error updating profile');
    }
  };

  const [transactions, setTransactions] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [now, setNow] = useState(new Date());
  // Simulate modal
  const [simulateModal, setSimulateModal] = useState(null); // null | 'credit' | 'debit'
  const [simulateAmount, setSimulateAmount] = useState('');
  
  // Request & Repay Loan Modals
  const [requestLoanWholesalerId, setRequestLoanWholesalerId] = useState(null);
  const [requestLoanAmount, setRequestLoanAmount] = useState('');
  const [adminId, setAdminId] = useState(null);
  const [toast, setToast] = useState(null); // { msg, type: 'error' | 'success' }

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [successScreen, setSuccessScreen] = useState(null); // { title: '', amount: '', subtitle: '' }
  
  const [upiModal, setUpiModal] = useState(null); // { action: 'repay_loan' | 'send_money', payload: {} }
  const [upiPin, setUpiPin] = useState('');
  const [upiError, setUpiError] = useState('');
  
  // Chat state
  const [conversations, setConversations] = useState([]);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatAmount, setChatAmount] = useState('');
  const [showPayInput, setShowPayInput] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') fetchConversations();
    if (activeTab === 'credit' || activeTab === 'wholesalers') fetchLoans();
  }, [activeTab]);

  // Live countdown timer — ticks every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Re-check overdue every 30 seconds when on loans tab
  useEffect(() => {
    if (activeTab !== 'credit') return;
    const interval = setInterval(() => fetchLoans(), 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');

      const res = await axios.get('/api/auth/me', { headers: { 'x-auth-token': token } });
      setUser(res.data);

      if (res.data.blocked) {
        // Still show dashboard but with warning
      }

      const txRes = await axios.get('/api/transactions', { headers: { 'x-auth-token': token } });
      setTransactions(txRes.data);

      const wsRes = await axios.get('/api/wholesalers', { headers: { 'x-auth-token': token } });
      setWholesalers(wsRes.data);

      try {
        const adminRes = await axios.get('/api/admin/profile', { headers: { 'x-auth-token': token } });
        setAdminId(adminRes.data._id);
      } catch (e) { console.error('Admin profile not found', e); }
    } catch (err) {
      console.error(err);
      navigate('/vendor/login');
    }
  };

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/credit', { headers: { 'x-auth-token': token } });
      setLoans(res.data);
      // Check overdue
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
    } catch (err) { showToast(err.response?.data?.msg || 'Error'); }
  };

  const sendMoney = async () => {
    if (!chatAmount || isNaN(chatAmount)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages/send-money', { receiverId: chatUserId, amount: Number(chatAmount), note: chatText || 'Payment' }, { headers: { 'x-auth-token': token } });
      setChatAmount('');
      setChatText('');
      setShowPayInput(false);
      openChat(chatUserId);
      fetchData();
    } catch (err) { showToast(err.response?.data?.msg || 'Error'); }
  };

  const handleSimulate = async (type) => {
    setSimulateAmount('');
    setSimulateModal(type);
  };

  const confirmSimulate = async () => {
    if (!simulateAmount || isNaN(simulateAmount) || Number(simulateAmount) <= 0) return;
    try {
      const token = localStorage.getItem('token');
      if (simulateModal === 'credit') {
        // Just add money to wallet (no PIN needed)
        await axios.post('/api/transactions/simulate', { amount: Number(simulateAmount), type: 'credit', description: `Added ₹${simulateAmount}` }, { headers: { 'x-auth-token': token } });
        setSimulateModal(null);
        setSimulateAmount('');
        fetchData();
      } else if (simulateModal === 'debit') {
        // Paying someone in chat — require UPI PIN
        setUpiError('');
        setUpiModal({ action: 'send_money', payload: { amount: Number(simulateAmount) } });
        setSimulateModal(null);
      }
    } catch (err) { showToast(err.response?.data?.msg || 'Error'); }
  };

  const handleRequestCredit = (wholesalerId) => {
    const hasActiveLoan = loans.some(l => ['Pending', 'Active', 'Overdue', 'Defaulted'].includes(l.status));
    if (hasActiveLoan) {
      // Direct them to the Loans tab to pay/view their existing liability
      setActiveTab('credit');
      return;
    }
    
    setRequestLoanAmount('');
    setRequestLoanWholesalerId(wholesalerId);
  };

  const submitRequestCredit = async () => {
    if (!requestLoanAmount || isNaN(requestLoanAmount) || Number(requestLoanAmount) <= 0) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/credit/request', 
        { wholesalerId: requestLoanWholesalerId, amount: Number(requestLoanAmount) },
        { headers: { 'x-auth-token': token } }
      );
      setRequestLoanWholesalerId(null);
      setSuccessScreen({
        title: 'Request Sent Successfully',
        amount: requestLoanAmount,
        subtitle: 'Wait for wholesaler approval.'
      });
      fetchLoans();
    } catch (err) { showToast(err.response?.data?.msg || 'Error requesting credit'); }
  };

  const handleRepayLoan = (loanId, amountToRepay) => {
    if (!amountToRepay || isNaN(amountToRepay) || Number(amountToRepay) <= 0) return;
    setUpiError('');
    setUpiModal({ action: 'repay_loan', payload: { loanId: loanId, amount: Number(amountToRepay) } });
  };

  const handleUpiSubmit = async () => {
    // Accept any 4-digit PIN for hackathon demo
    if (upiPin.length !== 4) return;
    setUpiError('');
    try {
      const token = localStorage.getItem('token');
      if (upiModal.action === 'repay_loan') {
        const { loanId, amount } = upiModal.payload;
        const res = await axios.post(
          `/api/credit/${loanId}/repay`,
          { amount },
          { headers: { 'x-auth-token': token } }
        );
        setUpiModal(null);
        setUpiPin('');
        // Optimistically update loan in state
        setLoans(prev => prev.map(l => l._id === loanId ? { ...l, ...res.data.loan } : l));
        setSuccessScreen({ title: 'Payment Successful', amount, subtitle: res.data.msg || 'Loan repaid successfully.' });
        // Refetch to get updated trust score + wallet
        await fetchLoans();
        await fetchData();
      } else if (upiModal.action === 'send_money') {
        const { amount } = upiModal.payload;
        await axios.post(
          '/api/messages/send-money',
          { receiverId: chatUserId, amount },
          { headers: { 'x-auth-token': token } }
        );
        setUpiModal(null);
        setUpiPin('');
        setSimulateAmount('');
        fetchConversations();
        fetchData();
        setSuccessScreen({ title: 'Payment Sent', amount, subtitle: 'Money sent securely.' });
      }
    } catch (err) {
      setUpiError(err.response?.data?.msg || err.message || 'Transaction failed');
      setUpiPin('');
    }
  };

  // Start chat with a wholesaler (from wholesaler list)
  const startChatWith = async (wholesaler) => {
    setChatUserId(wholesaler.user);
    setActiveTab('messages');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${wholesaler.user}`, { headers: { 'x-auth-token': token } });
      setChatMessages(res.data);
    } catch (err) { console.error(err); }
  };

  if (!user || !user.vendorProfile) return <div className="p-8 text-center">Loading...</div>;

  const vendor = user.vendorProfile;
  const wallet = user.wallet;
  const getPhotoUrl = (pathStr) => {
    if (!pathStr) return '';
    let filename = pathStr;
    if (filename.includes('\\')) filename = filename.split('\\').pop();
    if (filename.includes('/')) filename = filename.split('/').pop();
    return `/uploads/${filename}`;
  };

  const photoUrl = getPhotoUrl(vendor.businessPhoto);
  const profilePicUrl = getPhotoUrl(vendor.personalPhoto);

  return (
    <div className="min-h-screen relative bg-[#F6FBF7] text-slate-800 font-sans pb-20 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-blue-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-emerald-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Blocked Banner */}
        {user.blocked && (
          <div className="bg-red-600 text-white p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold">Account Blocked</p>
              <p className="text-sm text-red-100">{user.blockedReason || 'Unpaid loan. Please repay to unblock.'}</p>
            </div>
          </div>
        )}

        {/* Header */}
        
        {/* Header */}
        <header className="bg-white p-4 flex justify-between items-center shadow-sm relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
              {vendor.personalPhoto ? (
                <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 m-2 text-slate-500" />
              )}
            </div>
            <h1 className="text-xl font-extrabold text-emerald-600 tracking-tight">VendorPass</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>


        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto pb-6">
          
          {activeTab === 'home' && (
            <div className="animate-fade-in pb-8">
              {/* Hero Banner - Tall enough to show full business photo */}
              <div className="relative h-72 bg-slate-800 flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} className="absolute inset-0 w-full h-full object-cover" alt="Store" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-teal-900" />
                )}
                <div className="absolute inset-0 bg-black/20" />
                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* Profile Card - sits below the banner with generous spacing */}
              <div className="px-4 mt-4 relative z-20">
                <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                    {vendor.personalPhoto ? (
                      <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 m-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-xs font-medium">{t('welcomeBack') || 'Welcome back 👋'}</p>
                    <p className="font-extrabold text-slate-900 text-lg leading-tight">{vendor.fullName}</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-0.5">{t('id')}: {vendor.vendorId}</p>
                  </div>
                  <button onClick={openEditModal} className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all">{t('editProfile')}</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6 px-4">
                {/* Sales Overview Chart */}
                <div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 text-lg">{t('yourTrack')}</h3>
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    {/* Simple CSS Bar Chart */}
                    <div className="flex items-end justify-between h-36 gap-2">
                      {[
                        { day: 'MON', value: 30 },
                        { day: 'TUE', value: 45 },
                        { day: 'WED', value: 40 },
                        { day: 'THU', value: 70 },
                        { day: 'FRI', value: 65, active: true },
                        { day: 'SAT', value: 50 },
                        { day: 'SUN', value: 35 },
                      ].map(item => (
                        <div key={item.day} className="flex flex-col items-center flex-1 gap-2">
                          <div className="w-full bg-slate-50 rounded-t-sm flex items-end justify-center h-full relative group">
                            <div 
                              className={`w-full rounded-t-xl transition-all duration-500 ${item.active ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-md' : 'bg-emerald-100 hover:bg-emerald-200'}`} 
                              style={{ height: `${item.value}%` }}
                            />
                            <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none">
                              ₹{item.value * 100}
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trust Score */}
                <div>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 text-lg">{t('trustScore')}</h3>
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex flex-col items-center justify-center relative py-4">
                      {/* SVG Semi-circle gauge */}
                      <svg viewBox="0 0 100 50" className="w-48 overflow-visible">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={vendor.trustTier === 'Platinum' ? '#1E293B' : vendor.trustTier === 'Gold' ? '#EAB308' : vendor.trustTier === 'Silver' ? '#94A3B8' : '#F97316'} strokeWidth="8" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 - (Math.min(100, Math.max(0, vendor.trustScore || 0)) / 100) * 125.6} style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
                      </svg>
                      <div className="absolute bottom-4 text-center flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-extrabold ${vendor.trustTier === 'Platinum' ? 'text-slate-800' : vendor.trustTier === 'Gold' ? 'text-yellow-500' : vendor.trustTier === 'Silver' ? 'text-slate-400' : 'text-orange-500'}`}>{vendor.trustScore || 0}%</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase ${vendor.trustTier === 'Platinum' ? 'bg-slate-800 text-white' : vendor.trustTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : vendor.trustTier === 'Silver' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'}`}>{t(vendor.trustTier.toLowerCase())} {t('level')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] font-medium text-slate-500 mt-2 px-2">
                      <span className={vendor.trustTier === 'Bronze' ? 'text-orange-600 font-bold' : ''}>{t('bronze')}</span>
                      <span className={vendor.trustTier === 'Silver' ? 'text-slate-600 font-bold' : ''}>{t('silver')}</span>
                      <span className={vendor.trustTier === 'Gold' ? 'text-yellow-600 font-bold' : ''}>{t('gold')}</span>
                      <span className={vendor.trustTier === 'Platinum' ? 'text-slate-800 font-bold' : ''}>{t('platinum')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr_history' && (
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-8">
              {/* Wallet Card */}
              
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-2xl shadow-blue-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet className="w-24 h-24 text-white" /></div>
                <p className="text-blue-200 font-medium mb-2">{t('availableBalance')}</p>
                <h3 className="text-4xl font-bold text-white mb-6">₹{wallet?.balance || 0}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleSimulate('credit')} className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm transition">
                    <ArrowDownRight className="w-5 h-5 text-emerald-300" />
                    <span className="font-semibold text-white">{t('addMoney')}</span>
                  </button>
                  <button onClick={() => handleSimulate('debit')} className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm transition">
                    <ArrowUpRight className="w-5 h-5 text-red-300" />
                    <span className="font-semibold text-white">{t('send')}</span>
                  </button>
                </div>
              </div>

              {/* QR */}
              <div className="bg-white border border-slate-200 p-6 rounded-3xl text-center shadow-lg">
                <p className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-wider">{t('receivingQR')}</p>
                <div className="bg-white p-6 rounded-2xl inline-block shadow-xl">
                  <QRCodeSVG value={`${window.location.origin}/pay/${vendor.vendorId}`} size={200} />
                </div>
                <p className="mt-6 text-slate-600 text-sm">{t('showQRToReceive')}</p>
              </div>

              </div>
              {/* Transactions */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 px-2">{t('transactionHistory')}</h3>
                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx._id} className="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${tx.type === 'credit' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-red-500/20 text-red-400'}`}>
                          {tx.type === 'credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{t(tx.description.toLowerCase()) || tx.description}</p>
                          <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-center text-slate-500 py-4">{t('noTransactions')}</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wholesalers' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">{t('findWholesalers')}</h2>
              <input type="text" placeholder={t('searchPlaceholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 mb-6 shadow-sm" />
              <div className="grid gap-4">
                {wholesalers.filter(ws => ws.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || (ws.productCategories && ws.productCategories.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))).map(ws => {
                  const hasPending = loans.some(l => (l.wholesaler?._id === ws._id || l.wholesaler === ws._id) && l.status === 'Pending');
                  return (
                    <div key={ws._id} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm flex items-center justify-center">
                        {ws.photos && ws.photos[0] ? (
                          <img src={getPhotoUrl(ws.photos[0])} className="w-full h-full object-cover" alt="Wholesaler" />
                        ) : (
                          <User className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{ws.businessName}</h3>
                        <p className="text-sm text-emerald-600 mb-1">👤 {ws.fullName}</p>
                        <p className="text-sm text-slate-500 mb-3">{ws.productCategories?.join(', ')}</p>
                      </div>
                      <div className="flex gap-2 flex-col justify-center">
                        {hasPending ? (
                          <button disabled className="flex-1 bg-amber-100 border border-amber-300 text-amber-700 py-2 rounded-xl font-medium cursor-not-allowed">
                            {t('requestPending')}
                          </button>
                        ) : (
                          <button onClick={() => handleRequestCredit(ws._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium transition">
                            {t('requestLoan')}
                          </button>
                        )}
                        <button onClick={() => startChatWith(ws)} className="flex-1 bg-white border border-slate-200 hover:bg-slate-100 py-2 rounded-xl font-medium transition flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" /> {t('chat')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'credit' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-2">{t('myLoans')}</h2>
              <p className="text-sm text-slate-500 mb-4">{t('manageLoans')}</p>
              {loans.map(loan => {
                const remaining = (loan.totalDue || loan.amount) - (loan.amountPaid || 0);
                const isOverdue = ['Overdue', 'Defaulted'].includes(loan.status);
                const diffMs = loan.dueDate ? new Date(loan.dueDate) - now : 0;
                const totalSecsLeft = Math.max(0, Math.floor(diffMs / 1000));
                const minsLeft = Math.floor(totalSecsLeft / 60);
                const secsLeft = totalSecsLeft % 60;
                const timerStr = `${minsLeft}:${secsLeft.toString().padStart(2, '0')}`;
                return (
                  <div key={loan._id} className={`p-5 rounded-2xl border ${isOverdue ? 'bg-red-900/20 border-red-500/30' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                          {loan.wholesaler?.photos?.[0] ? (
                            <img src={getPhotoUrl(loan.wholesaler.photos[0])} alt="Wholesaler" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 m-3 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">{t('loanAmount')}</p>
                          <p className="text-3xl font-black text-slate-800 leading-none mb-1">₹{loan.amount}</p>
                          <p className="text-sm text-slate-700 font-semibold">
                            {loan.wholesaler?.fullName || loan.wholesaler?.businessName || t('wholesaler')}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">ID: {loan.wholesaler?._id || loan.wholesaler}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        loan.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-600' :
                        loan.status === 'Active' ? 'bg-blue-500/20 text-blue-400' :
                        loan.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                        isOverdue ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-500'
                      }`}>{loan.status}</span>
                    </div>

                    {loan.status === 'Pending' && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-300">
                        ⏳ {t('waitingApproval')}
                      </div>
                    )}

                    {['Active', 'Overdue', 'Defaulted'].includes(loan.status) && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">{t('interest')}</span>
                          <span className={isOverdue ? 'text-red-400 font-bold' : ''}>{loan.interestRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">{t('totalDue')}</span>
                          <span className="font-bold text-slate-800">₹{(loan.totalDue || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">{t('alreadyPaid')}</span>
                          <span className="text-emerald-600">₹{loan.amountPaid || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm bg-white p-2 rounded-lg">
                          <span className="text-slate-600 font-medium">💰 {t('stillOwe')}</span>
                          <span className="font-bold text-lg text-slate-800">₹{remaining.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">{t('dueAt')}</span>
                          <span className={isOverdue ? 'text-red-400 font-bold' : ''}>{new Date(loan.dueDate).toLocaleTimeString()}</span>
                        </div>
                        {loan.dueDate && loan.status === 'Active' && (
                          <div className={`flex justify-between text-sm p-2 rounded-lg ${totalSecsLeft <= 120 ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                            <span className="text-slate-600">⏱️ {t('timeLeftLabel')}</span>
                            <span className={`font-bold text-xl ${totalSecsLeft <= 120 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>{timerStr}</span>
                          </div>
                        )}
                        {isOverdue && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-sm text-red-300">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>{t('overdueWarning')}</span>
                          </div>
                        )}
                        <button onClick={() => handleRepayLoan(loan._id, remaining.toFixed(2))} className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold transition mt-2 text-lg text-white">
                          💳 {t('repayNow')} ₹{remaining.toFixed(2)}
                        </button>
                      </div>
                    )}

                    {loan.status === 'Paid' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-600 font-medium">
                        ✅ {t('fullyRepaid')} — ₹{loan.amountPaid} {t('paid')}
                      </div>
                    )}
                  </div>
                );
              })}
              {loans.length === 0 && (
                <div className="text-center p-8 bg-white border border-slate-200 rounded-3xl">
                  <p className="text-slate-500">{t('noLoanRequests')}</p>
                  <p className="text-sm text-slate-500 mt-1">{t('goToSearch')}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && !chatUserId && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{t('messages')}</h2>
                  <p className="text-sm text-slate-500">{t('chatWithWholesalers')}</p>
                </div>
                {adminId && (
                  <button onClick={() => openChat(adminId)} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-200 transition text-sm">
                    <ShieldCheck className="w-4 h-4" /> Support
                  </button>
                )}
              </div>
              {conversations.map(c => (
                <button key={c.userId} onClick={() => openChat(c.userId)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 border border-slate-200 transition text-left">
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
                  <p className="text-xs text-slate-500">{new Date(c.lastDate).toLocaleDateString()}</p>
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="text-center p-8 bg-white border border-slate-200 rounded-3xl">
                  <p className="text-slate-500 mb-2">No conversations yet.</p>
                  <p className="text-sm text-slate-500">Go to Search tab to find wholesalers and start chatting!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && chatUserId && (
            <div className="flex flex-col h-[calc(100vh-200px)]">
              <button onClick={() => { setChatUserId(null); fetchConversations(); }} className="text-sm text-blue-400 mb-4 self-start hover:underline">← {t('backToConversations')}</button>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map(msg => (
                  <div key={msg._id} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === user._id 
                        ? msg.type === 'payment' ? 'bg-emerald-600' : 'bg-blue-600'
                        : msg.type === 'payment' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-50 border border-slate-200 border border-slate-200'
                    }`}>
                      {msg.type === 'payment' && (
                        <div className="flex items-center gap-2 mb-1">
                          <IndianRupee className="w-4 h-4" />
                          <span className="font-bold text-lg">₹{msg.amount}</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-[10px] text-slate-800/50 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Chat Input */}
              <div className="space-y-2">
                {chatUserId !== adminId && showPayInput && (
                  <div className="flex gap-2">
                    <input type="number" placeholder="Amount" value={chatAmount} onChange={e => setChatAmount(e.target.value)} className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-800 placeholder-slate-500 outline-none" />
                    <button onClick={sendMoney} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" /> Send
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  {chatUserId !== adminId && (
                    <button onClick={() => setShowPayInput(!showPayInput)} className={`p-3 rounded-xl transition ${showPayInput ? 'bg-emerald-600' : 'bg-slate-50 border border-slate-200 hover:bg-white/20'}`}>
                      <IndianRupee className="w-5 h-5" />
                    </button>
                  )}
                  <input type="text" placeholder="Type a message..." value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 outline-none" />
                  <button onClick={sendMessage} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        
        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Edit Profile</h3>
              <form onSubmit={handleEditProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                  <input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Business Type</label>
                  <input type="text" value={editForm.businessType} onChange={e => setEditForm({...editForm, businessType: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Business Address</label>
                  <textarea value={editForm.businessAddress} onChange={e => setEditForm({...editForm, businessAddress: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500" rows="3" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">{t('preferredLanguage')}</label>
                  <select 
                    value={editForm.language} 
                    onChange={e => setEditForm({...editForm, language: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">{t('cancel')}</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">{t('saveChanges')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

</div>

        {/* Request Loan Modal */}
        {requestLoanWholesalerId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4" onClick={() => setRequestLoanWholesalerId(null)}>
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 bg-blue-50 text-blue-600">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">{t('requestLoan')}</h3>
                <p className="text-slate-400 text-sm mt-1">{t('enterAmountNeeded')}</p>
              </div>
              <div className="relative mb-6">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₹</span>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={requestLoanAmount}
                  onChange={e => setRequestLoanAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitRequestCredit()}
                  placeholder="0"
                  className="w-full pl-14 pr-4 py-5 text-4xl font-black text-slate-900 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-center"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setRequestLoanWholesalerId(null)} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">{t('cancel')}</button>
                <button onClick={submitRequestCredit} className="py-4 rounded-2xl text-white font-bold transition hover:-translate-y-0.5 shadow-lg bg-blue-600 hover:bg-blue-700 shadow-blue-200">
                  {t('request')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Repay Loan Modal Removed */}

        {/* Add Money / Send Money Modal */}
        {simulateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4" onClick={() => setSimulateModal(null)}>
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 ${simulateModal === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {simulateModal === 'credit' ? <ArrowDownRight className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">{simulateModal === 'credit' ? 'Add Money' : 'Send Money'}</h3>
                <p className="text-slate-400 text-sm mt-1">{simulateModal === 'credit' ? 'Credit your wallet balance' : 'Debit from your wallet balance'}</p>
              </div>
              <div className="relative mb-6">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">₹</span>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={simulateAmount}
                  onChange={e => setSimulateAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmSimulate()}
                  placeholder="0"
                  className="w-full pl-14 pr-4 py-5 text-4xl font-black text-slate-900 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-center"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setSimulateModal(null)} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">Cancel</button>
                <button onClick={confirmSimulate} className={`py-4 rounded-2xl text-white font-bold transition hover:-translate-y-0.5 shadow-lg ${simulateModal === 'credit' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50">
          <div className="flex justify-around p-4">
            <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-400' : 'text-slate-500'}`}>
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('home')}</span>
            </button>
            <button onClick={() => setActiveTab('qr_history')} className={`flex flex-col items-center gap-1 ${activeTab === 'qr_history' ? 'text-blue-400' : 'text-slate-500'}`}>
              <Wallet className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('wallet')}</span>
            </button>
            <button onClick={() => setActiveTab('wholesalers')} className={`flex flex-col items-center gap-1 ${activeTab === 'wholesalers' ? 'text-blue-400' : 'text-slate-500'}`}>
              <Search className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('search')}</span>
            </button>
            <button onClick={() => { setActiveTab('credit'); setChatUserId(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'credit' ? 'text-blue-400' : 'text-slate-500'}`}>
              <CreditCard className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('loans')}</span>
            </button>
            <button onClick={() => { setActiveTab('messages'); setChatUserId(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'messages' ? 'text-blue-400' : 'text-slate-500'}`}>
              <MessageSquare className="w-6 h-6" />
              <span className="text-[10px] font-semibold">{t('chat')}</span>
            </button>
          </div>
        </div>
        {/* UPI PIN Modal */}
        {upiModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[150] flex flex-col items-center justify-end sm:justify-center p-4 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
            <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
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
                <button onClick={() => { setUpiModal(null); setUpiPin(''); }} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">Cancel</button>
                <button id="upi-submit-btn" onClick={handleUpiSubmit} disabled={upiPin.length !== 4} className="py-4 rounded-2xl text-white font-bold transition hover:-translate-y-0.5 shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 disabled:opacity-50 disabled:hover:translate-y-0">
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Screen Success Screen (PhonePe / GPay style) */}
        {successScreen && (
          <div className="fixed inset-0 bg-emerald-600 z-[200] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl scale-in-center">
              <Check className="w-16 h-16 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2 text-center">{successScreen.title}</h2>
            <div className="flex items-center justify-center gap-1 text-white mb-6 w-full">
              <IndianRupee className="w-10 h-10 opacity-80" />
              <span className="text-7xl font-black tracking-tighter">{successScreen.amount}</span>
            </div>
            <p className="text-emerald-100 text-lg mb-12 text-center max-w-xs">{successScreen.subtitle}</p>
            <button 
              onClick={() => setSuccessScreen(null)} 
              className="mt-auto mb-8 w-full max-w-sm bg-white text-emerald-600 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition shadow-xl"
            >
              Done
            </button>
            <style>{`
              .scale-in-center {
                animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
              }
              @keyframes scale-in-center {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 max-w-sm ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="font-bold text-sm">{toast.msg}</p>
          <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white text-lg font-bold">×</button>
        </div>
      )}

      </div>
    </div>
  );
};

export default VendorDashboard;
