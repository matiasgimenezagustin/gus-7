# Sistema Backend de Turnos y Reservas — Vistas con Handlebars y Socket.io

Aplicación integral de backend para la gestión de servicios y turnos/reservas desarrollada con **Node.js**, **Express**, **Handlebars**, **Socket.io**, **MongoDB Atlas** y **Mongoose**, bajo el estándar **ECMAScript Modules (ESM)** y con una estricta **arquitectura en capas**.

Esta entrega incorpora una **capa visual renderizada del lado del servidor (SSR) mediante Handlebars** y una **capa de comunicación en tiempo real mediante WebSockets con Socket.io**, sincronizando eventos del sistema y actualizando el navegador sin necesidad de recargar la página, al mismo tiempo que conserva en su totalidad la API REST preexistente.

---

## 🎯 Objetivos de la Entrega

1. **Vistas del lado del servidor con Handlebars:**
   - Motor de plantillas configurado en Express con layout principal reutilizable.
   - `GET /views/services`: Renderiza el catálogo de servicios consultados desde MongoDB Atlas, visualizando nombre, descripción, duración, precio, categoría y disponibilidad.
   - `GET /views/availability` (y `GET /views/bookings`): Renderiza turnos y disponibilidad con datos reales de la base de datos.
   - **Cero datos hardcodeados:** Toda la información pasa por la arquitectura en capas (`views.controller → services / bookings service → repository → DAO → model`).
2. **Comunicación bidireccional en tiempo real con Socket.io:**
   - Servidor HTTP y Socket.io integrados en `server.js`.
   - `public/js/socket.js` emite y escucha eventos ante **acciones reales del sistema**:
     - **Creación de servicio:** emite `service:create` y propaga `service:created` a todos los clientes.
     - **Alternancia de disponibilidad:** emite `service:toggle-availability` y propaga `service:updated`.
     - **Eliminación de servicio:** emite `service:delete` y propaga `service:deleted`.
     - **Registro de reserva:** emite `booking:create` y propaga `booking:created`.
   - El DOM de los clientes conectados se actualiza dinámicamente con animaciones sin recargar la página.
3. **Persistencia e Integridad:**
   - Conexión a **MongoDB Atlas** con **Mongoose** mediante `MONGO_URI`.
   - La API REST (`/api/services`, `/api/bookings`, `/api/messages`) sigue 100% operativa y también dispara eventos Socket.io en operaciones de mutación.

---

## 🛠️ Tecnologías

- **Node.js** (v18.x o superior)
- **Express.js** (v4.x)
- **Express-Handlebars** (v9.x)
- **Socket.io** (v4.x)
- **MongoDB Atlas** & **Mongoose** (v8.x)
- **Dotenv** (v16.x)

---

## 📁 Estructura del Repositorio

```text
Gustavo-backend-7/
├── public/
│   ├── css/
│   │   └── styles.css                   # Estilos modernos y responsivos, cards, badges y animaciones
│   └── js/
│       └── socket.js                    # Cliente Socket.io: emite y escucha eventos en tiempo real
├── src/
│   ├── config/
│   │   ├── env.config.js                # Validación de variables de entorno (PORT, MONGO_URI)
│   │   └── db.config.js                 # Conexión asíncrona a MongoDB Atlas
│   ├── controllers/
│   │   ├── views.controller.js          # Controladores que obtienen datos reales y renderizan vistas
│   │   ├── services.controller.js       # Controladores API REST de servicios (emite por socket)
│   │   ├── bookings.controller.js       # Controladores API REST de reservas (emite por socket)
│   │   └── messages.controller.js       # Controladores API REST de mensajes
│   ├── routes/
│   │   ├── views.router.js              # Rutas /views/services, /views/availability, /views/bookings
│   │   ├── services.router.js           # Rutas /api/services
│   │   ├── bookings.router.js           # Rutas /api/bookings
│   │   └── messages.router.js           # Rutas /api/messages
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars          # Layout principal: Navbar, scripts socket.io y contenedor
│   │   ├── services.handlebars          # Vista de catálogo y formulario en tiempo real
│   │   ├── availability.handlebars      # Vista de disponibilidad de turnos y agenda
│   │   └── bookings.handlebars          # Vista de gestión de reservas
│   ├── sockets/
│   │   └── socket.manager.js            # Lógica del servidor Socket.io conectada a la capa Services
│   ├── services/
│   │   ├── services.service.js          # Reglas de negocio de servicios
│   │   ├── bookings.service.js          # Reglas de negocio de reservas
│   │   └── messages.service.js          # Reglas de negocio de mensajes
│   ├── repositories/
│   │   ├── services.repository.js       # Repositorio de servicios
│   │   ├── bookings.repository.js       # Repositorio de reservas
│   │   └── messages.repository.js       # Repositorio de mensajes
│   ├── dao/
│   │   ├── services.dao.js              # Consultas Mongoose sobre ServiceModel
│   │   ├── bookings.dao.js              # Consultas Mongoose sobre BookingModel
│   │   └── messages.dao.js              # Consultas Mongoose sobre MessageModel
│   ├── models/
│   │   ├── service.model.js             # Esquema de servicios
│   │   ├── booking.model.js             # Esquema de reservas con referencia por ObjectId
│   │   └── message.model.js             # Esquema de mensajes
│   ├── app.js                           # Configuración de Express, Handlebars y middlewares
│   └── server.js                        # HTTP Server + Socket.io + arranque de servidor
├── .env.example                         # Plantilla de variables de entorno
├── .gitignore                           # Excluye .env, node_modules/ y logs
├── package.json                         # Dependencias y scripts
└── README.md                            # Documentación exhaustiva
```

