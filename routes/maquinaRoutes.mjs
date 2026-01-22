import { Router } from 'express';
import { checkPermission } from '../middlewares/roleMiddleware.mjs';

/**
 * Routes de Maquinas
 * DBA y Admin tienen acceso completo
 * User solo puede leer
 */
const createMaquinasRoutes = (maquinasController) => {
  const router = Router();

  // GET /maquinas - Obtener todas las máquinas (Todos)
  router.get('/', 
    checkPermission('maquinas', 'read'),
    maquinasController.getAll
  );

  // GET /maquinas/estado/:estado - Obtener máquinas por estado (Todos)
  router.get('/estado/:estado', 
    checkPermission('maquinas', 'read'),
    maquinasController.getByEstado
  );

  // GET /maquinas/:id - Obtener máquina por ID (Todos)
  router.get('/:id', 
    checkPermission('maquinas', 'read'),
    maquinasController.getById
  );

  // POST /maquinas - Crear nueva máquina (DBA y Admin)
  router.post('/', 
    checkPermission('maquinas', 'create'),
    maquinasController.create
  );

  // PUT /maquinas/:id - Actualizar máquina (DBA y Admin)
  router.put('/:id', 
    checkPermission('maquinas', 'update'),
    maquinasController.update
  );

  // DELETE /maquinas/:id - Eliminar máquina (DBA y Admin)
  router.delete('/:id', 
    checkPermission('maquinas', 'delete'),
    maquinasController.delete
  );

  return router;
};

export default createMaquinasRoutes;