import { Router } from 'express';

/**
 * Routes de Ejercicio
 * Define los endpoints de la API
 */
const createEjercicioRoutes = (ejercicioController) => {
  const router = Router();

  // GET /ejercicios - Obtener todos los ejercicios
  router.get('/', ejercicioController.getAll);

  // GET /ejercicios/grupo/:grupo_muscular - Obtener ejercicios por grupo muscular
  router.get('/grupo/:grupo_muscular', ejercicioController.getByGrupoMuscular);

  // GET /ejercicios/maquina/:id_maquina - Obtener ejercicios por máquina
  router.get('/maquina/:id_maquina', ejercicioController.getByMaquina);

  // GET /ejercicios/:id - Obtener ejercicio por ID
  router.get('/:id', ejercicioController.getById);

  // POST /ejercicios - Crear nuevo ejercicio
  router.post('/', ejercicioController.create);

  // PUT /ejercicios/:id - Actualizar ejercicio
  router.put('/:id', ejercicioController.update);

  // DELETE /ejercicios/:id - Eliminar ejercicio
  router.delete('/:id', ejercicioController.delete);

  return router;
};

export default createEjercicioRoutes;