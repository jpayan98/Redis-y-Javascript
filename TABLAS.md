# Sistema de Gestión de Gimnasio - Estructura de Base de Datos

## 📋 Tablas Principales

### 1. Socios
```sql
CREATE TABLE socios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    estado VARCHAR(20)
        CHECK (estado IN ('activo', 'suspendido', 'inactivo'))
        DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Entrenadores
```sql
CREATE TABLE entrenadores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especialidad VARCHAR(30)
        CHECK (especialidad IN ('yoga','musculacion','spinning','crossfit'))
        DEFAULT 'musculacion',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

### 3. Clases
```sql
CREATE TABLE clases (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_clase VARCHAR(30)
        CHECK (tipo_clase IN ('spinning', 'yoga', 'pilates', 'zumba', 'crossfit','musculacion'))
        NOT NULL,
    id_entrenador INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_entrenador) REFERENCES entrenadores(id)
);

```

### 4. Rutinas
```sql
CREATE TABLE rutinas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nivel_dificultad VARCHAR(20)
        CHECK (nivel_dificultad IN ('principiante', 'intermedio', 'avanzado'))
        NOT NULL,
    id_socio INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_socio) REFERENCES socios(id)
);

```

### 5. Máquinas/Equipamiento
```sql
CREATE TABLE maquinas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    estado VARCHAR(30)
        CHECK (estado IN ('operativa', 'mantenimiento', 'averiada', 'fuera_servicio'))
        DEFAULT 'operativa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

### 7. Ejercicios_Rutina (Rutinas ↔ Máquinas)
```sql
CREATE TABLE rutinas_maquinas (
    id SERIAL PRIMARY KEY,
    id_rutina INT NOT NULL,
    id_maquina INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rutina) REFERENCES rutinas(id),
    FOREIGN KEY (id_maquina) REFERENCES maquinas(id)
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