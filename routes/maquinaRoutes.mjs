// routes/maquinaRoutes.mjs
import { Router } from 'express';
import { checkPermission } from '../middlewares/roleMiddleware.mjs';

const createMaquinaRoutes = (maquinaController) => {
  const router = Router();

  // GET /maquinas - Listar todas las máquinas
  // Todos pueden ver (user, admin, dba)
  router.get('/',
    checkPermission('maquinas', 'read'),
    maquinaController.getAll
  );

  // GET /maquinas/estado/:estado - Filtrar por estado
  // Todos pueden ver
  router.get('/estado/:estado',
    checkPermission('maquinas', 'read'),
    maquinaController.getByEstado
  );

  // GET /maquinas/tipo/:tipo - Filtrar por tipo
  // Todos pueden ver
  router.get('/tipo/:tipo',
    checkPermission('maquinas', 'read'),
    maquinaController.getByTipo
  );

  // GET /maquinas/:id - Obtener máquina por ID
  // Todos pueden ver
  router.get('/:id',
    checkPermission('maquinas', 'read'),
    maquinaController.getById
  );

  // POST /maquinas - Crear nueva máquina
  // Solo admin y dba
  router.post('/',
    checkPermission('maquinas', 'create'),
    maquinaController.create
  );

  // PUT /maquinas/:id - Actualizar máquina
  // Solo admin y dba
  router.put('/:id',
    checkPermission('maquinas', 'update'),
    maquinaController.update
  );

  // DELETE /maquinas/:id - Eliminar máquina
  // Solo admin y dba
  router.delete('/:id',
    checkPermission('maquinas', 'delete'),
    maquinaController.delete
  );

  return router;
};

export default createMaquinaRoutes;
