import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, LogOut, Wallet, Building2, MessageSquare, User, Send, IndianRupee, AlertTriangle, Clock, Percent, ShieldCheck, Check } from 'lucide-react';

const WholesalerDashboard = () => {
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

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (activeTab === 'messages') fetchConversations();
    if (activeTab === 'requests') fetchRequests();
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

  const sendMoney = () => {
    if (!chatAmount || isNaN(chatAmount) || Number(chatAmount) <= 0) return;
    setUpiError('');
    setUpiModal({ action: 'send_money', payload: { amount: Number(chatAmount), note: chatText } });
  };

  const handleUpiSubmit = async () => {
    // Accept any 4-digit PIN for hackathon demo
    if (upiPin.length !== 4) return;
    setUpiError('');
    try {
      const token = localStorage.getItem('token');
      if (upiModal.action === 'send_money') {
        const { amount, note } = upiModal.payload;
        await axios.post(
          '/api/messages/send-money',
          { receiverId: chatUserId, amount, note: note || 'Payment' },
          { headers: { 'x-auth-token': token } }
        );
        setChatAmount(''); setChatText(''); setShowPayInput(false);
        openChat(chatUserId); fetchData();
        setUpiModal(null); setUpiPin('');
        setSuccessScreen({ title: 'Payment Sent', amount, subtitle: 'Money sent securely.' });
      }
    } catch (err) {
      setUpiError(err.response?.data?.msg || err.message || 'Transaction failed');
      setUpiPin('');
    }
  };

  const handleApprove = async (id) => {
    const inputs = loanInputs[id] || {};
    const interestRate = Number(inputs.rate || 5);
    const durationMinutes = Number(inputs.duration || 5);
    if (interestRate < 0 || durationMinutes < 1) return alert('Invalid inputs');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/credit/${id}`, { status: 'Approved', interestRate, durationMinutes }, { headers: { 'x-auth-token': token } });
      alert(`Loan approved! ${interestRate}% interest, due in ${durationMinutes} minutes.`);
      fetchRequests(); fetchData();
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/credit/${id}`, { status: 'Rejected' }, { headers: { 'x-auth-token': token } });
      fetchRequests();
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const startChatWithVendor = async (vendor) => {
    setChatUserId(vendor.user); setActiveTab('messages');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${vendor.user}`, { headers: { 'x-auth-token': token } });
      setChatMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const updateLoanInput = (id, field, value) => {
    setLoanInputs(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
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
             <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30">
               <Building2 className="w-8 h-8 text-emerald-400" />
             </div>
             <div>
               <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Premium Distributor</p>
               <h1 className="text-3xl font-extrabold tracking-tight">{wholesaler.businessName}</h1>
             </div>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all hover:scale-110 active:scale-95 border border-white/10">
            <LogOut className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="mt-8 bg-white/5 backdrop-blur-md p-6 rounded-3xl flex items-center justify-between border border-white/10 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">Available Balance</p>
              <p className="text-emerald-50 text-sm font-bold">Business Wallet</p>
            </div>
          </div>
          <div className="text-right">
             <span className="text-3xl font-black tracking-tighter text-white">₹{wallet?.balance || 0}</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 mt-4">
        <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {['vendors', 'requests', 'history', 'messages'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setChatUserId(null); }}
              className={`flex-1 py-2 px-3 rounded-lg font-medium transition text-sm ${activeTab === tab ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              {tab === 'messages' ? 'Chat' : tab === 'history' ? 'History' : tab === 'requests' ? 'Loans' : 'Vendors'}
            </button>
          ))}
        </div>

        {activeTab === 'vendors' && (
          <div className="grid md:grid-cols-2 gap-4">
            {vendors.map(v => (
              <div key={v._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {v.personalPhoto ? <img src={`/${v.personalPhoto.replace(/\\/g, '/')}`} className="w-full h-full object-cover" alt="Vendor" /> : <Users className="w-8 h-8 m-4 text-slate-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{v.fullName}</h3>
                  <p className="text-sm text-slate-500 mb-2">{v.businessType}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${v.trustTier === 'Platinum' ? 'bg-slate-800 text-white' : v.trustTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : v.trustTier === 'Silver' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'}`}>
                      {v.trustTier} Trust
                    </span>
                    <button onClick={() => startChatWithVendor(v)} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" /> Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {vendors.length === 0 && <div className="col-span-2 text-center p-8 bg-white rounded-2xl border"><p className="text-slate-500">No vendors registered yet.</p></div>}
          </div>
        )}

        {(activeTab === 'requests' || activeTab === 'history') && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">{activeTab === 'history' ? 'History (Paid & Pending)' : 'Active Loans'}</h2>
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
                    <div>
                      <h3 className="font-bold text-slate-800">{r.vendor?.fullName || 'Vendor'}</h3>
                      <p className="text-sm text-slate-500">Requested: <span className="font-bold text-slate-700">₹{r.amount}</span></p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold h-fit ${
                      r.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      r.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                      r.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      isOverdue ? 'bg-red-100 text-red-700' :
                      r.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{r.status}</span>
                  </div>

                  {/* Pending — Wholesaler sets interest + duration */}
                  {r.status === 'Pending' && (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-sm text-amber-800 font-medium mb-3">Set loan terms before approving:</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Percent className="w-3 h-3" /> Interest Rate (%)</label>
                            <input type="number" min="0" placeholder="5" value={inputs.rate || ''} onChange={e => updateLoanInput(r._id, 'rate', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Duration (minutes)</label>
                            <input type="number" min="1" placeholder="5" value={inputs.duration || ''} onChange={e => updateLoanInput(r._id, 'duration', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Total vendor will owe: ₹{(r.amount * (1 + (inputs.rate || 5) / 100)).toFixed(2)} • Due in {inputs.duration || 5} min
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(r._id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition">
                          ✅ Approve & Send ₹{r.amount}
                        </button>
                        <button onClick={() => handleReject(r._id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-xl font-bold transition">
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active / Overdue / Defaulted — Show loan details */}
                  {['Active', 'Overdue', 'Defaulted'].includes(r.status) && (
                    <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
                      <div className="flex justify-between"><span className="text-slate-500">Interest Rate</span><span className={isOverdue ? 'text-red-600 font-bold' : 'font-medium'}>{r.interestRate}%</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Total Due</span><span className="font-bold">₹{(r.totalDue || 0).toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Paid So Far</span><span className="text-emerald-600 font-medium">₹{r.amountPaid || 0}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Remaining</span><span className="font-bold text-slate-800">₹{remaining.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Due Date</span><span className={isOverdue ? 'text-red-600 font-bold' : ''}>{new Date(r.dueDate).toLocaleTimeString()}</span></div>
                      {r.dueDate && r.status === 'Active' && (
                        <div className="flex justify-between"><span className="text-slate-500">⏱️ Time Left</span><span className={`font-bold text-lg ${totalSecsLeft <= 120 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>{timerStr}</span></div>
                      )}
                      {isOverdue && (
                        <div className="flex items-center gap-2 text-red-600 mt-2 bg-red-50 p-2 rounded-lg">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">Overdue! Interest increasing +2% every 2 min. Vendor blocked after 10 min.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Paid */}
                  {r.status === 'Paid' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-medium">
                      ✅ Fully repaid — ₹{r.amountPaid} received
                    </div>
                  )}
                </div>
              );
            })}
            {requests.filter(r => activeTab === 'history' ? ['Paid', 'Pending'].includes(r.status) : !['Paid', 'Pending'].includes(r.status)).length === 0 && (
              <div className="text-center p-8 bg-white rounded-2xl border"><p className="text-slate-500">No {activeTab === 'history' ? 'records' : 'active loans'} found.</p></div>
            )}
          </div>
        )}

        {activeTab === 'messages' && !chatUserId && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Messages</h2>
            {conversations.map(c => (
              <button key={c.userId} onClick={() => openChat(c.userId)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 transition text-left shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><User className="w-6 h-6 text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{c.name}</p>
                  <p className="text-sm text-slate-500 truncate">{c.lastMessage}</p>
                </div>
                <p className="text-xs text-slate-400">{new Date(c.lastDate).toLocaleDateString()}</p>
              </button>
            ))}
            {conversations.length === 0 && (
              <div className="text-center p-8 bg-white rounded-2xl border"><p className="text-slate-500">No conversations yet. Go to Vendors tab to start chatting!</p></div>
            )}
          </div>
        )}

        {activeTab === 'messages' && chatUserId && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <button onClick={() => { setChatUserId(null); fetchConversations(); }} className="text-sm text-emerald-600 hover:underline">← Back</button>
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
              <h3 className="text-2xl font-extrabold text-slate-900">Enter UPI PIN</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">To securely process ₹{upiModal.payload.amount}</p>
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
    </div>
  );
};

export default WholesalerDashboard;
