import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
    'nav.my_sermons': 'Mis Estudios',
    'nav.new_study': 'Nuevo Análisis',
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
    // Trust Bar
    'trust.advanced': 'EXÉGESIS AVANZADA',
    'trust.ai': 'IA HOMILÉTICA',
    'trust.bible': 'BIBLIA & HISTORIA',
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
    // Editor Tools
    'editor.exegesis_title': 'Análisis Exegético',
    'editor.verse_placeholder': 'Ej: Juan 3:16',
    'editor.analyze_btn': 'Analizar Pasaje',
    'editor.literary': 'Tipo Literario',
    'editor.author': 'Autor',
    'editor.purpose': 'Propósito',
    'editor.historical': 'Contexto Histórico',
    'editor.significance': 'Significancia',
    'editor.credits_left': 'Créditos restantes:',
    // Auth
    'auth.login_title': 'Iniciar Sesión',
    'auth.register_title': 'Crear Cuenta',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirm_password': 'Confirmar Contraseña',
    'auth.full_name': 'Nombre Completo',
    'auth.full_name_placeholder': 'Juan Pérez',
    'auth.email_placeholder': 'ejemplo@correo.com',
    'auth.login_btn': 'Entrar',
    'auth.register_btn': 'Registrarse',
    'auth.no_account': '¿No tienes una cuenta?',
    'auth.have_account': '¿Ya tienes una cuenta?',
    'auth.login_link': 'Inicia Sesión',
    'auth.register_link': 'Regístrate',
    'auth.success_title': '¡Casi listo! 🕊️',
    'auth.success_body': 'Hemos enviado un enlace de activación a',
    'auth.success_body_2': 'Por favor, revisa tu bandeja de entrada para confirmar tu cuenta y empezar a usar las herramientas de',
    'auth.go_login': 'Ir al Inicio de Sesión',
  },
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.pricing': 'Pricing',
    'nav.features': 'Features',
    'nav.my_sermons': 'My Studies',
    'nav.new_study': 'New Analysis',
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
    // Trust Bar
    'trust.advanced': 'ADVANCED EXEGESIS',
    'trust.ai': 'HOMILETIC AI',
    'trust.bible': 'BIBLE & HISTORY',
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
    // Editor Tools
    'editor.exegesis_title': 'Exegetical Analysis',
    'editor.verse_placeholder': 'Ex: John 3:16',
    'editor.analyze_btn': 'Analyze Passage',
    'editor.literary': 'Literary Type',
    'editor.author': 'Author',
    'editor.purpose': 'Purpose',
    'editor.historical': 'Historical Context',
    'editor.significance': 'Significance',
    'editor.credits_left': 'Credits remaining:',
    // Auth
    'auth.login_title': 'Log In',
    'auth.register_title': 'Create Account',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.full_name': 'Full Name',
    'auth.full_name_placeholder': 'John Doe',
    'auth.email_placeholder': 'example@email.com',
    'auth.login_btn': 'Sign In',
    'auth.register_btn': 'Sign Up',
    'auth.no_account': "Don't have an account?",
    'auth.have_account': 'Already have an account?',
    'auth.login_link': 'Log In',
    'auth.register_link': 'Register',
    'auth.success_title': 'Almost ready! 🕊️',
    'auth.success_body': 'We have sent an activation link to',
    'auth.success_body_2': 'Please check your inbox to confirm your account and start using the tools from',
    'auth.go_login': 'Go to Log In',
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
