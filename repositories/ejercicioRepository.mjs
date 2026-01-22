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
      .order('id', { ascending: true });

    if (error) throw error;

    // Guardar en caché
    if (this.redis && data) {
      await this.redis.setEx('ejercicios:all', 300, JSON.stringify(data));
    }

    return data.map(e => new Ejercicio(e));
  }

  async findById(id) {
    // Intentar obtener de caché
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

    // Guardar en caché
    await ejercicio.saveToCache();

    return ejercicio;
  }

  async findByNombre(nombre) {
    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .eq('nombre', nombre)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? new Ejercicio(data) : null;
  }

  async findByGrupoMuscular(grupoMuscular) {
    // Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get(`ejercicios:grupo:${grupoMuscular}`);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(e => new Ejercicio(e));
      }
    }

    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .eq('grupo_muscular', grupoMuscular);

    if (error) throw error;

    // Guardar en caché
    if (this.redis && data) {
      await this.redis.setEx(`ejercicios:grupo:${grupoMuscular}`, 300, JSON.stringify(data));
    }

    return data.map(e => new Ejercicio(e));
  }

  async findByMaquina(idMaquina) {
    // Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get(`ejercicios:maquina:${idMaquina}`);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(e => new Ejercicio(e));
      }
    }

    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .eq('id_maquina', idMaquina);

    if (error) throw error;

    // Guardar en caché
    if (this.redis && data) {
      await this.redis.setEx(`ejercicios:maquina:${idMaquina}`, 300, JSON.stringify(data));
    }

    return data.map(e => new Ejercicio(e));
  }

  async create(ejercicioData) {
    const { data, error } = await this.supabase
      .from('ejercicios')
      .insert({
        nombre: ejercicioData.nombre,
        descripcion: ejercicioData.descripcion || null,
        grupo_muscular: ejercicioData.grupo_muscular,
        id_maquina: ejercicioData.id_maquina || null
      })
      .select()
      .single();

    if (error) throw error;

    const ejercicio = new Ejercicio(data);

    // Invalidar caché de listados
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

    // Invalidar caché
    await ejercicio.invalidateCache();

    return ejercicio;
  }

  async delete(id) {
    // Obtener ejercicio antes de eliminar para invalidar caché
    const ejercicio = await this.findById(id);

    const { error } = await this.supabase
      .from('ejercicios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Invalidar caché
    if (ejercicio) {
      await ejercicio.invalidateCache();
    }

    return true;
  }
}

export default EjercicioRepository;