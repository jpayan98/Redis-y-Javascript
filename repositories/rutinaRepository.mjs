// repositories/rutinaRepository.mjs
import Rutina from '../models/rutina.mjs';

class RutinaRepository {
    constructor(supabase, redisClient = null) {
        this.supabase = supabase;
        this.redis = redisClient;
        Rutina.setClient(redisClient);
    }

    async findAll() {
        if (this.redis) {
            const cached = await this.redis.get('rutinas:all');
        if (cached) {
            return JSON.parse(cached).map(r => new Rutina(r));
        }
        }

        const { data, error } = await this.supabase
        .from('rutinas')
        .select('*')
        .order('id', { ascending: true });

        if (error) throw error;

        if (this.redis && data) {
            await this.redis.setEx('rutinas:all', 300, JSON.stringify(data));
        }

        return data.map(r => new Rutina(r));
    }

    async findById(id) {
        const cached = await Rutina.getFromCache(id);
        if (cached) return cached;

        const { data, error } = await this.supabase
        .from('rutinas')
        .select('*')
        .eq('id', id)
        .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (!data) return null;

        const rutina = new Rutina(data);
        await rutina.saveToCache();
        return rutina;
    }

    async findBySocio(idSocio) {
        if (this.redis) {
            const cached = await this.redis.get(`rutinas:socio:${idSocio}`);
            if (cached) {
                return JSON.parse(cached).map(r => new Rutina(r));
            }
        }

        const { data, error } = await this.supabase
        .from('rutinas')
        .select('*')
        .eq('id_socio', idSocio)
        .order('id', { ascending: true });

        if (error) throw error;

        if (this.redis && data) {
            await this.redis.setEx(`rutinas:socio:${idSocio}`, 300, JSON.stringify(data));
        }

        return data.map(r => new Rutina(r));
    }

    async findByNivel(nivel) {
        if (this.redis) {
        const cached = await this.redis.get(`rutinas:nivel:${nivel}`);
        if (cached) {
            return JSON.parse(cached).map(r => new Rutina(r));
        }
        }

        const { data, error } = await this.supabase
        .from('rutinas')
        .select('*')
        .eq('nivel_dificultad', nivel)
        .order('id', { ascending: true });

        if (error) throw error;

        if (this.redis && data) {
        await this.redis.setEx(`rutinas:nivel:${nivel}`, 300, JSON.stringify(data));
        }

    return data.map(r => new Rutina(r));
    }

    async create(rutinaData) {
        const { data, error } = await this.supabase
        .from('rutinas')
        .insert({
            nombre: rutinaData.nombre,
            nivel_dificultad: rutinaData.nivel_dificultad || 'principiante',
            id_socio: rutinaData.id_socio || null
        })
        .select()
        .single();

        if (error) throw error;

        const rutina = new Rutina(data);
        await rutina.invalidateCache();
        return rutina;
    }

    async update(id, rutinaData) {
        const updateData = {
            updated_at: new Date().toISOString()
        };

        if (rutinaData.nombre !== undefined) updateData.nombre = rutinaData.nombre;
        if (rutinaData.nivel_dificultad !== undefined) updateData.nivel_dificultad = rutinaData.nivel_dificultad;
        if (rutinaData.id_socio !== undefined) updateData.id_socio = rutinaData.id_socio;

        const { data, error } = await this.supabase
        .from('rutinas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

        if (error) throw error;
        if (!data) return null;

        const rutina = new Rutina(data);
        await rutina.invalidateCache();
        return rutina;
    }

    async delete(id) {
        const rutina = await this.findById(id);

        const { error } = await this.supabase
        .from('rutinas')
        .delete()
        .eq('id', id);

        if (error) throw error;

        if (rutina) {
            await rutina.invalidateCache();
        }

        return true;
    }
}

export default RutinaRepository;
