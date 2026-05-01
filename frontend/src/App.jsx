import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import VendorLogin from './pages/VendorLogin';
import VendorRegister from './pages/VendorRegister';
import VendorDashboard from './pages/VendorDashboard';
import WholesalerLogin from './pages/WholesalerLogin';
import WholesalerRegister from './pages/WholesalerRegister';
import WholesalerDashboard from './pages/WholesalerDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import PaymentPage from './pages/PaymentPage';

import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-[#F6FBF7] text-slate-800 font-sans">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/register" element={<VendorRegister />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/wholesaler/login" element={<WholesalerLogin />} />
            <Route path="/wholesaler/register" element={<WholesalerRegister />} />
            <Route path="/wholesaler/dashboard" element={<WholesalerDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/pay/:vendorId" element={<PaymentPage />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
