import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { environmentConfig } from './config/env.config.js';
import { connectDB } from './config/db.config.js';
import { initSocketServer } from './sockets/socket.manager.js';

const PORT = environmentConfig.port;

// Creación del servidor HTTP a partir de la app de Express
const httpServer = http.createServer(app);

// Inicialización de Socket.io sobre el servidor HTTP
const io = new Server(httpServer);

// Almacenar la instancia de Socket.io en la aplicación Express para que los controladores puedan emitir eventos
app.set('io', io);

// Inicializar la lógica de eventos y canales de WebSocket
initSocketServer(io);

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`[Servidor] Ejecutándose exitosamente en el puerto ${PORT}`);
      console.log(`[Servidor] Entorno: ${environmentConfig.nodeEnv}`);
      console.log(`[Vistas Handlebars] Servicios:      http://localhost:${PORT}/views/services`);
      console.log(`[Vistas Handlebars] Disponibilidad: http://localhost:${PORT}/views/availability`);
      console.log(`[Vistas Handlebars] Reservas:       http://localhost:${PORT}/views/bookings`);
      console.log(`[API REST] Recurso Servicios:       http://localhost:${PORT}/api/services`);
      console.log(`[API REST] Recurso Reservas:        http://localhost:${PORT}/api/bookings`);
      console.log(`[Socket.io] Servidor de WebSockets activo y sincronizado en tiempo real`);
    });
  } catch (error) {
    console.error(`[Servidor] Error crítico al iniciar la aplicación: ${error.message}`);
    process.exit(1);
  }
};

startServer();
