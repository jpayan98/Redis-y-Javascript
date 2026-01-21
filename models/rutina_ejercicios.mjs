/**
 * Modelo RutinaEjercicio
 * Representa la relación N:M entre rutinas y ejercicios
 */
class RutinaEjercicio {
  static redisClient = null;

  static setClient(client) {
    RutinaEjercicio.redisClient = client;
  }

  static getClient() {
    return RutinaEjercicio.redisClient;
  }

  constructor(data = {}) {
    this.id = data.id || null;
    this.id_rutina = data.id_rutina || null;
    this.id_ejercicio = data.id_ejercicio || null;
    this.series = data.series || 0;
    this.repeticiones = data.repeticiones || 0;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  toJSON() {
    return {
      id: this.id,
      id_rutina: this.id_rutina,
      id_ejercicio: this.id_ejercicio,
      series: this.series,
      repeticiones: this.repeticiones,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  toPublic() {
    return {
      id: this.id,
      id_rutina: this.id_rutina,
      id_ejercicio: this.id_ejercicio,
      series: this.series,
      repeticiones: this.repeticiones
    };
  }

  validate() {
    const errors = [];

    if (!this.id_rutina) {
      errors.push('El id_rutina es requerido');
    }

    if (!this.id_ejercicio) {
      errors.push('El id_ejercicio es requerido');
    }

    if (this.series < 0) {
      errors.push('Las series no pueden ser negativas');
    }

    if (this.repeticiones < 0) {
      errors.push('Las repeticiones no pueden ser negativas');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getCacheKey() {
    return `rutina_ejercicio:${this.id}`;
  }

  async saveToCache(ttl = 600) {
    const client = RutinaEjercicio.getClient();
    if (client && this.id) {
      await client.setEx(this.getCacheKey(), ttl, JSON.stringify(this.toJSON()));
    }
  }

  async invalidateCache() {
    const client = RutinaEjercicio.getClient();
    if (client && this.id) {
      await client.del(this.getCacheKey());
      await client.del('rutina_ejercicios:all');
      await client.del(`rutina_ejercicios:rutina:${this.id_rutina}`);
      await client.del(`rutina_ejercicios:ejercicio:${this.id_ejercicio}`);
    }
  }

  static async getFromCache(id) {
    const client = RutinaEjercicio.getClient();
    if (!client) return null;

    const cached = await client.get(`rutina_ejercicio:${id}`);
    if (cached) {
      return new RutinaEjercicio(JSON.parse(cached));
    }
    return null;
  }

  static async invalidateAllCache() {
    const client = RutinaEjercicio.getClient();
    if (client) {
      const keys = await client.keys('rutina_ejercicio*');
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  }
}

export default RutinaEjercicio;
