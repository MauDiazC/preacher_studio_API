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
    // Pricing
    'plan.free': 'Sembrador', 'plan.pro': 'Mentor', 'plan.unlimited': 'Ministerio',
    'plan.free_desc': '3 estudios básicos sin léxicos',
    'plan.pro_desc': '30 estudios al mes',
    'plan.unlimited_desc': 'Estudios ilimitados',
    'pricing.includes_prev': 'Todo lo del plan anterior',
    'pricing.includes_all': 'Todo lo de los planes anteriores',
    'pricing.pptx_keynote': 'Integración con PPTX y Keynote con plantillas',
    'pricing.start_now': 'Comenzar ahora',
    // List
    'list.search_placeholder': 'Buscar pasajes...',
    'list.title': 'Mis Estudios Exegéticos', 'list.subtitle': 'Gestionando la Sabiduría Divina', 'list.total_studies': 'Total Estudios', 'list.this_month': 'Este Mes', 'list.empty': 'No tienes estudios guardados aún.', 'list.loading': 'Cargando...', 'list.col_reference': 'Referencia Bíblica', 'list.col_last_edit': 'Última Edición', 'list.col_tags': 'Etiquetas', 'list.col_actions': 'Acciones', 'list.new_study_btn': 'Crear Estudio',
    // Editor
    'editor.exegesis': 'Exégesis', 'editor.write_here': 'Puedes seguir escribiendo notas:', 'editor.saved_ago': 'Guardado hace', 'editor.analyze_btn': 'Generar Análisis', 'editor.verse_placeholder': 'Ej: Juan 3:16', 'editor.resources': 'Recursos', 'editor.bible_versions': 'Versiones Bíblicas', 'editor.strong_lexicon': 'Léxicos Strong', 'editor.biblical_maps': 'Geografía y Mapas', 'editor.share_btn': 'Compartir',
    // Auth
    'auth.inspired_prep': 'Preparación Inspirada',
  },
  en: {
    // Navbar
    'nav.home': 'Home', 'nav.pricing': 'Pricing', 'nav.features': 'Features', 'nav.my_sermons': 'My Studies', 'nav.new_study': 'New Analysis', 'nav.login': 'Login', 'nav.try_free': 'Try Free', 'nav.logout': 'Logout', 'nav.library': 'My Studies', 'nav.sermon_prep': 'Create Study', 'nav.settings': 'Settings', 'nav.credits': 'My Credits', 'nav.unlimited': 'Unlimited',
    // Pricing
    'plan.free': 'Sower', 'plan.pro': 'Mentor', 'plan.unlimited': 'Ministry',
    'plan.free_desc': '3 basic studies without lexicons',
    'plan.pro_desc': '30 studies per month',
    'plan.unlimited_desc': 'Unlimited studies',
    'pricing.includes_prev': 'Everything in the previous plan',
    'pricing.includes_all': 'Everything in previous plans',
    'pricing.pptx_keynote': 'PPTX & Keynote integration with templates',
    'pricing.start_now': 'Start Now',
    // List
    'list.search_placeholder': 'Search passages...',
    'list.title': 'My Exegetical Studies', 'list.subtitle': 'Managing Divine Wisdom', 'list.total_studies': 'Total Studies', 'list.this_month': 'This Month', 'list.empty': 'No saved studies yet.', 'list.loading': 'Loading...', 'list.col_reference': 'Bible Reference', 'list.col_last_edit': 'Last Edit', 'list.col_tags': 'Tags', 'list.col_actions': 'Actions', 'list.new_study_btn': 'Create Study',
    // Editor
    'editor.exegesis': 'Exegesis', 'editor.write_here': 'You can keep writing notes:', 'editor.saved_ago': 'Saved', 'editor.analyze_btn': 'Generate Analysis', 'editor.verse_placeholder': 'Ex: John 3:16', 'editor.resources': 'Resources', 'editor.bible_versions': 'Bible Versions', 'editor.strong_lexicon': 'Strong Lexicons', 'editor.biblical_maps': 'Biblical Maps', 'editor.share_btn': 'Share',
    // Auth
    'auth.inspired_prep': 'Inspired Preparation',
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
