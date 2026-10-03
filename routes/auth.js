const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getMe,
} = require('../controllers/authControllers');
const { verificarToken } = require('../middlewares/auth');
const { verificarValidaciones } = require('../middlewares/validators');

const router = express.Router();

const validarRegistro = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),

  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('specialty')
    .notEmpty()
    .withMessage('La especialidad es obligatoria')
    .isIn(['Alchemy', 'Botany', 'Enchanting', 'Brewing', 'Runes'])
    .withMessage('La especialidad no es válida'),

  body('avatar')
    .optional()
    .isString()
    .withMessage('El avatar debe ser texto')
    .trim(),
];

const validarLogin = [
  body('email')
    .notEmpty()
    .withMessage('El email es obligatorio')
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Registro'
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email ya registrado
 */
router.post('/register', validarRegistro, verificarValidaciones, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', validarLogin, verificarValidaciones, loginUser);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener el usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/me', verificarToken, getMe);

module.exports = router;
