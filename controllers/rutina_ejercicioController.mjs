/**
 * Controller de RutinaEjercicio
 * Capa de manejo HTTP - Solo gestiona request/response
 */
class RutinaEjercicioController {
  constructor(rutinaEjercicioService) {
    this.rutinaEjercicioService = rutinaEjercicioService;
  }

  getAll = async (req, res) => {
    try {
      const vinculaciones = await this.rutinaEjercicioService.getAll();
      res.json(vinculaciones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const vinculacion = await this.rutinaEjercicioService.getById(parseInt(id));
      res.json(vinculacion);
    } catch (error) {
      if (error.message === 'Vinculación no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  getByRutina = async (req, res) => {
    try {
      const { id_rutina } = req.params;
      const ejercicios = await this.rutinaEjercicioService.getByRutina(parseInt(id_rutina));
      res.json(ejercicios);
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrada')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  getByEjercicio = async (req, res) => {
    try {
      const { id_ejercicio } = req.params;
      const rutinas = await this.rutinaEjercicioService.getByEjercicio(parseInt(id_ejercicio));
      res.json(rutinas);
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('no encontrado')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req, res) => {
    try {
      const vinculacion = await this.rutinaEjercicioService.create(req.body);
      res.status(201).json(vinculacion);
    } catch (error) {
      if (
        error.message.includes('requerido') || 
        error.message.includes('negativas') ||
        error.message.includes('no existe')
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const vinculacion = await this.rutinaEjercicioService.update(parseInt(id), req.body);
      res.json(vinculacion);
    } catch (error) {
      if (error.message === 'Vinculación no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (
        error.message === 'ID inválido' || 
        error.message.includes('requerido') ||
        error.message.includes('negativas')
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await this.rutinaEjercicioService.delete(parseInt(id));
      res.json(result);
    } catch (error) {
      if (error.message === 'Vinculación no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
}

export default RutinaEjercicioController;