const jwt = require('jsonwebtoken');
const User = require('../models/Usuario');

async function verificarToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' });
    }

    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      return res.status(401).json({ success: false, message: 'Formato de token inválido' });
    }

    const token = partes[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(decoded.id);

    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    req.user = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado' });
    }

    next(error);
  }
}

function autorizar(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }

    next();
  };
}

module.exports = { verificarToken, autorizar };
