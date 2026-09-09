# API PHP + Ionic/Angular

## 1. Base de datos

Para una instalación nueva:
1. Importa `database.sql` en MySQL.
2. El usuario de desarrollo creado es `admin@example.com` / `Admin123*`.
3. Cambia o elimina ese usuario antes de producción.

Si ya tenías la tabla `users` del proyecto anterior, ejecuta `database_migration.sql`.

## 2. API

Copia `php-api/` a tu servidor PHP, por ejemplo:

`htdocs/ionic-api/`

Endpoints:

| Método | Endpoint | Uso | Auth |
|---|---|---|---|
| POST | `/register.php` | Registro público | No |
| POST | `/login.php` | Login, entrega Bearer token | No |
| POST | `/logout.php` | Cierra token actual | Sí |
| GET | `/users.php` | Lista usuarios | Sí |
| GET | `/users.php?id=1` | Obtiene un usuario | Sí |
| POST | `/users.php` | Crea usuario | No |
| PUT | `/users.php?id=1` | Reemplaza datos básicos | Sí |
| PATCH | `/users.php?id=1` | Actualiza parcialmente | Sí |
| DELETE | `/users.php?id=1` | Elimina usuario | Sí |

El token tiene una vigencia de 7 días y se guarda en la base como hash SHA-256.

## 3. Ionic

`src/environments/environment.ts` debe apuntar a la carpeta pública de PHP:

```ts
apiUrl: 'http://localhost/ionic-api'
```

En producción cambia `environment.prod.ts` por tu HTTPS real.

Axios ya está declarado en `package.json`; ejecuta:

```bash
npm install
ionic serve
```

## 4. Flujo

```text
Tab1
  ├─ POST /login.php
  │    └─ guarda token + usuario
  │          └─ Tab2
  │
  └─ POST /register.php
       └─ vuelve a Login

Tab2
  └─ GET /users.php
       └─ muestra usuarios reales

Tab3
  ├─ GET /users.php?id={id}
  └─ PATCH /users.php?id={id}
       └─ actualiza usuario y localStorage

Logout
  └─ POST /logout.php
       └─ elimina token local
```

## 5. CORS

El proyecto ya responde a `OPTIONS` y permite `GET, POST, PUT, PATCH, DELETE`.

Para producción, no dejes `Access-Control-Allow-Origin: *`; usa el dominio/origen real de tu frontend.

## 6. Seguridad recomendada

- HTTPS obligatorio en producción.
- No publicar credenciales MySQL.
- Cambiar el usuario semilla.
- Para un sistema grande, separar permisos/roles en middleware y usar refresh tokens o JWT con expiración.
- Nunca enviar `password_hash` al frontend.
