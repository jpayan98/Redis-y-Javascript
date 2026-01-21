import RutinaEjercicio from '../models/rutina_ejercicio.mjs';

/**
 * Repository de RutinaEjercicio
 * Capa de acceso a datos - Supabase + Redis caché
 */
class RutinaEjercicioRepository {
  constructor(supabase, redisClient = null) {
    this.supabase = supabase;
    this.redis = redisClient;
    RutinaEjercicio.setClient(redisClient);
  }

  async findAll() {
    if (this.redis) {
      const cached = await this.redis.get('rutina_ejercicios:all');
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(re => new RutinaEjercicio(re));
      }
    }

    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx('rutina_ejercicios:all', 300, JSON.stringify(data));
    }

    return data.map(re => new RutinaEjercicio(re));
  }

  async findById(id) {
    const cached = await RutinaEjercicio.getFromCache(id);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const vinculacion = new RutinaEjercicio(data);
    await vinculacion.saveToCache();

    return vinculacion;
  }

  async findByRutina(id_rutina) {
    const cacheKey = `rutina_ejercicios:rutina:${id_rutina}`;
    
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(re => new RutinaEjercicio(re));
      }
    }

    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .select('*')
      .eq('id_rutina', id_rutina);

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(cacheKey, 300, JSON.stringify(data));
    }

    return data.map(re => new RutinaEjercicio(re));
  }

  async findByEjercicio(id_ejercicio) {
    const cacheKey = `rutina_ejercicios:ejercicio:${id_ejercicio}`;
    
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(re => new RutinaEjercicio(re));
      }
    }

    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .select('*')
      .eq('id_ejercicio', id_ejercicio);

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(cacheKey, 300, JSON.stringify(data));
    }

    return data.map(re => new RutinaEjercicio(re));
  }

  async create(reData) {
    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .insert({
        id_rutina: reData.id_rutina,
        id_ejercicio: reData.id_ejercicio,
        series: reData.series || 0,
        repeticiones: reData.repeticiones || 0
      })
      .select()
      .single();

    if (error) throw error;

    const vinculacion = new RutinaEjercicio(data);
    // El método invalidateCache del modelo borra las claves de la rutina y del ejercicio
    await vinculacion.invalidateCache();

    return vinculacion;
  }

  async update(id, reData) {
    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .update({
        series: reData.series,
        repeticiones: reData.repeticiones,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const vinculacion = new RutinaEjercicio(data);
    await vinculacion.invalidateCache();

    return vinculacion;
  }

  async delete(id) {
    // Muy importante: obtener antes de borrar para saber qué id_rutina e id_ejercicio
    // tenía y poder limpiar sus respectivos listados en la caché de Redis
    const vinculacion = await this.findById(id);

    const { error } = await this.supabase
      .from('rutina_ejercicios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (vinculacion) {
      await vinculacion.invalidateCache();
    }

    return true;
  }
}

export default RutinaEjercicioRepository;