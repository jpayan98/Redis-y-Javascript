/**
 * Modelo Socio
 * Representa un miembro del gimnasio
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
    this.email = data.email || '';
    this.estado = data.estado || 'activo';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Serialización completa del objeto
   * @returns {Object} Todos los datos del socio
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      estado: this.estado,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Serialización para respuestas públicas de la API
   * @returns {Object} Datos seguros del socio
   */
  toPublic() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      estado: this.estado
    };
  }

  /**
   * Valida si el socio tiene todos los campos requeridos
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.nombre || this.nombre.trim().length === 0) {
      errors.push('El nombre es requerido');
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push('El email es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('El email no tiene un formato válido');
    }

    if (this.estado && !['activo', 'suspendido', 'inactivo'].includes(this.estado)) {
      errors.push('El estado debe ser: activo, suspendido o inactivo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Genera la clave de caché para este socio
   * @returns {string} Clave de Redis
   */
  getCacheKey() {
    return `socio:${this.id}`;
  }

  /**
   * Guarda este socio en caché
   * @param {number} ttl - Tiempo de vida en segundos (por defecto 300 = 5 min)
   */
  async saveToCache(ttl = 300) {
    const client = Socio.getClient();
    if (client && this.id) {
      await client.setEx(
        this.getCacheKey(),
        ttl,
        JSON.stringify(this.toJSON())
      );
    }
  }

  /**
   * Invalida el caché de este socio
   */
  async invalidateCache() {
    const client = Socio.getClient();
    if (client && this.id) {
      await client.del(this.getCacheKey());
      await client.del('socios:all');
      await client.del(`socios:estado:${this.estado}`);
    }
  }

  /**
   * Obtiene un socio desde caché
   * @param {number} id - ID del socio
   * @returns {Socio|null} Instancia de Socio o null si no existe en caché
   */
  static async getFromCache(id) {
    const client = Socio.getClient();
    if (!client) return null;

    const cached = await client.get(`socio:${id}`);
    if (cached) {
      return new Socio(JSON.parse(cached));
    }
    return null;
  }

  /**
   * Invalida todo el caché relacionado con socios
   */
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