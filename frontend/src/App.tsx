import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/components/LandingPage';
import PricingPage from './features/landing/components/PricingPage';
import CheckoutPage from './features/checkout/CheckoutPage';
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import ForgotPasswordPage from './features/auth/components/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/components/ResetPasswordPage';
import AuthCallback from './features/auth/components/AuthCallback';
import SermonList from './features/sermons/components/SermonList';
import SermonEditor from './features/sermons/components/SermonEditor';
import SettingsPage from './features/profile/components/SettingsPage';
import Layout from './components/common/Layout';
import { LanguageProvider } from './context/LanguageContext';
import { useAuthStore } from './store/authStore';
import { supabase } from './services/supabase';

function App() {
  const { token, isAuthenticated, setAuth } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Sincronización ministerial de sesión al arrancar
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuth({ id: session.user.id, email: session.user.email || '' }, session.access_token);
      }
      setInitializing(false);
    };
    initAuth();
  }, [setAuth]);

  // Si hay un token en el store o en localStorage, consideramos que está autenticado
  const isTrulyAuthenticated = isAuthenticated || !!token || !!localStorage.getItem('token');

  if (initializing) return (
    <div style={{ height: '100vh', backgroundColor: '#111127', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loader-ministerial"></div>
    </div>
  );

  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/checkout/:planId" element={<CheckoutPage />} />

            <Route path="/login" element={!isTrulyAuthenticated ? <LoginPage /> : <Navigate to="/sermons" replace />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={!isTrulyAuthenticated ? <RegisterPage /> : <Navigate to="/sermons" replace />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route path="/sermons" element={isTrulyAuthenticated ? <SermonList /> : <Navigate to="/login" replace />} />
            <Route path="/sermons/new" element={isTrulyAuthenticated ? <SermonEditor /> : <Navigate to="/login" replace />} />
            <Route path="/sermons/:id" element={isTrulyAuthenticated ? <SermonEditor /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={isTrulyAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to={isTrulyAuthenticated ? "/sermons" : "/"} replace />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;
