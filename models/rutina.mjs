/**
 * Modelo Rutina
 * Representa un plan de entrenamiento asignado a un socio
 */
class Rutina {
  static redisClient = null;

  static setClient(client) {
    Rutina.redisClient = client;
  }

  static getClient() {
    return Rutina.redisClient;
  }

  constructor(data = {}) {
    // Nota: Usamos id_rutina para mantener consistencia con tu estilo de id_maquina
    this.id = data.id|| data.id || null; 
    this.nombre = data.nombre || '';
    this.nivel_dificultad = data.nivel_dificultad || 'principiante';
    this.id_socio = data.id_socio || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Serialización completa del objeto
   * @returns {Object} Todos los datos de la rutina
   */
  toJSON() {
    return {
      id_rutina: this.id_rutina,
      nombre: this.nombre,
      nivel_dificultad: this.nivel_dificultad,
      id_socio: this.id_socio,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Serialización para respuestas públicas de la API
   * @returns {Object} Datos seguros de la rutina
   */
  toPublic() {
    return {
      id_rutina: this.id_rutina,
      nombre: this.nombre,
      nivel_dificultad: this.nivel_dificultad,
      id_socio: this.id_socio
    };
  }

  /**
   * Verifica si la rutina es de nivel avanzado
   * @returns {boolean}
   */
  isAvanzada() {
    return this.nivel_dificultad === 'avanzado';
  }

  /**
   * Valida si la rutina tiene todos los campos requeridos según la DB
   * @returns {boolean} true si es válida
   */
  isValid() {
    const nivelesValidos = ['principiante', 'intermedio', 'avanzado'];
    return (
      this.nombre && 
      this.nombre.trim().length > 0 &&
      this.id_socio !== null &&
      nivelesValidos.includes(this.nivel_dificultad)
    );
  }

  /**
   * Genera la clave de caché para esta rutina
   * @returns {string} Clave de Redis
   */
  getCacheKey() {
    return `rutina:${this.id_rutina}`;
  }

  /**
   * Guarda esta rutina en caché
   * @param {number} ttl - Tiempo de vida en segundos
   */
  async saveToCache(ttl = 600) {
    const client = Rutina.getClient();
    if (client && this.id_rutina) {
      await client.setEx(
        this.getCacheKey(),
        ttl,
        JSON.stringify(this.toJSON())
      );
    }
  }

  /**
   * Invalida el caché de esta rutina y listados relacionados
   */
  async invalidateCache() {
    const client = Rutina.getClient();
    if (client && this.id_rutina) {
      await client.del(this.getCacheKey());
      // Invalida listados específicos
      await client.del('rutinas:all');
      await client.del(`rutinas:socio:${this.id_socio}`);
      await client.del(`rutinas:nivel:${this.nivel_dificultad}`);
    }
  }

  /**
   * Obtiene una rutina desde caché
   * @param {number} id - ID de la rutina
   * @returns {Rutina|null}
   */
  static async getFromCache(id) {
    const client = Rutina.getClient();
    if (!client) return null;

    const cached = await client.get(`rutina:${id}`);
    if (cached) {
      return new Rutina(JSON.parse(cached));
    }
    return null;
  }

  /**
   * Invalida todo el caché relacionado con rutinas
   */
  static async invalidateAllCache() {
    const client = Rutina.getClient();
    if (client) {
      const keys = await client.keys('rutina*');
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  }
}

export default Rutina;