import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import { useAuthStore } from './store/authStore';

// Direct imports to avoid resolution issues during build
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import SermonList from './features/sermons/components/SermonList';
import SermonEditor from './features/sermons/components/SermonEditor';
import LandingPage from './features/landing/components/LandingPage';
import PricingPage from './features/landing/components/PricingPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/sermons" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/sermons" />} />
          
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

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
