import Socio from '../models/socio.mjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository de Socio
 * Capa de acceso a datos - Supabase + Redis caché
 */
class SocioRepository {
  constructor(supabase, redisClient = null) {
    this.supabase = supabase;
    this.redis = redisClient;
    Socio.setClient(redisClient);
  }

  async findAll() {
    // Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get('socios:all');
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(s => new Socio(s));
      }
    }

    // Si no hay caché, consultar Supabase
    const { data, error } = await this.supabase
      .from('socios')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    // Guardar en caché
    if (this.redis && data) {
      await this.redis.setEx('socios:all', 300, JSON.stringify(data));
    }

    return data.map(s => new Socio(s));
  }

  async findById(id) {
    // Intentar obtener de caché
    const cached = await Socio.getFromCache(id);
    if (cached) return cached;

    // Si no hay caché, consultar Supabase
    const { data, error } = await this.supabase
      .from('socios')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const socio = new Socio(data);

    // Guardar en caché
    await socio.saveToCache();

    return socio;
  }

  async findByEmail(email) {
    const { data, error } = await this.supabase
      .from('socios')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? new Socio(data) : null;
  }

  async findByApiKey(apiKey) {
    // Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get(`socios:apikey:${apiKey}`);
      if (cached) {
        return new Socio(JSON.parse(cached));
      }
    }

    const { data, error } = await this.supabase
      .from('socios')
      .select('*')
      .eq('api_key', apiKey)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const socio = new Socio(data);

    // Guardar en caché
    if (this.redis) {
      await this.redis.setEx(`socios:apikey:${apiKey}`, 600, JSON.stringify(data));
    }

    return socio;
  }

  async findByActivo(activo) {
    // Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get(`socios:activo:${activo}`);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(s => new Socio(s));
      }
    }

    const { data, error } = await this.supabase
      .from('socios')
      .select('*')
      .eq('activo', activo)
      .order('id', { ascending: true });

    if (error) throw error;

    // Guardar en caché
    if (this.redis && data) {
      await this.redis.setEx(`socios:activo:${activo}`, 300, JSON.stringify(data));
    }

    return data.map(s => new Socio(s));
  }

  async create(socioData) {
    // Generar API Key si no se proporciona
    const apiKey = socioData.api_key || uuidv4();
    const role = socioData.role || 'user';

    const { data, error } = await this.supabase
      .from('socios')
      .insert({
        nombre: socioData.nombre,
        apellidos: socioData.apellidos,
        email: socioData.email,
        telefono: socioData.telefono || null,
        activo: socioData.activo !== undefined ? socioData.activo : true,
        api_key: apiKey,
        role: role
      })
      .select()
      .single();

    if (error) throw error;

    const socio = new Socio(data);

    // Invalidar caché de listados
    await socio.invalidateCache();

    return socio;
  }

  async update(id, socioData) {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Solo actualizar campos que vienen en socioData
    if (socioData.nombre !== undefined) updateData.nombre = socioData.nombre;
    if (socioData.apellidos !== undefined) updateData.apellidos = socioData.apellidos;
    if (socioData.email !== undefined) updateData.email = socioData.email;
    if (socioData.telefono !== undefined) updateData.telefono = socioData.telefono;
    if (socioData.activo !== undefined) updateData.activo = socioData.activo;
    if (socioData.role !== undefined) updateData.role = socioData.role;
    // La API key normalmente NO debe actualizarse, pero si viene...
    if (socioData.api_key !== undefined) updateData.api_key = socioData.api_key;

    const { data, error } = await this.supabase
      .from('socios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const socio = new Socio(data);

    // Invalidar caché
    await socio.invalidateCache();

    return socio;
  }

  async delete(id) {
    // Obtener socio antes de eliminar para invalidar caché
    const socio = await this.findById(id);

    const { error } = await this.supabase
      .from('socios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Invalidar caché
    if (socio) {
      await socio.invalidateCache();
    }

    return true;
  }

  async regenerateApiKey(id) {
    const newApiKey = uuidv4();

    const { data, error } = await this.supabase
      .from('socios')
      .update({
        api_key: newApiKey,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const socio = new Socio(data);
    await socio.invalidateCache();

    return socio;
  }
}

export default SocioRepository;