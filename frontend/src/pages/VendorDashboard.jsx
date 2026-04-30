import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, Search, CreditCard, MessageSquare, LogOut, ArrowUpRight, ArrowDownRight, User, Send, IndianRupee, AlertTriangle } from 'lucide-react';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [transactions, setTransactions] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [now, setNow] = useState(new Date());
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
    if (activeTab === 'credit') fetchLoans();
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
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
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
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const handleSimulate = async (type) => {
    const amount = prompt(`Enter amount to ${type}:`);
    if (!amount || isNaN(amount)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/transactions/simulate', 
        { amount: Number(amount), type, description: `Simulated ${type}` },
        { headers: { 'x-auth-token': token } }
      );
      fetchData();
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const handleRequestCredit = async (wholesalerId) => {
    const amount = prompt('Enter loan amount requested:');
    if (!amount || isNaN(amount)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/credit/request', 
        { wholesalerId, amount: Number(amount) },
        { headers: { 'x-auth-token': token } }
      );
      alert('Credit request sent! Due in 30 days with 5% interest.');
    } catch (err) { alert(err.response?.data?.msg || 'Error requesting credit'); }
  };

  const handleRepayLoan = async (loanId) => {
    const amount = prompt('Enter repayment amount:');
    if (!amount || isNaN(amount)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/credit/${loanId}/repay`, { amount: Number(amount) }, { headers: { 'x-auth-token': token } });
      alert(res.data.msg);
      fetchLoans();
      fetchData();
    } catch (err) { alert(err.response?.data?.msg || 'Error'); }
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
  const photoUrl = vendor.businessPhoto ? `/${vendor.businessPhoto.replace(/\\/g, '/')}` : '';

  return (
    <div className="min-h-screen relative bg-slate-900 text-slate-100 font-sans pb-20">
      {photoUrl && (
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center fixed" style={{ backgroundImage: `url(${photoUrl})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900 z-0"></div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col">
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
        <header className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 overflow-hidden border-2 border-white/20">
              {vendor.personalPhoto ? (
                <img src={`/${vendor.personalPhoto.replace(/\\/g, '/')}`} alt="Profile" className="w-full h-full object-cover" />
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
                  <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                    {vendor.trustTier}
                  </span>
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

              {/* QR */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl text-center shadow-lg">
                <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">My Receiving QR</p>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                  <QRCodeSVG value={`${window.location.origin}/pay/${vendor.vendorId}`} size={160} />
                </div>
                <p className="mt-4 text-slate-300 text-sm">Show this QR to receive payments securely.</p>
              </div>

              {/* Transactions */}
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
                  {transactions.length === 0 && <p className="text-center text-slate-500 py-4">No transactions yet</p>}
                </div>
              </div>
            </>
          )}

          {activeTab === 'wholesalers' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">Find Wholesalers</h2>
              <div className="grid gap-4">
                {wholesalers.map(ws => (
                  <div key={ws._id} className="bg-white/10 p-5 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-lg">{ws.businessName}</h3>
                    <p className="text-sm text-slate-400 mb-3">{ws.productCategories?.join(', ')}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleRequestCredit(ws._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-xl font-medium transition">Request Loan</button>
                      <button onClick={() => startChatWith(ws)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-xl font-medium transition flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'credit' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-2">My Loans</h2>
              <p className="text-sm text-slate-400 mb-4">Manage your loans and repayments</p>
              {loans.map(loan => {
                const remaining = (loan.totalDue || loan.amount) - (loan.amountPaid || 0);
                const isOverdue = ['Overdue', 'Defaulted'].includes(loan.status);
                const diffMs = loan.dueDate ? new Date(loan.dueDate) - now : 0;
                const totalSecsLeft = Math.max(0, Math.floor(diffMs / 1000));
                const minsLeft = Math.floor(totalSecsLeft / 60);
                const secsLeft = totalSecsLeft % 60;
                const timerStr = `${minsLeft}:${secsLeft.toString().padStart(2, '0')}`;
                return (
                  <div key={loan._id} className={`p-5 rounded-2xl border ${isOverdue ? 'bg-red-900/20 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-slate-400">Loan Amount</p>
                        <p className="text-2xl font-bold">₹{loan.amount}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        loan.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                        loan.status === 'Active' ? 'bg-blue-500/20 text-blue-400' :
                        loan.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                        isOverdue ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>{loan.status}</span>
                    </div>

                    {loan.status === 'Pending' && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-300">
                        ⏳ Waiting for wholesaler to set terms and approve...
                      </div>
                    )}

                    {['Active', 'Overdue', 'Defaulted'].includes(loan.status) && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Interest Rate</span>
                          <span className={isOverdue ? 'text-red-400 font-bold' : ''}>{loan.interestRate}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Total Due (with interest)</span>
                          <span className="font-bold text-white">₹{(loan.totalDue || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Already Paid</span>
                          <span className="text-emerald-400">₹{loan.amountPaid || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-300 font-medium">💰 Still Owe</span>
                          <span className="font-bold text-lg text-white">₹{remaining.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Due At</span>
                          <span className={isOverdue ? 'text-red-400 font-bold' : ''}>{new Date(loan.dueDate).toLocaleTimeString()}</span>
                        </div>
                        {loan.dueDate && loan.status === 'Active' && (
                          <div className={`flex justify-between text-sm p-2 rounded-lg ${totalSecsLeft <= 120 ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                            <span className="text-slate-300">⏱️ Time Left</span>
                            <span className={`font-bold text-xl ${totalSecsLeft <= 120 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>{timerStr}</span>
                          </div>
                        )}
                        {isOverdue && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-sm text-red-300">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>Interest increases +2% every 2 min overdue. Account blocks after 10 min!</span>
                          </div>
                        )}
                        <button onClick={() => handleRepayLoan(loan._id)} className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl font-bold transition mt-2 text-lg">
                          💳 Repay ₹{remaining.toFixed(2)} Now
                        </button>
                      </div>
                    )}

                    {loan.status === 'Paid' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-400 font-medium">
                        ✅ Fully repaid — ₹{loan.amountPaid} paid
                      </div>
                    )}
                  </div>
                );
              })}
              {loans.length === 0 && (
                <div className="text-center p-8 bg-white/5 border border-white/10 rounded-3xl">
                  <p className="text-slate-400">No loan requests yet.</p>
                  <p className="text-sm text-slate-500 mt-1">Go to Search tab to find wholesalers and request a loan!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && !chatUserId && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-2">Messages</h2>
              <p className="text-sm text-slate-400 mb-4">Chat with wholesalers and send payments</p>
              {conversations.map(c => (
                <button key={c.userId} onClick={() => openChat(c.userId)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition text-left">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{c.name}</p>
                    <p className="text-sm text-slate-400 truncate">{c.lastMessage}</p>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(c.lastDate).toLocaleDateString()}</p>
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="text-center p-8 bg-white/5 border border-white/10 rounded-3xl">
                  <p className="text-slate-400 mb-2">No conversations yet.</p>
                  <p className="text-sm text-slate-500">Go to Search tab to find wholesalers and start chatting!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && chatUserId && (
            <div className="flex flex-col h-[calc(100vh-200px)]">
              <button onClick={() => { setChatUserId(null); fetchConversations(); }} className="text-sm text-blue-400 mb-4 self-start hover:underline">← Back to conversations</button>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map(msg => (
                  <div key={msg._id} className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === user._id 
                        ? msg.type === 'payment' ? 'bg-emerald-600' : 'bg-blue-600'
                        : msg.type === 'payment' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/10 border border-white/10'
                    }`}>
                      {msg.type === 'payment' && (
                        <div className="flex items-center gap-2 mb-1">
                          <IndianRupee className="w-4 h-4" />
                          <span className="font-bold text-lg">₹{msg.amount}</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-[10px] text-white/50 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Chat Input */}
              <div className="space-y-2">
                {showPayInput && (
                  <div className="flex gap-2">
                    <input type="number" placeholder="Amount" value={chatAmount} onChange={e => setChatAmount(e.target.value)} className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-slate-400 outline-none" />
                    <button onClick={sendMoney} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl font-bold transition flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" /> Send
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setShowPayInput(!showPayInput)} className={`p-3 rounded-xl transition ${showPayInput ? 'bg-emerald-600' : 'bg-white/10 hover:bg-white/20'}`}>
                    <IndianRupee className="w-5 h-5" />
                  </button>
                  <input type="text" placeholder="Type a message..." value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none" />
                  <button onClick={sendMessage} className="p-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
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
            <button onClick={() => { setActiveTab('credit'); setChatUserId(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'credit' ? 'text-blue-400' : 'text-slate-500'}`}>
              <CreditCard className="w-6 h-6" />
              <span className="text-[10px] font-semibold">Loans</span>
            </button>
            <button onClick={() => { setActiveTab('messages'); setChatUserId(null); }} className={`flex flex-col items-center gap-1 ${activeTab === 'messages' ? 'text-blue-400' : 'text-slate-500'}`}>
              <MessageSquare className="w-6 h-6" />
              <span className="text-[10px] font-semibold">Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
