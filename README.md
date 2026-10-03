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
```

## Ejecutar

Desarrollo:

```bash
npm run dev
```

Producción:

```bash
npm start
```

## Swagger

Con el servidor ejecutándose:

`http://localhost:4000/api-docs`

## Persona A

### Autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Usuarios

Todas las rutas de usuarios requieren JWT y rol `admin`.

- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

## Roles

El rol global de usuario es:

- `user`
- `admin`

Los roles de miembros de gremios (`Grandmaster`, `Senior Alchemist`, `Apprentice`, `Taster`) pertenecen al dominio de Guild y serán manejados por Persona B.

## Estructura

```text
config/
controllers/
middleware/
models/
routes/
services/
utils/
```
