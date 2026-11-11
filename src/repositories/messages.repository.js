import { messagesDao as defaultMessagesDao } from '../dao/messages.dao.js';

export class MessagesRepository {
  constructor(dao = defaultMessagesDao) {
    this.dao = dao;
  }

  async getAll() {
    return await this.dao.getAll();
  }

  async getById(id) {
    return await this.dao.getById(id);
  }

  async create(messageData) {
    return await this.dao.create(messageData);
  }

  async delete(id) {
    return await this.dao.delete(id);
  }
}

export const messagesRepository = new MessagesRepository();
export const getAll = () => messagesRepository.getAll();
export const getById = (id) => messagesRepository.getById(id);
export const create = (data) => messagesRepository.create(data);
export const deleteMethod = (id) => messagesRepository.delete(id);
export { deleteMethod as delete };

export default messagesRepository;
