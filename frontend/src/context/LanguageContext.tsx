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
    'nav.home': 'Inicio', 'nav.pricing': 'Precios', 'nav.features': 'Funciones', 'nav.my_sermons': 'Mis Estudios', 'nav.new_study': 'Nuevo Análisis', 'nav.login': 'Login', 'nav.try_free': 'Probar Gratis', 'nav.logout': 'Salir', 'nav.library': 'Mis Estudios', 'nav.sermon_prep': 'Crear Estudio', 'nav.settings': 'Ajustes', 'nav.credits': 'Mis Créditos', 'nav.unlimited': 'Ilimitados',
    // Hero
    'hero.title_new': 'Tu Mentor Homilético Digital de Nivel Académico',
    'hero.description_new': 'Profundiza en la Palabra con análisis exegéticos, léxicos Strong y mapas bíblicos. La herramienta definitiva para la preparación de sermones inspirados.',
    'hero.cta_free': 'Comenzar mi Preparación',
    // Trust
    'trust.title': 'RECONOCIDO POR MINISTERIOS GLOBALES',
    // Pricing
    'pricing.title': 'Inversión en tu',
    'pricing.title_gradient': 'Ministerio',
    'pricing.subtitle': 'Planes diseñados para cada etapa de tu llamado espiritual.',
    'PRICING.BADGE': 'PLANES Y PRECIOS',
    'plan.free': 'Sembrador', 'plan.pro': 'Mentor', 'plan.unlimited': 'Ministerio',
    'plan.free_desc': '3 estudios básicos sin léxicos',
    'plan.pro_desc': '30 estudios al mes',
    'plan.unlimited_desc': 'Estudios ilimitados',
    'plan.free_price': '0',
    'pricing.month': '/mes',
    'pricing.includes_prev': 'Todo lo del plan anterior',
    'pricing.includes_all': 'Todo lo de los planes anteriores',
    'pricing.pptx_keynote': 'Integración con PPTX y Keynote con plantillas',
    'pricing.start_now': 'Comenzar ahora',
    'pricing.teams': 'Ministerio',
    // List
    'list.search_placeholder': 'Buscar pasajes...',
    'list.title': 'Mis Estudios Exegéticos', 'list.subtitle': 'Gestionando la Sabiduría Divina', 'list.total_studies': 'Total Estudios', 'list.this_month': 'Este Mes', 'list.empty': 'No tienes estudios guardados aún.', 'list.loading': 'Cargando...', 'list.col_reference': 'Referencia Bíblica', 'list.col_last_edit': 'Última Edición', 'list.col_tags': 'Etiquetas', 'list.col_actions': 'Acciones', 'list.new_study_btn': 'Crear Estudio',
    // Editor
    'editor.exegesis': 'Exégesis', 'editor.write_here': 'Notas Personales:', 'editor.saved_ago': 'Guardado hace', 'editor.analyze_btn': 'Generar Análisis', 'editor.verse_placeholder': 'Ej: Juan 3:16', 'editor.resources': 'Recursos', 'editor.bible_versions': 'Versiones Bíblicas', 'editor.strong_lexicon': 'Léxicos Strong', 'editor.biblical_maps': 'Geografía y Mapas', 'editor.share_btn': 'Compartir',
    // Auth
    'auth.inspired_prep': 'Preparación Inspirada',
    'auth.email': 'Correo Electrónico',
    'auth.email_placeholder': 'pastor@ejemplo.com',
    'auth.password': 'Contraseña',
    'auth.forgot_password': '¿Olvidaste tu contraseña?',
    'auth.login_btn': 'Iniciar Sesión',
    'auth.continue_with': 'O continuar con',
    'auth.no_account': '¿No tienes una cuenta?',
    'auth.register_now': 'Registrarme',
    'auth.full_name': 'Nombre Completo',
    'auth.register_btn': 'Crear Cuenta Ministerial',
    'auth.already_account': '¿Ya tienes una cuenta?',
    'auth.success_login': '¡Bienvenido de nuevo!',
    'auth.error_login': 'Credenciales inválidas',
    'auth.error_google': 'Error al conectar con Google',
    'auth.register_subtitle': 'Únete a la comunidad de guías espirituales',
    'auth.have_account': '¿Ya tienes una cuenta?',
    'auth.login_link': 'Iniciar Sesión',
    'AUTH.CONFIRM_PASSWORD_LABEL': 'Confirmar Contraseña',
    // Checkout
    'checkout.confirm_plan': 'Confirma tu Plan',
    'checkout.step_desc': 'Estás a un paso de elevar tu ministerio',
    'checkout.selected_sub': 'Suscripción Seleccionada',
    'checkout.change_plan': '¿No es el plan correcto?',
    'checkout.explore_others': 'Explorar otros planes',
    'checkout.guarantee': 'Garantía de Satisfacción',
    'checkout.secure_payment': 'Pago 100% Seguro',
    'checkout.trust': 'Respaldo Ministerial',
    'checkout.ministerial_backing': 'Usado por +10k Pastores',
    'checkout.summary_title': 'Resumen del Estudio',
    'checkout.taxes': 'Impuestos',
    'checkout.total_to_pay': 'Total a Pagar',
    'checkout.promo_code': 'Código de Promoción',
    'checkout.apply_btn': 'Aplicar',
    'checkout.proceed_btn': 'Proceder al Pago Seguro',
    'checkout.encrypted_notice': 'Tus datos están protegidos con encriptación de grado militar.',
    'checkout.quote_preparation': '"La preparación del corazón es del hombre; mas de Jehová es la respuesta de la lengua." — Proverbios 16:1',
    // Footer
    'footer.privacy': 'Privacidad', 'footer.terms': 'Términos', 'footer.contact': 'Soporte',
  },
  en: {
    // Navbar
    'nav.home': 'Home', 'nav.pricing': 'Pricing', 'nav.features': 'Features', 'nav.my_sermons': 'My Studies', 'nav.new_study': 'New Analysis', 'nav.login': 'Login', 'nav.try_free': 'Try Free', 'nav.logout': 'Logout', 'nav.library': 'My Studies', 'nav.sermon_prep': 'Create Study', 'nav.settings': 'Settings', 'nav.credits': 'My Credits', 'nav.unlimited': 'Unlimited',
    // Hero
    'hero.title_new': 'Your Academic-Grade Digital Homiletical Mentor',
    'hero.description_new': 'Deepen your study of the Word with exegetical analysis, Strong lexicons, and biblical maps. The ultimate tool for inspired sermon preparation.',
    'hero.cta_free': 'Start My Preparation',
    // Trust
    'trust.title': 'TRUSTED BY GLOBAL MINISTRIES',
    // Pricing
    'pricing.title': 'Investment in your',
    'pricing.title_gradient': 'Ministry',
    'pricing.subtitle': 'Plans designed for every stage of your spiritual calling.',
    'PRICING.BADGE': 'PLANS & PRICING',
    'plan.free': 'Sower', 'plan.pro': 'Mentor', 'plan.unlimited': 'Ministry',
    'plan.free_desc': '3 basic studies without lexicons',
    'plan.pro_desc': '30 studies per month',
    'plan.unlimited_desc': 'Unlimited studies',
    'plan.free_price': '0',
    'pricing.month': '/month',
    'pricing.includes_prev': 'Everything in the previous plan',
    'pricing.includes_all': 'Everything in previous plans',
    'pricing.pptx_keynote': 'PPTX & Keynote integration with templates',
    'pricing.start_now': 'Start Now',
    'pricing.teams': 'Ministry',
    // List
    'list.search_placeholder': 'Search passages...',
    'list.title': 'My Exegetical Studies', 'list.subtitle': 'Managing Divine Wisdom', 'list.total_studies': 'Total Studies', 'list.this_month': 'This Month', 'list.empty': 'No saved studies yet.', 'list.loading': 'Loading...', 'list.col_reference': 'Bible Reference', 'list.col_last_edit': 'Last Edit', 'list.col_tags': 'Tags', 'list.col_actions': 'Actions', 'list.new_study_btn': 'Create Study',
    // Editor
    'editor.exegesis': 'Exegesis', 'editor.write_here': 'Personal Notes:', 'editor.saved_ago': 'Saved', 'editor.analyze_btn': 'Generate Analysis', 'editor.verse_placeholder': 'Ex: John 3:16', 'editor.resources': 'Resources', 'editor.bible_versions': 'Bible Versions', 'editor.strong_lexicon': 'Strong Lexicons', 'editor.biblical_maps': 'Biblical Maps', 'editor.share_btn': 'Share',
    // Auth
    'auth.inspired_prep': 'Inspired Preparation',
    'auth.email': 'Email Address',
    'auth.email_placeholder': 'pastor@example.com',
    'auth.password': 'Password',
    'auth.forgot_password': 'Forgot your password?',
    'auth.login_btn': 'Log In',
    'auth.continue_with': 'Or continue with',
    'auth.no_account': 'Don\'t have an account?',
    'auth.register_now': 'Register Now',
    'auth.full_name': 'Full Name',
    'auth.register_btn': 'Create Ministerial Account',
    'auth.already_account': 'Already have an account?',
    'auth.success_login': 'Welcome back!',
    'auth.error_login': 'Invalid credentials',
    'auth.error_google': 'Error connecting with Google',
    'auth.register_subtitle': 'Join the community of spiritual guides',
    'auth.have_account': 'Already have an account?',
    'auth.login_link': 'Log In',
    'AUTH.CONFIRM_PASSWORD_LABEL': 'Confirm Password',
    // Checkout
    'checkout.confirm_plan': 'Confirm Your Plan',
    'checkout.step_desc': 'You are one step away from elevating your ministry',
    'checkout.selected_sub': 'Selected Subscription',
    'checkout.change_plan': 'Not the right plan?',
    'checkout.explore_others': 'Explore other plans',
    'checkout.guarantee': 'Satisfaction Guarantee',
    'checkout.secure_payment': '100% Secure Payment',
    'checkout.trust': 'Ministerial Support',
    'checkout.ministerial_backing': 'Used by +10k Pastors',
    'checkout.summary_title': 'Study Summary',
    'checkout.taxes': 'Taxes',
    'checkout.total_to_pay': 'Total to Pay',
    'checkout.promo_code': 'Promo Code',
    'checkout.apply_btn': 'Apply',
    'checkout.proceed_btn': 'Proceed to Secure Payment',
    'checkout.encrypted_notice': 'Your data is protected with military-grade encryption.',
    'checkout.quote_preparation': '"The preparations of the heart in man, and the answer of the tongue, is from the LORD." — Proverbs 16:1',
    // Footer
    'footer.privacy': 'Privacy', 'footer.terms': 'Terms', 'footer.contact': 'Support',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');
  const toggleLanguage = () => setLanguage(prev => prev === 'es' ? 'en' : 'es');
  const t = (key: string) => (translations[language] as any)[key] || key;
  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) throw new Error('useLanguage error');
  return context;
};
