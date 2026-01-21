import Maquina from '../models/maquina.mjs';

/**
 * Service de Maquina
 * Capa de lógica de negocio
 */
class MaquinaService {
  constructor(maquinaRepository) {
    this.maquinaRepository = maquinaRepository;
  }

  async getAll() {
    const maquinas = await this.maquinaRepository.findAll();
    return maquinas.map(m => m.toPublic());
  }

  async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const maquina = await this.maquinaRepository.findById(id);
    if (!maquina) {
      throw new Error('Máquina no encontrada');
    }

    return maquina.toPublic();
  }

  async getByEstado(estado) {
    const estadosValidos = ['operativa', 'mantenimiento', 'averiada', 'fuera_servicio'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('Estado inválido. Debe ser: operativa, mantenimiento, averiada o fuera_servicio');
    }

    const maquinas = await this.maquinaRepository.findByEstado(estado);
    return maquinas.map(m => m.toPublic());
  }

  async create(data) {
    // Crear instancia para usar la lógica de validación del modelo
    const maquina = new Maquina(data);
    const validation = maquina.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const nuevaMaquina = await this.maquinaRepository.create(data);
    return nuevaMaquina.toPublic();
  }

  async update(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    // Verificar existencia previa
    const maquinaExistente = await this.maquinaRepository.findById(id);
    if (!maquinaExistente) {
      throw new Error('Máquina no encontrada');
    }

    // Combinar datos y validar la integridad del modelo actualizado
    const maquinaActualizada = new Maquina({ ...maquinaExistente.toJSON(), ...data });
    const validation = maquinaActualizada.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    const maquina = await this.maquinaRepository.update(id, data);
    return maquina.toPublic();
  }

  async delete(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    // Verificar existencia antes de intentar borrar
    const maquina = await this.maquinaRepository.findById(id);
    if (!maquina) {
      throw new Error('Máquina no encontrada');
    }

    await this.maquinaRepository.delete(id);
    return { message: 'Máquina eliminada correctamente' };
  }
}

export default MaquinaService;