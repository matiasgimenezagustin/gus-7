import { servicesService } from '../services/services.service.js';
import { bookingsService } from '../services/bookings.service.js';

export const renderServicesView = async (req, res) => {
  try {
    const { category, available } = req.query;
    const services = await servicesService.getServices({ category, available });

    return res.render('services', {
      title: 'Catálogo de Servicios | Sistema de Turnos y Reservas',
      services,
      hasServices: services && services.length > 0,
      activeMenu: 'services',
      filters: { category, available }
    });
  } catch (error) {
    return res.status(500).render('services', {
      title: 'Error al cargar servicios',
      services: [],
      hasServices: false,
      errorMessage: `Error al obtener servicios: ${error.message}`
    });
  }
};

export const renderAvailabilityView = async (req, res) => {
  try {
    // Obtener servicios disponibles y reservas registradas a través de la capa de servicios
    const availableServices = await servicesService.getServices({ available: 'true' });
    const allServices = await servicesService.getServices();
    const bookings = await bookingsService.getAllBookings({ populate: true });

    return res.render('availability', {
      title: 'Disponibilidad y Turnos | Sistema de Turnos y Reservas',
      availableServices,
      hasAvailableServices: availableServices && availableServices.length > 0,
      allServices,
      bookings,
      hasBookings: bookings && bookings.length > 0,
      activeMenu: 'availability'
    });
  } catch (error) {
    return res.status(500).render('availability', {
      title: 'Error al cargar disponibilidad',
      availableServices: [],
      hasAvailableServices: false,
      bookings: [],
      hasBookings: false,
      errorMessage: `Error al obtener datos de disponibilidad: ${error.message}`
    });
  }
};

export const renderBookingsView = async (req, res) => {
  try {
    const bookings = await bookingsService.getAllBookings({ populate: true });
    const services = await servicesService.getServices();

    return res.render('bookings', {
      title: 'Gestión de Reservas | Sistema de Turnos y Reservas',
      bookings,
      hasBookings: bookings && bookings.length > 0,
      services,
      hasServices: services && services.length > 0,
      activeMenu: 'bookings'
    });
  } catch (error) {
    return res.status(500).render('bookings', {
      title: 'Error al cargar reservas',
      bookings: [],
      hasBookings: false,
      services: [],
      errorMessage: `Error al obtener reservas: ${error.message}`
    });
  }
};

