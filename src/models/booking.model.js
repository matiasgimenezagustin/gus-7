import mongoose from 'mongoose';

const bookingCollection = 'bookings';

const bookingSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'El nombre del cliente es obligatorio'],
      trim: true
    },
    clientEmail: {
      type: String,
      required: [true, 'El email del cliente es obligatorio'],
      trim: true,
      lowercase: true
    },
    date: {
      type: String,
      required: [true, 'La fecha de la reserva es obligatoria'],
      trim: true
    },
    time: {
      type: String,
      required: [true, 'La hora de la reserva es obligatoria'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
      trim: true
    },
    services: [
      {
        _id: false,
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'services',
          required: [true, 'El ID del servicio es obligatorio']
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, 'La cantidad debe ser al menos 1']
        }
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const BookingModel = mongoose.model(bookingCollection, bookingSchema);
export default BookingModel;

