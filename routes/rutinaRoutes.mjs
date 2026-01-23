// routes/rutinaRoutes.mjs
import { Router } from 'express';
import { checkPermission } from '../middlewares/roleMiddleware.mjs';

/**
 * Middleware para filtrar rutinas según rol
 * Si es user, redirige a sus propias rutinas
 */
const filterRutinasList = (req, res, next) => {
    // Si es user, redirigir a sus propias rutinas
    if (req.client.role === 'user') {
        return res.redirect(307, `/api/rutinas/socio/${req.client.id}`);
    }
    // DBA y Admin continúan normal
    next();
};

/**
 * Middleware para verificar que un user solo acceda a sus propias rutinas
 */
const filterOwnRutinas = (req, res, next) => {
    if (req.client.role === 'user') {
        const requestedSocioId = parseInt(req.params.id_socio);
        if (requestedSocioId !== req.client.id) {
            return res.status(403).json({
                error: 'Acceso denegado',
                message: 'Solo puedes ver tus propias rutinas'
            });
        }
    }
    next();
};

const createRutinaRoutes = (rutinaController) => {
    const router = Router();

    // GET /rutinas - Listar rutinas
    // User: solo las suyas, Admin/DBA: todas
    router.get('/',
        checkPermission('rutinas', 'read'),
        filterRutinasList,
        rutinaController.getAll
    );

    // GET /rutinas/socio/:id_socio - Filtrar por socio
    // User solo puede ver las suyas
    router.get('/socio/:id_socio',
        checkPermission('rutinas', 'read'),
        filterOwnRutinas,
        rutinaController.getBySocio
    );

    // GET /rutinas/nivel/:nivel - Filtrar por nivel de dificultad
    // Solo Admin y DBA
    router.get('/nivel/:nivel',
        checkPermission('rutinas', 'read'),
        (req, res, next) => {
            if (req.client.role === 'user') {
                return res.status(403).json({
                    error: 'Acceso denegado',
                    message: 'No tienes permisos para filtrar rutinas por nivel'
                });
            }
            next();
        },
        rutinaController.getByNivel
    );

    // GET /rutinas/:id - Obtener rutina por ID
    // Todos pueden ver (pero se valida en controller que user solo vea las suyas)
    router.get('/:id',
        checkPermission('rutinas', 'read'),
        rutinaController.getById
    );

    // POST /rutinas - Crear nueva rutina
    // Solo Admin y DBA
    router.post('/',
        checkPermission('rutinas', 'create'),
        rutinaController.create
    );

    // PUT /rutinas/:id - Actualizar rutina
    // Solo Admin y DBA
    router.put('/:id',
        checkPermission('rutinas', 'update'),
        rutinaController.update
    );

    // DELETE /rutinas/:id - Eliminar rutina
    // Solo Admin y DBA
    router.delete('/:id',
        checkPermission('rutinas', 'delete'),
        rutinaController.delete
    );

    return router;
};

export default createRutinaRoutes;
