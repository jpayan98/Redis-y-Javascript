import { Router } from 'express';
import { register, getMe } from '../controllers/authController.mjs';
import { apiKeyMiddleware } from '../middlewares/apiKeyMiddleware.mjs';

/**
 * Routes de autenticación
 * Registro público y gestión de perfil
 */
const router = Router();

// POST /api/register - Registrar nuevo socio (PÚBLICO - sin API Key)
// Crea automáticamente como role: 'user'
router.post('/register', register);

// GET /api/auth/me - Obtener información del socio autenticado
// Requiere API Key válida
router.get('/auth/me', apiKeyMiddleware, getMe);

export default router;