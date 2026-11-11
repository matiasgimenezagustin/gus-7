import mongoose from 'mongoose';
import BookingModel from '../models/booking.model.js';

export class BookingsDao {
  constructor(model = BookingModel) {
    this.model = model;
  }

  async getAll({ populate = false } = {}) {
    const query = this.model.find();
    if (populate) {
      query.populate('services.service');
    }
    return await query.lean();
  }

  async getById(id, { populate = false } = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const query = this.model.findById(id);
    if (populate) {
      query.populate('services.service');
    }
    return await query.lean();
  }

  async create(bookingData) {
    const createdBooking = await this.model.create(bookingData);
    return createdBooking.toObject();
  }

  async update(id, updateData, { populate = false } = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const { _id, id: ignoredId, ...fieldsToUpdate } = updateData;
    const query = this.model.findByIdAndUpdate(id, fieldsToUpdate, { new: true, runValidators: true });
    if (populate) {
      query.populate('services.service');
    }
    return await query.lean();
  }
}

export const bookingsDao = new BookingsDao();
export const getAll = (options) => bookingsDao.getAll(options);
export const getById = (id, options) => bookingsDao.getById(id, options);
export const create = (data) => bookingsDao.create(data);
export const update = (id, data, options) => bookingsDao.update(id, data, options);

export default bookingsDao;
