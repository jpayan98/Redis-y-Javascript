import BaseModel from './BaseModel.mjs';

/**
 * Modelo Entrenador
 * Representa un entrenador del gimnasio
 */
class Entrenador extends BaseModel {
  constructor(data = {}) {
    super();
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.especialidad = data.especialidad || 'musculacion';
    this.activo = data.activo !== undefined ? data.activo : true;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      especialidad: this.especialidad,
      activo: this.activo,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  toPublic() {
    return {
      id: this.id,
      nombre: this.nombre,
      especialidad: this.especialidad,
      activo: this.activo
    };
  }

  validate() {
    const errors = [];
    const especialidadesValidas = ['yoga', 'musculacion', 'spinning', 'crossfit'];

    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.push('El nombre es requerido');
    }

    if (this.especialidad && !especialidadesValidas.includes(this.especialidad)) {
      errors.push('La especialidad debe ser: yoga, musculacion, spinning o crossfit');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getCacheKey() {
    return `entrenador:${this.id}`;
  }

  async saveToCache(ttl = 300) {
    const client = Entrenador.getClient();
    if (client && this.id) {
      await client.setEx(this.getCacheKey(), ttl, JSON.stringify(this.toJSON()));
    }
  }

  async invalidateCache() {
    const client = Entrenador.getClient();
    if (client && this.id) {
      await client.del(this.getCacheKey());
      await client.del('entrenadores:all');
      await client.del(`entrenadores:especialidad:${this.especialidad}`);
    }
  }

  static async getFromCache(id) {
    const client = Entrenador.getClient();
    if (!client) return null;

    const cached = await client.get(`entrenador:${id}`);
    if (cached) {
      return new Entrenador(JSON.parse(cached));
    }
    return null;
  }

  static async invalidateAllCache() {
    const client = Entrenador.getClient();
    if (client) {
      const keys = await client.keys('entrenador*');
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  }
}

export default Entrenador;