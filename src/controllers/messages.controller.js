import { messagesService } from '../services/messages.service.js';

export const getMessages = async (req, res) => {
  try {
    const messages = await messagesService.getMessages();
    return res.status(200).json({
      status: 'success',
      payload: messages
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener los mensajes',
      error: error.message
    });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const { mid } = req.params;
    const message = await messagesService.getMessageById(mid);

    if (!message) {
      return res.status(404).json({
        status: 'error',
        message: `Mensaje con id ${mid} no encontrado`
      });
    }

    return res.status(200).json({
      status: 'success',
      payload: message
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al obtener el mensaje',
      error: error.message
    });
  }
};

export const createMessage = async (req, res) => {
  try {
    const newMessage = await messagesService.createMessage(req.body);

    return res.status(201).json({
      status: 'success',
      message: 'Mensaje guardado exitosamente',
      payload: newMessage
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { mid } = req.params;
    const deletedMessage = await messagesService.deleteMessage(mid);

    if (!deletedMessage) {
      return res.status(404).json({
        status: 'error',
        message: `Mensaje con id ${mid} no encontrado`
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `Mensaje con id ${mid} eliminado exitosamente`,
      payload: deletedMessage
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al eliminar el mensaje',
      error: error.message
    });
  }
};

