/**
 * Modelo Ejercicio
 * Representa un ejercicio que puede formar parte de una rutina
 */
class Ejercicio {
  static redisClient = null;

  static setClient(client) {
    Ejercicio.redisClient = client;
  }

  static getClient() {
    return Ejercicio.redisClient;
  }

  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.descripcion = data.descripcion || '';
    this.grupo_muscular = data.grupo_muscular || '';
    this.id_maquina = data.id_maquina || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      grupo_muscular: this.grupo_muscular,
      id_maquina: this.id_maquina,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  toPublic() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      grupo_muscular: this.grupo_muscular,
      id_maquina: this.id_maquina
    };
  }

  validate() {
    const errors = [];

    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.push('El nombre es requerido');
    }

    if (!this.grupo_muscular || this.grupo_muscular.trim().length === 0) {
      errors.push('El grupo muscular es requerido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getCacheKey() {
    return `ejercicio:${this.id}`;
  }

  async saveToCache(ttl = 600) {
    const client = Ejercicio.getClient();
    if (client && this.id) {
      await client.setEx(this.getCacheKey(), ttl, JSON.stringify(this.toJSON()));
    }
  }

  async invalidateCache() {
    const client = Ejercicio.getClient();
    if (client && this.id) {
      await client.del(this.getCacheKey());
      await client.del('ejercicios:all');
      await client.del(`ejercicios:grupo:${this.grupo_muscular}`);
      if (this.id_maquina) {
        await client.del(`ejercicios:maquina:${this.id_maquina}`);
      }
    }
  }

  static async getFromCache(id) {
    const client = Ejercicio.getClient();
    if (!client) return null;

    const cached = await client.get(`ejercicio:${id}`);
    if (cached) {
      return new Ejercicio(JSON.parse(cached));
    }
    return null;
  }

  static async invalidateAllCache() {
    const client = Ejercicio.getClient();
    if (client) {
      const keys = await client.keys('ejercicio*');
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  }
}

export default Ejercicio;
