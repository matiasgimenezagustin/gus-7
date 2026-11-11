import mongoose from 'mongoose';

const serviceCollection = 'services';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del servicio es obligatorio'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La descripción del servicio es obligatoria'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'La duración del servicio es obligatoria'],
      min: [1, 'La duración debe ser mayor a 0 minutos']
    },
    price: {
      type: Number,
      required: [true, 'El precio del servicio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    category: {
      type: String,
      required: [true, 'La categoría del servicio es obligatoria'],
      trim: true
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const ServiceModel = mongoose.model(serviceCollection, serviceSchema);
export default ServiceModel;

