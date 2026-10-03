function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((error) => error.message)
        .join(', '),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'valor';

    return res.status(409).json({
      success: false,
      message: `El ${field} ya está registrado`,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor, intente más tarde',
  });
}

module.exports = errorHandler;
