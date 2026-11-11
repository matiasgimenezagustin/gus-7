import mongoose from 'mongoose';

const messageCollection = 'messages';

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: [true, 'El usuario o remitente es obligatorio'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'El contenido del mensaje es obligatorio'],
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const MessageModel = mongoose.model(messageCollection, messageSchema);
export default MessageModel;

