const usuarioService = require('../services/usuarioService');
const asyncHandler = require('../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const usuarios = await usuarioService.getAllUsuarios();

  res.status(200).json({
    success: true,
    usuarios,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.getUsuarioById(req.params.id);

  res.status(200).json({
    success: true,
    usuario,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.updateUsuario(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: 'Usuario actualizado correctamente',
    usuario,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  await usuarioService.deleteUsuario(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Usuario eliminado correctamente',
  });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
