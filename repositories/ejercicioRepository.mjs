// repositories/ejercicioRepository.mjs
import Ejercicio from '../models/ejercicio.mjs';

class EjercicioRepository {
  constructor(supabase, redisClient = null) {
    this.supabase = supabase;
    this.redis = redisClient;
    Ejercicio.setClient(redisClient);
  }

  async findAll() {
    if (this.redis) {
      const cached = await this.redis.get('ejercicios:all');
      if (cached) {
        return JSON.parse(cached).map(e => new Ejercicio(e));
      }
    }

    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx('ejercicios:all', 300, JSON.stringify(data));
    }

    return data.map(e => new Ejercicio(e));
  }

  async findById(id) {
    const cached = await Ejercicio.getFromCache(id);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const ejercicio = new Ejercicio(data);
    await ejercicio.saveToCache();
    return ejercicio;
  }

  async findByGrupoMuscular(grupoMuscular) {
    if (this.redis) {
      const cached = await this.redis.get(`ejercicios:grupo:${grupoMuscular}`);
      if (cached) {
        return JSON.parse(cached).map(e => new Ejercicio(e));
      }
    }

    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .eq('grupo_muscular', grupoMuscular)
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(`ejercicios:grupo:${grupoMuscular}`, 300, JSON.stringify(data));
    }

    return data.map(e => new Ejercicio(e));
  }

  async findByMaquina(idMaquina) {
    if (this.redis) {
      const cached = await this.redis.get(`ejercicios:maquina:${idMaquina}`);
      if (cached) {
        return JSON.parse(cached).map(e => new Ejercicio(e));
      }
    }

    const { data, error } = await this.supabase
      .from('ejercicios')
      .select('*')
      .eq('id_maquina', idMaquina)
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(`ejercicios:maquina:${idMaquina}`, 300, JSON.stringify(data));
    }

    return data.map(e => new Ejercicio(e));
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
    await ejercicio.invalidateCache();
    return ejercicio;
  }

  async update(id, ejercicioData) {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (ejercicioData.nombre !== undefined) updateData.nombre = ejercicioData.nombre;
    if (ejercicioData.descripcion !== undefined) updateData.descripcion = ejercicioData.descripcion;
    if (ejercicioData.grupo_muscular !== undefined) updateData.grupo_muscular = ejercicioData.grupo_muscular;
    if (ejercicioData.id_maquina !== undefined) updateData.id_maquina = ejercicioData.id_maquina;

    const { data, error } = await this.supabase
      .from('ejercicios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const ejercicio = new Ejercicio(data);
    await ejercicio.invalidateCache();
    return ejercicio;
  }

  async delete(id) {
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
