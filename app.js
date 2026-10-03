const express = require('express');
const cors = require('cors');
const setupSwagger = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(cors());

setupSwagger(app);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/usuarios'));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Potion Lab Backend API is running...',
  });
});

app.use(errorHandler);

module.exports = app;
