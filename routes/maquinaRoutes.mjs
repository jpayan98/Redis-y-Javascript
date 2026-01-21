import { Router } from 'express';

/**
 * Routes de Maquina
 * Define los endpoints de la API para la gestión de equipos
 */
const createMaquinaRoutes = (maquinaController) => {
  const router = Router();

  // GET /maquinas - Obtener todas las máquinas
  router.get('/', maquinaController.getAll);

  // GET /maquinas/estado/:estado - Obtener máquinas por estado (operativa, mantenimiento, etc.)
  router.get('/estado/:estado', maquinaController.getByEstado);

  // GET /maquinas/:id - Obtener máquina por ID
  router.get('/:id', maquinaController.getById);

  // POST /maquinas - Crear nueva máquina
  router.post('/', maquinaController.create);

  // PUT /maquinas/:id - Actualizar datos de una máquina
  router.put('/:id', maquinaController.update);

  // DELETE /maquinas/:id - Eliminar una máquina
  router.delete('/:id', maquinaController.delete);

  return router;
};

export default createMaquinaRoutes;