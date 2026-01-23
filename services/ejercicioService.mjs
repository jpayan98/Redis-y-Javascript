// services/ejercicioService.mjs
import Ejercicio from '../models/ejercicio.mjs';

class EjercicioService {
  constructor(ejercicioRepository) {
    this.ejercicioRepository = ejercicioRepository;
  }

  async getAll() {
    const ejercicios = await this.ejercicioRepository.findAll();
    return ejercicios.map(e => e.toPublic());
  }

  async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const ejercicio = await this.ejercicioRepository.findById(id);
    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }

    return ejercicio.toPublic();
  }

  async getByGrupoMuscular(grupoMuscular) {
    if (!grupoMuscular || grupoMuscular.trim() === '') {
      throw new Error('Grupo muscular inválido');
    }

    const ejercicios = await this.ejercicioRepository.findByGrupoMuscular(grupoMuscular);
    return ejercicios.map(e => e.toPublic());
  }

  async getByMaquina(idMaquina) {
    if (!idMaquina || isNaN(idMaquina)) {
      throw new Error('ID de máquina inválido');
    }

    const ejercicios = await this.ejercicioRepository.findByMaquina(idMaquina);
    return ejercicios.map(e => e.toPublic());
  }

  async create(data) {
    const ejercicio = new Ejercicio(data);
    const validation = ejercicio.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Verificar nombre único
    const existente = await this.ejercicioRepository.findByNombre(data.nombre);
    if (existente) {
      throw new Error('Ya existe un ejercicio con ese nombre');
    }

    const nuevoEjercicio = await this.ejercicioRepository.create(data);
    return nuevoEjercicio.toPublic();
  }

  async update(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const ejercicioExistente = await this.ejercicioRepository.findById(id);
    if (!ejercicioExistente) {
      throw new Error('Ejercicio no encontrado');
    }

    // Validar datos actualizados
    const ejercicioActualizado = new Ejercicio({ ...ejercicioExistente.toJSON(), ...data });
    const validation = ejercicioActualizado.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Si cambia el nombre, verificar que no exista
    if (data.nombre && data.nombre !== ejercicioExistente.nombre) {
      const existente = await this.ejercicioRepository.findByNombre(data.nombre);
      if (existente) {
        throw new Error('Ya existe un ejercicio con ese nombre');
      }
    }

    const ejercicio = await this.ejercicioRepository.update(id, data);
    return ejercicio.toPublic();
  }

  async delete(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const ejercicio = await this.ejercicioRepository.findById(id);
    if (!ejercicio) {
      throw new Error('Ejercicio no encontrado');
    }

    await this.ejercicioRepository.delete(id);
    return { message: 'Ejercicio eliminado correctamente' };
  }
}

export default EjercicioService;
