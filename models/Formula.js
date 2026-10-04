const mongoose = require('mongoose');
const {
  ESTADOS_FORMULA,
  NOMBRES_CATEGORIAS,
} = require('../utils/constants');

const historialSchema = new mongoose.Schema(
  {
    state: { type: String, enum: ESTADOS_FORMULA, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

// Un voto = un usuario eligiendo una opción en una categoría
const votoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: {
        values: NOMBRES_CATEGORIAS,
        message: 'La categoría de voto no es válida',
      },
      required: true,
    },
    option: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const formulaSchema = new mongoose.Schema(
  {
    guild: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guild',
      required: [true, 'El gremio es obligatorio'],
    },
    name: {
      type: String,
      required: [true, 'El nombre de la fórmula es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre de la fórmula debe tener al menos 3 caracteres'],
      maxlength: [80, 'El nombre de la fórmula no puede tener más de 80 caracteres'],
    },
    effect: {
      type: String,
      required: [true, 'El efecto es obligatorio'],
      trim: true,
      minlength: [5, 'El efecto debe tener al menos 5 caracteres'],
      maxlength: [300, 'El efecto no puede tener más de 300 caracteres'],
    },
    difficulty: {
      type: Number,
      required: [true, 'La dificultad es obligatoria'],
      min: [1, 'La dificultad mínima es 1'],
      max: [5, 'La dificultad máxima es 5'],
    },
    state: {
      type: String,
      enum: {
        values: ESTADOS_FORMULA,
        message: 'El estado de la fórmula no es válido',
      },
      default: 'Proposal',
    },
    endDate: {
      type: Date,
      required: [true, 'La fecha de cierre es obligatoria'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stateHistory: { type: [historialSchema], default: [] },
    votes: { type: [votoSchema], default: [] },
    // Se llena al destilar la fórmula
    finalPotion: {
      finalName: String,
      winners: {
        ingredient: String,
        method: String,
        flask: String,
      },
    },
  },
  { timestamps: true },
);

formulaSchema.index({ guild: 1, state: 1 });

formulaSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Formula', formulaSchema);
