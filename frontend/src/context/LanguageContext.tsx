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
    'hero.badge': 'Asistencia Homilética Digital',
    'hero.title': 'Desbloquea la Profundidad',
    'hero.title_gradient': 'de la Palabra',
    'hero.description': 'Obtén análisis históricos, literarios y teológicos en segundos. La herramienta definitiva para la preparación de sermones profundos.',
    'hero.start': 'Comenzar Ahora',
    'hero.login': 'Iniciar Sesión',
    'tag.literary': 'Tipo Literario',
    'tag.authorship': 'Autoría',
    'tag.historical': 'Contexto Histórico',
    'tag.significance': 'Significancia',
    'tag.purpose': 'Propósito',
    // Trust Bar
    'trust.advanced': 'EXÉGESIS AVANZADA',
    'trust.ai': 'MENTORÍA HOMILÉTICA',
    'trust.bible': 'BIBLIA & HISTORIA',
    // Pricing
    'pricing.badge': 'Membresías Ministeriales',
    'pricing.title': 'Potencia tu',
    'pricing.title_gradient': 'Estudio Bíblico',
    'pricing.subtitle': 'Planes diseñados por pastores para facilitar la preparación del mensaje dominical.',
    'plan.free': 'Sembrador',
    'plan.pro': 'Mentor',
    'plan.unlimited': 'Exégeta',
    'plan.free_price': 'Gratis',
    'plan.popular': 'Recomendado',
    'plan.includes_all': 'Incluye todo lo del plan anterior',
    'btn.start_free': 'Comenzar Gratis',
    'btn.choose': 'Elegir Plan',
    'btn.be_exegete': 'Suscribirme',
    // Editor Tools
    'editor.exegesis_title': 'Análisis del Pasaje',
    'editor.verse_placeholder': 'Ej: Juan 3:16',
    'editor.analyze_btn': 'Generar Análisis',
    'editor.literary': 'Tipo Literario',
    'editor.author': 'Autor',
    'editor.purpose': 'Propósito',
    'editor.historical': 'Contexto Histórico',
    'editor.significance': 'Significancia',
    'editor.credits_left': 'Estudios disponibles:',
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
    // List
    'list.title': 'Mis Estudios Exegéticos',
    'list.new_btn': 'Nuevo Análisis',
    'list.empty': 'No tienes estudios guardados aún.',
    'list.edit': 'EDITAR',
    'list.loading': 'Cargando estudios...',
    // Landing New
    'hero.title_new': 'Potencia tu Mensaje, Simplifica tu Ministerio',
    'hero.description_new': 'La herramienta definitiva para preparar sermones inspiradores y organizar tu estudio bíblico en un solo lugar. Sin distracciones, solo enfoque.',
    'hero.cta_free': 'Empieza Gratis Ahora',
    'trust.title': 'Ministerios que confían en nosotros',
    'stats.pastors': 'Pastores Semanales',
    'stats.sermons': 'Sermones Creados',
    'stats.denominations': 'Denominaciones',
    'features.title': 'Preparación Inspirada',
    'features.study_title': 'Estudio Bíblico Profundo',
    'features.study_desc': 'Conecta pasajes, estudia léxicos y organiza tus referencias teológicas en una biblioteca personal intuitiva diseñada para el estudio serio.',
    'features.outline_title': 'Generación de Bosquejos',
    'features.outline_desc': 'Transforma tus reflexiones en estructuras de mensaje coherentes. Herramientas de organización que fluyen con tu proceso creativo.',
    'features.mgmt_title': 'Gestión de Mensajes',
    'features.mgmt_desc': 'Planifica series de sermones anuales y gestiona tu calendario ministerial con facilidad. Nunca pierdas el hilo de tus enseñanzas.',
    'roles.title': 'Diseñado para cada Líder',
    'roles.p1_title': 'Pastores de tiempo completo',
    'roles.p1_desc': 'Centraliza tu ministerio de enseñanza y reduce las horas de administración técnica.',
    'roles.p2_title': 'Líderes de Jóvenes',
    'roles.p2_desc': 'Crea contenido dinámico y relevante con herramientas que facilitan la comunicación visual.',
    'roles.p3_title': 'Estudiantes de Teología',
    'roles.p3_desc': 'Organiza tus notas de clase y proyectos de investigación en un entorno libre de distracciones.',
    'testimonials.title': 'Palabras desde el Púlpito',
    'faq.title': 'Preguntas Comunes',
    'faq.q1': '¿Qué tan seguros están mis datos y sermones?',
    'faq.a1': 'Utilizamos encriptación de grado bancario para asegurar que tu propiedad intelectual y notas personales estén siempre protegidas y solo accesibles para ti.',
    'faq.q2': '¿Qué traducciones de la Biblia están incluidas?',
    'faq.a2': 'Incluimos acceso a las versiones más utilizadas como RVR1960, NVI, LBLA y más para tu estudio comparativo.',
    'faq.q3': '¿Ofrecen planes para equipos pastorales de iglesias?',
    'faq.a3': 'Sí, nuestro plan Exégeta permite compartir recursos básicos, y ofrecemos planes institucionales para seminarios e iglesias grandes.',
    'cta.final_title': 'Comienza tu viaje hacia una preparación más profunda',
    'cta.final_desc': 'Únete a miles de pastores que han redescubierto el gozo de preparar el mensaje.',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
    'footer.contact': 'Contacto',
    'footer.copy': '© 2026 Preacher Studio. Preparación Inspirada.',
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
    'hero.badge': 'Digital Homiletic Assistance',
    'hero.title': 'Unlock the Depth',
    'hero.title_gradient': 'of the Word',
    'hero.description': 'Obtain historical, literary, and theological analysis in seconds. The ultimate tool for deep sermon preparation.',
    'hero.start': 'Start Now',
    'hero.login': 'Log In',
    'tag.literary': 'Literary Type',
    'tag.authorship': 'Authorship',
    'tag.historical': 'Historical Context',
    'tag.significance': 'Significance',
    'tag.purpose': 'Purpose',
    // Trust Bar
    'trust.advanced': 'ADVANCED EXEGESIS',
    'trust.ai': 'HOMILETIC MENTORSHIP',
    'trust.bible': 'BIBLE & HISTORY',
    // Pricing
    'pricing.badge': 'Ministerial Memberships',
    'pricing.title': 'Enhance your',
    'pricing.title_gradient': 'Bible Study',
    'pricing.subtitle': 'Plans designed by pastors to facilitate the preparation of the Sunday message.',
    'plan.free': 'Sower',
    'plan.pro': 'Mentor',
    'plan.unlimited': 'Exegete',
    'plan.free_price': 'Free',
    'plan.popular': 'Recommended',
    'plan.includes_all': 'Includes everything from the previous plan',
    'btn.start_free': 'Start for Free',
    'btn.choose': 'Choose Plan',
    'btn.be_exegete': 'Subscribe Now',
    // Editor Tools
    'editor.exegesis_title': 'Passage Analysis',
    'editor.verse_placeholder': 'Ex: John 3:16',
    'editor.analyze_btn': 'Generate Analysis',
    'editor.literary': 'Literary Type',
    'editor.author': 'Author',
    'editor.purpose': 'Purpose',
    'editor.historical': 'Historical Context',
    'editor.significance': 'Significance',
    'editor.credits_left': 'Available studies:',
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
    // List
    'list.title': 'My Exegetical Studies',
    'list.new_btn': 'New Analysis',
    'list.empty': 'You have no saved studies yet.',
    'list.edit': 'EDIT',
    'list.loading': 'Loading studies...',
    // Landing New
    'hero.title_new': 'Empower your Message, Simplify your Ministry',
    'hero.description_new': 'The ultimate tool for preparing inspiring sermons and organizing your Bible study in one place. No distractions, just focus.',
    'hero.cta_free': 'Start for Free Now',
    'trust.title': 'Ministries that trust us',
    'stats.pastors': 'Weekly Pastors',
    'stats.sermons': 'Sermons Created',
    'stats.denominations': 'Denominations',
    'features.title': 'Inspired Preparation',
    'features.study_title': 'Deep Bible Study',
    'features.study_desc': 'Connect passages, study lexicons, and organize your theological references in an intuitive personal library designed for serious study.',
    'features.outline_title': 'Outline Generation',
    'features.outline_desc': 'Transform your reflections into coherent message structures. Organization tools that flow with your creative process.',
    'features.mgmt_title': 'Message Management',
    'features.mgmt_desc': 'Plan annual sermon series and manage your ministerial calendar with ease. Never lose the thread of your teachings.',
    'roles.title': 'Designed for Every Leader',
    'roles.p1_title': 'Full-time Pastors',
    'roles.p1_desc': 'Centralize your teaching ministry and reduce technical administration hours.',
    'roles.p2_title': 'Youth Leaders',
    'roles.p2_desc': 'Create dynamic and relevant content with tools that facilitate visual communication.',
    'roles.p3_title': 'Theology Students',
    'roles.p3_desc': 'Organize your class notes and research projects in a distraction-free environment.',
    'testimonials.title': 'Words from the Pulpit',
    'faq.title': 'Common Questions',
    'faq.q1': 'How secure are my data and sermons?',
    'faq.a1': 'We use bank-grade encryption to ensure your intellectual property and personal notes are always protected and only accessible to you.',
    'faq.q2': 'What Bible translations are included?',
    'faq.a2': 'We include access to the most used versions like RVR1960, NIV, NASB, and more for your comparative study.',
    'faq.q3': 'Do you offer plans for church pastoral teams?',
    'faq.a3': 'Yes, our Exegete plan allows sharing basic resources, and we offer institutional plans for seminaries and large churches.',
    'cta.final_title': 'Start your journey towards deeper preparation',
    'cta.final_desc': 'Join thousands of pastors who have rediscovered the joy of message preparation.',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.contact': 'Contact',
    'footer.copy': '© 2026 Preacher Studio. Inspired Preparation.',
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
