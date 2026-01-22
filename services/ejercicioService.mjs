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

    async getByNivelDificultad8(nivelDificultad) {
    const nivelesValidos = ['principiante', 'intermedio', 'avanzado'];
    if (!nivelesValidos.includes(nivelDificultad)) {
      throw new Error('Nivel de dificultad inválido. Debe ser: principiante, intermedio o avanzado');
    }
    const ejercicios = await this.ejercicioRepository.findByNivelDificultad(nivelDificultad);
    return ejercicios.map(e => e.toPublic());
    }

    async create(data) {
    // Crear instancia para validar
    const ejercicio = new Ejercicio(data);
    const validation = ejercicio.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    const nuevoEjercicio = await this.ejercicioRepository.create(data);
    return nuevoEjercicio.toPublic();
    }

    async update(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    // Verificar existencia
    const ejercicioExistente = await this.ejercicioRepository.findById(id);
    if (!ejercicioExistente) {
      throw new Error('Ejercicio no encontrado');
    }

    const ejercicioActualizado = new Ejercicio({ ...ejercicioExistente.toJSON(), ...data });
    const validation = ejercicioActualizado.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    const actualizado = await this.ejercicioRepository.update(id, data);
    return actualizado.toPublic();
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
