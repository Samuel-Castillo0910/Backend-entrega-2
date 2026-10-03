const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const registerUser = asyncHandler(async (req, res) => {
  const resultado = await authService.registrar(req.body);

  res.status(201).json({
    success: true,
    message: 'Usuario registrado correctamente',
    usuario: resultado.usuario,
    token: resultado.token,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: 'Inicio de sesión exitoso',
    usuario: resultado.usuario,
    token: resultado.token,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const usuario = await authService.getMe(req.user._id);

  res.status(200).json({
    success: true,
    usuario,
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
