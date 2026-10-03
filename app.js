const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(
  cors({
    origin: [process.env.CORS_ORIGIN, 'http://localhost:5173'].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

setupSwagger(app);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Potion Lab Backend API is running...',
    docs: '/api-docs',
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/usuarios'));

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada, petición no existe',
  });
});

app.use(errorHandler);

module.exports = app;