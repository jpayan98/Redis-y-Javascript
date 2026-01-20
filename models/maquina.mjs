/**
 * Modelo Maquina
 * Representa una máquina o equipo del gimnasio
 */
class Maquina {
  static redisClient = null;

  static setClient(client) {
    Maquina.redisClient = client;
  }

  static getClient() {
    return Maquina.redisClient;
  }

  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.tipo = data.tipo || '';
    this.estado = data.estado || 'operativa';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      tipo: this.tipo,
      estado: this.estado,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  toPublic() {
    return {
      id: this.id,
      nombre: this.nombre,
      tipo: this.tipo,
      estado: this.estado
    };
  }

  validate() {
    const errors = [];
    const estadosValidos = ['operativa', 'mantenimiento', 'averiada', 'fuera_servicio'];

    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.push('El nombre es requerido');
    }

    if (!this.tipo || this.tipo.trim().length === 0) {
      errors.push('El tipo es requerido');
    }

    if (this.estado && !estadosValidos.includes(this.estado)) {
      errors.push('El estado debe ser: operativa, mantenimiento, averiada o fuera_servicio');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isOperativa() {
    return this.estado === 'operativa';
  }

  necesitaMantenimiento() {
    return this.estado === 'mantenimiento' || this.estado === 'averiada';
  }

  getCacheKey() {
    return `maquina:${this.id}`;
  }

  async saveToCache(ttl = 600) {
    const client = Maquina.getClient();
    if (client && this.id) {
      await client.setEx(this.getCacheKey(), ttl, JSON.stringify(this.toJSON()));
    }
  }

  async invalidateCache() {
    const client = Maquina.getClient();
    if (client && this.id) {
      await client.del(this.getCacheKey());
      await client.del('maquinas:all');
      await client.del('maquinas:operativas');
      await client.del(`maquinas:tipo:${this.tipo}`);
    }
  }

  static async getFromCache(id) {
    const client = Maquina.getClient();
    if (!client) return null;

    const cached = await client.get(`maquina:${id}`);
    if (cached) {
      return new Maquina(JSON.parse(cached));
    }
    return null;
  }

  static async invalidateAllCache() {
    const client = Maquina.getClient();
    if (client) {
      const keys = await client.keys('maquina*');
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  }
}

export default Maquina;