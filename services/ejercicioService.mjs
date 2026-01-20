import Ejercicio from '../models/ejercicio.mjs';

/**
 * Service de Ejercicio
 * Capa de lógica de negocio
 */

class EjercicioService {
    constructor(ejercicioRepository) {
        this.ejercicioRepository = ejercicioRepository;
    }

    async obtenerTodos() {
        const ejercicios = await this.ejercicioRepository.findAll();
        return ejercicios.map(e => e.toPublic());
    }

    async obtenerPorId(id) {
        if (!id || isNaN(id)) {
            throw new Error('ID inválido');
        }

        const ejercicio = await this.ejercicioRepository.findById(id);
        if (!ejercicio) {
            throw new Error('Ejercicio no encontrado');
        }

        return ejercicio.toPublic();
    }

    async obtenerPorGrupoMuscular(tipo) {
        const grupoMuscularValidos = ['cardio', 'fuerza', 'flexibilidad', 'equilibrio'];
        if (!grupoMuscularValidos.includes(tipo)) {
            throw new Error('Tipo inválido. Debe ser: cardio, fuerza, flexibilidad o equilibrio');
        }

        const ejercicios = await this.ejercicioRepository.findByTipo(tipo);
        return ejercicios.map(e => e.toPublic());
    }

    async crear(data) {
        // Crear instancia para validar
        const ejercicio = new Ejercicio(data);
        const validation = ejercicio.validate();

        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        const nuevoEjercicio = await this.ejercicioRepository.create(data);
        return nuevoEjercicio.toPublic();
    }

    async actualizar(id, data) {
        if (!id || isNaN(id)) {
            throw new Error('ID inválido');
        }

        const ejercicioExistente = await this.ejercicioRepository.findById(id);
        if (!ejercicioExistente) {
            throw new Error('Ejercicio no encontrado');
        }
        
        // Crear instancia para validar
        const ejercicio = new Ejercicio({ ...ejercicioExistente.toJSON(), ...data });
        const validation = ejercicio.validate();
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        const ejercicioActualizado = await this.ejercicioRepository.update(id, data);
        return ejercicioActualizado.toPublic();
    }

    async borrar(id) {
        if (!id || isNaN(id)) {
            throw new Error('ID inválido');
        }

        const ejercicioExistente = await this.ejercicioRepository.findById(id);
        if (!ejercicioExistente) {
            throw new Error('Ejercicio no encontrado');
        }

        await this.ejercicioRepository.delete(id);
        return { message: 'Ejercicio eliminado correctamente' };
    }
}

export default EjercicioService;