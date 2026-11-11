import mongoose from 'mongoose';
import { messagesRepository as defaultMessagesRepository } from '../repositories/messages.repository.js';

export class MessagesService {
  constructor(messagesRepository = defaultMessagesRepository) {
    this.messagesRepository = messagesRepository;
  }

  async getMessages() {
    return await this.messagesRepository.getAll();
  }

  async getMessageById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.messagesRepository.getById(id);
  }

  async createMessage(messageData) {
    if (!messageData || typeof messageData !== 'object') {
      throw new Error('Los datos del mensaje deben ser un objeto válido.');
    }

    const { user, message } = messageData;

    if (!user || typeof user !== 'string' || user.trim() === '') {
      throw new Error('El campo "user" es obligatorio y no puede estar vacío.');
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      throw new Error('El campo "message" es obligatorio y no puede estar vacío.');
    }

    const cleanMessage = {
      user: user.trim(),
      message: message.trim()
    };

    return await this.messagesRepository.create(cleanMessage);
  }

  async deleteMessage(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.messagesRepository.delete(id);
  }
}

export const messagesService = new MessagesService();
export const getMessages = () => messagesService.getMessages();
export const getMessageById = (id) => messagesService.getMessageById(id);
export const createMessage = (data) => messagesService.createMessage(data);
export const deleteMessage = (id) => messagesService.deleteMessage(id);

export default messagesService;