---

## 🏛️ Flujo Arquitectónico en Capas

Tanto las peticiones de vistas (`views.controller.js`) como las peticiones REST (`services.controller.js`) y los eventos de WebSocket (`socket.manager.js`) interactúan exclusivamente con la capa de **Services**, garantizando la reutilización y el desacoplamiento:

```text
Cliente (Browser / Socket.io / HTTP)
   │
   ├──► Router / Views Controller  ──┐
   ├──► Router / API Controller   ───┼──► Services ──► Repositories ──► DAO ──► MongoDB
   └──► Socket.io Events Handler ────┘
```

---

## ⚡ Funcionalidades en Tiempo Real (Socket.io)

### Eventos Cliente ➔ Servidor:
| Evento | Carga útil (Payload) | Acción en el Servidor |
| :--- | :--- | :--- |
| `service:create` | `{ name, description, duration, price, category, available }` | Valida y crea el servicio mediante `servicesService`, guardándolo en MongoDB. |
| `service:toggle-availability` | `serviceId` | Invierte el booleano `available` del servicio vía `servicesService`. |
| `service:delete` | `serviceId` | Elimina el servicio de MongoDB mediante `servicesService`. |
| `booking:create` | `{ clientName, clientEmail, date, time, services }` | Registra una nueva reserva con estado `pending` en MongoDB. |

### Eventos Servidor ➔ Clientes (Broadcast):
| Evento | Propósito | Efecto en el Cliente (`public/js/socket.js`) |
| :--- | :--- | :--- |
| `service:created` | Notifica un nuevo servicio registrado | Agrega la card dinámicamente en `#servicesList` con animación glow, actualiza contadores y la tabla de disponibilidad sin recargar. |
| `service:updated` | Notifica cambio en un servicio (ej: disponibilidad) | Actualiza el badge (Disponible / No disponible), bordes y tabla en vivo. |
| `service:deleted` | Notifica la baja de un servicio | Remueve la card del DOM con transición de desvanecimiento y actualiza el contador. |
| `booking:created` | Notifica una nueva reserva generada | Inserta la tarjeta de reserva en el listado y actualiza contadores en vivo. |
| `notification` | Mensaje toast | Despliega una alerta flotante en la esquina inferior derecha. |

---

## 🌐 Vistas Disponibles en Handlebars

1. **`GET /views/services`**:
   - Catálogo interactivo de servicios.
   - Formulario para agregar servicios en tiempo real vía WebSocket.
   - Botones para alternar disponibilidad y eliminar servicios en vivo.
   - Muestra campos requeridos: **nombre, descripción, duración, precio, categoría y disponibilidad**.

2. **`GET /views/availability`**:
   - Vista de disponibilidad y turnos.
   - Tabla dinámica de servicios actualmente disponibles para agendar.
   - Formulario para agendar un turno / reserva con selector de servicio disponible.
   - Listado en vivo de turnos registrados en la base de datos.

3. **`GET /views/bookings`**:
   - Vista especializada para el seguimiento de reservas registradas.
   - Formulario directo de reserva y grilla de turnos en tiempo real.

---

## ⚙️ Variables de Entorno

Crear el archivo `.env` a partir de `.env.example`:
```bash
cp .env.example .env
```

Contenido de `.env`:
```env
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor
- **Modo desarrollo (con recarga automática):**
  ```bash
  npm run dev
  ```
- **Modo producción:**
  ```bash
  npm start
  ```

### 3. Probar en el navegador
- Abrir **http://localhost:8080/views/services** en dos pestañas o ventanas simultáneas.
- Al crear un servicio o presionar *"🔄 Alternar Estado"* en una ventana, **la otra ventana se actualizará instantáneamente sin necesidad de recargar la página**.

---

## 📡 API REST (Siempre Activa)

| Verbo | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/services` | Lista todos los servicios (soporta `?category=...&available=true`) |
| `GET` | `/api/services/:sid` | Obtiene servicio por ObjectId |
| `POST` | `/api/services` | Crea servicio (emite `service:created` a WebSocket) |
| `PUT` | `/api/services/:sid` | Modifica servicio (emite `service:updated` a WebSocket) |
| `DELETE` | `/api/services/:sid` | Elimina servicio (emite `service:deleted` a WebSocket) |
| `GET` | `/api/bookings` | Lista todas las reservas |
| `GET` | `/api/bookings/:bid` | Obtiene reserva por ObjectId |
| `POST` | `/api/bookings` | Crea reserva (emite `booking:created` a WebSocket) |
| `POST` | `/api/bookings/:bid/services/:sid` | Agrega servicio con incremento de cantidad |
| `GET` | `/api/health` | Estado del servidor, Handlebars y Socket.io |
