import { Router } from 'express';

/**
 * Routes de RutinaEjercicio
 * Define los endpoints para la relación N:M entre rutinas y ejercicios
 */
const createRutinaEjercicioRoutes = (rutinaEjercicioController) => {
  const router = Router();

  // GET /rutina-ejercicios - Obtener todas las vinculaciones
  router.get('/', rutinaEjercicioController.getAll);

  // GET /rutina-ejercicios/rutina/:id_rutina - Obtener todos los ejercicios de una rutina
  router.get('/rutina/:id_rutina', rutinaEjercicioController.getByRutina);

  // GET /rutina-ejercicios/ejercicio/:id_ejercicio - Obtener todas las rutinas que usan un ejercicio
  router.get('/ejercicio/:id_ejercicio', rutinaEjercicioController.getByEjercicio);

  // GET /rutina-ejercicios/:id - Obtener una vinculación específica por su ID
  router.get('/:id', rutinaEjercicioController.getById);

  // POST /rutina-ejercicios - Vincular un ejercicio a una rutina (añade series/reps)
  router.post('/', rutinaEjercicioController.create);

  // PUT /rutina-ejercicios/:id - Actualizar series o repeticiones de una vinculación
  router.put('/:id', rutinaEjercicioController.update);

  // DELETE /rutina-ejercicios/:id - Eliminar un ejercicio de una rutina
  router.delete('/:id', rutinaEjercicioController.delete);

  return router;
};

export default createRutinaEjercicioRoutes;