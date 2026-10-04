const Formula = require('../models/Formula');
const Guild = require('../models/Gremio');
const {
  ESTADOS_FORMULA,
  CATEGORIAS,
  NOMBRES_CATEGORIAS,
} = require('../utils/constants');

// ---------- helpers ----------

function esAdmin(usuario) {
  return usuario.role === 'admin';
}

function rolEnGremio(gremio, usuarioId) {
  const miembro = gremio.members.find(
    (m) => m.user.toString() === usuarioId.toString(),
  );

  return miembro ? miembro.role : null;
}

async function buscarGremio(id) {
  const gremio = await Guild.findById(id);

  if (!gremio) {
    throw { status: 404, message: 'Gremio no encontrado' };
  }

  return gremio;
}

// Las fórmulas de un gremio privado solo las ven sus miembros (y los admin)
function verificarAcceso(gremio, usuario) {
  if (gremio.type === 'Public' || esAdmin(usuario)) return;

  if (!rolEnGremio(gremio, usuario._id)) {
    throw {
      status: 403,
      message: 'No tienes acceso a las fórmulas de este gremio privado',
    };
  }
}

async function buscarFormula(id) {
  const formula = await Formula.findById(id);

  if (!formula) {
    throw { status: 404, message: 'Fórmula no encontrada' };
  }

  return formula;
}

async function poblar(formula) {
  await formula.populate('guild', 'name emblem type');
  await formula.populate('createdBy', 'nombre specialty avatar');

  return formula;
}

// ---------- operaciones ----------

async function getAllFormulas({ guildId, state }, usuario) {
  const filtro = {};

  if (state) filtro.state = state;

  if (guildId) {
    const gremio = await buscarGremio(guildId);
    verificarAcceso(gremio, usuario);
    filtro.guild = guildId;
  } else if (!esAdmin(usuario)) {
    // Excluir fórmulas de gremios privados a los que no pertenece
    const ocultos = await Guild.find({
      type: 'Private',
      'members.user': { $ne: usuario._id },
    }).select('_id');

    if (ocultos.length > 0) {
      filtro.guild = { $nin: ocultos.map((g) => g._id) };
    }
  }

  return await Formula.find(filtro)
    .populate('guild', 'name emblem type')
    .populate('createdBy', 'nombre specialty avatar')
    .sort({ createdAt: -1 });
}

async function getFormulaById(id, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  verificarAcceso(gremio, usuario);

  return await poblar(formula);
}

async function createFormula(datos, usuario) {
  const gremio = await buscarGremio(datos.guild);

  if (!esAdmin(usuario) && !rolEnGremio(gremio, usuario._id)) {
    throw {
      status: 403,
      message: 'Debes ser miembro del gremio para proponer una fórmula',
    };
  }

  const formula = new Formula({
    guild: gremio._id,
    name: datos.name,
    effect: datos.effect,
    difficulty: datos.difficulty,
    endDate: datos.endDate,
    createdBy: usuario._id,
    state: 'Proposal',
    stateHistory: [{ state: 'Proposal', changedBy: usuario._id }],
  });

  await formula.save();

  return await poblar(formula);
}

async function updateFormula(id, datos, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  const esCreador = formula.createdBy.toString() === usuario._id.toString();
  const esGM = rolEnGremio(gremio, usuario._id) === 'Grandmaster';

  if (!esAdmin(usuario) && !esCreador && !esGM) {
    throw {
      status: 403,
      message: 'Solo el creador, el Grandmaster o un admin pueden editar la fórmula',
    };
  }

  if (formula.state !== 'Proposal') {
    throw {
      status: 400,
      message: 'Solo se puede editar una fórmula en estado Proposal',
    };
  }

  ['name', 'effect', 'difficulty', 'endDate'].forEach((campo) => {
    if (datos[campo] !== undefined) {
      formula[campo] = datos[campo];
    }
  });

  await formula.save();

  return await poblar(formula);
}

async function deleteFormula(id, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  const esCreador = formula.createdBy.toString() === usuario._id.toString();
  const esGM = rolEnGremio(gremio, usuario._id) === 'Grandmaster';

  if (!esAdmin(usuario) && !esCreador && !esGM) {
    throw {
      status: 403,
      message: 'Solo el creador, el Grandmaster o un admin pueden eliminar la fórmula',
    };
  }

  await formula.deleteOne();

  return formula;
}

