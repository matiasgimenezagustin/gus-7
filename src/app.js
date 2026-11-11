import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';

import servicesRouter from './routes/services.router.js';
import bookingsRouter from './routes/bookings.router.js';
import messagesRouter from './routes/messages.router.js';
import viewsRouter from './routes/views.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares para parseo de cuerpo de petición
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars como motor de plantillas
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos desde la carpeta public/
app.use(express.static(path.join(__dirname, '../public')));

// Redirección de raíz a la vista principal
app.get('/', (req, res) => {
  res.redirect('/views/services');
});

// Endpoint de verificación del servidor
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    message: 'Servidor activo, Handlebars y Socket.io operativos, conectado a MongoDB Atlas'
  });
});

// Enrutador de vistas renderizadas del lado del servidor
app.use('/views', viewsRouter);

// Enrutadores de la API REST existente
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/messages', messagesRouter);

// Manejo de rutas inexistentes
app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).render('services', {
      title: '404 - Página no encontrada',
      errorMessage: `La ruta "${req.originalUrl}" no existe en el servidor.`
    });
  }
  res.status(404).json({
    status: 'error',
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

export default app;
