// repositories/rutinaEjercicioRepository.mjs
import RutinaEjercicio from '../models/rutinaEjercicio.mjs';

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
        return JSON.parse(cached).map(re => new RutinaEjercicio(re));
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

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const rutinaEjercicio = new RutinaEjercicio(data);
    await rutinaEjercicio.saveToCache();
    return rutinaEjercicio;
  }

  async findByRutina(idRutina) {
    if (this.redis) {
      const cached = await this.redis.get(`rutina_ejercicios:rutina:${idRutina}`);
      if (cached) {
        return JSON.parse(cached).map(re => new RutinaEjercicio(re));
      }
    }

    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .select('*')
      .eq('id_rutina', idRutina)
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(`rutina_ejercicios:rutina:${idRutina}`, 300, JSON.stringify(data));
    }

    return data.map(re => new RutinaEjercicio(re));
  }

  async findByEjercicio(idEjercicio) {
    if (this.redis) {
      const cached = await this.redis.get(`rutina_ejercicios:ejercicio:${idEjercicio}`);
      if (cached) {
        return JSON.parse(cached).map(re => new RutinaEjercicio(re));
      }
    }

    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .select('*')
      .eq('id_ejercicio', idEjercicio)
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(`rutina_ejercicios:ejercicio:${idEjercicio}`, 300, JSON.stringify(data));
    }

    return data.map(re => new RutinaEjercicio(re));
  }

  async create(rutinaEjercicioData) {
    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .insert({
        id_rutina: rutinaEjercicioData.id_rutina,
        id_ejercicio: rutinaEjercicioData.id_ejercicio,
        series: rutinaEjercicioData.series || 0,
        repeticiones: rutinaEjercicioData.repeticiones || 0
      })
      .select()
      .single();

    if (error) throw error;

    const rutinaEjercicio = new RutinaEjercicio(data);
    await rutinaEjercicio.invalidateCache();
    return rutinaEjercicio;
  }

  async update(id, rutinaEjercicioData) {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (rutinaEjercicioData.id_rutina !== undefined) updateData.id_rutina = rutinaEjercicioData.id_rutina;
    if (rutinaEjercicioData.id_ejercicio !== undefined) updateData.id_ejercicio = rutinaEjercicioData.id_ejercicio;
    if (rutinaEjercicioData.series !== undefined) updateData.series = rutinaEjercicioData.series;
    if (rutinaEjercicioData.repeticiones !== undefined) updateData.repeticiones = rutinaEjercicioData.repeticiones;

    const { data, error } = await this.supabase
      .from('rutina_ejercicios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const rutinaEjercicio = new RutinaEjercicio(data);
    await rutinaEjercicio.invalidateCache();
    return rutinaEjercicio;
  }

  async delete(id) {
    const rutinaEjercicio = await this.findById(id);

    const { error } = await this.supabase
      .from('rutina_ejercicios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (rutinaEjercicio) {
      await rutinaEjercicio.invalidateCache();
    }

    return true;
  }
}

export default RutinaEjercicioRepository;
