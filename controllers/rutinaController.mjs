// controllers/rutinaController.mjs

class RutinaController {
    constructor(rutinaService) {
        this.rutinaService = rutinaService;
    }

    getAll = async (req, res) => {
        try {
            const rutinas = await this.rutinaService.getAll();
            res.json(rutinas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    getById = async (req, res) => {
        try {
            const { id } = req.params;
            const rutina = await this.rutinaService.getById(parseInt(id));

            // Si es user, verificar que la rutina le pertenece
            if (req.client.role === 'user' && rutina.id_socio !== req.client.id) {
                return res.status(403).json({
                    error: 'Acceso denegado',
                    message: 'Solo puedes ver tus propias rutinas'
                });
            }

            res.json(rutina);
        } catch (error) {
            if (error.message === 'Rutina no encontrada') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'ID inválido') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    };

    getBySocio = async (req, res) => {
        try {
            const { id_socio } = req.params;
            const rutinas = await this.rutinaService.getBySocio(parseInt(id_socio));
            res.json(rutinas);
        } catch (error) {
            if (error.message === 'ID de socio inválido') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    };

    getByNivel = async (req, res) => {
        try {
            const { nivel } = req.params;
            const rutinas = await this.rutinaService.getByNivel(nivel);
            res.json(rutinas);
        } catch (error) {
            if (error.message.includes('Nivel inválido')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    };

    create = async (req, res) => {
        try {
            const rutina = await this.rutinaService.create(req.body);
            res.status(201).json(rutina);
        } catch (error) {
            if (error.message.includes('requerido') ||
                error.message.includes('inválido')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    };

    update = async (req, res) => {
        try {
            const { id } = req.params;
            const rutina = await this.rutinaService.update(parseInt(id), req.body);
            res.json(rutina);
        } catch (error) {
            if (error.message === 'Rutina no encontrada') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'ID inválido' ||
                error.message.includes('requerido')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    };

    delete = async (req, res) => {
        try {
            const { id } = req.params;
            const result = await this.rutinaService.delete(parseInt(id));
            res.json(result);
        } catch (error) {
            if (error.message === 'Rutina no encontrada') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'ID inválido') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    };
}

export default RutinaController;
