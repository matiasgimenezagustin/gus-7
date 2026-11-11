import mongoose from 'mongoose';
import { bookingsRepository as defaultBookingsRepository } from '../repositories/bookings.repository.js';
import { servicesRepository as defaultServicesRepository } from '../repositories/services.repository.js';

export class BookingsService {
  constructor(
    bookingsRepository = defaultBookingsRepository,
    servicesRepository = defaultServicesRepository
  ) {
    this.bookingsRepository = bookingsRepository;
    this.servicesRepository = servicesRepository;
  }

  async getAllBookings(options = {}) {
    return await this.bookingsRepository.getAll(options);
  }

  async createBooking(bookingData) {
    if (!bookingData || typeof bookingData !== 'object') {
      throw new Error('Los datos de la reserva deben ser un objeto válido.');
    }

    const requiredFields = ['clientName', 'clientEmail', 'date', 'time'];
    const missingFields = requiredFields.filter((field) => {
      const value = bookingData[field];
      return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      );
    });

    if (missingFields.length > 0) {
      throw new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
    }

    const newBookingData = {
      clientName: String(bookingData.clientName).trim(),
      clientEmail: String(bookingData.clientEmail).trim(),
      date: String(bookingData.date).trim(),
      time: String(bookingData.time).trim(),
      status: bookingData.status ? String(bookingData.status).trim() : 'pending',
      services: Array.isArray(bookingData.services) ? bookingData.services : []
    };

    return await this.bookingsRepository.create(newBookingData);
  }

  async getBookingById(id, options = {}) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return await this.bookingsRepository.getById(id, options);
  }

  async addServiceToBooking(bookingId, serviceId, options = {}) {
    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      const error = new Error(`El ID de la reserva '${bookingId}' no tiene un formato válido.`);
      error.statusCode = 400;
      throw error;
    }

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
      const error = new Error(`El ID del servicio '${serviceId}' no tiene un formato válido.`);
      error.statusCode = 400;
      throw error;
    }

    const booking = await this.bookingsRepository.getById(bookingId, { populate: false });
    if (!booking) {
      const error = new Error(`Reserva con id ${bookingId} no encontrada`);
      error.statusCode = 404;
      throw error;
    }

    const service = await this.servicesRepository.getById(serviceId);
    if (!service) {
      const error = new Error(`Servicio con id ${serviceId} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    const currentServices = Array.isArray(booking.services) ? [...booking.services] : [];
    const existingIndex = currentServices.findIndex((item) => {
      const itemServiceId = item.service?._id
        ? item.service._id.toString()
        : item.service?.toString();
      return itemServiceId === String(serviceId);
    });

    if (existingIndex !== -1) {
      currentServices[existingIndex] = {
        ...currentServices[existingIndex],
        quantity: (currentServices[existingIndex].quantity || 0) + 1
      };
    } else {
      currentServices.push({
        service: serviceId,
        quantity: 1
      });
    }

    const formattedServices = currentServices.map((item) => ({
      service: item.service?._id || item.service,
      quantity: item.quantity
    }));

    return await this.bookingsRepository.update(bookingId, { services: formattedServices }, options);
  }
}

export const bookingsService = new BookingsService();
export const getAllBookings = (options) => bookingsService.getAllBookings(options);
export const createBooking = (data) => bookingsService.createBooking(data);
export const getBookingById = (id, options) => bookingsService.getBookingById(id, options);
export const addServiceToBooking = (bid, sid, options) => bookingsService.addServiceToBooking(bid, sid, options);

export default bookingsService;
