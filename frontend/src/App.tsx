import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import { useAuthStore } from './store/authStore';
import { LanguageProvider } from './context/LanguageContext';

// Direct imports to avoid resolution issues during build
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import AuthCallback from './features/auth/components/AuthCallback';
import SermonList from './features/sermons/components/SermonList';
import SermonEditor from './features/sermons/components/SermonEditor';
import LandingPage from './features/landing/components/LandingPage';
import PricingPage from './features/landing/components/PricingPage';
import CheckoutPage from './features/checkout/CheckoutPage';
import SettingsPage from './features/profile/components/SettingsPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/checkout/:planId" element={<CheckoutPage />} />
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/sermons" />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/sermons" />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected Routes */}
            <Route path="/sermons" element={
              isAuthenticated ? (
                <SermonList />
              ) : (
                <Navigate to="/login" />
              )
            } />

            <Route path="/sermons/new" element={
              isAuthenticated ? (
                <SermonEditor />
              ) : (
                <Navigate to="/login" />
              )
            } />

            <Route path="/sermons/:id" element={
              isAuthenticated ? (
                <SermonEditor />
              ) : (
                <Navigate to="/login" />
              )
            } />

            <Route path="/settings" element={
              isAuthenticated ? (
                <SettingsPage />
              ) : (
                <Navigate to="/login" />
              )
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;
