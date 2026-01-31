# Corrección de Visibilidad del Botón "Agregar Registro"

Se ha detectado que el botón "Agregar Registro" aparecía en blanco debido a conflictos con los nuevos colores personalizados.

### Cambios Realizados:
1.  **`css.html`**: Se añadió la clase `.btn-add-custom` que utiliza un degradado con tus colores personalizados (`--primary-color` azul y `--secondary-color` naranja).
2.  **`index.html`**: Se aplicó esta clase al botón de "Agregar Registro".

### Instrucciones:
Actualiza `css.html` e `index.html` en tu proyecto de Apps Script.
