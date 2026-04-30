const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/VendorDashboard.jsx', 'utf8');

// Update imports
content = content.replace(/import \{ Wallet, .* \} from 'lucide-react';/, 
  "import { Wallet, Search, CreditCard, MessageSquare, LogOut, ArrowUpRight, ArrowDownRight, User, Send, IndianRupee, AlertTriangle, QrCode, History, Home, Bell, TrendingUp, ShieldCheck } from 'lucide-react';"
);

// Update main wrapper background
content = content.replace(/<div className="min-h-screen relative bg-slate-900 text-slate-100 font-sans pb-20">/, 
  '<div className="min-h-screen relative bg-[#F6FBF7] text-slate-800 font-sans pb-20">'
);

// Remove the global background image logic
content = content.replace(/\{photoUrl && \([\s\S]*?\)\}\s*<div className="absolute inset-0 bg-gradient-to-b from-slate-900\/50 via-slate-900\/80 to-slate-900 z-0"><\/div>/, '');

// Replace header
content = content.replace(/<header className="p-6 flex justify-between items-center">[\s\S]*?<\/header>/, `
        {/* Header */}
        <header className="bg-white p-4 flex justify-between items-center shadow-sm relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
              {vendor.personalPhoto ? (
                <img src={\`/\${vendor.personalPhoto.replace(/\\\\/g, '/')}\`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 m-2 text-slate-400" />
              )}
            </div>
            <h1 className="text-xl font-extrabold text-emerald-600 tracking-tight">VendorPass</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
              <Bell className="w-5 h-5" />
            </button>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
`);

// Replace home tab content
content = content.replace(/\{activeTab === 'home' && \(\s*<>\s*\{\/\* Trust Card \*\/\}[\s\S]*?<\/>\s*\)\}/, `
          {activeTab === 'home' && (
            <div className="animate-fade-in pb-8 -mx-4">
              {/* Hero Banner */}
              <div className="relative h-48 bg-slate-800 flex items-center justify-center overflow-hidden">
                {photoUrl ? (
                  <img src={photoUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="Store" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-teal-900" />
                )}
                <div className="absolute inset-0 bg-black/20" />
                <h2 className="relative z-10 text-3xl font-extrabold text-white text-center drop-shadow-md">
                  Your Store Today
                </h2>
              </div>

              {/* Overlapping Welcome Card */}
              <div className="px-4 -mt-8 relative z-20">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    {vendor.personalPhoto ? (
                      <img src={\`/\${vendor.personalPhoto.replace(/\\\\/g, '/')}\`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 m-3 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-500 text-xs">Welcome, {vendor.fullName.split(' ')[0]}</p>
                    <p className="font-bold text-slate-800 leading-tight">{vendor.fullName}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Vendor ID: {vendor.vendorId}</p>
                  </div>
                  <button className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap">
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Sales Overview Chart */}
              <div className="px-4 mt-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">Sales Overview</h3>
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  {/* Simple CSS Bar Chart */}
                  <div className="flex items-end justify-between h-32 gap-2">
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
                            className={\`w-full rounded-t-sm transition-all duration-500 \${item.active ? 'bg-emerald-500 shadow-md' : 'bg-emerald-200 opacity-70'}\`} 
                            style={{ height: \`\${item.value}%\` }}
                          />
                          <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
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
              <div className="px-4 mt-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Trust Score</h3>
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex flex-col items-center justify-center relative py-4">
                    {/* SVG Semi-circle gauge */}
                    <svg viewBox="0 0 100 50" className="w-48 overflow-visible">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#10B981" strokeWidth="8" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="35" />
                    </svg>
                    <div className="absolute bottom-4 text-center flex flex-col items-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-emerald-600">72%</span>
                      </div>
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full mt-1 uppercase">{vendor.trustTier} Level</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] font-medium text-slate-400 mt-2 px-2">
                    <span className={vendor.trustTier === 'Bronze' ? 'text-emerald-600 font-bold' : ''}>Bronze</span>
                    <span className={vendor.trustTier === 'Silver' ? 'text-emerald-600 font-bold' : ''}>Silver</span>
                    <span className={vendor.trustTier === 'Gold' ? 'text-emerald-600 font-bold' : ''}>Gold</span>
                    <span className={vendor.trustTier === 'Platinum' ? 'text-emerald-600 font-bold' : ''}>Platinum</span>
                  </div>
                </div>
              </div>

            </div>
          )}
`);

// Convert other tabs to light theme
content = content.replaceAll('bg-white/5', 'bg-white');
content = content.replaceAll('border-white/10', 'border-slate-200');
content = content.replaceAll('bg-white/10', 'bg-slate-50 border border-slate-200');
content = content.replaceAll('border-white/20', 'border-slate-300');
content = content.replaceAll('text-white', 'text-slate-800');
content = content.replaceAll('text-slate-400', 'text-slate-500');
content = content.replaceAll('text-slate-300', 'text-slate-600');
content = content.replaceAll('text-blue-300', 'text-blue-600');
content = content.replaceAll('text-emerald-400', 'text-emerald-600');

// Fix bottom nav styling
content = content.replace(/className="fixed bottom-0 left-0 w-full bg-slate-[^"]*"/, 
  'className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50"'
);

// Specifically fix Wallet card text which became dark
content = content.replace(/<div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-2xl shadow-blue-900\/50 relative overflow-hidden">[\s\S]*?<\/div>\s*<\/div>/, `
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-2xl shadow-blue-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet className="w-24 h-24 text-white" /></div>
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
`);

fs.writeFileSync('frontend/src/pages/VendorDashboard.jsx', content);
console.log('Successfully updated VendorDashboard.jsx');
