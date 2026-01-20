import BaseModel from './BaseModel.mjs';

/**
 * Modelo Clase
 * Representa una sesión o actividad dirigida en el gimnasio
 */
class Clase extends BaseModel {
  constructor(data = {}) {
    super();
    // Consistencia con tu estilo de nombrado id_[entidad]
    this.id_clase = data.id_clase || data.id || null;
    this.nombre = data.nombre || '';
    this.tipo_clase = data.tipo_clase || '';
    this.id_entrenador = data.id_entrenador || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Serialización completa del objeto
   */
  toJSON() {
    return {
      id_clase: this.id_clase,
      nombre: this.nombre,
      tipo_clase: this.tipo_clase,
      id_entrenador: this.id_entrenador,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Serialización para respuestas públicas (segura)
   */
  toPublic() {
    return {
      id_clase: this.id_clase,
      nombre: this.nombre,
      tipo_clase: this.tipo_clase,
      id_entrenador: this.id_entrenador
    };
  }

  /**
   * Valida si la clase cumple con las restricciones de la DB
   * @returns {boolean}
   */
  isValid() {
    const tiposValidos = ['spinning', 'yoga', 'pilates', 'zumba', 'crossfit', 'musculacion'];
    return (
      this.nombre && 
      this.nombre.trim().length > 0 &&
      this.tipo_clase &&
      tiposValidos.includes(this.tipo_clase.toLowerCase()) &&
      this.id_entrenador !== null
    );
  }

  /**
   * Genera la clave de caché para esta clase
   */
  getCacheKey() {
    return `clase:${this.id_clase}`;
  }

  /**
   * Guarda la clase en caché Redis
   */
  async saveToCache(ttl = 600) {
    const client = Clase.getClient();
    if (client && this.id_clase) {
      await client.setEx(
        this.getCacheKey(),
        ttl,
        JSON.stringify(this.toJSON())
      );
    }
  }

  /**
   * Invalida el caché de esta clase y de los listados afectados
   */
  async invalidateCache() {
    const client = Clase.getClient();
    if (client && this.id_clase) {
      await client.del(this.getCacheKey());
      // Invalida índices y listados relacionados
      await client.del('clases:all');
      await client.del(`clases:tipo:${this.tipo_clase}`);
      await client.del(`clases:entrenador:${this.id_entrenador}`);
    }
  }

  /**
   * Obtiene una clase desde caché
   */
  static async getFromCache(id) {
    const client = Clase.getClient();
    if (!client) return null;

    const cached = await client.get(`clase:${id}`);
    if (cached) {
      return new Clase(JSON.parse(cached));
    }
    return null;
  }

  /**
   * Invalida todo el caché de clases
   */
  static async invalidateAllCache() {
    const client = Clase.getClient();
    if (client) {
      const keys = await client.keys('clase*');
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  }
}

export default Clase;