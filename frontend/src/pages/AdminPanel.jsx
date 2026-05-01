import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Users, List, Ban, Activity, Lock, MessageSquare, Send, X, Building2 } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [wholesalers, setWholesalers] = useState([]);
  const [activeTab, setActiveTab] = useState('vendors');
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [chatUserId, setChatUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/users', { headers: { 'x-auth-token': token } });
      setVendors(res.data.filter(u => u.role === 'vendor'));
      setWholesalers(res.data.filter(u => u.role === 'wholesaler'));

      const convRes = await axios.get('/api/messages/conversations', { headers: { 'x-auth-token': token } });
      setConversations(convRes.data);
    } catch (err) {
      console.error(err);
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/block/${id}`, {}, { headers: { 'x-auth-token': token } });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error blocking user');
    }
  };

  const openChat = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/messages/${userId}`, { headers: { 'x-auth-token': token } });
      setChatMessages(res.data);
      setChatUserId(userId);
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
            onClick={() => { setActiveTab('wholesalers'); setChatUserId(null); }} 
            className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${activeTab === 'wholesalers' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Building2 className="w-5 h-5" /> Wholesaler Hub
          </button>
          <button 
            onClick={() => { setActiveTab('messages'); setChatUserId(null); }} 
            className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all duration-300 ${activeTab === 'messages' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <MessageSquare className="w-5 h-5" /> Support Messages
          </button>
        </div>

        {activeTab !== 'messages' && (
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
              ) : (activeTab === 'vendors' ? vendors : wholesalers).map(u => {
                const profile = u.role === 'vendor' ? u.vendorProfile : u.wholesalerProfile;
                return (
                <tr key={u._id} className={`group hover:bg-white/[0.02] transition-colors ${u.blocked ? 'opacity-50' : ''}`}>
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black border border-white/10 ${u.role === 'vendor' ? 'text-blue-400' : 'text-emerald-400'}`}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-white text-lg tracking-tight">{profile?.fullName || profile?.businessName || u.username}</span>
                    </div>
                  </td>
                  <td className="p-8 text-slate-400 font-medium">{profile?.email || 'Encrypted'}</td>
                  <td className="p-8">
                    <span className="bg-white/5 px-4 py-2 rounded-xl text-slate-300 font-bold border border-white/10">
                      {profile?.businessType || profile?.address || 'Standard'}
                    </span>
                  </td>
                  <td className="p-8 text-right flex justify-end gap-3">
                    <button onClick={() => openChat(u._id)} className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 border border-blue-500/20 group-hover:scale-105 active:scale-95">
                      <MessageSquare className="w-4 h-4" /> Message
                    </button>
                    <button onClick={() => blockUser(u._id)} className={`${u.blocked ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'} px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 border group-hover:scale-105 active:scale-95`}>
                      {u.blocked ? <Ban className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {u.blocked ? 'Unblock' : 'Restrict Access'}
                    </button>
                  </td>
                </tr>
              )})}
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
        )}

        {activeTab === 'messages' && !chatUserId && (
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white mb-6">Support Conversations</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {conversations.map(c => (
                <div key={c.userId} onClick={() => openChat(c.userId)} className="bg-white/5 border border-white/10 p-5 rounded-3xl cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold border ${c.role === 'vendor' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} group-hover:scale-110 transition-transform`}>
                      {(c.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{c.name || 'User'}</p>
                      <p className="text-sm text-slate-400">{c.role === 'vendor' ? '🏪 Vendor' : '🏢 Wholesaler'} · {c.lastMessage}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(c.lastDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            {conversations.length === 0 && <p className="text-slate-400 text-center py-12">No support messages yet. Vendors and wholesalers can contact you from their portals.</p>}
          </div>
        )}

        {chatUserId && (
          <div className="bg-slate-800 rounded-3xl shadow-xl flex flex-col h-[500px] border border-slate-700 relative z-20 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="bg-slate-700 p-3 rounded-2xl"><Users className="w-6 h-6 text-slate-300" /></div>
                <h3 className="font-bold text-xl text-white">Support Chat</h3>
              </div>
              <button onClick={() => setChatUserId(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === chatUserId ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-4 rounded-3xl max-w-[80%] shadow-md ${m.sender === chatUserId ? 'bg-slate-700 text-slate-200 rounded-tl-sm' : 'bg-purple-600 text-white rounded-tr-sm'}`}>
                    <p className="font-medium text-[15px]">{m.text}</p>
                    <span className="text-[10px] opacity-70 mt-2 block font-bold tracking-wider">{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-800 border-t border-slate-700">
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl p-2 pl-6">
                <input type="text" value={chatText} onChange={e => setChatText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Reply to user..." className="flex-1 bg-transparent border-none outline-none text-white font-medium placeholder:text-slate-500" />
                <button onClick={sendMessage} className="bg-purple-600 text-white p-4 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
