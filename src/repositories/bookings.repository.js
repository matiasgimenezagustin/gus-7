import { bookingsDao as defaultBookingsDao } from '../dao/bookings.dao.js';

export class BookingsRepository {
  constructor(dao = defaultBookingsDao) {
    this.dao = dao;
  }

  async getAll(options) {
    return await this.dao.getAll(options);
  }

  async getById(id, options) {
    return await this.dao.getById(id, options);
  }

  async create(bookingData) {
    return await this.dao.create(bookingData);
  }

  async update(id, updateData, options) {
    return await this.dao.update(id, updateData, options);
  }
}

export const bookingsRepository = new BookingsRepository();
export const getAll = (options) => bookingsRepository.getAll(options);
export const create = (data) => bookingsRepository.create(data);
export const getById = (id, options) => bookingsRepository.getById(id, options);
export const update = (id, data, options) => bookingsRepository.update(id, data, options);

export default bookingsRepository;
