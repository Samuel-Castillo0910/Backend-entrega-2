const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  voteFormula,
  changeFormulaState,
} = require('../controllers/formulaController');
const { verificarToken } = require('../middlewares/auth');
const { verificarValidaciones } = require('../middlewares/validators');
const {
  ESTADOS_FORMULA,
  NOMBRES_CATEGORIAS,
} = require('../utils/constants');

const router = express.Router();

// Todas las rutas de fórmulas requieren estar autenticado
router.use(verificarToken);

const validarId = [
  param('id').isMongoId().withMessage('El ID de la fórmula no es válido'),
];

const validarFiltros = [
  query('guildId')
    .optional()
    .isMongoId()
    .withMessage('El ID del gremio no es válido'),
  query('state')
    .optional()
    .isIn(ESTADOS_FORMULA)
    .withMessage(`El estado debe ser uno de: ${ESTADOS_FORMULA.join(', ')}`),
];

const validarCreacion = [
  body('guild')
    .notEmpty()
    .withMessage('El gremio es obligatorio')
    .isMongoId()
    .withMessage('El ID del gremio no es válido'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la fórmula es obligatorio')
    .isLength({ min: 3, max: 80 })
    .withMessage('El nombre de la fórmula debe tener entre 3 y 80 caracteres'),

  body('effect')
    .trim()
    .notEmpty()
    .withMessage('El efecto es obligatorio')
    .isLength({ min: 5, max: 300 })
    .withMessage('El efecto debe tener entre 5 y 300 caracteres'),

  body('difficulty')
    .notEmpty()
    .withMessage('La dificultad es obligatoria')
    .isInt({ min: 1, max: 5 })
    .withMessage('La dificultad debe ser un número entero entre 1 y 5')
    .toInt(),

  body('endDate')
    .notEmpty()
    .withMessage('La fecha de cierre es obligatoria')
    .isISO8601()
    .withMessage('La fecha de cierre no es válida (use formato YYYY-MM-DD)'),
];

const validarActualizacion = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 80 })
    .withMessage('El nombre de la fórmula debe tener entre 3 y 80 caracteres'),

  body('effect')
    .optional()
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('El efecto debe tener entre 5 y 300 caracteres'),

  body('difficulty')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La dificultad debe ser un número entero entre 1 y 5')
    .toInt(),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de cierre no es válida (use formato YYYY-MM-DD)'),
];

const validarVoto = [
  body('category')
    .notEmpty()
    .withMessage('La categoría es obligatoria')
    .isIn(NOMBRES_CATEGORIAS)
    .withMessage(`La categoría debe ser una de: ${NOMBRES_CATEGORIAS.join(', ')}`),

  body('option')
    .trim()
    .notEmpty()
    .withMessage('La opción es obligatoria'),
];

