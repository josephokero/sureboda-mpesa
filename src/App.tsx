
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header';
import FloatingAuth from './components/FloatingAuth';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import DeliverySection from './components/DeliverySection';
import MissionVision from './components/MissionVision';
import BikesShowcase from './components/BikesShowcase';
import ForEveryone from './components/ForEveryone';
import Testimonials from './components/Testimonials';
import About from './components/About';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import Login from './components/Login';
import AboutUs from './pages/AboutUs';
import GetBike from './pages/GetBike';
import Bikes from './pages/Bikes';
import Ride from './pages/Ride';
import Faqs from './pages/Faqs';
import Contact from './pages/Contact';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RiderDashboard from './pages/RiderDashboard';
import AdminDashboardRoutes from './pages/admin';
import AdminBikes from './pages/admin/AdminBikes';

function AppContent() {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith('/rider-dashboard') || location.pathname === '/login' || location.pathname.startsWith('/admin-dashboard');
  // Render admin dashboard routes directly for /admin-dashboard and its children
  if (location.pathname.startsWith('/admin-dashboard')) {
    return <AdminDashboardRoutes />;
  }
  return (
    <Box sx={{ minHeight: '100vh', fontFamily: 'Montserrat, Roboto, Arial, sans-serif' }}>
      {!hideHeader && <Header />}
      {!hideHeader && <FloatingAuth />}
      {!hideHeader && <Box sx={{ height: 72 }} />}
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <Features />
            <HowItWorks />
            <DeliverySection />
            <MissionVision />
            <BikesShowcase />
            <ForEveryone />
            <Testimonials />
            <Footer />
            <About />
            <CallToAction />
          </>
        } />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/get-bike" element={<GetBike />} />
        <Route path="/bikes" element={<Bikes />} />
        <Route path="/ride" element={<Ride />} />
  {/* Register route removed */}
        <Route path="/login" element={<Login />} />
  {/* Signup route removed */}
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/rider-dashboard/*" element={<RiderDashboard />} />
  {/* <Route path="/admin-dashboard/bikes" element={<AdminBikes />} /> Duplicate, handled by AdminDashboardRoutes */}
      </Routes>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;