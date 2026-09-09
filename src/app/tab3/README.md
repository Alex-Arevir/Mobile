# Tab3 - Perfil

Pantalla sencilla de perfil para el proyecto Ionic Angular.

## Ubicación

Colocar estos archivos en:

src/app/tab3/

- tab3.page.html
- tab3.page.scss
- tab3.page.ts

## Ruta

La estructura actual del proyecto usa componentes standalone y `loadComponent()`.
Si ya tienes `tab3` en `tabs.routes.ts`, no es necesario modificar la ruta.

Ejemplo:

{
  path: 'tab3',
  loadComponent: () =>
    import('../tab3/tab3.page').then((m) => m.Tab3Page),
}

## Datos del usuario

La pantalla intenta leer:

localStorage.getItem('user')

Si existe un JSON con `name`, `username` y/o `email`, se muestran esos datos.
Si todavía no existe, utiliza datos de ejemplo.

## Requisitos

La pantalla utiliza FormsModule para los toggles.

No requiere Bootstrap ni Chart.js.
