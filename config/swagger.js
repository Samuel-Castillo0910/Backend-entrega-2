const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Potion Lab API',
      version: '1.0.0',
      description: 'API de Potion Lab - Entrega 2',
    },
    servers: [
      ...(process.env.PUBLIC_URL ? [{ url: process.env.PUBLIC_URL }] : []),
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Registro: {
          type: 'object',
          required: ['nombre', 'email', 'password', 'specialty'],
          properties: {
            nombre: { type: 'string', example: 'Erick' },
            email: { type: 'string', format: 'email', example: 'erick@email.com' },
            password: { type: 'string', format: 'password', example: '123456' },
            specialty: {
              type: 'string',
              enum: ['Alchemy', 'Botany', 'Enchanting', 'Brewing', 'Runes'],
            },
            avatar: { type: 'string', example: 'avatar1.png' },
          },
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        ActualizarUsuario: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            specialty: {
              type: 'string',
              enum: ['Alchemy', 'Botany', 'Enchanting', 'Brewing', 'Runes'],
            },
            avatar: { type: 'string' },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
            },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            nombre: { type: 'string' },
            email: { type: 'string' },
            specialty: { type: 'string' },
            avatar: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
