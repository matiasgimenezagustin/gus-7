import { Router } from 'express';
import {
  getMessages,
  getMessageById,
  createMessage,
  deleteMessage
} from '../controllers/messages.controller.js';

const router = Router();

router.get('/', getMessages);
router.get('/:mid', getMessageById);
router.post('/', createMessage);
router.delete('/:mid', deleteMessage);

export default router;

