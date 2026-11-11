import mongoose from 'mongoose';
import ServiceModel from '../models/service.model.js';

export class ServicesDao {
  constructor(model = ServiceModel) {
    this.model = model;
  }

  async getAll(filter = {}) {
    return await this.model.find(filter).lean();
  }

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model.findById(id).lean();
  }

  async create(serviceData) {
    const createdService = await this.model.create(serviceData);
    return createdService.toObject();
  }

  async update(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const { _id, id: ignoredId, ...fieldsToUpdate } = updateData;
    return await this.model
      .findByIdAndUpdate(id, fieldsToUpdate, { new: true, runValidators: true })
      .lean();
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model.findByIdAndDelete(id).lean();
  }
}

export const servicesDao = new ServicesDao();
export const getAll = (filter) => servicesDao.getAll(filter);
export const getById = (id) => servicesDao.getById(id);
export const create = (data) => servicesDao.create(data);
export const update = (id, data) => servicesDao.update(id, data);
export const deleteMethod = (id) => servicesDao.delete(id);
export { deleteMethod as delete };

export default servicesDao;
