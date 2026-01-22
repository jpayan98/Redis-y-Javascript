import Socio from '../models/socio.mjs';

/**
 * Service de Socio
 * Capa de lógica de negocio
 */
class SocioService {
  constructor(socioRepository) {
    this.socioRepository = socioRepository;
  }

  async getAll() {
    const socios = await this.socioRepository.findAll();
    return socios.map(s => s.toSafe());
  }

  async getById(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new Error('Socio no encontrado');
    }

    return socio.toSafe();
  }

  async getByActivo(activo) {
    // Convertir string a boolean si es necesario
    const isActivo = activo === 'true' || activo === true;
    
    const socios = await this.socioRepository.findByActivo(isActivo);
    return socios.map(s => s.toSafe());
  }

  async create(data) {
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
    
    // Devolver con API key solo al crear
    return {
      ...nuevoSocio.toSafe(),
      api_key: nuevoSocio.api_key,
      message: 'Socio creado exitosamente. Guarda tu API Key, no se mostrará de nuevo.'
    };
  }

  async update(id, data) {
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
    return socio.toSafe();
  }

  async delete(id) {
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

  async regenerateApiKey(id) {
    if (!id || isNaN(id)) {
      throw new Error('ID inválido');
    }

    const socio = await this.socioRepository.findById(id);
    if (!socio) {
      throw new Error('Socio no encontrado');
    }

    const socioActualizado = await this.socioRepository.regenerateApiKey(id);
    
    return {
      ...socioActualizado.toSafe(),
      api_key: socioActualizado.api_key,
      message: 'API Key regenerada exitosamente. Guarda la nueva clave.'
    };
  }
}

export default SocioService;