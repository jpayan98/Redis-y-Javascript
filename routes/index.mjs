import express from 'express';
import { supabase } from '../config/database.mjs';
import redis from '../config/redis.mjs';

// Importar routes
import apiKeyRoutes from './apiKeyRoutes.mjs';
import createSocioRoutes from './socioRoutes.mjs';
import createEjercicioRoutes from './ejercicioRoutes.mjs';
import createMaquinaRoutes from './maquinaRoutes.mjs';

// Importar Repositories
import SocioRepository from '../repositories/socioRepository.mjs';
import EjercicioRepository from '../repositories/ejercicioRepository.mjs';
import MaquinaRepository from '../repositories/maquinaRepository.mjs';

// Importar Services
import SocioService from '../services/socioService.mjs';
import EjercicioService from '../services/ejercicioService.mjs';
import MaquinaService from '../services/maquinaService.mjs';

// Importar Controllers
import SocioController from '../controllers/socioController.mjs';
import EjercicioController from '../controllers/ejercicioController.mjs';
import MaquinaController from '../controllers/maquinaController.mjs';

const router = express.Router();

// ============================================
// INYECCIÓN DE DEPENDENCIAS - SOCIOS
// ============================================

const socioRepository = new SocioRepository(supabase, redis);
const socioService = new SocioService(socioRepository);
const socioController = new SocioController(socioService);

// ============================================
// INYECCIÓN DE DEPENDENCIAS - EJERCICIOS
// ============================================

const ejercicioRepository = new EjercicioRepository(supabase, redis);
const ejercicioService = new EjercicioService(ejercicioRepository);
const ejercicioController = new EjercicioController(ejercicioService);

// ============================================
// INYECCIÓN DE DEPENDENCIAS - MÁQUINAS
// ============================================

const maquinaRepository = new MaquinaRepository(supabase, redis);
const maquinaService = new MaquinaService(maquinaRepository);
const maquinaController = new MaquinaController(maquinaService);

// ============================================
// REGISTRAR RUTAS
// ============================================

// Rutas de autenticación con API Keys
router.use('/', apiKeyRoutes);

// Rutas de entidades
router.use('/socios', createSocioRoutes(socioController));
router.use('/ejercicios', createEjercicioRoutes(ejercicioController));
router.use('/maquinas', createMaquinaRoutes(maquinaController));

// Ruta raíz con información de la API
router.get('/', (req, res) => {
  res.json({
    name: 'API Gimnasio',
    version: '1.0.0',
    endpoints: {
      auth: [
        'POST /api/register - Registrar y obtener nueva API Key'
      ],
      socios: [
        'GET /api/socios - Listar todos los socios',
        'GET /api/socios/:id - Obtener socio por ID',
        'GET /api/socios/estado/:estado - Obtener socios por estado',
        'POST /api/socios - Crear nuevo socio',
        'PUT /api/socios/:id - Actualizar socio',
        'DELETE /api/socios/:id - Eliminar socio'
      ],
      ejercicios: [
        'GET /api/ejercicios - Listar todos los ejercicios',
        'GET /api/ejercicios/:id - Obtener ejercicio por ID',
        'GET /api/ejercicios/grupo/:grupo_muscular - Obtener ejercicios por grupo muscular',
        'GET /api/ejercicios/maquina/:id_maquina - Obtener ejercicios por máquina',
        'POST /api/ejercicios - Crear nuevo ejercicio',
        'PUT /api/ejercicios/:id - Actualizar ejercicio',
        'DELETE /api/ejercicios/:id - Eliminar ejercicio'
      ],
      maquinas: [
        'GET /api/maquinas - Listar todas las máquinas',
        'GET /api/maquinas/:id - Obtener máquina por ID',
        'POST /api/maquinas - Crear nueva máquina',
        'PUT /api/maquinas/:id - Actualizar máquina',
        'DELETE /api/maquinas/:id - Eliminar máquina'
      ],
      admin: [
        'GET /api/admin/keys - Listar todas las API Keys',
        'PUT /api/admin/keys/:apiKey/deactivate - Desactivar API Key',
        'PUT /api/admin/keys/:apiKey/activate - Activar API Key'
      ]
    },
    usage: {
      header: 'X-API-Key',
      example: 'X-API-Key: tu-uuid-aqui'
    }
  });
});

export default router;