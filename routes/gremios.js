const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getGuilds,
  getGuildById,
  createGuild,
  updateGuild,
  deleteGuild,
  joinGuild,
  leaveGuild,
  changeMemberRole,
} = require('../controllers/gremioController');
const { verificarToken } = require('../middlewares/auth');
const { verificarValidaciones } = require('../middlewares/validators');
const { ROLES_GREMIO, TIPOS_GREMIO } = require('../utils/constants');

const router = express.Router();

// Todas las rutas de gremios requieren estar autenticado
router.use(verificarToken);

const validarId = [
  param('id').isMongoId().withMessage('El ID del gremio no es válido'),
];

const validarFiltro = [
  query('type')
    .optional()
    .isIn(TIPOS_GREMIO)
    .withMessage('El tipo debe ser Public o Private'),
];

const validarCreacion = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del gremio es obligatorio')
    .isLength({ min: 3, max: 60 })
    .withMessage('El nombre del gremio debe tener entre 3 y 60 caracteres'),

  body('motto')
    .optional()
    .isString()
    .withMessage('El lema debe ser texto')
    .trim()
    .isLength({ max: 150 })
    .withMessage('El lema no puede tener más de 150 caracteres'),

  body('type')
    .notEmpty()
    .withMessage('El tipo de gremio es obligatorio')
    .isIn(TIPOS_GREMIO)
    .withMessage('El tipo de gremio debe ser Public o Private'),

  body('emblem')
    .optional()
    .isString()
    .withMessage('El emblema debe ser texto')
    .trim(),

  body('inviteCode')
    .if(body('type').equals('Private'))
    .trim()
    .notEmpty()
    .withMessage('Un gremio privado necesita un código de invitación')
    .isLength({ min: 4, max: 20 })
    .withMessage('El código de invitación debe tener entre 4 y 20 caracteres'),
];

const validarActualizacion = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 60 })
    .withMessage('El nombre del gremio debe tener entre 3 y 60 caracteres'),

  body('motto')
    .optional()
    .isString()
    .withMessage('El lema debe ser texto')
    .trim()
    .isLength({ max: 150 })
    .withMessage('El lema no puede tener más de 150 caracteres'),

  body('type')
    .optional()
    .isIn(TIPOS_GREMIO)
    .withMessage('El tipo de gremio debe ser Public o Private'),

  body('emblem')
    .optional()
    .isString()
    .withMessage('El emblema debe ser texto')
    .trim(),

  body('inviteCode')
    .optional()
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('El código de invitación debe tener entre 4 y 20 caracteres'),
];

const validarJoin = [
  body('inviteCode')
    .optional()
    .isString()
    .withMessage('El código de invitación debe ser texto'),
];

