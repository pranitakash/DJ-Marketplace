import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import SetupInfo from './pages/SetupInfo';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Extracted AnimatedRoutes component to use useLocation hook
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />

        {/* Protected Marketplace Route */}
        <Route path="/explore" element={<ProtectedRoute><PageTransition><Explore /></PageTransition></ProtectedRoute>} />
        <Route path="/dj/:id" element={<ProtectedRoute><PageTransition><DJProfile /></PageTransition></ProtectedRoute>} />
        <Route path="/setup-info" element={<ProtectedRoute><PageTransition><SetupInfo /></PageTransition></ProtectedRoute>} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard/user" element={<ProtectedRoute allowedRoles={['user', 'admin']}><PageTransition><UserDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/dj" element={<ProtectedRoute allowedRoles={['dj', 'admin']}><PageTransition><DJDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />

        {/* Subpages / Static Pages */}
        <Route path="/about" element={<PageTransition><AboutUs /></PageTransition>} />
        <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactUs /></PageTransition>} />

        <Route path="/journal" element={<PageTransition><StaticPage title="Journal" /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><StaticPage title="Privacy Policy" /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><StaticPage title="Terms of Service" /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

// Reusable Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
