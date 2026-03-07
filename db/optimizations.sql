-- 06 - Optimizaciones de Base de Datos

-- 1. Índices para mejorar la velocidad de filtrado y ordenamiento
CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON sermons(user_id);
CREATE INDEX IF NOT EXISTS idx_sermons_created_at ON sermons(created_at DESC);

-- 2. Asegurar que la tabla de historial existe
CREATE TABLE IF NOT EXISTS sermon_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
    content_snapshot TEXT,
    version_label TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla para métricas de IA (Opcional, para monitoreo avanzado)
CREATE TABLE IF NOT EXISTS ai_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sermon_id UUID REFERENCES sermons(id) ON DELETE SET NULL,
    latency_seconds FLOAT,
    model_name TEXT,
    status TEXT, -- 'success' o 'error'
    error_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
