import mongoose from 'mongoose';
import { environmentConfig } from './env.config.js';

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(environmentConfig.mongoUri);
    console.log(`[MongoDB] Conexión establecida con éxito: ${connection.connection.host}/${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error(`[MongoDB] Error al conectar a la base de datos: ${error.message}`);
    throw error;
  }
};

export default connectDB;

