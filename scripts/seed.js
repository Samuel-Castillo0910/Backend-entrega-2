// Carga los datos de ejemplo del frontend (12 usuarios, 3 gremios y 10 fórmulas).
// Uso:  npm run seed
//
// Borra y vuelve a crear los usuarios @potionlab.test, los gremios y las
// fórmulas. En producción solo corre si se agrega --force.
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/Usuario');
const Guild = require('../models/Gremio');
const Formula = require('../models/Formula');
const data = require('./seed-data.json');

// El frontend usa otras especialidades que el modelo Usuario.
// "Taster" no tiene equivalente en el enum, se usa Alchemy.
const ESPECIALIDADES = {
  Brewmaster: 'Brewing',
  Herbalist: 'Botany',
  Runist: 'Runes',
  Taster: 'Alchemy',
};

// Usuario con permisos de admin para probar las rutas protegidas
const EMAIL_ADMIN = 'erick@potionlab.test';

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('Falta MONGO_URI en el .env');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('NODE_ENV=production: agrega --force si de verdad quieres sembrar.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  // Limpiar datos anteriores del seed
  await Formula.deleteMany({});
  await Guild.deleteMany({});
  await User.deleteMany({ email: /@potionlab\.test$/ });

  // Usuarios (uno por uno para que se encripte la contraseña)
  const usuarioPorIdFront = {};
  const usuarioPorNombre = {};

  for (const u of data.users) {
    const usuario = new User({
      nombre: u.name,
      email: u.email,
      password: u.password,
      specialty: ESPECIALIDADES[u.specialty] || 'Alchemy',
      avatar: u.avatar,
      role: u.email === EMAIL_ADMIN ? 'admin' : 'user',
    });

    await usuario.save();
    usuarioPorIdFront[u.id] = usuario;
    usuarioPorNombre[u.name] = usuario;
  }
  console.log(`Usuarios creados: ${data.users.length}`);

  // Gremios
  const gremioPorIdFront = {};

  for (const g of data.guilds) {
    const grandmaster = g.members.find((m) => m.role === 'Grandmaster');

    const gremio = new Guild({
      name: g.name,
      motto: g.motto,
      type: g.type,
      emblem: g.emblem,
      inviteCode: g.type === 'Private' ? g.inviteCode : undefined,
      createdBy: usuarioPorIdFront[grandmaster.userId]._id,
      members: g.members.map((m) => ({
        user: usuarioPorIdFront[m.userId]._id,
        role: m.role,
        joinDate: new Date(m.joinDate),
      })),
    });

    await gremio.save();
    gremioPorIdFront[g.id] = gremio;
  }
  console.log(`Gremios creados: ${data.guilds.length}`);

  // Fórmulas (los votos del frontend son { categoria: { idUsuario: opcion } })
  for (const f of data.formulas) {
    const votes = [];

    Object.entries(f.votes).forEach(([category, porUsuario]) => {
      Object.entries(porUsuario).forEach(([idFront, option]) => {
        votes.push({ user: usuarioPorIdFront[idFront]._id, category, option });
      });
    });

    await Formula.create({
      guild: gremioPorIdFront[f.guildId]._id,
      name: f.name,
      effect: f.effect,
      difficulty: f.difficulty,
      state: f.state,
      endDate: new Date(f.endDate),
      createdBy: usuarioPorIdFront[f.createdBy]._id,
      stateHistory: f.stateHistory.map((h) => ({
        state: h.state,
        changedAt: new Date(h.changedAt),
        changedBy: usuarioPorNombre[h.changedByName]?._id,
      })),
      votes,
      finalPotion: f.finalPotion,
    });
  }
  console.log(`Fórmulas creadas: ${data.formulas.length}`);

  console.log('\nListo. Contraseña de todos los usuarios: alquimia123');
  console.log(`Admin: ${EMAIL_ADMIN}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Error en el seed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
