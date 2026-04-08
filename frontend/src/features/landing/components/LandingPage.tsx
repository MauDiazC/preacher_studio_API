import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      question: language === 'es' ? '¿Qué tan seguros están mis datos y sermones?' : 'How secure are my data and sermons?',
      answer: language === 'es' 
        ? 'Utilizamos encriptación de grado bancario para asegurar que tu propiedad intelectual y notas personales estén siempre protegidas y solo accesibles para ti.' 
        : 'We use bank-grade encryption to ensure that your intellectual property and personal notes are always protected and only accessible to you.'
    },
    {
      question: language === 'es' ? '¿Qué versiones de la Biblia están incluidas?' : 'What Bible versions are included?',
      answer: language === 'es'
        ? 'Incluimos RVR1960 y NVI para español, y KJV y NIV para inglés, con acceso a léxicos originales Strong.'
        : 'We include KJV and NIV for English, and RVR1960 and NVI for Spanish, with access to original Strong lexicons.'
    },
    {
      question: language === 'es' ? '¿Ofrecen planes para equipos pastorales?' : 'Do you offer plans for pastoral teams?',
      answer: language === 'es'
        ? 'Sí, el plan Ministerio está diseñado para hasta 10 usuarios con espacios de trabajo compartidos.'
        : 'Yes, the Ministry plan is designed for up to 10 users with shared workspaces.'
    }
  ];

  return (
    <div className="landing-page-sacred">
      {/* Hero Section */}
      <section className="hero-section-sacred">
        <div className="hero-celestial-bg">
          <div className="hero-orbit"></div>
        </div>
        
        <div className="max-container">
          <div className="hero-grid">
            <div className="hero-content-column">
              <h1 className="hero-title-sacred">
                {t('hero.title_new')}
              </h1>
              <p className="hero-desc-sacred">
                {t('hero.description_new')}
              </p>
              <button 
                className="btn-hero-primary"
                onClick={() => navigate('/register')}
              >
                {t('hero.cta_free')}
              </button>
            </div>

            <div className="hero-visual-wrapper">
              <div className="hero-visual-glow"></div>
              <div className="hero-img-mask">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALFG_fDfcSfQWj-N7SyM7m4ZcXId595KPldM_8vRM33O48f1F-07XzNsBT5DGMHL0ay9uGoHW2cuXcbQSW3E_jJxEi5hJafbkWyGLF0fe4OSJ0R7ndX3ktS7CCgiv0vrgL-d0gJSRl1tmbNsGJl2ojmKAMopM6JnkJQJwLfV002v4DAJy0gOEqQyP39Lxc8msTgCTH8bS6c7KVJXHW6K6-4GOfdC-EHgNjQU5Wb1eKWxlKe74BNnKFJ3zbIm1FqLihmIeCK4Z20Yk" 
                  alt="Ministerial Visualization" 
                  className="hero-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="trusted-section">
        <div className="max-container">
          <p className="trusted-label">{t('trust.title')}</p>
          <div className="brand-logos-row">
            <span className="brand-logo-item">ALPHA CHURCH</span>
            <span className="brand-logo-item">REDEEMER GLOBAL</span>
            <span className="brand-logo-item">GRACE FELLOWSHIP</span>
            <span className="brand-logo-item">LIVING WATER</span>
            <span className="brand-logo-item">THE SANCTUARY</span>
          </div>

          <div className="stats-summary-grid">
            <div className="stat-item">
              <h4>+10,000</h4>
              <p>{language === 'es' ? 'Pastores Semanales' : 'Weekly Pastors'}</p>
            </div>
            <div className="stat-item">
              <h4>150k</h4>
              <p>{language === 'es' ? 'Sermones Creados' : 'Sermons Created'}</p>
            </div>
            <div className="stat-item">
              <h4>45+</h4>
              <p>{language === 'es' ? 'Denominaciones' : 'Denominations'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="max-container">
          <div className="section-header-sacred">
            <h2>{language === 'es' ? 'Preparación Inspirada' : 'Inspired Preparation'}</h2>
            <div className="header-accent-line"></div>
          </div>

          <div className="features-grid-sacred">
            <div className="feature-card-sacred">
              <div className="feature-icon-box">
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>auto_stories</span>
              </div>
              <h3>{language === 'es' ? 'Estudio Bíblico Profundo' : 'Deep Bible Study'}</h3>
              <p>{language === 'es' 
                ? 'Conecta pasajes, estudia léxicos y organiza tus referencias teológicas en una biblioteca personal intuitiva.' 
                : 'Connect passages, study lexicons, and organize your theological references in an intuitive personal library.'}
              </p>
            </div>

            <div className="feature-card-sacred">
              <div className="feature-icon-box">
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>edit_note</span>
              </div>
              <h3>{language === 'es' ? 'Generación de Bosquejos' : 'Outline Generation'}</h3>
              <p>{language === 'es'
                ? 'Transforma tus reflexiones en estructuras de mensaje coherentes. Herramientas que fluyen con tu proceso creativo.'
                : 'Transform your reflections into coherent message structures. Tools that flow with your creative process.'}
              </p>
            </div>

            <div className="feature-card-sacred">
              <div className="feature-icon-box">
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>calendar_month</span>
              </div>
              <h3>{language === 'es' ? 'Gestión de Mensajes' : 'Message Management'}</h3>
              <p>{language === 'es'
                ? 'Planifica series de sermones anuales y gestiona tu calendario ministerial con facilidad.'
                : 'Plan annual sermon series and manage your ministerial calendar with ease.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases-section">
        <div className="max-container">
          <div className="use-cases-grid">
            <div className="use-cases-content-col">
              <h2 className="hero-title-sacred" style={{ fontSize: '3rem' }}>
                {language === 'es' ? 'Diseñado para cada Líder' : 'Designed for Every Leader'}
              </h2>
              <div className="use-case-list">
                <div className="use-case-item">
                  <div className="use-case-num">1</div>
                  <div className="use-case-content">
                    <h4>{language === 'es' ? 'Pastores de tiempo completo' : 'Full-time Pastors'}</h4>
                    <p>{language === 'es' 
                      ? 'Centraliza tu ministerio de enseñanza y reduce las horas de administración técnica.'
                      : 'Centralize your teaching ministry and reduce hours of technical administration.'}
                    </p>
                  </div>
                </div>
                <div className="use-case-item">
                  <div className="use-case-num">2</div>
                  <div className="use-case-content">
                    <h4>{language === 'es' ? 'Líderes de Jóvenes' : 'Youth Leaders'}</h4>
                    <p>{language === 'es'
                      ? 'Crea contenido dinámico y relevante con herramientas que facilitan la comunicación visual.'
                      : 'Create dynamic and relevant content with tools that facilitate visual communication.'}
                    </p>
                  </div>
                </div>
                <div className="use-case-item">
                  <div className="use-case-num">3</div>
                  <div className="use-case-content">
                    <h4>{language === 'es' ? 'Estudiantes de Teología' : 'Theology Students'}</h4>
                    <p>{language === 'es'
                      ? 'Organiza tus notas de clase y proyectos de investigación en un entorno libre de distracciones.'
                      : 'Organize your class notes and research projects in a distraction-free environment.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="use-case-visual">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqSYZNgwHXRZr-epXQuFf127h7ewU22wEqq2J18eo4uL2Rl5IT5aPOnY2Zyg8PDJN4TTanQyG_lbdOELe9W3ZCN4evCruk7QD4N9vWLPvgJ6czDB2bEdKsQtWQnYtuAmHlcJyEzBHgHrde2kv9cAt4snD0pCGTfnnWzi_HLLBu-piJhdlDF_A8LXDKhblOKC0YnKdyoqJO1aS_U9pjFk81kGf4cs3LYlUS423bqQd7AlL3yD86uuyzdlNWjvEVkuGTQwlob1o69uM" 
                alt="Study Environment" 
                className="use-case-img-sacred"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="max-container">
          <h2 className="hero-title-sacred" style={{ textAlign: 'center', fontSize: '3rem', fontStyle: 'italic', marginBottom: '5rem' }}>
            "{language === 'es' ? 'Palabras desde el Púlpito' : 'Words from the Pulpit'}"
          </h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-text">
                {language === 'es'
                  ? '"Preacher Studio ha transformado mis sábados. Lo que antes me tomaba 8 horas, ahora fluye en 3. Me permite enfocarme en la oración."'
                  : '"Preacher Studio has transformed my Saturdays. What used to take me 8 hours now flows in 3. It allows me to focus on prayer."'}
              </p>
              <div className="testimonial-author">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5ZkaC4bFVROhWj6_QR3yEjl754IWUhjqST_uZ71myGm7s39rdiro6uh4T27qM2ZdvbTqoEuZ1SFFspGEuf9TG2mjlNNABCCSBojIV4uoFiox7nVJw1UZDimScfRfmTQPc_UOFK2aB_NqPHCL9so4YMfHDKNyjecBewsCe9Tq0vZKOvPCWG2vp49M_CzZd5qIrLVVhu92dL2M1Q-DvDHn3Dxio42PKleC_uaUdO-D4aP8gGCNQ0Rioz8EL-3Kp9EUJrhjKUDCMVFs" alt="Pastor" className="author-img" />
                <div>
                  <div className="author-name">Pastor Marcos Rivera</div>
                  <div className="author-org">Iglesia Vida Nueva</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                {language === 'es'
                  ? '"Como líder de jóvenes, necesitaba algo visual y rápido. Los bosquejos estructurados son la mejor herramienta que he usado."'
                  : '"As a youth leader, I needed something visual and fast. The structured outlines are the best tool I have used."'}
              </p>
              <div className="testimonial-author">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-EuUCyMAB3G1o-V8tXehbCFRAQqcZ5UIANoIHtOl9CzwvxKul_6KpOT5zvLktjKkPnvmU1VYL5mIIlniAAi8EWZ2Yhh0TZaOdST66tUpHONYByt0JPONAa3_zg_X16xTFlFUgBy1Q_muQX7exQN6K2hYfzawu787Os13t4AscJyzzTMm3lC3wTvTKc7Hpcz0lCpkxzVw7DXKcoCyCz9PGKDAWxNmLibHlZg8eABHLArZffuAKjwkhEU4f35_9vB2mJazy3IdI-G0" alt="Leader" className="author-img" />
                <div>
                  <div className="author-name">David Espinoza</div>
                  <div className="author-org">Generación Radical</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-text">
                {language === 'es'
                  ? '"La profundidad del estudio bíblico es impresionante. Tener mis referencias cruzadas en una sola pantalla es simplemente liberador."'
                  : '"The depth of Bible study is impressive. Having my cross-references on one screen is simply liberating."'}
              </p>
              <div className="testimonial-author">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCl_qUqNidn3819gOYd|6jvjSe-tnnX8xQ5-esTitglTe7IQm73vnpGJ2KjL2cMokScxpTv7fXcW81a0HX80CPHM_1A2dJ07ZJB6BXUF8-smuzIK-8k-stat8kfV7895yll5v3nXQCnp53IR_ht5z_es5G5KefRm9eQVt8MDz_LzU_6LL3Z5yPr_agPLk-O034fvq6MuJAZj_Alyg9lFPXMLPpaykfef1fceGR0mKk2hH7V0Z9ImEKj_u5ovb_J-22GayU12JAFapCA" alt="Doctor" className="author-img" />
                <div>
                  <div className="author-name">Dr. Roberto Peña</div>
                  <div className="author-org">Seminario Bíblico Central</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="max-container">
          <div className="section-header-sacred">
            <h2>{language === 'es' ? 'Preguntas Comunes' : 'Common Questions'}</h2>
            <div className="header-accent-line"></div>
          </div>
          <div className="faq-container">
            {faqData.map((faq, index) => (
              <div key={index} className="faq-item" onClick={() => toggleFaq(index)}>
                <div className="faq-question">
                  <h4>{faq.question}</h4>
                  <span className="material-symbols-outlined">
                    {activeFaq === index ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
                {activeFaq === index && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="cta-bg-glow"></div>
        <div className="max-container">
          <h2 className="hero-title-sacred" style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>
            {language === 'es' ? 'Comienza tu viaje hacia una preparación más profunda' : 'Begin your journey towards a deeper preparation'}
          </h2>
          <p className="hero-desc-sacred" style={{ margin: '0 auto 3rem' }}>
            {language === 'es' ? 'Únete a miles de pastores que han redescubierto el gozo de preparar el mensaje.' : 'Join thousands of pastors who have rediscovered the joy of preparing the message.'}
          </p>
          <button 
            className="btn-hero-primary" 
            style={{ padding: '1.5rem 4rem', fontSize: '1.25rem' }}
            onClick={() => navigate('/register')}
          >
            {language === 'es' ? 'Probar Gratis Ahora' : 'Try for Free Now'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="max-container">
          <div className="footer-content-sacred">
            <div className="footer-brand">
              <h2>PREACHER STUDIO</h2>
              <p className="footer-copy">© 2026 Preacher Studio. {t('auth.inspired_prep')}.</p>
            </div>

            <div className="footer-links-sacred">
              <a href="#" className="footer-link-item">{t('footer.privacy')}</a>
              <a href="#" className="footer-link-item">{t('footer.terms')}</a>
              <a href="#" className="footer-link-item">{t('footer.contact')}</a>
            </div>

            <div className="social-icons-footer">
              <a href="#" className="social-icon-btn"><span className="material-symbols-outlined">public</span></a>
              <a href="#" className="social-icon-btn"><span className="material-symbols-outlined">video_library</span></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
