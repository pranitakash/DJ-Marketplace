import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Explore from './pages/Explore';
import DJProfile from './pages/DJProfile';
import UserDashboard from './pages/dashboards/UserDashboard';
import DJDashboard from './pages/dashboards/DJDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import StaticPage from './pages/StaticPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import HowItWorks from './pages/HowItWorks';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/dj/:id" element={<DJProfile />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/dj" element={<DJDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Subpages / Static Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<ContactUs />} />

          <Route path="/journal" element={<StaticPage title="Journal" />} />
          <Route path="/privacy" element={<StaticPage title="Privacy Policy" />} />
          <Route path="/terms" element={<StaticPage title="Terms of Service" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
