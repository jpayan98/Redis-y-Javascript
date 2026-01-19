const { createClient } = require('redis');

class BaseModel {
    static client = null;

    static async connect() {
        if (!BaseModel.client) {
            BaseModel.client = createClient();
            BaseModel.client.on('error', (err) => console.error('Redis Client Error', err));
            await BaseModel.client.connect();
        }
        return BaseModel.client;
    }

    static async disconnect() {
        if (BaseModel.client) {
            await BaseModel.client.quit();
            BaseModel.client = null;
        }
    }

    static getClient() {
        return BaseModel.client;
    }
}

module.exports = BaseModel;
