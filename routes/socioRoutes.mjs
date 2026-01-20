import { Router } from 'express';

/**
 * Routes de Socio
 * Define los endpoints de la API
 */
const createSocioRoutes = (socioController) => {
  const router = Router();

  // GET /socios - Obtener todos los socios
  router.get('/', socioController.getAll);

  // GET /socios/estado/:estado - Obtener socios por estado
  router.get('/estado/:estado', socioController.getByEstado);

  // GET /socios/:id - Obtener socio por ID
  router.get('/:id', socioController.getById);

  // POST /socios - Crear nuevo socio
  router.post('/', socioController.create);

  // PUT /socios/:id - Actualizar socio
  router.put('/:id', socioController.update);

  // DELETE /socios/:id - Eliminar socio
  router.delete('/:id', socioController.delete);

  return router;
};

export default createSocioRoutes;
