import { bookingsService } from '../services/bookings.service.js';

export const getAllBookings = async (req, res) => {
  try {
    const populate = req.query.populate === 'true';
    const bookings = await bookingsService.getAllBookings({ populate });
    return res.status(200).json({
      status: 'success',
      payload: bookings
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener las reservas',
      error: error.message
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { bid } = req.params;
    const populate = req.query.populate === 'true';
    const booking = await bookingsService.getBookingById(bid, { populate });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: `Reserva con id ${bid} no encontrada`
      });
    }

    return res.status(200).json({
      status: 'success',
      payload: booking
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener la reserva',
      error: error.message
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    const newBooking = await bookingsService.createBooking(req.body);

    const io = req.app.get('io');
    if (io) {
      io.emit('booking:created', newBooking);
      io.emit('notification', {
        type: 'success',
        message: `Nueva reserva creada vía API: ${newBooking.clientName} (${newBooking.date} ${newBooking.time})`
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Reserva creada exitosamente',
      payload: newBooking
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const addServiceToBooking = async (req, res) => {
  try {
    const { bid, sid } = req.params;
    const populate = req.query.populate === 'true';
    const updatedBooking = await bookingsService.addServiceToBooking(bid, sid, { populate });

    const io = req.app.get('io');
    if (io) {
      io.emit('booking:updated', updatedBooking);
    }

    return res.status(200).json({
      status: 'success',
      message: `Servicio ${sid} agregado a la reserva ${bid} con éxito`,
      payload: updatedBooking
    });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({
      status: 'error',
      message: error.message
    });
  }
};
