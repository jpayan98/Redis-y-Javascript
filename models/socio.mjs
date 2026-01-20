import BaseModel from './BaseModel.mjs';

/**
 * Modelo Socio
 * Representa un miembro del gimnasio
 */
class Socio extends BaseModel {
  constructor(data = {}) {
    super();
    this.id_socio = data.id_socio || null;
    this.nombre = data.nombre || '';
    this.apellidos = data.apellidos || '';
    this.telefono = data.telefono || '';
    this.email = data.email || '';
    this.fecha_alta = data.fecha_alta || null;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Serialización completa del objeto
   * @returns {Object} Todos los datos del socio
   */
  toJSON() {
    return {
      id_socio: this.id_socio,
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

  /**
   * Serialización para respuestas públicas de la API
   * @returns {Object} Datos seguros del socio (sin información sensible)
   */
  toPublic() {
    return {
      id_socio: this.id_socio,
      nombre: this.nombre,
      apellidos: this.apellidos,
      email: this.email,
      fecha_alta: this.fecha_alta,
      activo: this.activo
    };
  }

  /**
   * Obtiene el nombre completo del socio
   * @returns {string} Nombre y apellidos concatenados
   */
  getNombreCompleto() {
    return `${this.nombre} ${this.apellidos}`.trim();
  }

  /**
   * Valida si el socio tiene todos los campos requeridos
   * @returns {boolean} true si es válido
   */
  isValid() {
    return (
      this.nombre && 
      this.nombre.trim().length > 0 &&
      this.apellidos && 
      this.apellidos.trim().length > 0 &&
      this.email && 
      this.email.trim().length > 0
    );
  }

  /**
   * Genera la clave de caché para este socio
   * @returns {string} Clave de Redis
   */
  getCacheKey() {
    return `socio:${this.id_socio}`;
  }

  /**
   * Guarda este socio en caché
   * @param {number} ttl - Tiempo de vida en segundos (por defecto 300 = 5 min)
   */
  async saveToCache(ttl = 300) {
    const client = Socio.getClient();
    if (client && this.id_socio) {
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
    if (client && this.id_socio) {
      await client.del(this.getCacheKey());
      // También invalidar listados
      await client.del('socios:all');
      await client.del('socios:activos');
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
      const keys = await client.keys('socio:*');
      if (keys.length > 0) {
        await client.del(keys);
      }
      await client.del('socios:all');
      await client.del('socios:activos');
    }
  }
}

export default Socio;