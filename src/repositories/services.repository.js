import { servicesDao as defaultServicesDao } from '../dao/services.dao.js';

export class ServicesRepository {
  constructor(dao = defaultServicesDao) {
    this.dao = dao;
  }

  async getAll(filter = {}) {
    return await this.dao.getAll(filter);
  }

  async getById(id) {
    return await this.dao.getById(id);
  }

  async create(serviceData) {
    return await this.dao.create(serviceData);
  }

  async update(id, updateData) {
    return await this.dao.update(id, updateData);
  }

  async delete(id) {
    return await this.dao.delete(id);
  }
}

export const servicesRepository = new ServicesRepository();
export const getAll = (filter) => servicesRepository.getAll(filter);
export const getById = (id) => servicesRepository.getById(id);
export const create = (data) => servicesRepository.create(data);
export const update = (id, data) => servicesRepository.update(id, data);
export const deleteMethod = (id) => servicesRepository.delete(id);
export { deleteMethod as delete };

export default servicesRepository;
