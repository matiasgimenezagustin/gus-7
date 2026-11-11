import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const nodeEnv = process.env.NODE_ENV || 'development';
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/turnos_reservas';

if (isNaN(port) || port <= 0) {
  throw new Error('La variable de entorno PORT debe ser un número de puerto válido.');
}

export const environmentConfig = {
  port,
  nodeEnv,
  mongoUri
};

export default environmentConfig;

