// repositories/maquinaRepository.mjs
import Maquina from '../models/maquina.mjs';

class MaquinaRepository {
  constructor(supabase, redisClient = null) {
    this.supabase = supabase;
    this.redis = redisClient;
    Maquina.setClient(redisClient);
  }

  async findAll() {
    if (this.redis) {
      const cached = await this.redis.get('maquinas:all');
      if (cached) {
        return JSON.parse(cached).map(m => new Maquina(m));
      }
    }

    const { data, error } = await this.supabase
      .from('maquinas')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx('maquinas:all', 300, JSON.stringify(data));
    }

    return data.map(m => new Maquina(m));
  }

  async findById(id) {
    const cached = await Maquina.getFromCache(id);
    if (cached) return cached;

    const { data, error } = await this.supabase
      .from('maquinas')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    const maquina = new Maquina(data);
    await maquina.saveToCache();
    return maquina;
  }

  async findByEstado(estado) {
    if (this.redis) {
      const cached = await this.redis.get(`maquinas:estado:${estado}`);
      if (cached) {
        return JSON.parse(cached).map(m => new Maquina(m));
      }
    }

    const { data, error } = await this.supabase
      .from('maquinas')
      .select('*')
      .eq('estado', estado)
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(`maquinas:estado:${estado}`, 300, JSON.stringify(data));
    }

    return data.map(m => new Maquina(m));
  }

  async findByTipo(tipo) {
    if (this.redis) {
      const cached = await this.redis.get(`maquinas:tipo:${tipo}`);
      if (cached) {
        return JSON.parse(cached).map(m => new Maquina(m));
      }
    }

    const { data, error } = await this.supabase
      .from('maquinas')
      .select('*')
      .eq('tipo', tipo)
      .order('id', { ascending: true });

    if (error) throw error;

    if (this.redis && data) {
      await this.redis.setEx(`maquinas:tipo:${tipo}`, 300, JSON.stringify(data));
    }

    return data.map(m => new Maquina(m));
  }

  async findByNombre(nombre) {
    const { data, error } = await this.supabase
      .from('maquinas')
      .select('*')
      .eq('nombre', nombre)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? new Maquina(data) : null;
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
    await maquina.invalidateCache();
    return maquina;
  }

  async update(id, maquinaData) {
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (maquinaData.nombre !== undefined) updateData.nombre = maquinaData.nombre;
    if (maquinaData.tipo !== undefined) updateData.tipo = maquinaData.tipo;
    if (maquinaData.estado !== undefined) updateData.estado = maquinaData.estado;

    const { data, error } = await this.supabase
      .from('maquinas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    const maquina = new Maquina(data);
    await maquina.invalidateCache();
    return maquina;
  }

  async delete(id) {
    const maquina = await this.findById(id);

    const { error } = await this.supabase
      .from('maquinas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (maquina) {
      await maquina.invalidateCache();
    }

    return true;
  }
}

export default MaquinaRepository;
