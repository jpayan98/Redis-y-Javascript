import { supabase } from '../config/database.mjs';
import redis from '../config/redis.mjs';

/**
 * Middleware para validar API Keys y aplicar rate limiting
 * Usa la tabla 'socios' en lugar de 'api_keys'
 */
export const apiKeyMiddleware = async (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'Falta API Key' });
  }

  // Comprobar que la API key existe y el socio está activo en Supabase
  const { data: socio, error } = await supabase
    .from('socios')
    .select('*')
    .eq('api_key', apiKey)
    .eq('activo', true)
    .single();

  if (error || !socio) {
    return res.status(403).json({ error: 'API Key Inválida o socio inactivo' });
  }

  // Rate limiting con Redis (ventana de 1 minuto)
  const window = Math.floor(Date.now() / 60000);
  const redisKey = `rate:${apiKey}:${window}`;

  try {
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, 60);
    }

    if (count > 100) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
  } catch (redisError) {
    console.error('Redis error:', redisError);
    // Continuar sin rate limiting si Redis falla
  }

  // Adjuntar información del socio a la request
  // Estructura compatible con el código anterior
  req.client = {
    id: socio.id,
    nombre: socio.nombre,
    apellidos: socio.apellidos,
    email: socio.email,
    telefono: socio.telefono,
    role: socio.role || 'user',
    apiKey: socio.api_key,
    activo: socio.activo,
    fecha_alta: socio.fecha_alta,
    created_at: socio.created_at,
    updated_at: socio.updated_at
  };
  
  next();
};