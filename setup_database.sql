CREATE TABLE IF NOT EXISTS api_keys (
  id SERIAL PRIMARY KEY,
  api_key UUID UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por api_key
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);

-- Índice para filtrar por estado activo
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Índice para filtrar por rol
CREATE INDEX IF NOT EXISTS idx_api_keys_role ON api_keys(role);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';


CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos de nuestro proyecto

INSERT INTO api_keys (api_key, client_name, email, role) VALUES
  (gen_random_uuid(),'Admin','admin@example.com','admin'),

INSERT INTO api_keys (api_key, client_name, email, role) VALUES
  (gen_random_uuid(),'Usuario de prueba','usuario@example.com','user');

CREATE TABLE IF NOT EXISTS SOCIOS(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    fecha_alta TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS MAQUINAS(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    estado VARCHAR(50) DEFAULT 'operativa' CHECK (estado IN ('operativa', 'mantenimiento', 'fuera_de_servicio')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS RUTINAS(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    nivel_dificultad VARCHAR(50) DEFAULT 'principiante' CHECK (nivel_dificultad IN ('principiante', 'intermedio', 'avanzado')),
    id_socio INTEGER REFERENCES SOCIOS(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS EJERCICIOS(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    grupo_muscular VARCHAR(100) NOT NULL,
    id_maquina INTEGER REFERENCES MAQUINAS(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS RUTINA_EJERCICIOS(
    id SERIAL PRIMARY KEY,
    id_rutina INTEGER REFERENCES RUTINAS(id) ON DELETE CASCADE,
    id_ejercicio INTEGER REFERENCES EJERCICIOS(id) ON DELETE CASCADE,
    series INTEGER DEFAULT 0,
    repeticiones INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
