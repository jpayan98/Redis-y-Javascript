import { Router } from 'express';
import { checkPermission } from '../middlewares/roleMiddleware.mjs';

/**
 * Middleware personalizado para que los users solo vean su propio perfil
 */
const filterOwnProfile = (req, res, next) => {
  // Si es user, solo puede ver su propio ID
  if (req.client.role === 'user') {
    const requestedId = parseInt(req.params.id);
    if (requestedId !== req.client.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes ver tu propio perfil'
      });
    }
  }
  next();
};

/**
 * Middleware para filtrar listado según rol
 */
const filterSociosList = async (req, res, next) => {
  // Guardar el rol para que el controller lo use
  req.userRole = req.client.role;
  req.userId = req.client.id;
  next();
};

/**
 * Routes de Socios
 * Define los endpoints de la API con permisos por rol
 */
const createSocioRoutes = (socioController) => {
  const router = Router();

  // GET /socios - Listar socios
  // DBA y Admin ven todos, User solo ve su perfil
  router.get('/',
    checkPermission('socios', 'read'),
    filterSociosList,
    socioController.getAll
  );

  // GET /socios/activo/:activo - Filtrar por activo/inactivo
  // Solo DBA y Admin
  router.get('/activo/:activo',
    checkPermission('socios', 'read'),
    (req, res, next) => {
      if (req.client.role === 'user') {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'No tienes permisos para filtrar socios'
        });
      }
      next();
    },
    socioController.getByActivo
  );

  // GET /socios/:id - Obtener socio por ID
  // DBA y Admin ven cualquiera, User solo su propio ID
  router.get('/:id',
    checkPermission('socios', 'read'),
    filterOwnProfile,
    socioController.getById
  );

  // POST /socios - Crear nuevo socio
  // Solo DBA
  router.post('/',
    checkPermission('socios', 'create'),
    socioController.create
  );

  // PUT /socios/:id - Actualizar socio
  // Solo DBA
  router.put('/:id',
    checkPermission('socios', 'update'),
    socioController.update
  );

  // DELETE /socios/:id - Eliminar socio
  // Solo DBA
  router.delete('/:id',
    checkPermission('socios', 'delete'),
    socioController.delete
  );

  // POST /socios/:id/regenerate-key - Regenerar API Key
  // Solo DBA
  router.post('/:id/regenerate-key',
    checkPermission('socios', 'update'),
    socioController.regenerateApiKey
  );

  return router;
};

export default createSocioRoutes;