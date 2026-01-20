/**
 * Modelo Socio
 * Representa un miembro del gimnasio
 */
class Socio {
  constructor(data = {}) {
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
}

export default Socio;