const validarEstado = [
  body('state')
    .notEmpty()
    .withMessage('El estado es obligatorio')
    .isIn(ESTADOS_FORMULA)
    .withMessage(`El estado debe ser uno de: ${ESTADOS_FORMULA.join(', ')}`),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     CrearFormula:
 *       type: object
 *       required: [guild, name, effect, difficulty, endDate]
 *       properties:
 *         guild: { type: string, description: ID del gremio }
 *         name: { type: string, example: Elixir de Fuerza }
 *         effect: { type: string, example: Aumentar temporalmente la fuerza física. }
 *         difficulty: { type: integer, minimum: 1, maximum: 5, example: 3 }
 *         endDate: { type: string, format: date, example: "2026-10-30" }
 *     ActualizarFormula:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         effect: { type: string }
 *         difficulty: { type: integer, minimum: 1, maximum: 5 }
 *         endDate: { type: string, format: date }
 *     VotoFormula:
 *       type: object
 *       required: [category, option]
 *       properties:
 *         category: { type: string, enum: [ingredient, method, flask] }
 *         option:
 *           type: string
 *           description: >
 *             ingredient: Raíz de Mandrágora | Polvo de Estrellas.
 *             method: Llama Azul | Baño de Agua Arcana.
 *             flask: Cristal Lunar | Cráneo de Plata.
 *           example: Llama Azul
 *     CambiarEstadoFormula:
 *       type: object
 *       required: [state]
 *       properties:
 *         state:
 *           type: string
 *           enum: [Proposal, VotingOpen, Closed, Distilled]
 *           description: Solo se permite avanzar al siguiente estado
 *     Formula:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         guild: { type: object }
 *         name: { type: string }
 *         effect: { type: string }
 *         difficulty: { type: integer }
 *         state: { type: string, enum: [Proposal, VotingOpen, Closed, Distilled] }
 *         endDate: { type: string, format: date-time }
 *         createdBy: { type: object }
 *         stateHistory: { type: array, items: { type: object } }
 *         votes: { type: array, items: { type: object } }
 *         finalPotion: { type: object }
 */

/**
 * @swagger
 * /api/formulas:
 *   get:
 *     summary: Listar fórmulas (filtros opcionales por gremio y estado)
 *     tags: [Fórmulas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: guildId
 *         schema: { type: string }
 *       - in: query
 *         name: state
 *         schema: { type: string, enum: [Proposal, VotingOpen, Closed, Distilled] }
 *     responses:
 *       200:
 *         description: Lista de fórmulas
 *       400:
 *         description: Filtros inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Gremio privado sin acceso
 */
router.get('/', validarFiltros, verificarValidaciones, getFormulas);

/**
 * @swagger
 * /api/formulas:
 *   post:
 *     summary: Proponer una fórmula en un gremio (queda en estado Proposal)
 *     tags: [Fórmulas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearFormula'
 *     responses:
 *       201:
 *         description: Fórmula creada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No eres miembro del gremio
 *       404:
 *         description: Gremio no encontrado
 */
router.post('/', validarCreacion, verificarValidaciones, createFormula);

/**
 * @swagger
 * /api/formulas/{id}:
 *   get:
 *     summary: Obtener una fórmula por ID
 *     tags: [Fórmulas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Fórmula encontrada
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Gremio privado sin acceso
 *       404:
 *         description: Fórmula no encontrada
 */
router.get('/:id', validarId, verificarValidaciones, getFormulaById);

/**
 * @swagger
 * /api/formulas/{id}:
 *   put:
 *     summary: Actualizar una fórmula en estado Proposal (creador, Grandmaster o admin)
 *     tags: [Fórmulas]
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
 *             $ref: '#/components/schemas/ActualizarFormula'
 *     responses:
 *       200:
 *         description: Fórmula actualizada
 *       400:
 *         description: Datos inválidos o la fórmula ya no está en Proposal
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Fórmula no encontrada
 */
router.put(
  '/:id',
  validarId,
  validarActualizacion,
  verificarValidaciones,
  updateFormula,
);

/**
 * @swagger
 * /api/formulas/{id}:
 *   delete:
 *     summary: Eliminar una fórmula (creador, Grandmaster o admin)
 *     tags: [Fórmulas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Fórmula eliminada
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Fórmula no encontrada
 */
router.delete('/:id', validarId, verificarValidaciones, deleteFormula);

/**
 * @swagger
 * /api/formulas/{id}/vote:
 *   post:
 *     summary: Votar en una categoría (solo miembros, fórmula en VotingOpen)
 *     tags: [Fórmulas]
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
 *             $ref: '#/components/schemas/VotoFormula'
 *     responses:
 *       200:
 *         description: Voto registrado (si ya había votado en esa categoría, se reemplaza)
 *       400:
 *         description: Datos inválidos o la votación no está abierta
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: No eres miembro del gremio
 *       404:
 *         description: Fórmula no encontrada
 */
router.post(
  '/:id/vote',
  validarId,
  validarVoto,
  verificarValidaciones,
  voteFormula,
);

/**
 * @swagger
 * /api/formulas/{id}/state:
 *   patch:
 *     summary: Avanzar el estado de una fórmula (Proposal → VotingOpen → Closed → Distilled)
 *     tags: [Fórmulas]
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
 *             $ref: '#/components/schemas/CambiarEstadoFormula'
 *     responses:
 *       200:
 *         description: Estado actualizado (al destilar se calcula la poción final)
 *       400:
 *         description: Transición no permitida o faltan votos para destilar
 *       401:
 *         description: Token ausente o inválido
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Fórmula no encontrada
 */
router.patch(
  '/:id/state',
  validarId,
  validarEstado,
  verificarValidaciones,
  changeFormulaState,
);

module.exports = router;
