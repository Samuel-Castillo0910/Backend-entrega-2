# Potion Lab - Backend Entrega 2

Backend de Potion Lab realizado con Node.js, Express, MongoDB, Mongoose y JWT.

## Tecnologías

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- bcryptjs
- express-validator
- Swagger

## Instalación

```bash
npm install
```

Crear un archivo `.env` a partir de `.env.example` y configurar:

```env
PORT=4000
MONGO_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
PUBLIC_URL=https://tu-backend.onrender.com
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (en producción lo asigna Render/Railway) |
| `MONGO_URI` | Cadena de conexión de MongoDB Atlas (obligatoria) |
| `JWT_SECRET` | Clave para firmar los tokens (obligatoria) |
| `JWT_EXPIRES_IN` | Duración del token, por ejemplo `7d` |
| `NODE_ENV` | `development` o `production` |
| `CORS_ORIGIN` | URL del frontend permitido por CORS |
| `PUBLIC_URL` | URL pública del backend, se muestra en Swagger |

Si falta `MONGO_URI` o `JWT_SECRET`, el servidor avisa y no arranca.

## Ejecutar

Desarrollo:

```bash
npm run dev
```

Producción:

```bash
npm start
```

## Despliegue

- API desplegada: _pegar aquí la URL_
- Swagger en producción: _pegar aquí la URL_/api-docs
- Build command: `npm install`
- Start command: `npm start`
- Configurar en el servicio las mismas variables del `.env`.
- En MongoDB Atlas permitir el acceso desde cualquier IP.

## Swagger

Con el servidor ejecutándose:

`http://localhost:4000/api-docs`

## Persona A

### Autenticación

- `POST /api/auth/register`: registra un usuario y devuelve el token.
- `POST /api/auth/login`: inicia sesión y devuelve el token.
- `GET /api/auth/me`: devuelve el usuario autenticado (requiere JWT).

### Usuarios

Todas las rutas de usuarios requieren JWT y rol `admin`.

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`: solo permite editar `nombre`, `email`, `password`, `specialty`, `avatar` y `role`.
- `DELETE /api/users/:id`: un admin no puede eliminarse a sí mismo.

Para usar el token en Swagger o en el frontend se manda el header:

```
Authorization: Bearer <token>
```

## Persona B

Todas las rutas de gremios y fórmulas requieren JWT (`Authorization: Bearer <token>`).

### Gremios

- `GET /api/guilds`: lista los gremios (filtro opcional `?type=Public|Private`).
- `POST /api/guilds`: crea un gremio; quien lo crea queda como `Grandmaster`. Si es `Private` se envía `inviteCode`.
- `GET /api/guilds/:id`: detalle con miembros. El `inviteCode` solo lo ven el Grandmaster y los admin.
- `PUT /api/guilds/:id`: edita el gremio (solo Grandmaster o admin).
- `DELETE /api/guilds/:id`: elimina el gremio y sus fórmulas (solo Grandmaster o admin).
- `POST /api/guilds/:id/join`: unirse como `Apprentice` (en gremios privados se envía `inviteCode` en el body).
- `POST /api/guilds/:id/leave`: salir del gremio (el Grandmaster no puede salir).
- `PATCH /api/guilds/:id/members/:userId/role`: cambia el rol de un miembro (solo Grandmaster o admin). Asignar `Grandmaster` a otro miembro pasa al anterior a `Senior Alchemist`.

### Fórmulas

- `GET /api/formulas`: lista las fórmulas (filtros opcionales `?guildId=` y `?state=`). Las de gremios privados solo las ven sus miembros y los admin.
- `POST /api/formulas`: propone una fórmula (`guild`, `name`, `effect`, `difficulty` 1-5, `endDate`); solo miembros del gremio. Queda en `Proposal`.
- `GET /api/formulas/:id`: detalle de la fórmula.
- `PUT /api/formulas/:id`: edita la fórmula mientras esté en `Proposal` (creador, Grandmaster o admin).
- `DELETE /api/formulas/:id`: elimina la fórmula (creador, Grandmaster o admin).
- `POST /api/formulas/:id/vote`: vota en una categoría (`ingredient`, `method` o `flask`) con una opción válida. Solo miembros y solo en `VotingOpen`. Un usuario tiene un voto por categoría; si vota de nuevo, se reemplaza.
- `PATCH /api/formulas/:id/state`: avanza el estado (`Proposal` → `VotingOpen` → `Closed` → `Distilled`) y registra el cambio en `stateHistory`. Pueden hacerlo el creador, el Grandmaster, los Senior Alchemist y los admin.

Al pasar a `Distilled` se calcula la poción final: en cada categoría gana la opción con más votos y, en caso de empate, decide el voto del Grandmaster. Para destilar debe haber al menos un voto en las tres categorías. El peso de votos por especialidad y rol del frontend queda para la Entrega 3.

### Datos de ejemplo (seed)

```bash
npm run seed
```

Carga los 12 usuarios, 3 gremios y 10 fórmulas del frontend. Todos los usuarios (`@potionlab.test`) tienen la contraseña `alquimia123` y `erick@potionlab.test` es admin. El script borra y recrea esos datos; en producción exige `--force`.

Las especialidades del frontend se traducen a las del modelo: Brewmaster → Brewing, Herbalist → Botany, Runist → Runes, Taster → Alchemy.

## Roles

El rol global de usuario es:

- `user` (por defecto al registrarse)
- `admin`

Para crear el primer admin, registrar un usuario y cambiar su `role` a `admin` directamente en MongoDB Atlas.

Los roles de miembros de gremios (`Grandmaster`, `Senior Alchemist`, `Apprentice`, `Taster`) pertenecen al dominio de Guild y los maneja la Persona B.

## Estructura

```text
config/        # Conexión a la base de datos y Swagger
controllers/   # Manejo de req/res
middlewares/   # Auth (JWT y roles), validaciones y errores
models/        # Schemas de Mongoose (Usuario, Gremio, Formula)
routes/        # Definición de endpoints
scripts/       # Seed con los datos de ejemplo
services/      # Lógica de negocio
utils/         # Funciones auxiliares y constantes
app.js         # Configuración de Express
index.js       # Arranque del servidor
```