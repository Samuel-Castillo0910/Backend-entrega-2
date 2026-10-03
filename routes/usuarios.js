const express = require('express');
const { body, param } = require('express-validator');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/usuarioController');
const { verificarToken, autorizar } = require('../middleware/auth');
const { verificarValidaciones } = require('../middleware/validators');

const router = express.Router();

router.use(verificarToken);
router.use(autorizar('admin'));

const validarId = [
  param('id')
    .isMongoId()
    .withMessage('El ID del usuario no es válido'),
];

const validarActualizacion = [
  body('nombre')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('El email no es válido')
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('specialty')
    .optional()
    .isIn(['Alchemy', 'Botany', 'Enchanting', 'Brewing', 'Runes'])
    .withMessage('La especialidad no es válida'),

  body('avatar')
    .optional()
    .isString()
    .withMessage('El avatar debe ser texto')
    .trim(),

  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('El rol debe ser admin o user'),
];

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Se requiere rol admin
 */
router.get('/', getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Se requiere rol admin
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', validarId, verificarValidaciones, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarUsuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Se requiere rol admin
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Email duplicado
 */
router.put(
  '/:id',
  validarId,
  validarActualizacion,
  verificarValidaciones,
  updateUser,
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       400:
 *         description: ID inválido o intento de autoeliminación
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Se requiere rol admin
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', validarId, verificarValidaciones, deleteUser);

module.exports = router;
