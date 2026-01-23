// routes/ejercicioRoutes.mjs
import { Router } from 'express';
import { checkPermission } from '../middlewares/roleMiddleware.mjs';

const createEjercicioRoutes = (ejercicioController) => {
  const router = Router();

  // GET /ejercicios - Listar todos los ejercicios
  // Todos pueden ver (user, admin, dba)
  router.get('/',
    checkPermission('ejercicios', 'read'),
    ejercicioController.getAll
  );

  // GET /ejercicios/grupo/:grupo_muscular - Filtrar por grupo muscular
  // Todos pueden ver
  router.get('/grupo/:grupo_muscular',
    checkPermission('ejercicios', 'read'),
    ejercicioController.getByGrupoMuscular
  );

  // GET /ejercicios/maquina/:id_maquina - Filtrar por máquina
  // Todos pueden ver
  router.get('/maquina/:id_maquina',
    checkPermission('ejercicios', 'read'),
    ejercicioController.getByMaquina
  );

  // GET /ejercicios/:id - Obtener ejercicio por ID
  // Todos pueden ver
  router.get('/:id',
    checkPermission('ejercicios', 'read'),
    ejercicioController.getById
  );

  // POST /ejercicios - Crear nuevo ejercicio
  // Solo admin y dba
  router.post('/',
    checkPermission('ejercicios', 'create'),
    ejercicioController.create
  );

  // PUT /ejercicios/:id - Actualizar ejercicio
  // Solo admin y dba
  router.put('/:id',
    checkPermission('ejercicios', 'update'),
    ejercicioController.update
  );

  // DELETE /ejercicios/:id - Eliminar ejercicio
  // Solo admin y dba
  router.delete('/:id',
    checkPermission('ejercicios', 'delete'),
    ejercicioController.delete
  );

  return router;
};

export default createEjercicioRoutes;
