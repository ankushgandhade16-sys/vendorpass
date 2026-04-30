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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/wholesaler/login" element={<WholesalerLogin />} />
          <Route path="/wholesaler/register" element={<WholesalerRegister />} />
          <Route path="/wholesaler/dashboard" element={<WholesalerDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
