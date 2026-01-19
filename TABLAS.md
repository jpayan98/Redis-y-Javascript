# Sistema de Gestión de Gimnasio - Estructura de Base de Datos

## 📋 Tablas Principales

### 1. Socios
```sql
CREATE TABLE Socios (
    id_socio INT PRIMARY KEY AUTO_INCREMENT,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    fecha_alta DATE NOT NULL,
    fecha_baja DATE NULL,
    tipo_membresia ENUM('básica', 'estándar', 'premium', 'vip') NOT NULL,
    estado ENUM('activo', 'suspendido', 'inactivo') DEFAULT 'activo',
    foto_perfil VARCHAR(255),
    objetivo ENUM('pérdida_peso', 'ganancia_muscular', 'mantenimiento', 'rendimiento') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Entrenadores
```sql
CREATE TABLE Entrenadores (
    id_entrenador INT PRIMARY KEY AUTO_INCREMENT,
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    especialidad VARCHAR(100), -- Ej: Musculación, Yoga, Spinning, CrossFit
    certificaciones TEXT, -- Títulos y certificados
    fecha_contratacion DATE NOT NULL,
    horario_disponible JSON, -- Horarios de disponibilidad
    valoracion_promedio DECIMAL(3,2) DEFAULT 0.00,
    foto_perfil VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Clases
```sql
CREATE TABLE Clases (
    id_clase INT PRIMARY KEY AUTO_INCREMENT,
    id_entrenador INT NOT NULL,
    nombre VARCHAR(100) NOT NULL, -- Ej: Spinning Avanzado, Yoga Principiantes
    descripcion TEXT,
    tipo_clase ENUM('spinning', 'yoga', 'pilates', 'zumba', 'crossfit', 'funcional', 'boxing', 'gap') NOT NULL,
    nivel ENUM('principiante', 'intermedio', 'avanzado') NOT NULL,
    duracion INT NOT NULL, -- En minutos
    aforo_maximo INT NOT NULL,
    dia_semana ENUM('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    sala VARCHAR(50) NOT NULL,
    requiere_reserva BOOLEAN DEFAULT TRUE,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_entrenador) REFERENCES Entrenadores(id_entrenador) ON DELETE RESTRICT
);
```

### 4. Rutinas
```sql
CREATE TABLE Rutinas (
    id_rutina INT PRIMARY KEY AUTO_INCREMENT,
    id_socio INT NOT NULL,
    id_entrenador INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    objetivo VARCHAR(100),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    dias_semana SET('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo') NOT NULL,
    nivel_dificultad ENUM('principiante', 'intermedio', 'avanzado') NOT NULL,
    observaciones TEXT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_socio) REFERENCES Socios(id_socio) ON DELETE CASCADE,
    FOREIGN KEY (id_entrenador) REFERENCES Entrenadores(id_entrenador) ON DELETE RESTRICT
);
```

### 5. Máquinas/Equipamiento
```sql
CREATE TABLE Maquinas (
    id_maquina INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('cardio', 'fuerza', 'funcional', 'libre') NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    zona VARCHAR(50) NOT NULL, -- Área del gimnasio
    estado ENUM('operativa', 'mantenimiento', 'averiada', 'fuera_servicio') DEFAULT 'operativa',
    fecha_compra DATE,
    ultimo_mantenimiento DATE,
    proximo_mantenimiento DATE,
    instrucciones_uso TEXT,
    imagen VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔗 Tablas Intermedias (N:M)

### 6. Asistencias (Socios ↔ Clases)
```sql
CREATE TABLE Asistencias (
    id_asistencia INT PRIMARY KEY AUTO_INCREMENT,
    id_socio INT NOT NULL,
    id_clase INT NOT NULL,
    fecha DATE NOT NULL,
    hora_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('reservada', 'asistió', 'no_asistió', 'cancelada') DEFAULT 'reservada',
    fecha_cancelacion TIMESTAMP NULL,
    valoracion INT CHECK (valoracion BETWEEN 1 AND 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_socio) REFERENCES Socios(id_socio) ON DELETE CASCADE,
    FOREIGN KEY (id_clase) REFERENCES Clases(id_clase) ON DELETE CASCADE,
    UNIQUE KEY unica_reserva (id_socio, id_clase, fecha)
);
```

### 7. Ejercicios_Rutina (Rutinas ↔ Máquinas)
```sql
CREATE TABLE Ejercicios_Rutina (
    id_ejercicio INT PRIMARY KEY AUTO_INCREMENT,
    id_rutina INT NOT NULL,
    id_maquina INT NULL, -- Puede ser NULL si es ejercicio sin máquina
    nombre_ejercicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    series INT NOT NULL,
    repeticiones VARCHAR(50), -- Ej: "12-15" o "30 segundos"
    peso VARCHAR(50), -- Ej: "20kg" o "máximo"
    descanso INT, -- Segundos entre series
    orden_ejecucion INT NOT NULL, -- Orden en la rutina
    dia_semana ENUM('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo') NOT NULL,
    notas TEXT,
    video_demostracion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rutina) REFERENCES Rutinas(id_rutina) ON DELETE CASCADE,
    FOREIGN KEY (id_maquina) REFERENCES Maquinas(id_maquina) ON DELETE SET NULL
);
```

---

## 🔗 Relaciones del Sistema

### Relaciones 1:N (Uno a Muchos)

1. **Entrenador → Clases**
   - Un entrenador imparte múltiples clases
   - `Entrenadores.id_entrenador` → `Clases.id_entrenador`

2. **Socio → Rutinas**
   - Un socio puede tener múltiples rutinas a lo largo del tiempo
   - `Socios.id_socio` → `Rutinas.id_socio`

3. **Entrenador → Rutinas**
   - Un entrenador crea múltiples rutinas para diferentes socios
   - `Entrenadores.id_entrenador` → `Rutinas.id_entrenador`

4. **Rutina → Ejercicios_Rutina**
   - Una rutina contiene múltiples ejercicios
   - `Rutinas.id_rutina` → `Ejercicios_Rutina.id_rutina`

### Relaciones N:M (Muchos a Muchos)

1. **Socios ↔ Clases** (mediante tabla Asistencias)
   - Muchos socios pueden reservar/asistir a muchas clases
   - Un socio puede asistir a múltiples clases
   - Una clase puede tener múltiples socios
   - **Tabla intermedia:** `Asistencias`
   - **Claves foráneas:** 
     - `Asistencias.id_socio` → `Socios.id_socio`
     - `Asistencias.id_clase` → `Clases.id_clase`

2. **Rutinas ↔ Máquinas** (mediante tabla Ejercicios_Rutina)
   - Una rutina usa varias máquinas
   - Una máquina se usa en varias rutinas
   - **Tabla intermedia:** `Ejercicios_Rutina`
   - **Claves foráneas:**
     - `Ejercicios_Rutina.id_rutina` → `Rutinas.id_rutina`
     - `Ejercicios_Rutina.id_maquina` → `Maquinas.id_maquina`

---

## 📊 Diagrama de Relaciones (Textual)

```
Entrenadores (1) ----< (N) Clases
     |
     |
     | (1)
     |
     v
    (N) Rutinas (N) ----< (N) Ejercicios_Rutina >---- (N) Máquinas
         ^
         |
         | (N)
         |
        (1)
      Socios (N) ----< (N) Asistencias >---- (N) Clases
```

### Leyenda:
- `(1) ----< (N)` : Relación uno a muchos
- `(N) >----< (N)` : Relación muchos a muchos (con tabla intermedia)