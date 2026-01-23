// services/rutinaService.mjs
import Rutina from '../models/rutina.mjs';

class RutinaService {
    constructor(rutinaRepository) {
        this.rutinaRepository = rutinaRepository;
    }

    async getAll() {
        const rutinas = await this.rutinaRepository.findAll();
        return rutinas.map(r => r.toPublic());
    }

    async getById(id) {
        if (!id || isNaN(id)) {
        throw new Error('ID inválido');
        }

        const rutina = await this.rutinaRepository.findById(id);
        if (!rutina) {
        throw new Error('Rutina no encontrada');
        }

        return rutina.toPublic();
    }

    async getBySocio(idSocio) {
        if (!idSocio || isNaN(idSocio)) {
        throw new Error('ID de socio inválido');
        }

        const rutinas = await this.rutinaRepository.findBySocio(idSocio);
        return rutinas.map(r => r.toPublic());
    }

    async getByNivel(nivel) {
        const validNiveles = ['principiante', 'intermedio', 'avanzado'];
        
        if (!validNiveles.includes(nivel)) {
        throw new Error(`Nivel inválido. Debe ser: ${validNiveles.join(', ')}`);
        }

        const rutinas = await this.rutinaRepository.findByNivel(nivel);
        return rutinas.map(r => r.toPublic());
    }

    async create(data) {
        const rutina = new Rutina(data);
        const validation = rutina.validate();

        if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
        }

        const nuevaRutina = await this.rutinaRepository.create(data);
        return nuevaRutina.toPublic();
    }

    async update(id, data) {
        if (!id || isNaN(id)) {
        throw new Error('ID inválido');
        }

        const rutinaExistente = await this.rutinaRepository.findById(id);
        if (!rutinaExistente) {
        throw new Error('Rutina no encontrada');
        }

        // Validar datos actualizados
        const rutinaActualizada = new Rutina({ ...rutinaExistente.toJSON(), ...data });
        const validation = rutinaActualizada.validate();

        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        const rutina = await this.rutinaRepository.update(id, data);
        return rutina.toPublic();
    }

    async delete(id) {
        if (!id || isNaN(id)) {
        throw new Error('ID inválido');
        }

        const rutina = await this.rutinaRepository.findById(id);
        if (!rutina) {
        throw new Error('Rutina no encontrada');
        }

        await this.rutinaRepository.delete(id);
        return { message: 'Rutina eliminada correctamente' };
    }
    }

export default RutinaService;
