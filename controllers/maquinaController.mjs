// controllers/maquinaController.mjs

class MaquinaController {
  constructor(maquinaService) {
    this.maquinaService = maquinaService;
  }

  getAll = async (req, res) => {
    try {
      const maquinas = await this.maquinaService.getAll();
      res.json(maquinas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      const maquina = await this.maquinaService.getById(parseInt(id));
      res.json(maquina);
    } catch (error) {
      if (error.message === 'Máquina no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  getByEstado = async (req, res) => {
    try {
      const { estado } = req.params;
      const maquinas = await this.maquinaService.getByEstado(estado);
      res.json(maquinas);
    } catch (error) {
      if (error.message.includes('Estado inválido')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  getByTipo = async (req, res) => {
    try {
      const { tipo } = req.params;
      const maquinas = await this.maquinaService.getByTipo(tipo);
      res.json(maquinas);
    } catch (error) {
      if (error.message.includes('Tipo inválido')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  create = async (req, res) => {
    try {
      const maquina = await this.maquinaService.create(req.body);
      res.status(201).json(maquina);
    } catch (error) {
      if (error.message.includes('requerido') || 
          error.message.includes('formato') || 
          error.message.includes('Ya existe')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const maquina = await this.maquinaService.update(parseInt(id), req.body);
      res.json(maquina);
    } catch (error) {
      if (error.message === 'Máquina no encontrada') {
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
      const result = await this.maquinaService.delete(parseInt(id));
      res.json(result);
    } catch (error) {
      if (error.message === 'Máquina no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'ID inválido') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  };
}

export default MaquinaController;
