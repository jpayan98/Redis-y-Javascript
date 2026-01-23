import { apiKeyMiddleware } from './apiKeyMiddleware.mjs';

/**
 * Middleware genérico para verificar roles
 */
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    await new Promise((resolve, reject) => {
      apiKeyMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }).catch(() => {
      return;
    });

    if (res.headersSent) {
      return;
    }

    if (!req.client || !allowedRoles.includes(req.client.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
        yourRole: req.client?.role || 'desconocido'
      });
    }

    next();
  };
};

export const adminMiddleware = requireRole('admin', 'dba');
export const dbaMiddleware = requireRole('dba');

export const permissions = {
  socios: {
    read: ['dba', 'user'],
    create: ['dba'],
    update: ['dba'],
    delete: ['dba']
  },
  maquinas: {
    read: ['dba', 'admin', 'user'],
    create: ['dba', 'admin'],
    update: ['dba', 'admin'],
    delete: ['dba', 'admin']
  },
  ejercicios: {
    read: ['dba', 'admin', 'user'],
    create: ['dba', 'admin'],
    update: ['dba', 'admin'],
    delete: ['dba', 'admin']
  },
  rutinas: {
    read: ['dba', 'admin', 'user'],
    create: ['dba', 'admin'],
    update: ['dba', 'admin'],
    delete: ['dba', 'admin']
  }
};


export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    await new Promise((resolve, reject) => {
      apiKeyMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }).catch(() => {
      return;
    });

    if (res.headersSent) {
      return;
    }

    const allowedRoles = permissions[resource]?.[action];

    if (!allowedRoles) {
      return res.status(500).json({ 
        error: 'Configuración de permisos no encontrada',
        resource,
        action
      });
    }

    if (!req.client || !allowedRoles.includes(req.client.role)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `No tienes permisos para ${action} en ${resource}`,
        requiredRoles: allowedRoles,
        yourRole: req.client?.role || 'desconocido'
      });
    }

    next();
  };
};