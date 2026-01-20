import Socio from '../models/socio.mjs';

/**
 * Service de Socio
 * Capa de lógica de negocio
 */
class SocioService {
  constructor(socioRepository) {
    this.socioRepository = socioRepository;
  }

  async obtenerTodos() {
    const socios = await this.socioRepository.findAll();
    return socios.map(s => s.toPublic());
  }

  async obtenerPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new Error('Socio no encontrado');
    }

    return socio.toPublic();
  }

  async obtnerPorEstado(estado) {
    const estadosValidos = ['activo', 'suspendido', 'inactivo'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('Estado inválido. Debe ser: activo, suspendido o inactivo');
    }

    const socios = await this.socioRepository.findByEstado(estado);
    return socios.map(s => s.toPublic());
  }

  async crear(data) {
    // Crear instancia para validar
    const socio = new Socio(data);
    const validation = socio.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Verificar email único
    const existente = await this.socioRepository.findByEmail(data.email);
    if (existente) {
      throw new Error('Ya existe un socio con ese email');
    }

    const nuevoSocio = await this.socioRepository.create(data);
    return nuevoSocio.toPublic();
  }

  async actualizar(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    // Verificar que existe
    const socioExistente = await this.socioRepository.findById(id);
    if (!socioExistente) {
      throw new Error('Socio no encontrado');
    }

    // Validar datos actualizados
    const socioActualizado = new Socio({ ...socioExistente.toJSON(), ...data });
    const validation = socioActualizado.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Si cambia el email, verificar que no exista
    if (data.email && data.email !== socioExistente.email) {
      const existente = await this.socioRepository.findByEmail(data.email);
      if (existente) {
        throw new Error('Ya existe un socio con ese email');
      }
    }

    const socio = await this.socioRepository.update(id, data);
    return socio.toPublic();
  }

  async borrar(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    // Verificar que existe
    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new Error('Socio no encontrado');
    }

    await this.socioRepository.delete(id);
    return { message: 'Socio eliminado correctamente' };
  }
}

export default SocioService;