const validarRol = [
  param('id').isMongoId().withMessage('El ID del gremio no es válido'),
  param('userId').isMongoId().withMessage('El ID del usuario no es válido'),
  body('role')
    .notEmpty()
    .withMessage('El rol es obligatorio')
    .isIn(ROLES_GREMIO)
    .withMessage(`El rol debe ser uno de: ${ROLES_GREMIO.join(', ')}`),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     CrearGremio:
 *       type: object
 *       required: [name, type]
 *       properties:
 *         name: { type: string, example: Alquimistas EIA }
 *         motto: { type: string, example: El conocimiento es nuestra mejor fórmula. }
 *         type: { type: string, enum: [Public, Private] }
 *         emblem: { type: string, example: "🧪" }
 *         inviteCode:
 *           type: string
 *           description: Obligatorio si el gremio es Private
 *           example: LUNA23
 *     ActualizarGremio:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         motto: { type: string }
 *         type: { type: string, enum: [Public, Private] }
 *         emblem: { type: string }
 *         inviteCode: { type: string }
 *     CambiarRolMiembro:
 *       type: object
 *       required: [role]
 *       properties:
 *         role:
 *           type: string
 *           enum: [Grandmaster, Senior Alchemist, Apprentice, Taster]
 *     Gremio:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         name: { type: string }
 *         motto: { type: string }
 *         type: { type: string, enum: [Public, Private] }
 *         emblem: { type: string }
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user: { type: object }
 *               role: { type: string }
 *               joinDate: { type: string, format: date-time }
 *         createdBy: { type: string }
 */

/**
 * @swagger
 * /api/guilds:
 *   get:
 *     summary: Listar gremios
 *     tags: [Gremios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [Public, Private] }
 *     responses:
 *       200:
 *         description: Lista de gremios
 *       400:
 *         description: Filtro inválido
 *       401:
 *         description: Token ausente o inválido
 */
router.get('/', validarFiltro, verificarValidaciones, getGuilds);

/**
 * @swagger
 * /api/guilds:
 *   post:
 *     summary: Crear un gremio (quien lo crea queda como Grandmaster)
 *     tags: [Gremios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearGremio'
 *     responses:
 *       201:
 *         description: Gremio creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       409:
 *         description: Ya existe un gremio con ese nombre
 */
router.post('/', validarCreacion, verificarValidaciones, createGuild);

/**
 * @swagger
 * /api/guilds/{id}:
 *   get:
 *     summary: Obtener un gremio por ID
 *     tags: [Gremios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gremio encontrado (el inviteCode solo lo ve el Grandmaster o un admin)
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: Gremio no encontrado
 */
router.get('/:id', validarId, verificarValidaciones, getGuildById);

/**
 * @swagger
 * /api/guilds/{id}:
 *   put:
 *     summary: Actualizar un gremio (solo Grandmaster o admin)
 *     tags: [Gremios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActualizarGremio'
 *     responses:
 *       200:
 *         description: Gremio actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No eres el Grandmaster del gremio
 *       404:
 *         description: Gremio no encontrado
 *       409:
 *         description: Nombre duplicado
 */
router.put(
  '/:id',
  validarId,
  validarActualizacion,
  verificarValidaciones,
  updateGuild,
);

/**
 * @swagger
 * /api/guilds/{id}:
 *   delete:
 *     summary: Eliminar un gremio y sus fórmulas (solo Grandmaster o admin)
 *     tags: [Gremios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Gremio eliminado
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No eres el Grandmaster del gremio
 *       404:
 *         description: Gremio no encontrado
 */
router.delete('/:id', validarId, verificarValidaciones, deleteGuild);

/**
 * @swagger
 * /api/guilds/{id}/join:
 *   post:
 *     summary: Unirse a un gremio (en gremios privados se envía el inviteCode)
 *     tags: [Gremios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inviteCode: { type: string, example: LUNA23 }
 *     responses:
 *       200:
 *         description: Te uniste al gremio como Apprentice
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Código de invitación incorrecto
 *       404:
 *         description: Gremio no encontrado
 *       409:
 *         description: Ya eres miembro
 */
router.post('/:id/join', validarId, validarJoin, verificarValidaciones, joinGuild);

/**
 * @swagger
 * /api/guilds/{id}/leave:
 *   post:
 *     summary: Salir de un gremio (el Grandmaster no puede salir)
 *     tags: [Gremios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Saliste del gremio
 *       400:
 *         description: No eres miembro o eres el Grandmaster
 *       401:
 *         description: Token ausente o inválido
 *       404:
 *         description: Gremio no encontrado
 */
router.post('/:id/leave', validarId, verificarValidaciones, leaveGuild);

/**
 * @swagger
 * /api/guilds/{id}/members/{userId}/role:
 *   patch:
 *     summary: Cambiar el rol de un miembro (solo Grandmaster o admin)
 *     tags: [Gremios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambiarRolMiembro'
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No eres el Grandmaster del gremio
 *       404:
 *         description: Gremio o miembro no encontrado
 */
router.patch(
  '/:id/members/:userId/role',
  validarRol,
  verificarValidaciones,
  changeMemberRole,
);

module.exports = router;
