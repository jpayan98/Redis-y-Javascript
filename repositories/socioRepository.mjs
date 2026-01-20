import Socio from '../models/socio.mjs';

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

    if (error) throw error;
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

  async findByEstado(estado) {
    // Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get(`socios:estado:${estado}`);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(s => new Socio(s));
      }
    }

    const { data, error } = await this.supabase
      .from('socios')
      .select('*')
      .eq('estado', estado);

    if (error) throw error;

    // Guardar en caché
    if (this.redis && data) {
      await this.redis.setEx(`socios:estado:${estado}`, 300, JSON.stringify(data));
    }

    return data.map(s => new Socio(s));
  }

  async create(socioData) {
    const { data, error } = await this.supabase
      .from('socios')
      .insert({
        nombre: socioData.nombre,
        email: socioData.email,
        estado: socioData.estado || 'activo'
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
    const { data, error } = await this.supabase
      .from('socios')
      .update({
        nombre: socioData.nombre,
        email: socioData.email,
        estado: socioData.estado,
        updated_at: new Date().toISOString()
      })
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
}

export default SocioRepository;
