import Rutina from '../models/rutina.mjs';

/**
 * Repository de Rutina
 * Capa de acceso a datos - Supabase + Redis caché
 */
class RutinaRepository {
  constructor(supabase, redisClient = null) {
    this.supabase = supabase;
    this.redis = redisClient;
    Rutina.setClient(redisClient);
  }

  async findAll() {
    // Intentar obtener de caché global
    if (this.redis) {
      const cached = await this.redis.get('rutinas:all');
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(r => new Rutina(r));
      }
    }

    // Consulta a Supabase
    const { data, error } = await this.supabase
      .from('rutinas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Guardar en caché (300s)
    if (this.redis && data) {
      await this.redis.setEx('rutinas:all', 300, JSON.stringify(data));
    }

    return data.map(r => new Rutina(r));
  }

  async findById(id) {
    // Intentar obtener de caché individual
    const cached = await Rutina.getFromCache(id);
    if (cached) return cached;

    // Consulta a Supabase
    const { data, error } = await this.supabase
      .from('rutinas')
      .select('*')
      .eq('id_rutina', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const rutina = new Rutina(data);
    await rutina.saveToCache();

    return rutina;
  }

  async findBySocio(idSocio) {
    const cacheKey = `rutinas:socio:${idSocio}`;

    // Intentar obtener de caché específica por socio
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(r => new Rutina(r));
      }
    }

    const { data, error } = await this.supabase
      .from('rutinas')
      .select('*')
      .eq('id_socio', idSocio);

    if (error) throw error;

    // Guardar en caché
    if (this.redis && data) {
      await this.redis.setEx(cacheKey, 300, JSON.stringify(data));
    }

    return data.map(r => new Rutina(r));
  }

  async findByNivel(nivel) {
    const cacheKey = `rutinas:nivel:${nivel}`;

    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(r => new Rutina(r));
      }
    }

    const { data, error } = await this.supabase
      .from('rutinas')
      .select('*')
      .eq('nivel_dificultad', nivel);

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(cacheKey, 300, JSON.stringify(data));
    }

    return data.map(r => new Rutina(r));
  }

  async create(rutinaData) {
    const { data, error } = await this.supabase
      .from('rutinas')
      .insert({
        nombre: rutinaData.nombre,
        nivel_dificultad: rutinaData.nivel_dificultad || 'principiante',
        id_socio: rutinaData.id_socio
      })
      .select()
      .single();

    if (error) throw error;

    const rutina = new Rutina(data);
    
    // Invalidar caché (all, socio y nivel)
    await rutina.invalidateCache();

    return rutina;
  }

  async update(id, rutinaData) {
    const { data, error } = await this.supabase
      .from('rutinas')
      .update({
        nombre: rutinaData.nombre,
        nivel_dificultad: rutinaData.nivel_dificultad,
        id_socio: rutinaData.id_socio,
        updated_at: new Date().toISOString()
      })
      .eq('id_rutina', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const rutina = new Rutina(data);
    
    // Invalidar caché previa y nueva
    await rutina.invalidateCache();

    return rutina;
  }

  async delete(id) {
    // Obtenemos la rutina antes de borrar para saber a qué socio/nivel pertenecía
    // y así poder limpiar sus respectivas claves de caché
    const rutina = await this.findById(id);

    const { error } = await this.supabase
      .from('rutinas')
      .delete()
      .eq('id_rutina', id);

    if (error) throw error;

    if (rutina) {
      await rutina.invalidateCache();
    }

    return true;
  }
}

export default RutinaRepository;