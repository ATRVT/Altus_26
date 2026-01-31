# Arreglo de la Gráfica de Supervisión

### Problema
La gráfica mostraba datos de ejemplo (random) al inicio y no se actualizaba automáticamente al cambiar de alumno.

### Solución en `FULL_INDEX.html`
1.  **Limpieza**: Se eliminaron los datos de ejemplo de la función `initChart()`. Ahora inicia vacía.
2.  **Auto-Actualización**: Se añadieron "listeners" para que al cambiar el estudiante, programa o fechas, la gráfica se recargue automáticamente sin necesidad de pulsar botones extra.

### Instrucciones
Copia el contenido de `FULL_INDEX.html` al archivo `index.html` en Apps Script.
