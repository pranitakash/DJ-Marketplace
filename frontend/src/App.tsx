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
          <Route path="/journal" element={<StaticPage title="Journal" />} />
          <Route path="/venues" element={<StaticPage title="Venues" />} />
          <Route path="/events" element={<StaticPage title="Events" />} />
          <Route path="/pricing" element={<StaticPage title="Pricing" />} />
          <Route path="/contact" element={<StaticPage title="Contact" />} />
          <Route path="/privacy" element={<StaticPage title="Privacy Policy" />} />
          <Route path="/terms" element={<StaticPage title="Terms of Service" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
