import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  es: {
    // Navbar
    'nav.home': 'Inicio',
    'nav.pricing': 'Precios',
    'nav.features': 'Funciones',
    'nav.my_sermons': 'Mis Sermones',
    'nav.new_study': 'Nuevo Estudio',
    'nav.login': 'Login',
    'nav.try_free': 'Probar Gratis',
    'nav.logout': 'Salir',
    // Landing
    'hero.badge': 'Mentoría Exegética con IA',
    'hero.title': 'Desbloquea la Profundidad',
    'hero.title_gradient': 'de la Palabra',
    'hero.description': 'Obtén análisis históricos, literarios y de significancia en segundos. La herramienta definitiva para pastores y predicadores modernos.',
    'hero.start': 'Comenzar Ahora',
    'hero.login': 'Iniciar Sesión',
    'tag.literary': 'Tipo Literario',
    'tag.authorship': 'Autoría',
    'tag.historical': 'Contexto Histórico',
    'tag.significance': 'Significancia',
    'tag.purpose': 'Propósito',
    // Pricing
    'pricing.badge': 'Planes y Precios',
    'pricing.title': 'Invierte en tu',
    'pricing.title_gradient': 'Ministerio',
    'pricing.subtitle': 'Planes diseñados por pastores para pastores. Sin complicaciones, solo exégesis pura.',
    'plan.free': 'Sembrador',
    'plan.pro': 'Mentor',
    'plan.unlimited': 'Exégeta',
    'plan.free_price': 'Gratis',
    'plan.popular': 'Más Popular',
    'plan.includes_all': 'Incluye todo lo del plan anterior',
    'btn.start_free': 'Empezar Gratis',
    'btn.choose': 'Elegir Plan',
    'btn.be_exegete': 'Ser un Exégeta',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.pricing': 'Pricing',
    'nav.features': 'Features',
    'nav.my_sermons': 'My Sermons',
    'nav.new_study': 'New Study',
    'nav.login': 'Login',
    'nav.try_free': 'Try Free',
    'nav.logout': 'Logout',
    // Landing
    'hero.badge': 'AI Exegetical Mentorship',
    'hero.title': 'Unlock the Depth',
    'hero.title_gradient': 'of the Word',
    'hero.description': 'Get historical, literary, and significance analysis in seconds. The ultimate tool for modern pastors and preachers.',
    'hero.start': 'Start Now',
    'hero.login': 'Log In',
    'tag.literary': 'Literary Type',
    'tag.authorship': 'Authorship',
    'tag.historical': 'Historical Context',
    'tag.significance': 'Significance',
    'tag.purpose': 'Purpose',
    // Pricing
    'pricing.badge': 'Plans & Pricing',
    'pricing.title': 'Invest in your',
    'pricing.title_gradient': 'Ministry',
    'pricing.subtitle': 'Plans designed by pastors for pastors. No complications, just pure exegesis.',
    'plan.free': 'Sower',
    'plan.pro': 'Mentor',
    'plan.unlimited': 'Exegete',
    'plan.free_price': 'Free',
    'plan.popular': 'Most Popular',
    'plan.includes_all': 'Includes everything from the previous plan',
    'btn.start_free': 'Start for Free',
    'btn.choose': 'Choose Plan',
    'btn.be_exegete': 'Become an Exegete',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
