// controllers/rutinaEjercicioController.mjs

class RutinaEjercicioController {
  constructor(rutinaEjercicioService) {
    this.rutinaEjercicioService = rutinaEjercicioService;
  }

  getAll = async (req, res) => {
    try {
      const rutinaEjercicios = await this.rutinaEjercicioService.getAll();
      res.json(rutinaEjercicios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const rutinaEjercicio = await this.rutinaEjercicioService.getById(parseInt(id));
      res.json(rutinaEjercicio);
    } catch (error) {
      if (error.message === 'Relación rutina-ejercicio no encontrada') {
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
      const rutinaEjercicios = await this.rutinaEjercicioService.getByRutina(parseInt(id_rutina));
      res.json(rutinaEjercicios);
    } catch (error) {
      if (error.message === 'ID de rutina inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  getByEjercicio = async (req, res) => {
    try {
      const { id_ejercicio } = req.params;
      const rutinaEjercicios = await this.rutinaEjercicioService.getByEjercicio(parseInt(id_ejercicio));
      res.json(rutinaEjercicios);
    } catch (error) {
      if (error.message === 'ID de ejercicio inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req, res) => {
    try {
      const rutinaEjercicio = await this.rutinaEjercicioService.create(req.body);
      res.status(201).json(rutinaEjercicio);
    } catch (error) {
      if (error.message.includes('requerido') || 
          error.message.includes('no existe') ||
          error.message.includes('válido')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const rutinaEjercicio = await this.rutinaEjercicioService.update(parseInt(id), req.body);
      res.json(rutinaEjercicio);
    } catch (error) {
      if (error.message === 'Relación rutina-ejercicio no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido' || 
          error.message.includes('requerido') ||
          error.message.includes('no existe')) {
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
      if (error.message === 'Relación rutina-ejercicio no encontrada') {
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
