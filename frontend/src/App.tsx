import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Button from './components/common/Button';
import { useAuthStore } from './store/authStore';

// Direct imports to avoid resolution issues during build
import LoginPage from './features/auth/components/LoginPage';
import RegisterPage from './features/auth/components/RegisterPage';
import SermonList from './features/sermons/components/SermonList';
import SermonEditor from './features/sermons/components/SermonEditor';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Prepare su mensaje con fe y excelencia</h1>
        <p className="hero-subtitle">Utilice nuestra plataforma de mentoría homilética asistida por IA para profundizar en su estudio bíblico y conectar con su audiencia.</p>
        <Button size="lg" onClick={() => navigate('/sermons/new')}>Nuevo Sermón</Button>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          
          <Route path="/" element={
            isAuthenticated ? (
              <HomePage />
            ) : (
              <Navigate to="/login" />
            )
          } />
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

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
