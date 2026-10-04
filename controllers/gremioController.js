const gremioService = require('../services/gremioService');
const asyncHandler = require('../utils/asyncHandler');

const getGuilds = asyncHandler(async (req, res) => {
  const gremios = await gremioService.getAllGremios(req.query);

  res.status(200).json({ success: true, gremios });
});

const getGuildById = asyncHandler(async (req, res) => {
  const gremio = await gremioService.getGremioById(req.params.id, req.user);

  res.status(200).json({ success: true, gremio });
});

const createGuild = asyncHandler(async (req, res) => {
  const gremio = await gremioService.createGremio(req.body, req.user);

  res.status(201).json({
    success: true,
    message: 'Gremio creado correctamente',
    gremio,
  });
});

const updateGuild = asyncHandler(async (req, res) => {
  const gremio = await gremioService.updateGremio(
    req.params.id,
    req.body,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: 'Gremio actualizado correctamente',
    gremio,
  });
});

const deleteGuild = asyncHandler(async (req, res) => {
  await gremioService.deleteGremio(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: 'Gremio eliminado correctamente',
  });
});

const joinGuild = asyncHandler(async (req, res) => {
  const gremio = await gremioService.joinGremio(
    req.params.id,
    req.body.inviteCode,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: 'Te uniste al gremio',
    gremio,
  });
});

const leaveGuild = asyncHandler(async (req, res) => {
  await gremioService.leaveGremio(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: 'Saliste del gremio',
  });
});

const changeMemberRole = asyncHandler(async (req, res) => {
  const gremio = await gremioService.cambiarRolMiembro(
    req.params.id,
    req.params.userId,
    req.body.role,
    req.user,
  );

  res.status(200).json({
    success: true,
    message: 'Rol actualizado correctamente',
    gremio,
  });
});

module.exports = {
  getGuilds,
  getGuildById,
  createGuild,
  updateGuild,
  deleteGuild,
  joinGuild,
  leaveGuild,
  changeMemberRole,
};
