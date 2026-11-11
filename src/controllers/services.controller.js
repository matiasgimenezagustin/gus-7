import { servicesService } from '../services/services.service.js';

export const getServices = async (req, res) => {
  try {
    const { category, available } = req.query;
    const services = await servicesService.getServices({ category, available });

    return res.status(200).json({
      status: 'success',
      payload: services
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener los servicios',
      error: error.message
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { sid } = req.params;
    const service = await servicesService.getServiceById(sid);

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: `Servicio con id ${sid} no encontrado`
      });
    }

    return res.status(200).json({
      status: 'success',
      payload: service
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener el servicio',
      error: error.message
    });
  }
};

export const createService = async (req, res) => {
  try {
    const newService = await servicesService.createService(req.body);

    const io = req.app.get('io');
    if (io) {
      io.emit('service:created', newService);
      io.emit('notification', {
        type: 'success',
        message: `Nuevo servicio creado vía API: "${newService.name}"`
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Servicio creado exitosamente',
      payload: newService
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { sid } = req.params;
    const updatedService = await servicesService.updateService(sid, req.body);

    if (!updatedService) {
      return res.status(404).json({
        status: 'error',
        message: `Servicio con id ${sid} no encontrado`
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('service:updated', updatedService);
      io.emit('notification', {
        type: 'info',
        message: `Servicio actualizado vía API: "${updatedService.name}"`
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Servicio actualizado exitosamente',
      payload: updatedService
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { sid } = req.params;
    const deletedService = await servicesService.deleteService(sid);

    if (!deletedService) {
      return res.status(404).json({
        status: 'error',
        message: `Servicio con id ${sid} no encontrado`
      });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('service:deleted', { id: sid, name: deletedService.name });
      io.emit('notification', {
        type: 'warning',
        message: `Servicio eliminado vía API: "${deletedService.name}"`
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `Servicio con id ${sid} eliminado exitosamente`,
      payload: deletedService
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al eliminar el servicio',
      error: error.message
    });
  }
};
