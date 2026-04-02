import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background-glow"></div>
        <div className="hero-content">
          <div className="badge">Mentoría Exegética con IA</div>
          <h1 className="hero-title">
            Desbloquea la Profundidad <br /> 
            <span className="text-gradient">de la Palabra</span>
          </h1>
          <p className="hero-description">
            Obtén análisis históricos, literarios y de significancia en segundos. 
            La herramienta definitiva para pastores y predicadores modernos.
          </p>
          <div className="hero-actions">
            <Button size="lg" onClick={() => navigate('/register')}>
              Comenzar Ahora
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </Button>
          </div>
        </div>

        {/* Visual Element inspirado en el mockup */}
        <div className="hero-visual">
          <div className="orbit-container">
            <div className="orbit-circle orbit-1"></div>
            <div className="orbit-circle orbit-2"></div>
            <div className="orbit-circle orbit-3"></div>
            <div className="central-node">
              <div className="inner-glow"></div>
              <span className="node-icon">📖</span>
            </div>
            {/* Flotantes que representan los 5 puntos exegéticos */}
            <div className="floating-tag tag-1">Tipo Literario</div>
            <div className="floating-tag tag-2">Autoría</div>
            <div className="floating-tag tag-3">Contexto Histórico</div>
            <div className="floating-tag tag-4">Significancia</div>
            <div className="floating-tag tag-5">Propósito</div>
          </div>
        </div>
      </section>

      {/* Trust Bar (similar al mockup) */}
      <div className="trust-bar">
        <span>PREACHER STUDIO</span>
        <span>•</span>
        <span>EXÉGESIS AVANZADA</span>
        <span>•</span>
        <span>IA HOMILÉTICA</span>
        <span>•</span>
        <span>BIBLIA & HISTORIA</span>
      </div>
    </div>
  );
};

export default LandingPage;
