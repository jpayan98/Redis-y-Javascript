/**
 * Modelo Socio
 * Representa un socio del gimnasio
 */
class Socio {
  static redisClient = null;

  static setClient(client) {
    Socio.redisClient = client;
  }

  static getClient() {
    return Socio.redisClient;
  }

  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || '';
    this.apellidos = data.apellidos || '';
    this.telefono = data.telefono || null;
    this.email = data.email || '';
    this.fecha_alta = data.fecha_alta || null;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      email: this.email,
      fecha_alta: this.fecha_alta,
      activo: this.activo,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  toPublic() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellidos: this.apellidos,
      telefono: this.telefono,
      email: this.email,
      fecha_alta: this.fecha_alta,
      activo: this.activo
    };
  }

  validate() {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.push('El nombre es requerido');
    }

    if (!this.apellidos || this.apellidos.trim().length === 0) {
      errors.push('Los apellidos son requeridos');
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push('El email es requerido');
    } else if (!emailRegex.test(this.email)) {
      errors.push('El email no tiene un formato válido');
    }

    if (this.telefono && this.telefono.length > 20) {
      errors.push('El teléfono no puede exceder 20 caracteres');
    }

    if (typeof this.activo !== 'boolean') {
      errors.push('El campo activo debe ser verdadero o falso');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  isActivo() {
    return this.activo === true;
  }

  getNombreCompleto() {
    return `${this.nombre} ${this.apellidos}`.trim();
  }

  getCacheKey() {
    return `socio:${this.id}`;
  }

  async saveToCache(ttl = 600) {
    const client = Socio.getClient();
    if (client && this.id) {
      await client.setEx(this.getCacheKey(), ttl, JSON.stringify(this.toJSON()));
    }
  }

  async invalidateCache() {
    const client = Socio.getClient();
    if (client && this.id) {
      await client.del(this.getCacheKey());
      await client.del('socios:all');
      await client.del('socios:activos');
      await client.del(`socios:email:${this.email}`);
    }
  }

  static async getFromCache(id) {
    const client = Socio.getClient();
    if (!client) return null;

    const cached = await client.get(`socio:${id}`);
    if (cached) {
      return new Socio(JSON.parse(cached));
    }
    return null;
  }

  static async invalidateAllCache() {
    const client = Socio.getClient();
    if (client) {
      const keys = await client.keys('socio*');
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  }
}

export default Socio;