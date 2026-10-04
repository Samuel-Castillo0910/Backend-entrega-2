// Constantes del dominio de Potion Lab (gremios y fórmulas)

const ROLES_GREMIO = ['Grandmaster', 'Senior Alchemist', 'Apprentice', 'Taster'];

const TIPOS_GREMIO = ['Public', 'Private'];

// Orden del ciclo de vida de una fórmula
const ESTADOS_FORMULA = ['Proposal', 'VotingOpen', 'Closed', 'Distilled'];

// Categorías votables y sus opciones (iguales a las del frontend)
const CATEGORIAS = {
  ingredient: {
    name: 'Ingrediente base',
    options: ['Raíz de Mandrágora', 'Polvo de Estrellas'],
  },
  method: {
    name: 'Método de calentamiento',
    options: ['Llama Azul', 'Baño de Agua Arcana'],
  },
  flask: {
    name: 'Tipo de frasco',
    options: ['Cristal Lunar', 'Cráneo de Plata'],
  },
};

const NOMBRES_CATEGORIAS = Object.keys(CATEGORIAS);

module.exports = {
  ROLES_GREMIO,
  TIPOS_GREMIO,
  ESTADOS_FORMULA,
  CATEGORIAS,
  NOMBRES_CATEGORIAS,
};
