const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/VendorDashboard.jsx', 'utf8');

// 1. Add State Variables
const stateVars = `
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', businessAddress: '', businessType: '' });

  const openEditModal = () => {
    setEditForm({
      fullName: vendor.fullName || '',
      email: vendor.email || '',
      businessAddress: vendor.businessAddress || '',
      businessType: vendor.businessType || ''
    });
    setShowEditModal(true);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/vendors/profile', editForm, { headers: { 'x-auth-token': token } });
      alert('Profile updated successfully!');
      setShowEditModal(false);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.msg || 'Error updating profile');
    }
  };
`;

content = content.replace(/(const \[activeTab, setActiveTab\] = useState\('home'\);)/, `$1\n${stateVars}`);


// 2. Add Edit Modal to the bottom
const modalJSX = `
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
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
`;

content = content.replace(/(<\/div>\s*\{\/\* Bottom Nav \*\/})/, `${modalJSX}\n$1`);


// 3. Connect Edit Profile Button
content = content.replace(/<button className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap">\s*Edit Profile\s*<\/button>/, 
  `<button onClick={openEditModal} className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-emerald-100 transition">Edit Profile</button>`
);

// 4. Update Wholesalers Tab (Add Search functionality)
content = content.replace(/<h2 className="text-2xl font-bold mb-6">Find Wholesalers<\/h2>/, 
  `<h2 className="text-2xl font-bold mb-4">Find Wholesalers</h2>
              <input type="text" placeholder="Search by name or category..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 mb-6 shadow-sm" />`
);
content = content.replace(/\{wholesalers\.map\(ws => \(/, 
  `{wholesalers.filter(ws => ws.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || (ws.productCategories && ws.productCategories.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))).map(ws => (`
);


// 5. Layout Fixes for 'qr_history' (Wallet Page)
content = content.replace(/\{activeTab === 'qr_history' && \(\s*<div className="space-y-8">/, 
  `{activeTab === 'qr_history' && (
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-8">`
);
content = content.replace(/\{\/\* Transactions \*\/\}/, 
  `</div>
              {/* Transactions */}`
);

// 6. Layout Fixes for 'home' (put charts in grid)
content = content.replace(/\{\/\* Sales Overview Chart \*\/\}\s*<div className="px-4 mt-6">/, 
  `<div className="grid md:grid-cols-2 gap-6 mt-6 px-4">
                {/* Sales Overview Chart */}
                <div>`
);
content = content.replace(/\{\/\* Trust Score \*\/\}\s*<div className="px-4 mt-6">/, 
  `</div>
                {/* Trust Score */}
                <div>`
);

content = content.replace(/\{\/\* Trust Score \*\/\}\s*<div>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)}/, 
  (match) => {
    // This is getting tricky, let's do a simpler targeted replace for closing the grid.
    return match.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\)}/, `</div>\n                </div>\n              </div>\n            </div>\n          )}`);
  }
);

// Alternative for step 6 Trust Score closing:
// Actually, let me just find the end of the Trust score div and add an extra closing div for the grid wrapper.
let parts = content.split(`{/* Trust Score */}`);
if (parts.length > 1) {
   let afterTrust = parts[1];
   // Find the end of the activeTab === 'home' block
   afterTrust = afterTrust.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\)\}/, `</div></div></div></div>)}`);
   content = parts[0] + `{/* Trust Score */}` + afterTrust;
}

fs.writeFileSync('frontend/src/pages/VendorDashboard.jsx', content);
console.log('Successfully updated VendorDashboard.jsx layout, search, and edit profile feature');
