
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
CREATE TABLE public.socios (
  id serial PRIMARY KEY,
  nombre varchar NOT NULL,
  apellidos varchar NOT NULL,
  telefono varchar,
  email varchar NOT NULL UNIQUE,
  fecha_alta timestamptz NOT NULL DEFAULT now(),
  activo boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  api_key uuid,
  role varchar DEFAULT 'user' CHECK (role::text = ANY (ARRAY['user'::character varying::text, 'admin'::character varying::text, 'dba'::character varying::text]))
);

CREATE TABLE public.maquinas (
  id serial PRIMARY KEY,
  nombre varchar NOT NULL,
  tipo varchar NOT NULL,
  estado varchar DEFAULT 'operativa' CHECK (estado::text = ANY (ARRAY['operativa'::character varying, 'mantenimiento'::character varying, 'fuera_de_servicio'::character varying]::text[])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.rutinas (
  id serial PRIMARY KEY,
  nombre varchar NOT NULL,
  nivel_dificultad varchar DEFAULT 'principiante' CHECK (nivel_dificultad::text = ANY (ARRAY['principiante'::character varying, 'intermedio'::character varying, 'avanzado'::character varying]::text[])),
  id_socio integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rutinas_id_socio_fkey FOREIGN KEY (id_socio) REFERENCES public.socios(id)
);

CREATE TABLE public.ejercicios (
  id serial PRIMARY KEY,
  nombre varchar NOT NULL,
  descripcion text,
  grupo_muscular varchar NOT NULL,
  id_maquina integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ejercicios_id_maquina_fkey FOREIGN KEY (id_maquina) REFERENCES public.maquinas(id)
);

CREATE TABLE public.rutina_ejercicios (
  id serial PRIMARY KEY,
  id_rutina integer,
  id_ejercicio integer,
  series integer DEFAULT 0,
  repeticiones integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rutina_ejercicios_id_rutina_fkey FOREIGN KEY (id_rutina) REFERENCES public.rutinas(id),
  CONSTRAINT rutina_ejercicios_id_ejercicio_fkey FOREIGN KEY (id_ejercicio) REFERENCES public.ejercicios(id)
);

INSERT INTO usuarios (nombre, apellidos, telefono, email, fecha_alta, activo, api_key, role) VALUES
('Juan',   'Pérez Gómez',       '600123456', 'juan.perez@email.com',   '2024-01-10', true,  gen_random_uuid(), 'admin'),
('María',  'López Sánchez',     '600123457', 'maria.lopez@email.com',  '2024-01-12', true,  gen_random_uuid(), 'user'),
('Carlos', 'Ruiz Martín',       '600123458', 'carlos.ruiz@email.com',  '2024-01-15', false, gen_random_uuid(), 'user'),
('Ana',    'García Torres',     '600123459', 'ana.garcia@email.com',   '2024-01-18', true,  gen_random_uuid(), 'dba'),
('Lucía',  'Fernández Díaz',    '600123460', 'lucia.fernandez@email.com','2024-01-20', true, gen_random_uuid(), 'user'),
('Pedro',  'Moreno Vidal',      '600123461', 'pedro.moreno@email.com', '2024-01-22', false, gen_random_uuid(), 'user'),
('Sofía',  'Navarro León',      '600123462', 'sofia.navarro@email.com','2024-01-25', true,  gen_random_uuid(), 'admin'),
('David',  'Romero Cruz',       '600123463', 'david.romero@email.com', '2024-01-28', true,  gen_random_uuid(), 'user'),
('Elena',  'Ortega Ramos',      '600123464', 'elena.ortega@email.com', '2024-02-01', true,  gen_random_uuid(), 'dba'),
('Javier', 'Molina Herrera',    '600123465', 'javier.molina@email.com','2024-02-03', false, gen_random_uuid(), 'user');



INSERT INTO public.rutinas (nombre, nivel_dificultad, id_socio) VALUES
('Rutina cuerpo completo básica',      'principiante', 1),
('Iniciación al cardio',               'principiante', 2),
('Fuerza general para novatos',        'principiante', 3),
('Movilidad y estiramientos',          'principiante', 4),
('Core básico',                        'principiante', 5),

('Cardio resistencia media',           'intermedio',   1),
('Hipertrofia torso',                  'intermedio',   2),
('Pierna y glúteo intermedio',          'intermedio',   3),
('Entrenamiento funcional',            'intermedio',   4),
('Core y estabilidad',                 'intermedio',   5),

('HIIT avanzado',                      'avanzado',     1),
('Fuerza máxima',                      'avanzado',     2),
('Rutina full body intensa',           'avanzado',     3),
('Potencia y explosividad',            'avanzado',     4),
('Resistencia extrema',                'avanzado',     5);



INSERT INTO public.maquinas (nombre, tipo, estado) VALUES
('Cinta de correr 1',        'Cardio',        'operativa'),
('Cinta de correr 2',        'Cardio',        'operativa'),
('Bicicleta estática 1',     'Cardio',        'operativa'),
('Bicicleta estática 2',     'Cardio',        'mantenimiento'),
('Elíptica 1',               'Cardio',        'operativa'),

('Press de banca',           'Fuerza',        'operativa'),
('Máquina de poleas',        'Fuerza',        'operativa'),
('Prensa de piernas',        'Fuerza',        'mantenimiento'),
('Extensión de cuádriceps',  'Fuerza',        'operativa'),
('Curl femoral',             'Fuerza',        'operativa'),

('Remo sentado',             'Fuerza',        'operativa'),
('Multipower',               'Fuerza',        'fuera_de_servicio'),
('Jaula de sentadillas',     'Fuerza',        'operativa'),
('Máquina de abdominales',   'Fuerza',        'operativa'),
('Escaladora',               'Cardio',        'operativa');


INSERT INTO public.ejercicios (nombre, descripcion, grupo_muscular, id_maquina) VALUES
('Flexiones',                'Flexiones clásicas para pecho y tríceps',          'Pecho',                NULL),
('Press de banca',           'Press de banca plano con barra',                   'Pecho',                6),
('Fondos en paralelas',      'Fondos para pecho y tríceps',                       'Pecho',                NULL),
('Sentadillas',              'Sentadillas libres con barra',                     'Piernas',              NULL),
('Prensa de piernas',        'Prensa para cuádriceps y glúteos',                'Piernas',              8),
('Curl femoral',             'Curl acostado para isquiotibiales',               'Piernas',              9),
('Peso muerto',              'Peso muerto clásico para cadena posterior',       'Espalda',              10),
('Remo con barra',           'Remo para dorsal y trapecio',                      'Espalda',              NULL),
('Jalón al pecho',           'Jalón en polea para dorsales',                     'Espalda',              7),
('Plancha',                  'Plancha abdominal para core',                      'Abdomen',              14),
('Crunch abdominal',         'Abdominales clásicos',                              'Abdomen',              14),
('Elevaciones laterales',    'Elevaciones laterales de hombro con mancuernas',  'Hombros',              NULL),
('Press militar',            'Press de hombro sentado con barra',               'Hombros',              11),
('Bicicleta estática',       'Cardio en bicicleta estática',                     'Cardio',               3),
('Cinta de correr',          'Cardio en cinta de correr',                        'Cardio',               1);


INSERT INTO public.rutina_ejercicios (id_rutina, id_ejercicio, series, repeticiones) VALUES
-- Rutina 1
(1, 1, 3, 12),
(1, 2, 3, 10),
(1, 10, 2, 30),

-- Rutina 2
(2, 3, 3, 12),
(2, 4, 4, 15),
(2, 5, 3, 12),

-- Rutina 3
(3, 6, 3, 12),
(3, 7, 4, 10),
(3, 8, 3, 15),

-- Rutina 4
(4, 9, 3, 12),
(4, 10, 3, 30),
(4, 11, 3, 20),

-- Rutina 5
(5, 12, 3, 15),
(5, 13, 3, 10),
(5, 1, 4, 12),

-- Rutina 6
(6, 2, 3, 12),
(6, 5, 3, 15),
(6, 14, 2, 20),

-- Rutina 7
(7, 3, 4, 10),
(7, 15, 3, 20);
