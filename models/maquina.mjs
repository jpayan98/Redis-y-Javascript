import BaseModel from './BaseModel.mjs';

/**
 * Modelo Maquina
 * Representa una máquina o equipo del gimnasio
 */
class Maquina extends BaseModel {
  constructor(data = {}) {
    super();
    this.id_maquina = data.id_maquina || null;
    this.nombre = data.nombre || '';
    this.tipo = data.tipo || '';
    this.zona = data.zona || '';
    this.estado = data.estado || 'Operativa';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Serialización completa del objeto
   * @returns {Object} Todos los datos de la máquina
   */
  toJSON() {
    return {
      id_maquina: this.id_maquina,
      nombre: this.nombre,
      tipo: this.tipo,
      zona: this.zona,
      estado: this.estado,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Serialización para respuestas públicas de la API
   * @returns {Object} Datos seguros de la máquina
   */
  toPublic() {
    return {
      id_maquina: this.id_maquina,
      nombre: this.nombre,
      tipo: this.tipo,
      zona: this.zona,
      estado: this.estado
    };
  }

  /**
   * Verifica si la máquina está operativa
   * @returns {boolean} true si está operativa
   */
  isOperativa() {
    return this.estado === 'Operativa';
  }

  /**
   * Verifica si la máquina necesita mantenimiento
   * @returns {boolean} true si necesita mantenimiento
   */
  necesitaMantenimiento() {
    return this.estado === 'Mantenimiento' || this.estado === 'Averiada';
  }

  /**
   * Valida si la máquina tiene todos los campos requeridos
   * @returns {boolean} true si es válida
   */
  isValid() {
    return (
      this.nombre && 
      this.nombre.trim().length > 0 &&
      this.tipo && 
      this.tipo.trim().length > 0 &&
      this.zona && 
      this.zona.trim().length > 0
    );
  }

  /**
   * Genera la clave de caché para esta máquina
   * @returns {string} Clave de Redis
   */
  getCacheKey() {
    return `maquina:${this.id_maquina}`;
  }

  /**
   * Guarda esta máquina en caché
   * @param {number} ttl - Tiempo de vida en segundos (por defecto 600 = 10 min)
   */
  async saveToCache(ttl = 600) {
    const client = Maquina.getClient();
    if (client && this.id_maquina) {
      await client.setEx(
        this.getCacheKey(),
        ttl,
        JSON.stringify(this.toJSON())
      );
    }
  }

  /**
   * Invalida el caché de esta máquina
   */
  async invalidateCache() {
    const client = Maquina.getClient();
    if (client && this.id_maquina) {
      await client.del(this.getCacheKey());
      // También invalidar listados
      await client.del('maquinas:all');
      await client.del('maquinas:operativas');
      await client.del(`maquinas:tipo:${this.tipo}`);
      await client.del(`maquinas:zona:${this.zona}`);
    }
  }

  /**
   * Obtiene una máquina desde caché
   * @param {number} id - ID de la máquina
   * @returns {Maquina|null} Instancia de Maquina o null si no existe en caché
   */
  static async getFromCache(id) {
    const client = Maquina.getClient();
    if (!client) return null;

    const cached = await client.get(`maquina:${id}`);
    if (cached) {
      return new Maquina(JSON.parse(cached));
    }
    return null;
  }

  /**
   * Invalida todo el caché relacionado con máquinas
   */
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