const mongoose = require('mongoose');
const { ROLES_GREMIO, TIPOS_GREMIO } = require('../utils/constants');

const miembroSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario del miembro es obligatorio'],
    },
    role: {
      type: String,
      enum: {
        values: ROLES_GREMIO,
        message: 'El rol de gremio no es válido',
      },
      default: 'Apprentice',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const gremioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del gremio es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre del gremio debe tener al menos 3 caracteres'],
      maxlength: [60, 'El nombre del gremio no puede tener más de 60 caracteres'],
    },
    motto: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'El lema no puede tener más de 150 caracteres'],
    },
    type: {
      type: String,
      required: [true, 'El tipo de gremio es obligatorio'],
      enum: {
        values: TIPOS_GREMIO,
        message: 'El tipo de gremio debe ser Public o Private',
      },
      default: 'Public',
    },
    emblem: {
      type: String,
      trim: true,
      default: '🧪',
    },
    // Solo se usa en gremios privados. No se devuelve por defecto.
    inviteCode: {
      type: String,
      trim: true,
      uppercase: true,
      select: false,
      required: [
        function () {
          return this.type === 'Private';
        },
        'Un gremio privado necesita un código de invitación',
      ],
    },
    members: {
      type: [miembroSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

gremioSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Guild', gremioSchema);
