import { supabase } from '../config/database.mjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controlador de autenticación
 * Gestiona el registro y generación de API Keys para socios
 */

/**
 * POST /api/register
 * Registra un nuevo socio y genera su API Key
 */
export const register = async (req, res) => {
  try {
    const { nombre, apellidos, email, telefono, role } = req.body;

    // Validar campos requeridos
    if (!nombre || !apellidos || !email) {
      return res.status(400).json({ 
        error: 'Campos requeridos',
        message: 'nombre, apellidos y email son obligatorios'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email inválido',
        message: 'Proporciona un email válido'
      });
    }

    // Validar rol si se proporciona
    const validRoles = ['user', 'admin', 'dba'];
    const assignedRole = role && validRoles.includes(role) ? role : 'user';

    // Generar API Key única
    const apiKey = uuidv4();

    // Crear socio en la base de datos
    const { data: newSocio, error } = await supabase
      .from('socios')
      .insert([
        {
          nombre,
          apellidos,
          email,
          telefono: telefono || null,
          api_key: apiKey,
          role: assignedRole,
          activo: true
        }
      ])
      .select()
      .single();

    if (error) {
      // Error de email duplicado
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'Email ya registrado',
          message: 'Ya existe un socio con este email'
        });
      }
      
      throw error;
    }

    res.status(201).json({
      message: 'Socio registrado exitosamente',
      socio: {
        id: newSocio.id,
        nombre: newSocio.nombre,
        apellidos: newSocio.apellidos,
        email: newSocio.email,
        role: newSocio.role
      },
      apiKey: newSocio.api_key,
      instructions: 'Usa esta API Key en el header X-API-Key para autenticarte'
    });

  } catch (error) {
    console.error('Error al registrar socio:', error);
    res.status(500).json({ 
      error: 'Error al registrar socio',
      message: error.message 
    });
  }
};

/**
 * GET /api/auth/me
 * Obtiene información del socio autenticado
 */
export const getMe = async (req, res) => {
  try {
    // req.client viene del middleware apiKeyMiddleware
    if (!req.client) {
      return res.status(401).json({ 
        error: 'No autenticado' 
      });
    }

    res.json({
      socio: {
        id: req.client.id,
        nombre: req.client.nombre,
        apellidos: req.client.apellidos,
        email: req.client.email,
        role: req.client.role
      }
    });

  } catch (error) {
    console.error('Error al obtener información del socio:', error);
    res.status(500).json({ 
      error: 'Error al obtener información',
      message: error.message 
    });
  }
};