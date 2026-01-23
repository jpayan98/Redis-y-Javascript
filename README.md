# API Gym Management System

API REST para gestión de gimnasios con autenticación por API Key, control de acceso basado en roles (RBAC), caché Redis y base de datos PostgreSQL en Supabase.

> Trabajo UD4 PSP y UT5 AAD

## Tecnologías

- **Node.js** (ES Modules)
- **Express 5.x** - Framework HTTP
- **Supabase** - Base de datos PostgreSQL en la nube
- **Redis** - Caché en memoria y rate limiting
- **UUID** - Generación de API Keys

## Estructura del Proyecto

```
├── index.mjs                    # Punto de entrada
├── app.mjs                      # Configuración de Express
├── docker-compose.yml           # Redis en Docker
├── setup_database.sql           # Script de creación de BD
│
├── config/
│   ├── database.mjs             # Cliente Supabase
│   └── redis.mjs                # Cliente Redis
│
├── models/
│   ├── socio.mjs                # Modelo de socio
│   ├── maquina.mjs              # Modelo de máquina
│   ├── ejercicio.mjs            # Modelo de ejercicio
│   ├── rutina.mjs               # Modelo de rutina
│   └── rutinaEjercicio.mjs      # Relación rutina-ejercicio
│
├── repositories/                # Capa de acceso a datos
├── services/                    # Lógica de negocio
├── controllers/                 # Manejadores HTTP
├── routes/                      # Definición de endpoints
│
├── middlewares/
│   ├── apiKeyMiddleware.mjs     # Validación API Key + Rate Limiting
│   ├── roleMiddleware.mjs       # Control de permisos por rol
│   └── adminMiddleware.mjs      # Verificación de admin
│
└── utils/
    └── apiKey.mjs               # Generador de UUID
```

## Instalación

### 1. Clonar e instalar dependencias

```bash
cd Redis-y-Javascript
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:

```env
PROJECT_URL=https://tu-proyecto.supabase.co
API_KEY=tu-api-key-de-supabase
PORT=3000
NODE_ENV=development
```

### 3. Crear base de datos

Ejecutar el contenido de `setup_database.sql` en el editor SQL de Supabase.

### 4. Iniciar Redis

```bash
sudo docker-compose up -d
```

### 5. Iniciar el servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints

### Autenticación (Públicos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/register` | Registrar nuevo socio y obtener API Key |
| GET | `/api/auth/me` | Obtener perfil del socio autenticado |

### Socios

| Método | Endpoint | Permisos |
|--------|----------|----------|
| GET | `/api/socios` | dba |
| GET | `/api/socios/:id` | dba, user (solo su perfil) |
| GET | `/api/socios/activo/:activo` | dba |
| POST | `/api/socios` | dba |
| PUT | `/api/socios/:id` | dba |
| DELETE | `/api/socios/:id` | dba |
| POST | `/api/socios/:id/regenerate-key` | dba |

### Máquinas

| Método | Endpoint | Permisos |
|--------|----------|----------|
| GET | `/api/maquinas` | dba, admin, user |
| GET | `/api/maquinas/:id` | dba, admin, user |
| GET | `/api/maquinas/estado/:estado` | dba, admin, user |
| GET | `/api/maquinas/tipo/:tipo` | dba, admin, user |
| POST | `/api/maquinas` | dba, admin |
| PUT | `/api/maquinas/:id` | dba, admin |
| DELETE | `/api/maquinas/:id` | dba, admin |

### Ejercicios

| Método | Endpoint | Permisos |
|--------|----------|----------|
| GET | `/api/ejercicios` | dba, admin, user |
| GET | `/api/ejercicios/:id` | dba, admin, user |
| GET | `/api/ejercicios/grupo/:grupo_muscular` | dba, admin, user |
| GET | `/api/ejercicios/maquina/:id_maquina` | dba, admin, user |
| POST | `/api/ejercicios` | dba, admin |
| PUT | `/api/ejercicios/:id` | dba, admin |
| DELETE | `/api/ejercicios/:id` | dba, admin |

### Rutinas

| Método | Endpoint | Permisos |
|--------|----------|----------|
| GET | `/api/rutinas` | dba, admin, user (solo sus rutinas) |
| GET | `/api/rutinas/:id` | dba, admin, user |
| GET | `/api/rutinas/socio/:id_socio` | dba, admin, user |
| GET | `/api/rutinas/nivel/:nivel` | dba, admin, user |
| POST | `/api/rutinas` | dba, admin |
| PUT | `/api/rutinas/:id` | dba, admin |
| DELETE | `/api/rutinas/:id` | dba, admin |

