import { servicesService } from '../services/services.service.js';
import { bookingsService } from '../services/bookings.service.js';

export const initSocketServer = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Nuevo cliente conectado con ID: ${socket.id}`);

    // Acción en tiempo real: Crear un nuevo servicio
    socket.on('service:create', async (serviceData) => {
      try {
        const newService = await servicesService.createService(serviceData);
        // Emite a todos los clientes conectados el nuevo servicio
        io.emit('service:created', newService);
        io.emit('notification', {
          type: 'success',
          message: `Nuevo servicio agregado: "${newService.name}"`
        });
      } catch (error) {
        socket.emit('socket:error', {
          action: 'service:create',
          message: error.message
        });
      }
    });

    // Acción en tiempo real: Cambiar disponibilidad de un servicio
    socket.on('service:toggle-availability', async (serviceId) => {
      try {
        const existing = await servicesService.getServiceById(serviceId);
        if (!existing) {
          throw new Error(`Servicio con ID ${serviceId} no encontrado`);
        }

        const updatedService = await servicesService.updateService(serviceId, {
          available: !existing.available
        });

        // Emite a todos los clientes la actualización del servicio
        io.emit('service:updated', updatedService);
        io.emit('notification', {
          type: 'info',
          message: `Disponibilidad de "${updatedService.name}" modificada a: ${updatedService.available ? 'Disponible' : 'No disponible'}`
        });
      } catch (error) {
        socket.emit('socket:error', {
          action: 'service:toggle-availability',
          message: error.message
        });
      }
    });

    // Acción en tiempo real: Eliminar servicio
    socket.on('service:delete', async (serviceId) => {
      try {
        const deleted = await servicesService.deleteService(serviceId);
        if (deleted) {
          io.emit('service:deleted', { id: serviceId, name: deleted.name });
          io.emit('notification', {
            type: 'warning',
            message: `Servicio "${deleted.name}" eliminado del catálogo`
          });
        }
      } catch (error) {
        socket.emit('socket:error', {
          action: 'service:delete',
          message: error.message
        });
      }
    });

    // Acción en tiempo real: Crear reserva
    socket.on('booking:create', async (bookingData) => {
      try {
        const newBooking = await bookingsService.createBooking(bookingData);
        io.emit('booking:created', newBooking);
        io.emit('notification', {
          type: 'success',
          message: `Nueva reserva registrada para "${newBooking.clientName}" (${newBooking.date} a las ${newBooking.time})`
        });
      } catch (error) {
        socket.emit('socket:error', {
          action: 'booking:create',
          message: error.message
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
    });
  });
};

export default initSocketServer;

