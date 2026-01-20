import Rutina from '../models/rutina.mjs';

/**
 * Service de Rutina
 * Capa de lógica de negocio
 */
class RutinaService {
  constructor(rutinaRepository) {
    this.rutinaRepository = rutinaRepository;
  }

  async obtenerTodos() {
    const rutinas = await this.rutinaRepository.findAll();
    return rutinas.map(r => r.toPublic());
  }
  
  async obtenerPorId(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const rutina = await this.rutinaRepository.findById
  }

}