import RutinaEjercicio from '../models/rutina_ejercicio.mjs';

/**
 * Service de RutinaEjercicio
 * Capa de lógica de negocio para la relación entre Rutinas y Ejercicios
 */
class RutinaEjercicioService {
  constructor(rutinaEjercicioRepository) {
    this.rutinaEjercicioRepository = rutinaEjercicioRepository;
  }

  async getAll() {
    const vinculaciones = await this.rutinaEjercicioRepository.findAll();
    return vinculaciones.map(re => re.toPublic());
  }

  async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const vinculacion = await this.rutinaEjercicioRepository.findById(id);
    if (!vinculacion) {
      throw new Error('Vinculación no encontrada');
    }

    return vinculacion.toPublic();
  }

  async getByRutina(id_rutina) {
    if (!id_rutina || isNaN(id_rutina)) {
      throw new Error('ID de rutina inválido');
    }

    const vinculaciones = await this.rutinaEjercicioRepository.findByRutina(id_rutina);
    return vinculaciones.map(re => re.toPublic());
  }

  async getByEjercicio(id_ejercicio) {
    if (!id_ejercicio || isNaN(id_ejercicio)) {
      throw new Error('ID de ejercicio inválido');
    }

    const vinculaciones = await this.rutinaEjercicioRepository.findByEjercicio(id_ejercicio);
    return vinculaciones.map(re => re.toPublic());
  }

  async create(data) {
    // 1. Validar datos con el modelo
    const vinculacion = new RutinaEjercicio(data);
    const validation = vinculacion.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // 2. Lógica extra: Podrías verificar aquí si el ejercicio ya está en la rutina
    // para evitar duplicados si tu base de datos no tiene una restricción UNIQUE
    const actuales = await this.rutinaEjercicioRepository.findByRutina(data.id_rutina);
    const duplicado = actuales.find(re => re.id_ejercicio === data.id_ejercicio);
    if (duplicado) {
      throw new Error('Este ejercicio ya forma parte de esta rutina');
    }

    const nuevaVinculacion = await this.rutinaEjercicioRepository.create(data);
    return nuevaVinculacion.toPublic();
  }

  async update(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    // Verificar existencia
    const existente = await this.rutinaEjercicioRepository.findById(id);
    if (!existente) {
      throw new Error('Vinculación no encontrada');
    }

    // Validar nuevos datos (series/repeticiones)
    const actualizado = new RutinaEjercicio({ ...existente.toJSON(), ...data });
    const validation = actualizado.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const resultado = await this.rutinaEjercicioRepository.update(id, data);
    return resultado.toPublic();
  }

  async delete(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const existente = await this.rutinaEjercicioRepository.findById(id);
    if (!existente) {
      throw new Error('Vinculación no encontrada');
    }

    await this.rutinaEjercicioRepository.delete(id);
    return { message: 'Ejercicio eliminado de la rutina correctamente' };
  }
}

export default RutinaEjercicioService;