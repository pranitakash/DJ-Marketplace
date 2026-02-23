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
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/dj" element={<DJDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
