/**
 * Controller de Ejercicio
 * Capa de manejo HTTP - Solo gestiona request/response
 */
class EjercicioController {
  constructor(ejercicioService) {
    this.ejercicioService = ejercicioService;
  }

  getAll = async (req, res) => {
    try {
      const ejercicios = await this.ejercicioService.getAll();
      res.json(ejercicios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const ejercicio = await this.ejercicioService.getById(parseInt(id));
      res.json(ejercicio);
    } catch (error) {
      if (error.message === 'Ejercicio no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  getByGrupoMuscular = async (req, res) => {
    try {
      const { grupo } = req.params;
      const ejercicios = await this.ejercicioService.getByGrupoMuscular(grupo);
      res.json(ejercicios);
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('requerido')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req, res) => {
    try {
      const ejercicio = await this.ejercicioService.create(req.body);
      res.status(201).json(ejercicio);
    } catch (error) {
      if (
        error.message.includes('requerido') || 
        error.message.includes('formato') ||
        error.message.includes('inválido')
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const ejercicio = await this.ejercicioService.update(parseInt(id), req.body);
      res.json(ejercicio);
    } catch (error) {
      if (error.message === 'Ejercicio no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (
        error.message === 'ID inválido' || 
        error.message.includes('requerido') ||
        error.message.includes('formato')
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.ejercicioService.delete(parseInt(id));
      res.json(result);
    } catch (error) {
      if (error.message === 'Ejercicio no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
}

export default EjercicioController;