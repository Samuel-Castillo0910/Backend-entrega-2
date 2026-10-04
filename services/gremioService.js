const Guild = require('../models/Gremio');
const Formula = require('../models/Formula');

const CAMPOS_MIEMBRO = 'nombre specialty avatar';

// ---------- helpers ----------

function idDe(ref) {
  return (ref._id || ref).toString();
}

function esAdmin(usuario) {
  return usuario.role === 'admin';
}

function obtenerMiembro(gremio, usuarioId) {
  return gremio.members.find((m) => idDe(m.user) === usuarioId.toString());
}

function esGrandmaster(gremio, usuario) {
  const miembro = obtenerMiembro(gremio, usuario._id);
  return Boolean(miembro && miembro.role === 'Grandmaster');
}

async function buscarGremio(id, { conCodigo = false } = {}) {
  const consulta = Guild.findById(id);
  if (conCodigo) consulta.select('+inviteCode');

  const gremio = await consulta;

  if (!gremio) {
    throw { status: 404, message: 'Gremio no encontrado' };
  }

  return gremio;
}

// El código de invitación solo lo ven el Grandmaster y los admin
function serializar(gremio, usuario) {
  const json = gremio.toJSON();

  if (!esAdmin(usuario) && !esGrandmaster(gremio, usuario)) {
    delete json.inviteCode;
  }

  return json;
}

async function poblar(gremio) {
  return await gremio.populate('members.user', CAMPOS_MIEMBRO);
}

// ---------- operaciones ----------

async function getAllGremios({ type } = {}) {
  const filtro = {};
  if (type) filtro.type = type;

  return await Guild.find(filtro)
    .populate('members.user', CAMPOS_MIEMBRO)
    .sort({ createdAt: -1 });
}

async function getGremioById(id, usuario) {
  const gremio = await buscarGremio(id, { conCodigo: true });
  await poblar(gremio);

  return serializar(gremio, usuario);
}

async function createGremio(datos, usuario) {
  const existente = await Guild.findOne({ name: datos.name });

  if (existente) {
    throw { status: 409, message: 'Ya existe un gremio con ese nombre' };
  }

  const gremio = new Guild({
    name: datos.name,
    motto: datos.motto,
    type: datos.type,
    emblem: datos.emblem,
    inviteCode: datos.type === 'Private' ? datos.inviteCode : undefined,
    createdBy: usuario._id,
    // Quien crea el gremio queda como Grandmaster
    members: [{ user: usuario._id, role: 'Grandmaster' }],
  });

  await gremio.save();
  await poblar(gremio);

  return gremio;
}

async function updateGremio(id, datos, usuario) {
  const gremio = await buscarGremio(id, { conCodigo: true });

  if (!esAdmin(usuario) && !esGrandmaster(gremio, usuario)) {
    throw {
      status: 403,
      message: 'Solo el Grandmaster del gremio puede editarlo',
    };
  }

  if (datos.name && datos.name !== gremio.name) {
    const repetido = await Guild.findOne({ name: datos.name, _id: { $ne: id } });

    if (repetido) {
      throw { status: 409, message: 'Ya existe un gremio con ese nombre' };
    }
  }

  ['name', 'motto', 'type', 'emblem', 'inviteCode'].forEach((campo) => {
    if (datos[campo] !== undefined) {
      gremio[campo] = datos[campo];
    }
  });

  // Un gremio público no necesita código
  if (gremio.type === 'Public') {
    gremio.inviteCode = undefined;
  }

  await gremio.save();
  await poblar(gremio);

  return gremio;
}

async function deleteGremio(id, usuario) {
  const gremio = await buscarGremio(id);

  if (!esAdmin(usuario) && !esGrandmaster(gremio, usuario)) {
    throw {
      status: 403,
      message: 'Solo el Grandmaster del gremio puede eliminarlo',
    };
  }

  // Las fórmulas del gremio se eliminan con él
  await Formula.deleteMany({ guild: gremio._id });
  await gremio.deleteOne();

  return gremio;
}

async function joinGremio(id, inviteCode, usuario) {
  const gremio = await buscarGremio(id, { conCodigo: true });

  if (obtenerMiembro(gremio, usuario._id)) {
    throw { status: 409, message: 'Ya eres miembro de este gremio' };
  }

  if (gremio.type === 'Private') {
    const enviado = (inviteCode || '').toString().trim().toUpperCase();

    if (!enviado || enviado !== gremio.inviteCode) {
      throw { status: 403, message: 'Código de invitación incorrecto' };
    }
  }

  gremio.members.push({ user: usuario._id, role: 'Apprentice' });
  await gremio.save();
  await poblar(gremio);

  return serializar(gremio, usuario);
}

async function leaveGremio(id, usuario) {
  const gremio = await buscarGremio(id);
  const miembro = obtenerMiembro(gremio, usuario._id);

  if (!miembro) {
    throw { status: 400, message: 'No eres miembro de este gremio' };
  }

  if (miembro.role === 'Grandmaster') {
    throw {
      status: 400,
      message:
        'El Grandmaster no puede abandonar el gremio: transfiere el rol o elimina el gremio',
    };
  }

  gremio.members = gremio.members.filter(
    (m) => idDe(m.user) !== usuario._id.toString(),
  );
  await gremio.save();

  return gremio;
}

async function cambiarRolMiembro(id, miembroId, nuevoRol, usuario) {
  const gremio = await buscarGremio(id);

  if (!esAdmin(usuario) && !esGrandmaster(gremio, usuario)) {
    throw {
      status: 403,
      message: 'Solo el Grandmaster del gremio puede cambiar roles',
    };
  }

  const objetivo = obtenerMiembro(gremio, miembroId);

  if (!objetivo) {
    throw { status: 404, message: 'El usuario no es miembro de este gremio' };
  }

  if (objetivo.role === 'Grandmaster' && nuevoRol !== 'Grandmaster') {
    throw {
      status: 400,
      message: 'Para cambiar al Grandmaster, asigna primero el rol a otro miembro',
    };
  }

  if (nuevoRol === 'Grandmaster') {
    // Solo puede haber un Grandmaster: el anterior pasa a Senior Alchemist
    gremio.members.forEach((m) => {
      if (m.role === 'Grandmaster') m.role = 'Senior Alchemist';
    });
  }

  objetivo.role = nuevoRol;

  await gremio.save();
  await poblar(gremio);

  return gremio;
}

module.exports = {
  getAllGremios,
  getGremioById,
  createGremio,
  updateGremio,
  deleteGremio,
  joinGremio,
  leaveGremio,
  cambiarRolMiembro,
};
