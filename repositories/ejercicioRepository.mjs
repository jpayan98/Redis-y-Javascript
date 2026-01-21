import Ejercicio from '../models/ejercicio.mjs';

/**
 * Repository de Ejercicio
 * Capa de acceso a datos - Supabase + Redis caché
 */
class EjercicioRepository {
  constructor(supabase, redisClient = null) {
    this.supabase = supabase;
    this.redis = redisClient;
    Ejercicio.setClient(redisClient);
  }

  async findAll() {
    // Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get('ejercicios:all');
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(e => new Ejercicio(e));
      }
    }

    // Si no hay caché, consultar Supabase
    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    // Guardar en caché (duración 300 segundos como en socio)
    if (this.redis && data) {
      await this.redis.setEx('ejercicios:all', 300, JSON.stringify(data));
    }

    return data.map(e => new Ejercicio(e));
  }

  async findById(id) {
    // Intentar obtener de caché mediante el método estático del modelo
    const cached = await Ejercicio.getFromCache(id);
    if (cached) return cached;

    // Si no hay caché, consultar Supabase
    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const ejercicio = new Ejercicio(data);

    // Guardar en caché individualmente
    await ejercicio.saveToCache();

    return ejercicio;
  }

  async findByGrupoMuscular(grupo) {
    const cacheKey = `ejercicios:grupo:${grupo}`;
    
    // Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(e => new Ejercicio(e));
      }
    }

    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .eq('grupo_muscular', grupo);

    if (error) throw error;

    // Guardar en caché
    if (this.redis && data) {
      await this.redis.setEx(cacheKey, 300, JSON.stringify(data));
    }

    return data.map(e => new Ejercicio(e));
  }

  async create(ejercicioData) {
    const { data, error } = await this.supabase
      .from('ejercicios')
      .insert({
        nombre: ejercicioData.nombre,
        descripcion: ejercicioData.descripcion,
        grupo_muscular: ejercicioData.grupo_muscular,
        id_maquina: ejercicioData.id_maquina || null
      })
      .select()
      .single();

    if (error) throw error;

    const ejercicio = new Ejercicio(data);

    // Invalidar caché (limpia 'ejercicios:all', el grupo y la máquina)
    await ejercicio.invalidateCache();

    return ejercicio;
  }

  async update(id, ejercicioData) {
    const { data, error } = await this.supabase
      .from('ejercicios')
      .update({
        nombre: ejercicioData.nombre,
        descripcion: ejercicioData.descripcion,
        grupo_muscular: ejercicioData.grupo_muscular,
        id_maquina: ejercicioData.id_maquina,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const ejercicio = new Ejercicio(data);

    // Invalidar caché para reflejar cambios en listas y búsqueda individual
    await ejercicio.invalidateCache();

    return ejercicio;
  }

  async delete(id) {
    // Obtenemos el ejercicio antes de borrarlo para poder 
    // usar su información (como grupo_muscular) para limpiar la caché
    const ejercicio = await this.findById(id);

    const { error } = await this.supabase
      .from('ejercicios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (ejercicio) {
      await ejercicio.invalidateCache();
    }

    return true;
  }
}

export default EjercicioRepository;