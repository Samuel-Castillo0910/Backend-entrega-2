const jwt = require('jsonwebtoken');
const User = require('../models/Usuario');

async function registrar({ nombre, email, password, specialty, avatar }) {
  const usuarioExistente = await User.findOne({ email });

  if (usuarioExistente) {
    throw { status: 409, message: 'El email ya está registrado' };
  }

  const usuario = new User({
    nombre,
    email,
    password,
    specialty,
    avatar,
  });

  await usuario.save();

  const token = generarToken(usuario);

  return { usuario, token };
}

async function login({ email, password }) {
  const usuario = await User.findOne({ email }).select('+password');

  if (!usuario) {
    throw { status: 401, message: 'El email o la contraseña son incorrectos' };
  }

  const passwordValida = await usuario.compararPasswords(password);

  if (!passwordValida) {
    throw { status: 401, message: 'El email o la contraseña son incorrectos' };
  }

  const token = generarToken(usuario);

  usuario.password = undefined;

  return { usuario, token };
}

async function getMe(id) {
  const usuario = await User.findById(id);

  if (!usuario) {
    throw { status: 404, message: 'Usuario no encontrado' };
  }

  return usuario;
}

function generarToken(usuario) {
  return jwt.sign(
    {
      id: usuario._id,
      email: usuario.email,
      role: usuario.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  );
}

module.exports = {
  registrar,
  login,
  getMe,
  generarToken,
};
