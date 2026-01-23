// routes/rutinaEjercicioRoutes.mjs
import { Router } from 'express';
import { checkPermission } from '../middlewares/roleMiddleware.mjs';

const createRutinaEjercicioRoutes = (rutinaEjercicioController) => {
    const router = Router();

    // GET /rutina-ejercicios - Listar todas las relaciones
    // Todos pueden ver
    router.get('/',
        checkPermission('rutinas', 'read'),
        rutinaEjercicioController.getAll
    );

    // GET /rutina-ejercicios/rutina/:id_rutina - Filtrar por rutina
    // Todos pueden ver
    router.get('/rutina/:id_rutina',
        checkPermission('rutinas', 'read'),
        rutinaEjercicioController.getByRutina
    );

    // GET /rutina-ejercicios/ejercicio/:id_ejercicio - Filtrar por ejercicio
    // Todos pueden ver
    router.get('/ejercicio/:id_ejercicio',
        checkPermission('rutinas', 'read'),
        rutinaEjercicioController.getByEjercicio
    );

    // GET /rutina-ejercicios/:id - Obtener por ID
    // Todos pueden ver
    router.get('/:id',
        checkPermission('rutinas', 'read'),
        rutinaEjercicioController.getById
    );

    // POST /rutina-ejercicios - Crear nueva relación
    // Solo admin y dba
    router.post('/',
        checkPermission('rutinas', 'create'),
        rutinaEjercicioController.create
    );

    // PUT /rutina-ejercicios/:id - Actualizar relación
    // Solo admin y dba
    router.put('/:id',
        checkPermission('rutinas', 'update'),
        rutinaEjercicioController.update
    );

    // DELETE /rutina-ejercicios/:id - Eliminar relación
    // Solo admin y dba
    router.delete('/:id',
        checkPermission('rutinas', 'delete'),
        rutinaEjercicioController.delete
    );

    return router;
};

export default createRutinaEjercicioRoutes;
