# Ionic Angular + PHP Login Migration

## What was migrated
- The visual login/register interface from `tab1` was migrated to `src/app/login/`.
- `app.routes.ts` now loads LoginPage at `/` and `/login`.
- Existing `tab2` and `tab3` views were not modified.
- The original `tab1` files are kept as a backup/reference; they are no longer the root screen.

## Axios
Install Axios in the Ionic project:
```bash
npm install axios
```

## API
Copy `php-api/` to your PHP server, for example:
`htdocs/ionic-api/`

Update:
- `src/environments/environment.ts` -> `apiUrl`
- `php-api/config.php` -> MySQL credentials

## Database
Import `database.sql` into MySQL.

Initial user:
- username: `admin`
- password: `Admin123*`
- email: `admin@example.com`

Change/delete this seed account for real deployments.

## API payloads

### Login
POST `/login.php`
```json
{
  "username": "admin",
  "password": "Admin123*"
}
```

### Register
POST `/register.php`
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "Secret123"
}
```

## Expected login response
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

## Flow
Login success -> `/tabs/tab2`

This keeps the existing tab structure while removing `tab1` from the initial route.

## Important
For production:
- Replace `Access-Control-Allow-Origin: *` with your app/domain.
- Use HTTPS.
- Move database credentials outside public web root when possible.
- Replace the example seed password.