async function votar(id, { category, option }, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  if (!rolEnGremio(gremio, usuario._id)) {
    throw { status: 403, message: 'Solo los miembros del gremio pueden votar' };
  }

  if (formula.state !== 'VotingOpen') {
    throw {
      status: 400,
      message: 'Solo se puede votar cuando la fórmula está en VotingOpen',
    };
  }

  if (!CATEGORIAS[category].options.includes(option)) {
    throw {
      status: 400,
      message: `La opción no es válida para la categoría ${category}`,
    };
  }

  // Un voto por usuario y categoría: si ya votó, se reemplaza
  const existente = formula.votes.find(
    (v) =>
      v.user.toString() === usuario._id.toString() && v.category === category,
  );

  if (existente) {
    existente.option = option;
  } else {
    formula.votes.push({ user: usuario._id, category, option });
  }

  await formula.save();

  return await poblar(formula);
}

// Gana la opción con más votos. En empate decide el voto del Grandmaster.
// (El peso por especialidad/rol del frontend queda para la Entrega 3.)
function calcularGanadores(formula, gremio) {
  const grandmaster = gremio.members.find((m) => m.role === 'Grandmaster');
  const ganadores = {};
  const sinVotos = [];

  NOMBRES_CATEGORIAS.forEach((categoria) => {
    const votos = formula.votes.filter((v) => v.category === categoria);

    if (votos.length === 0) {
      sinVotos.push(categoria);
      return;
    }

    const conteo = {};
    votos.forEach((v) => {
      conteo[v.option] = (conteo[v.option] || 0) + 1;
    });

    const maximo = Math.max(...Object.values(conteo));
    const empatadas = Object.keys(conteo).filter((o) => conteo[o] === maximo);

    if (empatadas.length === 1) {
      ganadores[categoria] = empatadas[0];
      return;
    }

    const votoGM = grandmaster
      ? votos.find((v) => v.user.toString() === grandmaster.user.toString())
      : null;

    ganadores[categoria] =
      votoGM && empatadas.includes(votoGM.option) ? votoGM.option : empatadas[0];
  });

  return { ganadores, sinVotos };
}

async function cambiarEstado(id, nuevoEstado, usuario) {
  const formula = await buscarFormula(id);
  const gremio = await buscarGremio(formula.guild);

  const rol = rolEnGremio(gremio, usuario._id);
  const esCreador = formula.createdBy.toString() === usuario._id.toString();
  const puede =
    esAdmin(usuario) ||
    esCreador ||
    rol === 'Grandmaster' ||
    rol === 'Senior Alchemist';

  if (!puede) {
    throw {
      status: 403,
      message: 'No tienes permisos para cambiar el estado de esta fórmula',
    };
  }

  const actual = ESTADOS_FORMULA.indexOf(formula.state);
  const siguiente = ESTADOS_FORMULA[actual + 1];

  if (!siguiente) {
    throw { status: 400, message: 'La fórmula ya fue destilada' };
  }

  if (nuevoEstado !== siguiente) {
    throw {
      status: 400,
      message: `Transición no permitida: de ${formula.state} solo se puede pasar a ${siguiente}`,
    };
  }

  if (nuevoEstado === 'Distilled') {
    const { ganadores, sinVotos } = calcularGanadores(formula, gremio);

    if (sinVotos.length > 0) {
      throw {
        status: 400,
        message: `No se puede destilar: faltan votos en ${sinVotos.join(', ')}`,
      };
    }

    formula.finalPotion = {
      finalName: `${ganadores.ingredient} + ${ganadores.method} en ${ganadores.flask}`,
      winners: ganadores,
    };
  }

  formula.state = nuevoEstado;
  formula.stateHistory.push({ state: nuevoEstado, changedBy: usuario._id });

  await formula.save();

  return await poblar(formula);
}

module.exports = {
  getAllFormulas,
  getFormulaById,
  createFormula,
  updateFormula,
  deleteFormula,
  votar,
  cambiarEstado,
};
