import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import { useAuthStore } from './store/authStore';
import { LanguageProvider } from './context/LanguageContext';

// Direct imports
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
  const { isAuthenticated, token } = useAuthStore();
  
  // Si hay un token en el store, consideramos que está autenticado
  // para evitar rebotes innecesarios durante la hidratación.
  const isTrulyAuthenticated = isAuthenticated || !!token || !!localStorage.getItem('token');

  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/checkout/:planId" element={<CheckoutPage />} />
            
            <Route path="/login" element={!isTrulyAuthenticated ? <LoginPage /> : <Navigate to="/sermons" replace />} />
            <Route path="/register" element={!isTrulyAuthenticated ? <RegisterPage /> : <Navigate to="/sermons" replace />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected Routes */}
            <Route path="/sermons" element={isTrulyAuthenticated ? <SermonList /> : <Navigate to="/login" replace />} />
            <Route path="/sermons/new" element={isTrulyAuthenticated ? <SermonEditor /> : <Navigate to="/login" replace />} />
            <Route path="/sermons/:id" element={isTrulyAuthenticated ? <SermonEditor /> : <Navigate to="/login" replace />} />
            <Route path="/settings" element={isTrulyAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />} />

            {/* Catch all - Solo redirige al landing si la ruta no existe y NO está autenticado */}
            <Route path="*" element={<Navigate to={isTrulyAuthenticated ? "/sermons" : "/"} replace />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
}

export default App;
