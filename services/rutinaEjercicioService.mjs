// services/rutinaEjercicioService.mjs
import RutinaEjercicio from '../models/rutinaEjercicio.mjs';

class RutinaEjercicioService {
  constructor(rutinaEjercicioRepository, rutinaRepository, ejercicioRepository) {
    this.rutinaEjercicioRepository = rutinaEjercicioRepository;
    this.rutinaRepository = rutinaRepository;
    this.ejercicioRepository = ejercicioRepository;
  }

  async getAll() {
    const rutinaEjercicios = await this.rutinaEjercicioRepository.findAll();
    return rutinaEjercicios.map(re => re.toPublic());
  }

  async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const rutinaEjercicio = await this.rutinaEjercicioRepository.findById(id);
    if (!rutinaEjercicio) {
      throw new Error('Relación rutina-ejercicio no encontrada');
    }

    return rutinaEjercicio.toPublic();
  }

  async getByRutina(idRutina) {
    if (!idRutina || isNaN(idRutina)) {
      throw new Error('ID de rutina inválido');
    }

    const rutinaEjercicios = await this.rutinaEjercicioRepository.findByRutina(idRutina);
    return rutinaEjercicios.map(re => re.toPublic());
  }

  async getByEjercicio(idEjercicio) {
    if (!idEjercicio || isNaN(idEjercicio)) {
      throw new Error('ID de ejercicio inválido');
    }

    const rutinaEjercicios = await this.rutinaEjercicioRepository.findByEjercicio(idEjercicio);
    return rutinaEjercicios.map(re => re.toPublic());
  }

  async create(data) {
    const rutinaEjercicio = new RutinaEjercicio(data);
    const validation = rutinaEjercicio.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Verificar que la rutina existe
    const rutina = await this.rutinaRepository.findById(data.id_rutina);
    if (!rutina) {
      throw new Error('La rutina especificada no existe');
    }

    // Verificar que el ejercicio existe
    const ejercicio = await this.ejercicioRepository.findById(data.id_ejercicio);
    if (!ejercicio) {
      throw new Error('El ejercicio especificado no existe');
    }

    const nuevoRutinaEjercicio = await this.rutinaEjercicioRepository.create(data);
    return nuevoRutinaEjercicio.toPublic();
  }

  async update(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const rutinaEjercicioExistente = await this.rutinaEjercicioRepository.findById(id);
    if (!rutinaEjercicioExistente) {
      throw new Error('Relación rutina-ejercicio no encontrada');
    }

    // Validar datos actualizados
    const rutinaEjercicioActualizado = new RutinaEjercicio({ ...rutinaEjercicioExistente.toJSON(), ...data });
    const validation = rutinaEjercicioActualizado.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Si cambia id_rutina, verificar que existe
    if (data.id_rutina && data.id_rutina !== rutinaEjercicioExistente.id_rutina) {
      const rutina = await this.rutinaRepository.findById(data.id_rutina);
      if (!rutina) {
        throw new Error('La rutina especificada no existe');
      }
    }

    // Si cambia id_ejercicio, verificar que existe
    if (data.id_ejercicio && data.id_ejercicio !== rutinaEjercicioExistente.id_ejercicio) {
      const ejercicio = await this.ejercicioRepository.findById(data.id_ejercicio);
      if (!ejercicio) {
        throw new Error('El ejercicio especificado no existe');
      }
    }

    const rutinaEjercicio = await this.rutinaEjercicioRepository.update(id, data);
    return rutinaEjercicio.toPublic();
  }

  async delete(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const rutinaEjercicio = await this.rutinaEjercicioRepository.findById(id);
    if (!rutinaEjercicio) {
      throw new Error('Relación rutina-ejercicio no encontrada');
    }

    await this.rutinaEjercicioRepository.delete(id);
    return { message: 'Relación rutina-ejercicio eliminada correctamente' };
  }
}

export default RutinaEjercicioService;
