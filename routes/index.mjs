import express from 'express';
import { supabase } from '../config/database.mjs';
import redis from '../config/redis.mjs';

// Importar routes
import authRoutes from './authRoutes.mjs';
import createSocioRoutes from './socioRoutes.mjs';
import createMaquinaRoutes from './maquinaRoutes.mjs';
import createEjercicioRoutes from './ejercicioRoutes.mjs';
import createRutinaRoutes from './rutinaRoutes.mjs';
import createRutinaEjercicioRoutes from './rutinaEjercicioRoutes.mjs';

// Importar Repositories
import SocioRepository from '../repositories/socioRepository.mjs';
import MaquinaRepository from '../repositories/maquinaRepository.mjs';
import EjercicioRepository from '../repositories/ejercicioRepository.mjs';
import RutinaRepository from '../repositories/rutinaRepository.mjs';
import RutinaEjercicioRepository from '../repositories/rutinaEjercicioRepository.mjs';

// Importar Services
import SocioService from '../services/socioService.mjs';
import MaquinaService from '../services/maquinaService.mjs';
import EjercicioService from '../services/ejercicioService.mjs';
import RutinaService from '../services/rutinaService.mjs';
import RutinaEjercicioService from '../services/rutinaEjercicioService.mjs';

// Importar Controllers
import SocioController from '../controllers/socioController.mjs';
import MaquinaController from '../controllers/maquinaController.mjs';
import EjercicioController from '../controllers/ejercicioController.mjs';
import RutinaController from '../controllers/rutinaController.mjs';
import RutinaEjercicioController from '../controllers/rutinaEjercicioController.mjs';

const router = express.Router();

// ============================================
// INYECCIÓN DE DEPENDENCIAS - SOCIOS
// ============================================

const socioRepository = new SocioRepository(supabase, redis);
const socioService = new SocioService(socioRepository);
const socioController = new SocioController(socioService);

// ============================================
// INYECCIÓN DE DEPENDENCIAS - MÁQUINAS
// ============================================

const maquinaRepository = new MaquinaRepository(supabase, redis);
const maquinaService = new MaquinaService(maquinaRepository);
const maquinaController = new MaquinaController(maquinaService);

// ============================================
// INYECCIÓN DE DEPENDENCIAS - EJERCICIOS
// ============================================

const ejercicioRepository = new EjercicioRepository(supabase, redis);
const ejercicioService = new EjercicioService(ejercicioRepository);
const ejercicioController = new EjercicioController(ejercicioService);

// ============================================
// INYECCIÓN DE DEPENDENCIAS - RUTINAS
// ============================================

const rutinaRepository = new RutinaRepository(supabase, redis);
const rutinaService = new RutinaService(rutinaRepository);
const rutinaController = new RutinaController(rutinaService);

// ============================================
// INYECCIÓN DE DEPENDENCIAS - RUTINA_EJERCICIOS
// ============================================

const rutinaEjercicioRepository = new RutinaEjercicioRepository(supabase, redis);
// RutinaEjercicioService necesita 3 repositories para verificar relaciones
const rutinaEjercicioService = new RutinaEjercicioService(
  rutinaEjercicioRepository,
  rutinaRepository,
  ejercicioRepository
);
const rutinaEjercicioController = new RutinaEjercicioController(rutinaEjercicioService);

// ============================================
// REGISTRAR RUTAS
// ============================================

// Rutas de autenticación (registro público y /auth/me)
router.use('/', authRoutes);

// Rutas de entidades (requieren autenticación)
router.use('/socios', createSocioRoutes(socioController));
router.use('/maquinas', createMaquinaRoutes(maquinaController));
router.use('/ejercicios', createEjercicioRoutes(ejercicioController));
router.use('/rutinas', createRutinaRoutes(rutinaController));
router.use('/rutina-ejercicios', createRutinaEjercicioRoutes(rutinaEjercicioController));

