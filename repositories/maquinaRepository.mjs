import Maquina from '../models/maquina.mjs';

/**
 * Repository de Maquina
 * Capa de acceso a datos - Supabase + Redis caché
 */
class MaquinaRepository {
  constructor(supabase, redisClient = null) {
    this.supabase = supabase;
    this.redis = redisClient;
    // Configuramos el cliente Redis en el modelo para que funcionen sus métodos estáticos
    Maquina.setClient(redisClient);
  }

  async findAll() {
    // 1. Intentar obtener de caché
    if (this.redis) {
      const cached = await this.redis.get('maquinas:all');
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(m => new Maquina(m));
      }
    }

    // 2. Si no hay caché, consultar Supabase
    const { data, error } = await this.supabase
      .from('maquinas')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    // 3. Guardar en caché para la próxima vez (expira en 5 min)
    if (this.redis && data) {
      await this.redis.setEx('maquinas:all', 300, JSON.stringify(data));
    }

    return data.map(m => new Maquina(m));
  }

  async findById(id) {
    // 1. Intentar obtener de caché usando el método del modelo
    const cached = await Maquina.getFromCache(id);
    if (cached) return cached;

    // 2. Consultar Supabase
    const { data, error } = await this.supabase
      .from('maquinas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw error;
    }

    const maquina = new Maquina(data);

    // 3. Guardar en caché individual
    await maquina.saveToCache();

    return maquina;
  }

  async findByEstado(estado) {
    // Intentar obtener de caché específica por estado
    if (this.redis) {
      const cached = await this.redis.get(`maquinas:estado:${estado}`);
      if (cached) {
        const data = JSON.parse(cached);
        return data.map(m => new Maquina(m));
      }
    }

    const { data, error } = await this.supabase
      .from('maquinas')
      .select('*')
      .eq('estado', estado);

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(`maquinas:estado:${estado}`, 300, JSON.stringify(data));
    }

    return data.map(m => new Maquina(m));
  }

  async create(maquinaData) {
    const { data, error } = await this.supabase
      .from('maquinas')
      .insert({
        nombre: maquinaData.nombre,
        tipo: maquinaData.tipo,
        estado: maquinaData.estado || 'operativa'
      })
      .select()
      .single();

    if (error) throw error;

    const maquina = new Maquina(data);

    // Limpiar cachés de listas (all, estados, etc.)
    await maquina.invalidateCache();

    return maquina;
  }

  async update(id, maquinaData) {
    const { data, error } = await this.supabase
      .from('maquinas')
      .update({
        nombre: maquinaData.nombre,
        tipo: maquinaData.tipo,
        estado: maquinaData.estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const maquina = new Maquina(data);

    // Limpiar caché antigua y actualizar
    await maquina.invalidateCache();
    await maquina.saveToCache();

    return maquina;
  }

  async delete(id) {
    // Buscamos la máquina antes de borrarla para saber qué claves de caché limpiar
    const maquina = await this.findById(id);

    const { error } = await this.supabase
      .from('maquinas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Si existía, limpiamos su rastro en Redis
    if (maquina) {
      await maquina.invalidateCache();
    }

    return true;
  }
}

export default MaquinaRepository;