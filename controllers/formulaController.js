const formulaService = require('../services/formulaService');
const asyncHandler = require('../utils/asyncHandler');

const getFormulas = asyncHandler(async (req, res) => {
  const formulas = await formulaService.getAllFormulas(req.query, req.user);

  res.status(200).json({ success: true, formulas });
});

const getFormulaById = asyncHandler(async (req, res) => {
  const formula = await formulaService.getFormulaById(req.params.id, req.user);

  res.status(200).json({ success: true, formula });
});

const createFormula = asyncHandler(async (req, res) => {
  const formula = await formulaService.createFormula(req.body, req.user);

  res.status(201).json({
    success: true,
    message: 'Fórmula creada correctamente',
    formula,
  });
});

const updateFormula = asyncHandler(async (req, res) => {
  const formula = await formulaService.updateFormula(
    req.params.id,
    req.body,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: 'Fórmula actualizada correctamente',
    formula,
  });
});

const deleteFormula = asyncHandler(async (req, res) => {
  await formulaService.deleteFormula(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: 'Fórmula eliminada correctamente',
  });
});

const voteFormula = asyncHandler(async (req, res) => {
  const formula = await formulaService.votar(req.params.id, req.body, req.user);

  res.status(200).json({
    success: true,
    message: 'Voto registrado',
    formula,
  });
});

const changeFormulaState = asyncHandler(async (req, res) => {
  const formula = await formulaService.cambiarEstado(
    req.params.id,
    req.body.state,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: `La fórmula pasó a estado ${formula.state}`,
    formula,
  });
});

module.exports = {
  getFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  voteFormula,
  changeFormulaState,
};
