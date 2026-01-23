// services/maquinaService.mjs
import Maquina from '../models/maquina.mjs';

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
    const validEstados = ['operativa', 'mantenimiento', 'fuera_de_servicio'];
    
    if (!validEstados.includes(estado)) {
      throw new Error(`Estado inválido. Debe ser: ${validEstados.join(', ')}`);
    }

    const maquinas = await this.maquinaRepository.findByEstado(estado);
    return maquinas.map(m => m.toPublic());
  }

  async getByTipo(tipo) {
    if (!tipo || tipo.trim() === '') {
      throw new Error('Tipo inválido');
    }

    const maquinas = await this.maquinaRepository.findByTipo(tipo);
    return maquinas.map(m => m.toPublic());
  }

  async create(data) {
    const maquina = new Maquina(data);
    const validation = maquina.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Verificar nombre único
    const existente = await this.maquinaRepository.findByNombre(data.nombre);
    if (existente) {
      throw new Error('Ya existe una máquina con ese nombre');
    }

    const nuevaMaquina = await this.maquinaRepository.create(data);
    return nuevaMaquina.toPublic();
  }

  async update(id, data) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const maquinaExistente = await this.maquinaRepository.findById(id);
    if (!maquinaExistente) {
      throw new Error('Máquina no encontrada');
    }

    // Validar datos actualizados
    const maquinaActualizada = new Maquina({ ...maquinaExistente.toJSON(), ...data });
    const validation = maquinaActualizada.validate();

    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Si cambia el nombre, verificar que no exista
    if (data.nombre && data.nombre !== maquinaExistente.nombre) {
      const existente = await this.maquinaRepository.findByNombre(data.nombre);
      if (existente) {
        throw new Error('Ya existe una máquina con ese nombre');
      }
    }

    const maquina = await this.maquinaRepository.update(id, data);
    return maquina.toPublic();
  }

  async delete(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const maquina = await this.maquinaRepository.findById(id);
    if (!maquina) {
      throw new Error('Máquina no encontrada');
    }

    await this.maquinaRepository.delete(id);
    return { message: 'Máquina eliminada correctamente' };
  }
}

export default MaquinaService;
