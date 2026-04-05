import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import Button from '../../../components/common/Button';
import './LandingPage.css';
import landingHeroImg from '../../../assets/landing_hero.png';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') }
  ];

  return (
    <div className="landing-container-new">
      <main>
        {/* Hero Section */}
        <section className="hero-section-new">
          <div className="celestial-orbit-bg"></div>
          <div className="max-w-container">
            <div className="hero-grid">
              <div className="hero-content-new">
                <div className="badge-new">{t('hero.badge')}</div>
                <h1 className="hero-title-new">
                  {t('hero.title_new')}
                </h1>
                <p className="hero-description-new">
                  {t('hero.description_new')}
                </p>
                <div className="hero-actions-new">
                  <Button size="lg" className="cta-primary shimmer-button" onClick={() => navigate('/register')}>
                    {t('hero.cta_free')}
                  </Button>
                </div>
              </div>

              <div className="hero-visual-new">
                <div className="visual-glow"></div>
                <div className="image-mask-new">
                  <img 
                    src={landingHeroImg} 
                    alt="Preacher Studio Visualization" 
                    className="hero-main-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Section */}
        <section className="proof-section">
          <div className="max-w-container">
            <p className="proof-label">{t('trust.title')}</p>
            <div className="logo-cloud">
              <div className="logo-item">ALPHA CHURCH</div>
              <div className="logo-item">REDEEMER GLOBAL</div>
              <div className="logo-item">GRACE FELLOWSHIP</div>
              <div className="logo-item">LIVING WATER</div>
              <div className="logo-item">THE SANCTUARY</div>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">+10,000</div>
                <div className="stat-label">{t('stats.pastors')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">150k</div>
                <div className="stat-label">{t('stats.sermons')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">45+</div>
                <div className="stat-label">{t('stats.denominations')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section" id="features">
          <div className="max-w-container">
            <div className="section-header">
              <h2 className="section-title">{t('features.title')}</h2>
              <div className="section-underline"></div>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📖</div>
                <h3 className="feature-title">{t('features.study_title')}</h3>
                <p className="feature-desc">{t('features.study_desc')}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3 className="feature-title">{t('features.outline_title')}</h3>
                <p className="feature-desc">{t('features.outline_desc')}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📅</div>
                <h3 className="feature-title">{t('features.mgmt_title')}</h3>
                <p className="feature-desc">{t('features.mgmt_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="roles-section">
          <div className="max-w-container">
            <div className="roles-grid">
              <div className="roles-content">
                <h2 className="section-title-alt">{t('roles.title')}</h2>
                <div className="roles-list">
                  <div className="role-item">
                    <div className="role-number">1</div>
                    <div>
                      <h4>{t('roles.p1_title')}</h4>
                      <p>{t('roles.p1_desc')}</p>
                    </div>
                  </div>
                  <div className="role-item">
                    <div className="role-number">2</div>
                    <div>
                      <h4>{t('roles.p2_title')}</h4>
                      <p>{t('roles.p2_desc')}</p>
                    </div>
                  </div>
                  <div className="role-item">
                    <div className="role-number">3</div>
                    <div>
                      <h4>{t('roles.p3_title')}</h4>
                      <p>{t('roles.p3_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="roles-visual">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqSYZNgwHXRZr-epXQuFf127h7ewU22wEqq2J18eo4uL2Rl5IT5aPOnY2Zyg8PDJN4TTanQyG_lbdOELe9W3ZCN4evCruk7QD4N9vWLPvgJ6czDB2bEdKsQtWQnYtuAmHlcJyEzBHgHrde2kv9cAt4snD0pCGTfnnWzi_HLLBu-piJhdlDF_A8LXDKhblOKC0YnKdyoqJO1aS_U9pjFk81kGf4cs3LYlUS423bqQd7AlL3yD86uuyzdlNWjvEVkuGTQwlob1o69uM" 
                  alt="Study environment" 
                  className="roles-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="max-w-container">
            <h2 className="testimonials-title italic">"{t('testimonials.title')}"</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <p className="testimonial-text">
                  "Preacher Studio ha transformado mis sábados. Lo que antes me tomaba 8 horas de organización, ahora fluye de manera natural en 3. Me permite enfocarme en la oración y no en el software."
                </p>
                <div className="testimonial-author">
                  <div className="author-name">Pastor Marcos Rivera</div>
                  <div className="author-role">Iglesia Vida Nueva</div>
                </div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">
                  "Como líder de jóvenes, necesitaba algo visual y rápido. Los bosquejos estructurados de Preacher Studio son la mejor herramienta que he usado en 10 años de ministerio."
                </p>
                <div className="testimonial-author">
                  <div className="author-name">David Espinoza</div>
                  <div className="author-role">Generación Radical</div>
                </div>
              </div>
              <div className="testimonial-card">
                <p className="testimonial-text">
                  "La profundidad del estudio bíblico es impresionante. Tener mis referencias teológicas cruzadas con mi bosquejo en una sola pantalla es simplemente liberador."
                </p>
                <div className="testimonial-author">
                  <div className="author-name">Dr. Roberto Peña</div>
                  <div className="author-role">Seminario Bíblico Central</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="max-w-narrow">
            <h2 className="section-title text-center">{t('faq.title')}</h2>
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div 
                  key={i} 
                  className={`faq-item ${openFaq === i ? 'open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <span className="faq-icon">{openFaq === i ? '↑' : '↓'}</span>
                  </div>
                  {openFaq === i && <div className="faq-answer">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta-section">
          <div className="max-w-narrow">
            <h2 className="final-cta-title">{t('cta.final_title')}</h2>
            <p className="final-cta-desc">{t('cta.final_desc')}</p>
            <Button size="lg" className="cta-huge shimmer-button" onClick={() => navigate('/register')}>
              {t('nav.try_free')}
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="max-w-container footer-content">
          <div className="footer-brand">
            <div className="footer-logo">PREACHER STUDIO</div>
            <p className="footer-copy">{t('footer.copy')}</p>
          </div>
          <div className="footer-links">
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
