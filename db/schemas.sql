-- Extension para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Perfiles de usuario (Pastores)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla Principal de Sermones
-- El campo 'content' es el "borrador vivo" que se guarda automáticamente
CREATE TABLE sermons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Sermón sin título',
    main_passage TEXT,
    content TEXT DEFAULT '', -- Aquí reside la persistencia inmediata
    status TEXT DEFAULT 'seed', -- seed, outline, draft, final
    is_auto_saving BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Historial/Traza (Snapshot de versiones)
-- Aquí guardamos puntos de control cuando el pastor decide "avanzar de etapa"
CREATE TABLE sermon_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
    content_snapshot TEXT NOT NULL,
    version_label TEXT, -- Ej: "Bosquejo inicial", "Revisión 1"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Sugerencias del LLM
CREATE TABLE llm_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
    prompt_type TEXT, -- 'expansion', 'outline', 'bible_search'
    ai_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);