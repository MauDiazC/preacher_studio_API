-- Añadir estilo de mentoría al perfil del pastor
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mentorship_style TEXT DEFAULT 'encouraging';
