/**
 * Controller de Socio
 * Capa de manejo HTTP - Solo gestiona request/response
 */
class SocioController {
  constructor(socioService) {
    this.socioService = socioService;
  }

  getAll = async (req, res) => {
    try {
      // Si es user, solo devolver su propio perfil
      if (req.userRole === 'user') {
        const socio = await this.socioService.getById(req.userId);
        return res.json([socio]); // Devolver array con un solo elemento
      }
      
      // DBA y Admin ven todos
      const socios = await this.socioService.getAll();
      res.json(socios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const socio = await this.socioService.getById(parseInt(id));
      res.json(socio);
    } catch (error) {
      if (error.message === 'Socio no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  getByActivo = async (req, res) => {
    try {
      const { activo } = req.params;
      const socios = await this.socioService.getByActivo(activo);
      res.json(socios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req, res) => {
    try {
      const socio = await this.socioService.create(req.body);
      res.status(201).json(socio);
    } catch (error) {
      if (error.message.includes('requerido') || 
          error.message.includes('formato') || 
          error.message.includes('Ya existe') ||
          error.message.includes('rol')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const socio = await this.socioService.update(parseInt(id), req.body);
      res.json(socio);
    } catch (error) {
      if (error.message === 'Socio no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido' || 
          error.message.includes('requerido') || 
          error.message.includes('Ya existe')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.socioService.delete(parseInt(id));
      res.json(result);
    } catch (error) {
      if (error.message === 'Socio no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  regenerateApiKey = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.socioService.regenerateApiKey(parseInt(id));
      res.json(result);
    } catch (error) {
      if (error.message === 'Socio no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
}

export default SocioController;