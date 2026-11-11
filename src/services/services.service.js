import mongoose from 'mongoose';
import { servicesRepository as defaultServicesRepository } from '../repositories/services.repository.js';

export class ServicesService {
  constructor(servicesRepository = defaultServicesRepository) {
    this.servicesRepository = servicesRepository;
  }

  async getServices(filters = {}) {
    const mongoFilter = {};

    if (filters && typeof filters === 'object') {
      const { category, available } = filters;

      if (category !== undefined && String(category).trim() !== '') {
        mongoFilter.category = new RegExp(`^${String(category).trim()}$`, 'i');
      }

      if (available !== undefined && String(available).trim() !== '') {
        const availableString = String(available).trim().toLowerCase();
        if (availableString === 'true') {
          mongoFilter.available = true;
        } else if (availableString === 'false') {
          mongoFilter.available = false;
        }
      }
    }

    return await this.servicesRepository.getAll(mongoFilter);
  }

  async getServiceById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return await this.servicesRepository.getById(id);
  }

  async createService(serviceData) {
    if (!serviceData || typeof serviceData !== 'object') {
      throw new Error('Los datos del servicio deben ser un objeto válido.');
    }

    const requiredFields = ['name', 'description', 'duration', 'price', 'category', 'available'];
    const missingFields = requiredFields.filter((field) => {
      const value = serviceData[field];
      return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
      );
    });

    if (missingFields.length > 0) {
      throw new Error(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
    }

    if (typeof serviceData.available !== 'boolean') {
      throw new Error('El campo "available" debe ser de tipo boolean (true o false).');
    }

    const numericPrice = Number(serviceData.price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      throw new Error('El campo "price" debe ser un número válido mayor o igual a 0.');
    }

    const numericDuration = Number(serviceData.duration);
    if (isNaN(numericDuration) || numericDuration <= 0) {
      throw new Error('El campo "duration" debe ser un número válido mayor a 0 (minutos).');
    }

    const cleanService = {
      name: String(serviceData.name).trim(),
      description: String(serviceData.description).trim(),
      duration: numericDuration,
      price: numericPrice,
      category: String(serviceData.category).trim(),
      available: serviceData.available
    };

    return await this.servicesRepository.create(cleanService);
  }

  async updateService(id, updatedData) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    if (!updatedData || typeof updatedData !== 'object') {
      throw new Error('Los datos de actualización deben ser un objeto válido.');
    }

    const existingService = await this.servicesRepository.getById(id);
    if (!existingService) {
      return null;
    }

    const { id: ignoredId, _id: ignoredMongoId, ...allowedUpdates } = updatedData;

    if (allowedUpdates.name !== undefined) {
      if (typeof allowedUpdates.name !== 'string' || allowedUpdates.name.trim() === '') {
        throw new Error('El campo "name" no puede estar vacío.');
      }
      allowedUpdates.name = allowedUpdates.name.trim();
    }

    if (allowedUpdates.description !== undefined) {
      if (typeof allowedUpdates.description !== 'string' || allowedUpdates.description.trim() === '') {
        throw new Error('El campo "description" no puede estar vacío.');
      }
      allowedUpdates.description = allowedUpdates.description.trim();
    }

    if (allowedUpdates.category !== undefined) {
      if (typeof allowedUpdates.category !== 'string' || allowedUpdates.category.trim() === '') {
        throw new Error('El campo "category" no puede estar vacío.');
      }
      allowedUpdates.category = allowedUpdates.category.trim();
    }

    if (allowedUpdates.price !== undefined) {
      const numericPrice = Number(allowedUpdates.price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        throw new Error('El campo "price" debe ser un número válido mayor o igual a 0.');
      }
      allowedUpdates.price = numericPrice;
    }

    if (allowedUpdates.duration !== undefined) {
      const numericDuration = Number(allowedUpdates.duration);
      if (isNaN(numericDuration) || numericDuration <= 0) {
        throw new Error('El campo "duration" debe ser un número válido mayor a 0.');
      }
      allowedUpdates.duration = numericDuration;
    }

    if (allowedUpdates.available !== undefined && typeof allowedUpdates.available !== 'boolean') {
      throw new Error('El campo "available" debe ser de tipo boolean.');
    }

    return await this.servicesRepository.update(id, allowedUpdates);
  }

  async deleteService(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return await this.servicesRepository.delete(id);
  }
}

export const servicesService = new ServicesService();
export const getServices = (filters) => servicesService.getServices(filters);
export const getServiceById = (id) => servicesService.getServiceById(id);
export const createService = (data) => servicesService.createService(data);
export const updateService = (id, data) => servicesService.updateService(id, data);
export const deleteService = (id) => servicesService.deleteService(id);

export default servicesService;

