const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede tener más de 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no es válido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false,
    },
    specialty: {
      type: String,
      required: [true, 'La especialidad es obligatoria'],
      enum: {
        values: ['Alchemy', 'Botany', 'Enchanting', 'Brewing', 'Runes'],
        message: 'La especialidad no es válida',
      },
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'El rol no es válido',
      },
      default: 'user',
    },
  },
  { timestamps: true },
);

// Mongoose 9: los hooks async ya no usan next()
usuarioSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.compararPasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Nunca devolver el hash de la contraseña en las respuestas JSON
usuarioSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', usuarioSchema);