import mongoose from 'mongoose';
import MessageModel from '../models/message.model.js';

export class MessagesDao {
  constructor(model = MessageModel) {
    this.model = model;
  }

  async getAll() {
    return await this.model.find().sort({ createdAt: 1 }).lean();
  }

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model.findById(id).lean();
  }

  async create(messageData) {
    const createdMessage = await this.model.create(messageData);
    return createdMessage.toObject();
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.model.findByIdAndDelete(id).lean();
  }
}

export const messagesDao = new MessagesDao();
export const getAll = () => messagesDao.getAll();
export const getById = (id) => messagesDao.getById(id);
export const create = (data) => messagesDao.create(data);
export const deleteMethod = (id) => messagesDao.delete(id);
export { deleteMethod as delete };

export default messagesDao;