### Rutina-Ejercicios

| Método | Endpoint | Permisos |
|--------|----------|----------|
| GET | `/api/rutina-ejercicios` | dba, admin, user |
| GET | `/api/rutina-ejercicios/:id` | dba, admin, user |
| GET | `/api/rutina-ejercicios/rutina/:id_rutina` | dba, admin, user |
| GET | `/api/rutina-ejercicios/ejercicio/:id_ejercicio` | dba, admin, user |
| POST | `/api/rutina-ejercicios` | dba, admin |
| PUT | `/api/rutina-ejercicios/:id` | dba, admin |
| DELETE | `/api/rutina-ejercicios/:id` | dba, admin |

## Autenticación

### Registro de usuario

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "apellidos": "López",
    "email": "carlos@example.com",
    "telefono": "600123456"
  }'
```

Respuesta:
```json
{
  "message": "Socio registrado exitosamente",
  "socio": {
    "id": 1,
    "nombre": "Carlos",
    "email": "carlos@example.com",
    "role": "user"
  },
  "apiKey": "550e8400-e29b-41d4-a716-446655440000",
  "instructions": "Usa esta API Key en el header X-API-Key para autenticarte"
}
```

### Usar la API Key

Incluir el header `X-API-Key` en todas las peticiones:

```bash
curl http://localhost:3000/api/ejercicios \
  -H "X-API-Key: 550e8400-e29b-41d4-a716-446655440000"
```

## Roles y Permisos

| Rol | Descripción |
|-----|-------------|
| **user** | Socio del gimnasio. Solo lectura, accede solo a sus datos |
| **admin** | Entrenador/Staff. CRUD en máquinas, ejercicios, rutinas |
| **dba** | Administrador. Control total incluyendo gestión de socios |

## Rate Limiting

- **Límite**: 100 peticiones por minuto por API Key
- **Respuesta al exceder**: `429 Too Many Requests`

## Caché Redis

El sistema cachea automáticamente las consultas:

- **Colecciones**: TTL 5 minutos
- **Registros individuales**: TTL 10 minutos
- **Invalidación**: Automática al crear, actualizar o eliminar

## Códigos de Estado

| Código | Significado |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado |
| 400 | Error en la petición |
| 401 | Falta API Key |
| 403 | API Key inválida o permisos insuficientes |
| 404 | Recurso no encontrado |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

## Base de Datos

### Tablas

- **socios**: Miembros del gimnasio con API Key y rol
- **maquinas**: Equipamiento del gimnasio
- **ejercicios**: Catálogo de ejercicios
- **rutinas**: Planes de entrenamiento asignados a socios
- **rutina_ejercicios**: Relación entre rutinas y ejercicios (series, repeticiones)

### Diagrama de Relaciones

```
Socios (1) ──────< (N) Rutinas
                      │
                      │ (N) ────> (N) Ejercicios
                      │           (via rutina_ejercicios)
                      │
Maquinas (1) ────────< (N) Ejercicios
```

## Ejemplos de Uso

### Listar ejercicios por grupo muscular

```bash
curl http://localhost:3000/api/ejercicios/grupo/Pecho \
  -H "X-API-Key: tu-api-key"
```

### Crear una rutina (requiere admin o dba)

```bash
curl -X POST http://localhost:3000/api/rutinas \
  -H "X-API-Key: tu-api-key-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Rutina Principiante",
    "nivel_dificultad": "principiante",
    "id_socio": 1
  }'
```

### Agregar ejercicio a rutina

```bash
curl -X POST http://localhost:3000/api/rutina-ejercicios \
  -H "X-API-Key: tu-api-key-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "id_rutina": 1,
    "id_ejercicio": 1,
    "series": 3,
    "repeticiones": 12
  }'
```

## Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| 401 "Falta API Key" | Header no enviado | Incluir `X-API-Key` en el header |
| 403 "API Key Inválida" | Key no existe o socio inactivo | Verificar la API Key o registrar nuevo socio |
| 403 "Acceso denegado" | Rol sin permisos suficientes | Usar una cuenta con el rol adecuado |
| 429 "Rate limit exceeded" | Más de 100 peticiones/minuto | Esperar 60 segundos |
| "Redis Error" | Redis no está corriendo | Ejecutar `sudo docker-compose up -d` |

## Scripts NPM

```bash
npm start     # Iniciar en producción
npm run dev   # Iniciar en desarrollo con auto-reload
```