// Ruta raíz con información de la API
router.get('/', (req, res) => {
  res.json({
    name: 'API Gimnasio',
    version: '2.0.0',
    description: 'API REST para gestión de gimnasio con autenticación por API Key',
    endpoints: {
      auth: [
        'POST /api/register - Registrar nuevo socio y obtener API Key (PÚBLICO)',
        'GET  /api/auth/me - Obtener información del socio autenticado'
      ],
      socios: [
        'GET    /api/socios - Listar socios (DBA: todos, User: solo su perfil)',
        'GET    /api/socios/:id - Obtener socio por ID',
        'GET    /api/socios/activo/:activo - Filtrar por activo (DBA)',
        'POST   /api/socios - Crear nuevo socio (DBA)',
        'PUT    /api/socios/:id - Actualizar socio (DBA)',
        'DELETE /api/socios/:id - Eliminar socio (DBA)',
        'POST   /api/socios/:id/regenerate-key - Regenerar API Key (DBA)'
      ],
      maquinas: [
        'GET    /api/maquinas - Listar todas las máquinas',
        'GET    /api/maquinas/:id - Obtener máquina por ID',
        'GET    /api/maquinas/estado/:estado - Filtrar por estado',
        'GET    /api/maquinas/tipo/:tipo - Filtrar por tipo',
        'POST   /api/maquinas - Crear nueva máquina (Admin, DBA)',
        'PUT    /api/maquinas/:id - Actualizar máquina (Admin, DBA)',
        'DELETE /api/maquinas/:id - Eliminar máquina (Admin, DBA)'
      ],
      ejercicios: [
        'GET    /api/ejercicios - Listar todos los ejercicios',
        'GET    /api/ejercicios/:id - Obtener ejercicio por ID',
        'GET    /api/ejercicios/grupo/:grupo_muscular - Filtrar por grupo muscular',
        'GET    /api/ejercicios/maquina/:id_maquina - Filtrar por máquina',
        'POST   /api/ejercicios - Crear nuevo ejercicio (Admin, DBA)',
        'PUT    /api/ejercicios/:id - Actualizar ejercicio (Admin, DBA)',
        'DELETE /api/ejercicios/:id - Eliminar ejercicio (Admin, DBA)'
      ],
      rutinas: [
        'GET    /api/rutinas - Listar rutinas (User: solo suyas, Admin/DBA: todas)',
        'GET    /api/rutinas/:id - Obtener rutina por ID',
        'GET    /api/rutinas/socio/:id_socio - Filtrar por socio',
        'GET    /api/rutinas/nivel/:nivel - Filtrar por nivel de dificultad',
        'POST   /api/rutinas - Crear nueva rutina (Admin, DBA)',
        'PUT    /api/rutinas/:id - Actualizar rutina (Admin, DBA)',
        'DELETE /api/rutinas/:id - Eliminar rutina (Admin, DBA)'
      ],
      rutina_ejercicios: [
        'GET    /api/rutina-ejercicios - Listar todas las relaciones',
        'GET    /api/rutina-ejercicios/:id - Obtener relación por ID',
        'GET    /api/rutina-ejercicios/rutina/:id_rutina - Ejercicios de una rutina',
        'GET    /api/rutina-ejercicios/ejercicio/:id_ejercicio - Rutinas que usan un ejercicio',
        'POST   /api/rutina-ejercicios - Añadir ejercicio a rutina (Admin, DBA)',
        'PUT    /api/rutina-ejercicios/:id - Actualizar relación (Admin, DBA)',
        'DELETE /api/rutina-ejercicios/:id - Eliminar relación (Admin, DBA)'
      ]
    },
    roles: {
      user: 'Socio del gimnasio - Acceso de solo lectura',
      admin: 'Staff/Entrenador - Gestiona equipamiento, ejercicios y rutinas',
      dba: 'Administrador - Control total del sistema'
    },
    authentication: {
      header: 'X-API-Key',
      example: 'X-API-Key: tu-uuid-aqui',
      howToGetKey: 'POST /api/register con nombre, apellidos y email'
    }
  });
});

export default router;