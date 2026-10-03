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
models/        # Schemas de Mongoose
routes/        # Definición de endpoints
services/      # Lógica de negocio
utils/         # Funciones auxiliares
app.js         # Configuración de Express
index.js       # Arranque del servidor
```