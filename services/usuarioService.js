const User = require('../models/Usuario');

async function getAllUsuarios() {
  return await User.find().sort({ createdAt: -1 });
}

async function getUsuarioById(id) {
  const usuario = await User.findById(id);

  if (!usuario) {
    throw { status: 404, message: 'Usuario no encontrado' };
  }

  return usuario;
}

async function updateUsuario(id, datos) {
  const usuario = await User.findById(id).select('+password');

  if (!usuario) {
    throw { status: 404, message: 'Usuario no encontrado' };
  }

  if (datos.email && datos.email !== usuario.email) {
    const emailExistente = await User.findOne({
      email: datos.email,
      _id: { $ne: id },
    });

    if (emailExistente) {
      throw { status: 409, message: 'El email ya está registrado' };
    }
  }

  const camposPermitidos = [
    'nombre',
    'email',
    'password',
    'specialty',
    'avatar',
    'role',
  ];

  camposPermitidos.forEach((campo) => {
    if (datos[campo] !== undefined) {
      usuario[campo] = datos[campo];
    }
  });

  await usuario.save();

  return usuario;
}

async function deleteUsuario(id, usuarioActualId) {
  if (id === usuarioActualId.toString()) {
    throw { status: 400, message: 'Un admin no puede eliminarse a sí mismo' };
  }

  const usuario = await User.findByIdAndDelete(id);

  if (!usuario) {
    throw { status: 404, message: 'Usuario no encontrado' };
  }

  return usuario;
}

module.exports = {
  getAllUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
};