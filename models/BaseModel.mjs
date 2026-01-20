import { createClient } from 'redis';

/**
 * Clase base para todos los modelos
 * Proporciona conexión compartida a Redis para caché
 */
class BaseModel {
    static client = null;

    /**
     * Conecta al servidor Redis
     * @returns {Promise<RedisClient>} Cliente de Redis conectado
     */
    static async connect() {
        if (!BaseModel.client) {
            BaseModel.client = createClient();
            BaseModel.client.on('error', (err) => console.error('Redis Client Error', err));
            await BaseModel.client.connect();
        }
        return BaseModel.client;
    }

    /**
     * Desconecta del servidor Redis
     */
    static async disconnect() {
        if (BaseModel.client) {
            await BaseModel.client.quit();
            BaseModel.client = null;
        }
    }

    /**
     * Obtiene el cliente de Redis
     * @returns {RedisClient|null} Cliente de Redis o null si no está conectado
     */
    static getClient() {
        return BaseModel.client;
    }
}

export default BaseModel;
